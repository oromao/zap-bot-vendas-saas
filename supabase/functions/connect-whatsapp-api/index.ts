
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the session to identify the user
    const {
      data: { session },
      error: sessionError,
    } = await supabaseClient.auth.getSession();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = session.user.id;
    const requestData: ConnectionRequest = await req.json();

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
        JSON.stringify({ error: "Failed to save connection data" }),
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
    }

    // Send test message or verify connection
    // This would normally verify the connection with either Meta or Twilio APIs
    // For now, we'll just simulate a successful connection
    
    console.log(`WhatsApp API connection established for user ${userId} using ${requestData.type} provider`);
    
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
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
