// Bot WhatsApp + Supabase Workflows em JS CommonJS
const winston = require("winston");

// Configuração do logger com winston
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta) : ""
      }`;
    })
  ),
  transports: [new winston.transports.Console()],
});

require("dotenv").config();
const { Client, LocalAuth, MessageMedia, Buttons } = require("whatsapp-web.js");
const express = require("express");
const app = express();
let latestQr = null;
const { createClient } = require("@supabase/supabase-js");

// Validar variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey)
  throw new Error("Configurar SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);

// Client WhatsApp
// Modificação para configuração do cliente WhatsApp
// Substitua o trecho de inicialização do cliente no seu arquivo bot.cjs

// Client WhatsApp
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "bot-session",
    dataPath: "./wwebjs_auth",
  }),
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium-browser",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--disable-gpu",
      "--disable-software-rasterizer",
      "--disable-features=IsolateOrigins,site-per-process",
      "--blink-settings=imagesEnabled=false",
      "--no-zygote",
      "--user-data-dir=./wwebjs_auth/session",
      "--disable-features=HttpsFirstBalancedModeAutoEnable"
    ],
    handleSIGINT: false,
    timeout: 60000
  },
});

client.on("qr", (qr) => {
  latestQr = qr;
  logger.info("QR code recebido do WhatsApp!");
});

client.on("ready", () => logger.info("WhatsApp pronto e sessão persistida!"));

client.on("message", async (msg) => {
  try {
    const from = msg.from;
    const body = msg.body;
    logger.debug({ from, body }, "Mensagem recebida");
    // Salvar input
    await supabase
      .from("whatsapp_messages")
      .insert({ from, body, received_at: new Date().toISOString() });
    // Definir workflow
    let workflowId;
    const uw = await supabase
      .from("user_workflows")
      .select("workflow_id")
      .eq("phone", from)
      .maybeSingle();
    if (uw.data) workflowId = uw.data.workflow_id;
    else {
      const def = await supabase
        .from("workflows")
        .select("id")
        .eq("type", "atendimento")
        .limit(1)
        .maybeSingle();
      workflowId = def.data?.id;
    }
    if (!workflowId) return logger.error({ from }, "Sem workflow definido");
    // Carregar definição
    const wf = await supabase
      .from("workflows")
      .select("definition")
      .eq("id", workflowId)
      .single();
    const { nodes, edges } = wf.data.definition;
    logger.info("Workflow carregado com sucesso", { workflowId });
    // Executar
    await executeWorkflowLocal(msg, nodes, edges);
  } catch (err) {
    logger.error(err, "Erro ao processar mensagem");
  }
});

// Executor local de workflow via whatsapp-web.js
async function executeWorkflowLocal(msg, nodes, edges) {
  logger.info("Iniciando execução do workflow");
  const order = topologicalSort(nodes, edges);
  for (const node of order) {
    logger.debug("Executando nó do workflow", { node });
    switch (node.type) {
      case "mensagem":
        await msg.reply(node.data.text);
        break;
      case "pergunta": {
        const opts = (node.data.options || "").split(",").map((o) => o.trim());
        const buttons = new Buttons(
          node.data.text,
          opts.map((o, i) => ({ id: `${i}`, body: o })),
          node.data.title,
          node.data.footer
        );
        await msg.reply(buttons);
        break;
      }
      case "arquivo": {
        const media = await MessageMedia.fromUrl(node.data.fileUrl);
        await msg.reply(media);
        break;
      }
      case "aguardar":
        logger.info("Aguardando", { delay: node.data.delay });
        await new Promise((r) => setTimeout(r, Number(node.data.delay) * 1000));
        break;
      case "encerrar":
        await msg.reply(node.data.endText);
        logger.info("Workflow encerrado");
        return;
      default:
        await msg.reply(`Tipo não implementado: ${node.type}`);
        logger.warn("Tipo de nó não implementado", { type: node.type });
    }
  }
}

// Ordenação topológica
function topologicalSort(nodes, edges) {
  const indegree = {};
  nodes.forEach((n) => (indegree[n.id] = 0));
  edges.forEach((e) => (indegree[e.target] = (indegree[e.target] || 0) + 1));
  const queue = nodes.filter((n) => indegree[n.id] === 0);
  const result = [];
  while (queue.length) {
    const n = queue.shift();
    result.push(n);
    edges
      .filter((e) => e.source === n.id)
      .forEach((e) => {
        indegree[e.target]--;
        if (indegree[e.target] === 0)
          queue.push(nodes.find((x) => x.id === e.target));
      });
  }
  return result;
}

app.get("/whatsapp-qr", (req, res) => {
  if (latestQr) {
    res.json({ qr: latestQr });
  } else {
    res.status(404).json({ error: "QR code não disponível" });
  }
});

app.listen(3333, "0.0.0.0", () => logger.info("Servidor QR rodando em 0.0.0.0:3333"));
// Configuração adicional para evitar problemas de resolução DNS

client.initialize();
