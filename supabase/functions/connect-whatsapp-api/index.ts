
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      console.error("Request missing authorization token");
      return new Response(
        JSON.stringify({ error: "Unauthorized: Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Supabase client with authorization from request
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { 
            Authorization: authHeader,
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the session to identify the user
    const {
      data: { session },
      error: sessionError,
    } = await supabaseClient.auth.getSession();

    if (sessionError) {
      console.error("Authentication error:", sessionError.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized: " + sessionError.message }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!session) {
      console.error("No session found");
      return new Response(
        JSON.stringify({ error: "Unauthorized: No session found" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = session.user.id;
    console.log(`Processing request for authenticated user: ${userId}`);
    
    // Parse the request body
    let requestData: ConnectionRequest;
    try {
      requestData = await req.json();
    } catch (e) {
      console.error("Error parsing request body:", e);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate request data
    if (requestData.type === "meta") {
      if (!requestData.businessId || !requestData.phoneNumberId || !requestData.accessToken) {
        return new Response(
          JSON.stringify({ error: "Missing required Meta WhatsApp fields" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else if (requestData.type === "twilio") {
      if (!requestData.accountSid || !requestData.authToken || !requestData.phoneNumber) {
        return new Response(
          JSON.stringify({ error: "Missing required Twilio fields" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid connection type" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing ${requestData.type} connection request for user ${userId}`);

    // Store connection data in database (encrypted at rest)
    const { error: insertError } = await supabaseClient.from("whatsapp_api_connections").upsert({
      user_id: userId,
      connection_type: requestData.type,
      config: requestData,
      connected: true,
      connected_at: new Date().toISOString(),
      status: "active",
    });

    if (insertError) {
      console.error("Error storing connection data:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save connection data", details: insertError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update whatsapp_connections table 
    const { error: updateError } = await supabaseClient.from("whatsapp_connections").upsert({
      user_id: userId,
      connected: true,
      connected_at: new Date().toISOString(),
    });

    if (updateError) {
      console.error("Error updating connection status:", updateError);
      // Continue execution even if this update fails
    }

    // Send confirmation email
    try {
      await supabaseClient.functions.invoke('send-connection-notification', {
        body: { connectionType: requestData.type === "meta" ? "Meta WhatsApp API" : "Twilio API" }
      });
    } catch (emailError) {
      console.error("Error sending notification email:", emailError);
      // Continue execution even if email fails
    }
    
    console.log(`Successfully connected ${requestData.type} for user ${userId}`);
    
    return new Response(
      JSON.stringify({ 
        message: "WhatsApp API connected successfully", 
        connected: true
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error handling WhatsApp API connection request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
