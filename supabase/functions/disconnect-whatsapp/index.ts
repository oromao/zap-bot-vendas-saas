
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
      { 
        global: { 
          headers: { Authorization: req.headers.get('Authorization')! },
          // Add fetch options to improve performance and prevent timeouts
          fetch: (url, init) => {
            return fetch(url, {
              ...init,
              // Set a reasonable timeout
              signal: AbortSignal.timeout(10000), // Increased timeout to 10s
            });
          },
        }
      }
    );
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error("Authorization error:", authError);
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Attempting to disconnect WhatsApp for user ${user.id}`);
    
    // Atualizar a tabela consolidada
    const { error } = await supabaseClient
      .from('whatsapp_connections')
      .update({ 
        connected: false,
        disconnected_at: new Date().toISOString(),
        status: 'inactive'
      })
      .eq('user_id', user.id);
    
    if (error) {
      console.error("Error updating connection status:", error);
      return new Response(
        JSON.stringify({ error: "Erro ao desconectar WhatsApp", details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`WhatsApp disconnected successfully for user ${user.id}`);
    
    return new Response(
      JSON.stringify({ success: true, message: "WhatsApp desconectado com sucesso" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error disconnecting WhatsApp:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Erro ao desconectar WhatsApp", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
