import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function executeNode(node, context) {
  // Suporte ao nó send_message
  if (node.type === "send_message") {
    // Aqui você deve usar a API do WhatsApp Cloud para enviar a mensagem
    // Exemplo de chamada (mock):
    const whatsappToken = Deno.env.get("WHATSAPP_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${whatsappToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: context.to,
        type: "text",
        text: { body: node.data.text || "Mensagem do bot!" },
      }),
    });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workflowId, to, userId } = await req.json();
    if (!workflowId || !to) {
      return new Response(
        JSON.stringify({ error: "workflowId e to são obrigatórios" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Busca o workflow salvo
    const { data: workflow, error } = await supabase
      .from("workflows")
      .select("*")
      .eq("id", workflowId)
      .single();
    if (error || !workflow) {
      return new Response(
        JSON.stringify({ error: "Workflow não encontrado" }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Cria uma instância do workflow
    const { data: instanceData, error: instanceError } = await supabase
      .from("workflow_instances")
      .insert([
        {
          workflow_id: workflowId,
          user_id: userId || null,
          step_index: 0,
          context: { to },
          active: true,
        },
      ])
      .select()
      .single();
    if (instanceError) {
      return new Response(JSON.stringify({ error: instanceError.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Executa o primeiro nó do workflow
    const nodes = workflow.definition.nodes || [];
    if (nodes.length > 0) {
      await executeNode(nodes[0], { to });
    }

    return new Response(
      JSON.stringify({
        status: "ok",
        message: "Workflow ativado e primeiro nó executado",
        instance: instanceData,
      }),
      { headers: corsHeaders }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
