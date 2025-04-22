
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache de status para reduzir consultas ao banco de dados
const statusCache = new Map();
const CACHE_TTL = 30000; // 30 segundos de TTL para o cache (aumentado para reduzir consultas frequentes)
const MAX_CACHE_SIZE = 500; // Limitar tamanho do cache para evitar vazamentos de memória

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = performance.now();
    console.log(`[${new Date().toISOString()}] Recebendo requisição de verificação de status`);
    
    // Extrair o token JWT para identificar o usuário
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Requisição sem token de autorização");
      return new Response(
        JSON.stringify({ error: "Não autorizado", details: "Token de autorização ausente" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar o cache antes de prosseguir com requisições ao banco de dados
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

    // Se não tem cache válido, inicializar cliente Supabase com tratamento de erros melhorado
    let supabaseClient;
    try {
      supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { 
          global: { 
            headers: { Authorization: authHeader },
            fetch: (url, init) => {
              return fetch(url, {
                ...init,
                signal: AbortSignal.timeout(5000), // Timeout razoável de 5s
              });
            },
          }
        }
      );
    } catch (initError) {
      console.error("Erro ao inicializar cliente Supabase:", initError);
      return new Response(
        JSON.stringify({ error: "Erro interno", details: "Falha ao inicializar serviço" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Autenticar usuário
    let user;
    try {
      const { data, error } = await supabaseClient.auth.getUser();
      if (error || !data.user) {
        console.error("Erro de autorização:", error);
        return new Response(
          JSON.stringify({ error: "Não autorizado", details: error?.message || "Usuário não encontrado" }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      user = data.user;
      console.log(`Verificando status do WhatsApp para usuário ${user.id}`);
    } catch (authError) {
      console.error("Exceção ao autenticar usuário:", authError);
      return new Response(
        JSON.stringify({ error: "Erro de autenticação", details: authError instanceof Error ? authError.message : "Falha na autenticação" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Consultar status da conexão no banco de dados com tratamento de erros
    let connected = false;
    try {
      // Otimizar consulta ao banco de dados
      const { data, error } = await supabaseClient
        .from('whatsapp_connections')
        .select('connected')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error("Erro na consulta ao banco de dados:", error);
        // Se houve erro na consulta, retornar status não conectado, mas não armazenar em cache
        return new Response(
          JSON.stringify({ connected: false }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Se não encontrou entrada, assume desconectado
      connected = data?.connected ?? false;
    } catch (dbError) {
      console.error("Exceção ao consultar banco de dados:", dbError);
      // Em caso de exceção, retornar não conectado sem armazenar em cache
      return new Response(
        JSON.stringify({ connected: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Armazenar no cache
    statusCache.set(cacheKey, {
      connected,
      timestamp: Date.now()
    });

    // Limpar entradas antigas do cache se exceder o tamanho máximo
    if (statusCache.size > MAX_CACHE_SIZE) {
      console.log(`Limpando cache (tamanho: ${statusCache.size})`);
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
    console.error("Erro não tratado ao verificar status do WhatsApp:", error);
    
    // Garantir que sempre responda, mesmo em caso de erro inesperado
    return new Response(
      JSON.stringify({ 
        error: "Erro ao verificar status do WhatsApp", 
        details: error instanceof Error ? error.message : "Erro desconhecido",
        connected: false // Sempre incluir status para evitar erros no frontend
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
