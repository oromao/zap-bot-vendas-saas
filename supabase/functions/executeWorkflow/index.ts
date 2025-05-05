import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.34.0";
import logger from "../../../../src/lib/logger";

// Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

type Node = { id: string; type: string; data: Record<string, unknown> };
type Edge = { source: string; target: string };

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type,Authorization,x-client-info,apikey",
};

serve(async (req) => {
  console.log("[executeWorkflow] Received request:", req.method, req.url);
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { nodes, edges } = await req.json();
    console.log("[executeWorkflow] Input nodes:", JSON.stringify(nodes));
    console.log("[executeWorkflow] Input edges:", JSON.stringify(edges));
    const order = topologicalSort(nodes as Node[], edges as Edge[]);
    console.log(
      "[executeWorkflow] Computed order:",
      order.map((n) => n.id)
    );
    const results: string[] = [];
    const variables: Record<string, unknown> = {};

    for (const node of order) {
      console.log(
        `[executeWorkflow] Processing node ${node.id} type=${node.type}`
      );
      let output: string;
      switch (node.type) {
        case "mensagem":
          output = `Mensagem enviada: ${node.data.text}`;
          break;
        case "pergunta": {
          const opts = node.data.options
            ?.split(",")
            .map((o: string) => o.trim()) || ["Sim", "Não"];
          output = `Pergunta respondida: ${opts[0]}`; // simula escolha
          break;
        }
        case "condicao":
          output = `Condição ${node.data.condition} avaliada`;
          break;
        case "ia": {
          // Executa chamada via Cohere (API gratuita, free tier)
          const cohereKey = Deno.env.get("COHERE_API_KEY");
          const cohereModel = Deno.env.get("COHERE_MODEL") || "small";
          if (!cohereKey) throw new Error("Cohere API key not set");
          const cohereResp = await fetch("https://api.cohere.ai/v1/generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${cohereKey}`,
            },
            body: JSON.stringify({
              model: cohereModel,
              prompt: node.data.prompt,
              max_tokens: node.data.maxTokens || 150,
              temperature: node.data.temperature || 0.7,
            }),
          });
          const cohereJson = await cohereResp.json();
          console.log(
            "[executeWorkflow][ia] Cohere response:",
            JSON.stringify(cohereJson)
          );
          output =
            cohereJson.generations?.[0]?.text.trim() || cohereJson.text || "";
          break;
        }
        case "aguardar":
          // Espera real conforme o delay (segundos)
          const delayMs = Number(node.data.delay) * 1000;
          await new Promise((res) => setTimeout(res, delayMs));
          output = `Aguardou ${node.data.delay} segundos`;
          break;
        case "webhook":
          try {
            await fetch(node.data.webhookUrl);
            output = "Webhook recebido";
          } catch (e: unknown) {
            const msg =
              e && typeof e === "object" && "message" in e
                ? (e as { message?: string }).message || "Erro desconhecido"
                : "Erro desconhecido";
            output = `Webhook erro: ${msg}`;
          }
          break;
        case "codigo":
          try {
            // Executa código JS (cuidado em produção)
            const fn = Function(node.data.code);
            const result = fn();
            // Se retornar Promise, espera o resultado
            const final = result instanceof Promise ? await result : result;
            output = `Resultado do código: ${final}`;
          } catch (e: unknown) {
            const msg =
              e && typeof e === "object" && "message" in e
                ? (e as { message?: string }).message || "Erro desconhecido"
                : "Erro desconhecido";
            output = `Erro de código: ${msg}`;
          }
          break;
        case "banco": {
          const { data: queryData, error: queryError } = await supabase.rpc(
            "run_sql",
            { query: node.data.sql }
          );
          output = queryError
            ? `Erro SQL: ${queryError.message}`
            : JSON.stringify(queryData);
          break;
        }
        case "email": {
          const { error: mailError } = await supabase
            .from("email_queue")
            .insert({
              to: node.data.to,
              subject: node.data.subject || "Workflow Email",
              body: node.data.emailText,
            });
          output = mailError
            ? `Erro ao enfileirar e-mail: ${mailError.message}`
            : `E-mail enfileirado para ${node.data.to}`;
          break;
        }
        case "variavel": {
          variables[node.data.varName] = node.data.varValue;
          output = `Variável ${node.data.varName} = ${node.data.varValue}`;
          break;
        }
        case "arquivo": {
          output = `Arquivo enviado: ${node.data.fileUrl}`;
          break;
        }
        case "http":
          try {
            const res = await fetch(node.data.httpUrl, {
              method: node.data.httpMethod,
            });
            output = `HTTP ${res.status}`;
          } catch (e: unknown) {
            const msg =
              e && typeof e === "object" && "message" in e
                ? (e as { message?: string }).message || "Erro desconhecido"
                : "Erro desconhecido";
            output = `Erro HTTP: ${msg}`;
          }
          break;
        case "encerrar":
          output = node.data.endText;
          break;
        default:
          output = "Não implementado";
      }
      console.log(`[executeWorkflow] Node ${node.id} output:`, output);
      results.push(output);
    }

    console.log(
      "[executeWorkflow] Final results array:",
      JSON.stringify(results)
    );
    return new Response(JSON.stringify({ steps: results }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (e: unknown) {
    const msg =
      e && typeof e === "object" && "message" in e
        ? (e as { message?: string }).message || "Erro desconhecido"
        : "Erro desconhecido";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }
});

// Ordenação topológica para definir ordem de execução
function topologicalSort(nodes: Node[], edges: Edge[]): Node[] {
  const indegree = new Map<string, number>();
  nodes.forEach((n) => indegree.set(n.id, 0));
  edges.forEach((e) =>
    indegree.set(e.target, (indegree.get(e.target) || 0) + 1)
  );
  const queue = nodes.filter((n) => indegree.get(n.id) === 0);
  const order: Node[] = [];
  while (queue.length) {
    const n = queue.shift()!;
    order.push(n);
    edges
      .filter((e) => e.source === n.id)
      .forEach(({ target }) => {
        indegree.set(target, indegree.get(target)! - 1);
        if (indegree.get(target) === 0) {
          const next = nodes.find((x) => x.id === target)!;
          queue.push(next);
        }
      });
  }
  return order;
}

// Adicionando logs para execução de workflows
export async function executeWorkflowHandler(req, res) {
  logger.info("Recebendo solicitação para executar workflow");
  try {
    const { workflowId, input } = req.body;
    logger.debug("Dados recebidos para execução de workflow", {
      workflowId,
      input,
    });

    // Lógica de execução do workflow
    const workflow = await supabase
      .from("workflows")
      .select("definition")
      .eq("id", workflowId)
      .single();

    if (workflow.error) {
      logger.error("Erro ao carregar definição do workflow", workflow.error);
      return res.status(404).json({ error: "Workflow não encontrado" });
    }

    logger.info("Definição do workflow carregada com sucesso", { workflowId });

    // Simulação de execução
    const result = await executeWorkflowLogic(workflow.data.definition, input);

    logger.info("Workflow executado com sucesso", { workflowId });
    res.status(200).json({ success: true, result });
  } catch (error) {
    logger.error("Erro inesperado ao executar workflow", error);
    res.status(500).json({ error: "Erro inesperado" });
  }
}
