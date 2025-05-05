import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import logger from "../../../../src/lib/logger";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  logger.info("Recebendo solicitação para criar workflow");

  try {
    const { type, name, definition } = await req.json();
    logger.debug("Dados recebidos para criação de workflow", { name, type });

    if (!type || !name || !definition) {
      return new Response(
        JSON.stringify({ error: "type, name e definition são obrigatórios" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { data, error } = await supabase
      .from("workflows")
      .insert([{ type, name, definition }])
      .select();

    if (error) {
      logger.error("Erro ao criar workflow", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    logger.info("Workflow criado com sucesso", { id: data[0].id });

    return new Response(JSON.stringify({ workflow: data[0] }), {
      headers: corsHeaders,
    });
  } catch (e) {
    logger.error("Erro inesperado ao criar workflow", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
