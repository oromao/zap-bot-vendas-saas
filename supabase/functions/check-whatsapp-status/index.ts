
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache de status para reduzir consultas ao banco de dados
const statusCache = new Map();
const CACHE_TTL = 10000; // 10 segundos de TTL para o cache

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = performance.now();
    console.log(`[${new Date().toISOString()}] Recebendo requisição de verificação de status`);
    
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
              // Set an aggressive timeout
              signal: AbortSignal.timeout(3000), // Reduzido para 3s para falhar rapidamente
            });
          },
        }
      }
    );
    
    // Extrair o token JWT para identificar o usuário
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Requisição sem token de autorização");
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar o cache antes de fazer a autenticação completa
    const token = authHeader.replace('Bearer ', '');
    const cacheKey = `status_${token}`;
    const cachedStatus = statusCache.get(cacheKey);
    
    if (cachedStatus && (Date.now() - cachedStatus.timestamp < CACHE_TTL)) {
      console.log(`Retornando status em cache para requisição: ${cachedStatus.connected ? 'Conectado' : 'Desconectado'}`);
      return new Response(
        JSON.stringify({ connected: cachedStatus.connected }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Autenticar usuário apenas se não houver cache válido
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error("Erro de autorização:", authError);
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Verificando status do WhatsApp para usuário ${user.id}`);
    
    // Otimizar consulta ao banco de dados
    const { data, error } = await supabaseClient
      .from('whatsapp_connections')
      .select('connected')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error("Erro na consulta ao banco de dados:", error);
      return new Response(
        JSON.stringify({ error: "Erro ao verificar status do WhatsApp", details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Se não encontrou entrada, assume desconectado
    const connected = data?.connected ?? false;

    // Armazenar no cache
    statusCache.set(cacheKey, {
      connected,
      timestamp: Date.now()
    });

    // Se o cache ficar muito grande, limpar entradas antigas
    if (statusCache.size > 1000) {
      const now = Date.now();
      for (const [key, value] of statusCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          statusCache.delete(key);
        }
      }
    }

    const endTime = performance.now();
    console.log(`Status do WhatsApp para usuário ${user.id}: ${connected ? 'Conectado' : 'Desconectado'}`);
    console.log(`Tempo de resposta: ${Math.round(endTime - startTime)}ms`);
    
    return new Response(
      JSON.stringify({ connected }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Erro ao verificar status do WhatsApp:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Erro ao verificar status do WhatsApp", 
        details: error instanceof Error ? error.message : "Erro desconhecido"
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
