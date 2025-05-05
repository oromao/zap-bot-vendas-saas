import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.34.0";

// Supabase Edge Function for saving workflows
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-client-info, apikey",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { workflowName, nodes, edges, name, type, id } = await req.json();
    const safeName =
      typeof name === "string" && name.trim()
        ? name
        : typeof workflowName === "string" && workflowName.trim()
        ? workflowName
        : "Workflow sem nome";
    const safeType =
      typeof type === "string" && type.trim() ? type : "atendimento";
    const definition = { nodes, edges };
    const values = {
      workflow_name: workflowName,
      name: safeName,
      type: safeType,
      nodes,
      edges,
      definition,
    };
    let res;
    if (id) {
      // Update existing workflow
      res = await supabase.from("workflows").update(values).eq("id", id);
    } else {
      // Insert new workflow
      res = await supabase.from("workflows").insert(values);
    }
    const { data, error } = res;

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: unknown) {
    const msg =
      err && typeof err === "object" && "message" in err
        ? (err as { message?: string }).message || "Erro desconhecido"
        : "Erro desconhecido";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
