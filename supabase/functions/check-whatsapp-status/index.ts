
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
    // In a real implementation, you would check the actual status from your WhatsApp API provider
    // For demo purposes, we'll simulate a connection status stored in a Supabase table
    
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

    // Here you would typically check a real WhatsApp connection status
    // For demonstration, we'll return a mocked status
    // In production, you'd integrate with the WhatsApp Business API or a third-party service
    
    const { data, error } = await supabaseClient
      .from('whatsapp_connections')
      .select('connected')
      .eq('user_id', user.id)
      .maybeSingle();
    
    // If no entry is found, assume disconnected
    const connected = data?.connected ?? false;

    console.log(`WhatsApp status checked for user ${user.id}: ${connected ? 'Connected' : 'Disconnected'}`);
    
    return new Response(
      JSON.stringify({ connected }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error checking WhatsApp status:", error);
    
    return new Response(
      JSON.stringify({ error: "Erro ao verificar status do WhatsApp" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
