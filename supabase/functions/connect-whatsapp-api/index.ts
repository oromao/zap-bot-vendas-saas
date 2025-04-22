
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
}

interface TwilioConnectionRequest {
  type: "twilio";
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

type ConnectionRequest = MetaConnectionRequest | TwilioConnectionRequest;

const handler = async (req: Request): Promise<Response> => {
  console.log("[DEBUG] Received request to connect-whatsapp-api");
  console.log("[DEBUG] Request URL:", req.url);
  console.log("[DEBUG] Request method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Extract authorization and apikey headers for debugging
    const authHeader = req.headers.get('Authorization');
    const apikey = req.headers.get('apikey');
    const contentType = req.headers.get('Content-Type');
    
    console.log("[DEBUG] Auth header present:", !!authHeader);
    console.log("[DEBUG] API key present:", !!apikey);
    console.log("[DEBUG] Content-Type:", contentType);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    console.log("[DEBUG] Supabase URL:", supabaseUrl ? "Present" : "Missing");
    console.log("[DEBUG] Supabase Anon Key:", supabaseAnonKey ? "Present" : "Missing");
    console.log("[DEBUG] Supabase Service Role Key:", supabaseServiceRoleKey ? "Present" : "Missing");

    // Extract the JWT token
    let userId: string | null = null;
    try {
      // Create admin client with service role key for accessing auth data directly
      const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      });

      // First try to get the userId from the JWT if it exists
      if (authHeader) {
        const jwt = authHeader.replace('Bearer ', '');
        console.log("[DEBUG] Attempting to verify JWT token");
        
        const { data: { user }, error: userError } = await adminClient.auth.getUser(jwt);
        
        if (userError) {
          console.error("[DEBUG] Error verifying JWT:", userError.message);
        } else if (user) {
          userId = user.id;
          console.log(`[DEBUG] Successfully authenticated user via JWT: ${userId}`);
        }
      }
      
      // If JWT auth fails, check if we have a userId in the request body
      if (!userId) {
        // Try to decode userId from the sb context if available
        const sbContext = (req as any).url?.sb?.[0]?.auth_user;
        
        if (sbContext) {
          userId = sbContext;
          console.log(`[DEBUG] Found userId in sb context: ${userId}`);
        }
      }
      
      // If still no userId, check the request body
      if (!userId) {
        const requestBody = await req.clone().text();
        console.log("[DEBUG] Request body:", requestBody);
        
        try {
          const bodyData = JSON.parse(requestBody);
          userId = bodyData.userId || null;
          console.log(`[DEBUG] Found userId in request body: ${userId}`);
        } catch (e) {
          console.error("[DEBUG] Error parsing request body:", e);
        }
      }
    } catch (authError) {
      console.error("[DEBUG] Error during authentication process:", authError);
    }

    if (!userId) {
      console.error("[DEBUG] Authentication failed: No valid user ID found");
      return new Response(
        JSON.stringify({ error: "Authentication failed: Unable to identify user" }),
        { 
          status: 401, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    console.log(`[DEBUG] Proceeding with user ID: ${userId}`);
    
    // Parse the request body
    let requestData: ConnectionRequest;
    try {
      requestData = await req.json();
      console.log("[DEBUG] Request data type:", requestData.type);
    } catch (e) {
      console.error("[DEBUG] Error parsing request body:", e);
      return new Response(
        JSON.stringify({ error: "Invalid request body", details: e instanceof Error ? e.message : "Unknown error" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate request data
    if (requestData.type === "meta") {
      if (!requestData.businessId || !requestData.phoneNumberId || !requestData.accessToken) {
        console.error("[DEBUG] Missing required Meta WhatsApp fields");
        return new Response(
          JSON.stringify({ error: "Missing required Meta WhatsApp fields" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else if (requestData.type === "twilio") {
      if (!requestData.accountSid || !requestData.authToken || !requestData.phoneNumber) {
        console.error("[DEBUG] Missing required Twilio fields");
        return new Response(
          JSON.stringify({ error: "Missing required Twilio fields" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else {
      console.error("[DEBUG] Invalid connection type");
      return new Response(
        JSON.stringify({ error: "Invalid connection type" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[DEBUG] Processing ${requestData.type} connection request for user ${userId}`);

    // Create a client using anon key for database operations (since we already verified the user)
    const client = createClient(supabaseUrl, supabaseAnonKey);
    
    try {
      // Store connection data in database (encrypted at rest)
      const { error: insertError } = await client.from("whatsapp_api_connections").upsert({
        user_id: userId,
        connection_type: requestData.type,
        config: requestData,
        connected: true,
        connected_at: new Date().toISOString(),
        status: "active",
      });

      if (insertError) {
        console.error("[DEBUG] Error storing connection data:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to save connection data", details: insertError.message }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      console.log("[DEBUG] Successfully stored API connection data");

      // Update whatsapp_connections table 
      const { error: updateError } = await client.from("whatsapp_connections").upsert({
        user_id: userId,
        connected: true,
        connected_at: new Date().toISOString(),
      });

      if (updateError) {
        console.error("[DEBUG] Error updating connection status:", updateError);
        // Continue execution even if this update fails
      } else {
        console.log("[DEBUG] Successfully updated whatsapp_connections table");
      }

      // Try to send confirmation email
      try {
        await client.functions.invoke('send-connection-notification', {
          body: { connectionType: requestData.type === "meta" ? "Meta WhatsApp API" : "Twilio API" }
        });
        console.log("[DEBUG] Notification email sent successfully");
      } catch (emailError) {
        console.error("[DEBUG] Error sending notification email:", emailError);
        // Continue execution even if email fails
      }
      
      console.log(`[DEBUG] Successfully connected ${requestData.type} for user ${userId}`);
      
      return new Response(
        JSON.stringify({ 
          message: "WhatsApp API connected successfully", 
          connected: true
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } catch (dbError) {
      console.error("[DEBUG] Database operation error:", dbError);
      return new Response(
        JSON.stringify({ 
          error: "Database operation failed", 
          details: dbError instanceof Error ? dbError.message : "Unknown database error" 
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
  } catch (error) {
    console.error("[DEBUG] Unhandled error in connect-whatsapp-api:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
