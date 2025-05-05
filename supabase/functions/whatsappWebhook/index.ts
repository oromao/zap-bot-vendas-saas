import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.34.0";

// Supabase client
type MessageRow = { from: string; body: string; received_at: string };
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

// WhatsApp API config defaults (Facebook WABA)
const whatsappEnvToken = Deno.env.get("WHATSAPP_TOKEN")!;
const whatsappEnvPhoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")!;
const whatsappVerifyToken = Deno.env.get("WHATSAPP_VERIFY_TOKEN")!;

async function sendWhatsApp(
  to: string,
  message: string,
  token?: string,
  phoneNumberId?: string
) {
  const tokenToUse = token || whatsappEnvToken;
  const phoneIdToUse = phoneNumberId || whatsappEnvPhoneNumberId;
  const res = await fetch(
    `https://graph.facebook.com/v15.0/${phoneIdToUse}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenToUse}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        text: { body: message },
      }),
    }
  );
  if (!res.ok) console.error("sendWhatsApp error:", await res.text());
}

serve(async (req) => {
  // Handle WhatsApp webhook verification challenge
  const url = new URL(req.url);
  if (req.method === "GET" && url.searchParams.has("hub.challenge")) {
    if (url.searchParams.get("hub.verify_token") === whatsappVerifyToken) {
      return new Response(url.searchParams.get("hub.challenge")!, {
        status: 200,
      });
    }
    return new Response("Forbidden", { status: 403 });
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const event = await req.json();
  // extract user token/phone override if provided
  const userToken: string | undefined = event.userToken || event.token;
  const userPhoneNumberId: string | undefined = event.phoneNumberId;
  const from = event.from || event.From || event.messages?.[0]?.from || "";
  const body =
    event.body || event.Body || event.messages?.[0]?.text?.body || "";
  console.log("[whatsappWebhook] incoming", from, body);

  // Save incoming message
  await supabase
    .from<MessageRow>("whatsapp_messages")
    .insert({ from, body, received_at: new Date().toISOString() });

  // Determine workflow ID for user
  let workflowId: string | null = null;
  const { data: uw, error: uwErr } = await supabase
    .from("user_workflows")
    .select("workflow_id")
    .eq("phone", from)
    .single();
  if (uw && uw.workflow_id) {
    workflowId = uw.workflow_id;
  } else {
    const { data: def, error: defErr } = await supabase
      .from("workflows")
      .select("id")
      .eq("type", "atendimento")
      .limit(1)
      .single();
    workflowId = def?.id || null;
  }
  if (!workflowId) {
    console.error("No workflow found for", from);
    return new Response("Not found", { status: 404 });
  }

  // Load workflow definition
  const { data: wf, error: wfErr } = await supabase
    .from("workflows")
    .select("definition")
    .eq("id", workflowId)
    .single();
  if (wfErr || !wf) {
    console.error("Workflow load error", wfErr);
    return new Response("Internal Error", { status: 500 });
  }
  const { nodes, edges } = wf.definition as {
    nodes: unknown[];
    edges: unknown[];
  };

  // Execute workflow
  const { data: exec, error: execErr } = await supabase.functions.invoke(
    "executeWorkflow",
    { body: JSON.stringify({ nodes, edges }) }
  );
  if (execErr) {
    console.error("executeWorkflow error", execErr);
    return new Response("Internal Error", { status: 500 });
  }
  const steps: string[] = exec.steps;

  // Send replies
  for (const msg of steps) {
    // pass user credentials or fallback to env
    await sendWhatsApp(from, msg, userToken, userPhoneNumberId);
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
