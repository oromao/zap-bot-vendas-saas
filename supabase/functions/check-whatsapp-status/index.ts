
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
              signal: AbortSignal.timeout(5000),
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

    console.log(`Checking WhatsApp status for user ${user.id}`);
    
    // Optimize database query to be more efficient
    const { data, error } = await supabaseClient
      .from('whatsapp_connections')
      .select('connected')
      .eq('user_id', user.id)
      .limit(1)  // Limit to just one row for efficiency
      .maybeSingle();
    
    if (error) {
      console.error("Database query error:", error);
      return new Response(
        JSON.stringify({ error: "Erro ao verificar status do WhatsApp" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // If no entry is found, assume disconnected
    const connected = data?.connected ?? false;

    console.log(`WhatsApp status for user ${user.id}: ${connected ? 'Connected' : 'Disconnected'}`);
    
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
