
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface MetaConnectionRequest {
  type: "meta";
  businessId: string;
  phoneNumberId: string;
  accessToken: string;
  userId?: string;
}

interface TwilioConnectionRequest {
  type: "twilio";
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  userId?: string;
}

type ConnectionRequest = MetaConnectionRequest | TwilioConnectionRequest;

const handler = async (req: Request): Promise<Response> => {
  console.log("[DEBUG] Received request to connect-whatsapp-api");
  console.log("[DEBUG] Request URL:", req.url);
  console.log("[DEBUG] Request method:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    console.log("[DEBUG] Supabase URL:", supabaseUrl ? "Present" : "Missing");
    console.log("[DEBUG] Service Role Key:", supabaseServiceRoleKey ? "Present" : "Missing");

    // Create admin client with service role key
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });

    // Parse request data first
    let requestData: ConnectionRequest;
    try {
      requestData = await req.json();
      console.log("[DEBUG] Request data type:", requestData.type);
    } catch (e) {
      console.error("[DEBUG] Error parsing request body:", e);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try to get user ID from different sources
    let userId = null;
    
    // 1. Check JWT context if available
    const authContext = (req as any).url?.sb?.[0];
    if (authContext && authContext.auth_user) {
      console.log("[DEBUG] User ID found in JWT context:", authContext.auth_user);
      userId = authContext.auth_user;
    }
    // 2. If not in context, check if it's in the request body
    else if (requestData.userId) {
      console.log("[DEBUG] User ID found in request body:", requestData.userId);
      userId = requestData.userId;
    }

    // If still no user ID, return authentication error
    if (!userId) {
      console.error("[DEBUG] No user ID found in request context or body");
      return new Response(
        JSON.stringify({ error: "Authentication required. Please provide a valid user ID" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate request data
    if (requestData.type === "meta") {
      if (!requestData.businessId || !requestData.phoneNumberId || !requestData.accessToken) {
        console.error("[DEBUG] Missing required Meta WhatsApp fields");
        return new Response(
          JSON.stringify({ error: "Missing required Meta WhatsApp fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (requestData.type === "twilio") {
      if (!requestData.accountSid || !requestData.authToken || !requestData.phoneNumber) {
        console.error("[DEBUG] Missing required Twilio fields");
        return new Response(
          JSON.stringify({ error: "Missing required Twilio fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      console.error("[DEBUG] Invalid connection type");
      return new Response(
        JSON.stringify({ error: "Invalid connection type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store connection data in database
    try {
      console.log("[DEBUG] Storing API connection data for user:", userId);
      
      // Store in whatsapp_api_connections table
      const { error: insertError } = await adminClient
        .from("whatsapp_api_connections")
        .upsert({
          user_id: userId,
          connection_type: requestData.type,
          config: requestData,
          connected: true,
          connected_at: new Date().toISOString(),
          status: "active",
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error("[DEBUG] Error storing connection data:", insertError);
        throw insertError;
      }

      console.log("[DEBUG] Successfully stored API connection data");

      // Update whatsapp_connections table for backward compatibility
      // Using upsert instead of insert to handle duplicate key errors
      const { error: updateError } = await adminClient
        .from("whatsapp_connections")
        .upsert({
          user_id: userId,
          connected: true,
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        console.error("[DEBUG] Error updating whatsapp_connections:", updateError);
        // We continue even if this fails, since the main table was updated successfully
      } else {
        console.log("[DEBUG] Successfully updated whatsapp_connections table");
      }

      return new Response(
        JSON.stringify({ 
          message: "WhatsApp API connected successfully",
          connected: true
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (dbError) {
      console.error("[DEBUG] Database operation error:", dbError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to save connection data", 
          details: dbError instanceof Error ? dbError.message : "Unknown database error" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("[DEBUG] Unhandled error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
