import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Helper para resposta de erro padronizada
function errorResponse(message, status = 500, details = null) {
  return new Response(
    JSON.stringify(details ? { error: message, details } : { error: message }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

// Cache de status com TTL reduzido e tamanho limitado
const statusCache = new Map();
const CACHE_TTL = 30000; // 30 segundos de TTL
const MAX_CACHE_SIZE = 100; // Reduzido para 100 entradas

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse("Não autorizado", 401);
    }

    // Verificar cache primeiro
    const cacheKey = authHeader.replace("Bearer ", "");
    const cachedStatus = statusCache.get(cacheKey);

    if (cachedStatus && Date.now() - cachedStatus.timestamp < CACHE_TTL) {
      return new Response(
        JSON.stringify({ connected: cachedStatus.connected }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Se não tem cache, consultar banco
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
          fetch: (url, init) =>
            fetch(url, { ...init, signal: AbortSignal.timeout(5000) }),
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) {
      return errorResponse("Não autorizado", 401);
    }

    // Consulta simplificada ao banco
    const { data: connection } = await supabaseClient
      .from("whatsapp_connections")
      .select("connected")
      .eq("user_id", user.id)
      .maybeSingle();

    const connected = !!connection?.connected;

    // Atualizar cache
    statusCache.set(cacheKey, {
      connected,
      timestamp: Date.now(),
    });

    // Limpar cache se necessário
    if (statusCache.size > MAX_CACHE_SIZE) {
      const now = Date.now();
      for (const [key, value] of statusCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          statusCache.delete(key);
        }
      }
    }

    return new Response(JSON.stringify({ connected }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return errorResponse(
      "Erro ao verificar status",
      500,
      error instanceof Error ? error.message : String(error)
    );
  }
});
