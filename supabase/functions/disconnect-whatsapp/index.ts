
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the user ID from the JWT token in the request
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // In a real implementation, this would call the WhatsApp Business API to disconnect
    // For this demo, we'll just update the status in the database
    
    const { error } = await supabaseClient
      .from('whatsapp_connections')
      .upsert({ 
        user_id: user.id, 
        connected: false,
        disconnected_at: new Date().toISOString()
      });
    
    if (error) {
      console.error("Error updating connection status:", error);
      return new Response(
        JSON.stringify({ error: "Erro ao desconectar WhatsApp" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`WhatsApp disconnected for user ${user.id}`);
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error disconnecting WhatsApp:", error);
    
    return new Response(
      JSON.stringify({ error: "Erro ao desconectar WhatsApp" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
