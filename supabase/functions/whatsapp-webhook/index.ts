import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function executeNode(node, context) {
  if (node.type === "send_message") {
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

async function processMessage(body, supabase) {
  const msg = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const from = msg?.from;
  if (!from) return;
  // Buscar instância ativa para esse cliente
  const { data: instance } = await supabase
    .from("workflow_instances")
    .select("*, workflow:workflow_id(*)")
    .eq("active", true)
    .single();
  if (!instance || !instance.workflow) return;
  // Avança o step
  const step = instance.step_index + 1;
  const nodes = instance.workflow.definition.nodes || [];
  if (step < nodes.length) {
    await executeNode(nodes[step], { to: from });
    // Atualiza a instância
    await supabase
      .from("workflow_instances")
      .update({ step_index: step })
      .eq("id", instance.id);
  } else {
    // Finaliza a instância
    await supabase
      .from("workflow_instances")
      .update({ active: false })
      .eq("id", instance.id);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const body = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    await processMessage(body, supabase);
    return new Response(JSON.stringify({ status: "received" }), {
      headers: corsHeaders,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
