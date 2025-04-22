
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache para reduzir as chamadas
const chatCache = new Map();
const CACHE_TTL = 60000; // 1 minuto de TTL para o cache
const MAX_CACHE_SIZE = 100; // Limitar tamanho do cache

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = performance.now();
    console.log(`[${new Date().toISOString()}] Recebendo requisição para buscar conversas`);
    
    // Extrair o token JWT para identificar o usuário
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Requisição sem token de autorização");
      return new Response(
        JSON.stringify({ error: "Não autorizado", details: "Token de autorização ausente" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar o cache antes de prosseguir
    const token = authHeader.replace('Bearer ', '');
    const cacheKey = `chats_${token}`;
    const cachedChats = chatCache.get(cacheKey);
    
    if (cachedChats && (Date.now() - cachedChats.timestamp < CACHE_TTL)) {
      console.log(`Retornando chats em cache (${cachedChats.data.length} chats)`);
      return new Response(
        JSON.stringify(cachedChats.data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Se não tem cache válido, inicializar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se WhatsApp está conectado
    const { data: connectionData, error: connectionError } = await supabaseClient
      .from('whatsapp_connections')
      .select('connected, status')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (!connectionData?.connected || connectionData?.status !== 'active') {
      return new Response(
        JSON.stringify({ error: "WhatsApp não está conectado" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Em uma implementação real, isso buscaria conversas da WhatsApp Business API
    // Para esta demonstração, retornaremos dados simulados
    const mockChats = generateMockChats();
    
    console.log(`Retrieved ${mockChats.length} chats for user ${user.id}`);
    
    // Armazenar no cache
    chatCache.set(cacheKey, {
      data: mockChats,
      timestamp: Date.now()
    });

    // Limpar entradas antigas do cache se exceder o tamanho máximo
    if (chatCache.size > MAX_CACHE_SIZE) {
      console.log(`Limpando cache (tamanho: ${chatCache.size})`);
      const now = Date.now();
      for (const [key, value] of chatCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          chatCache.delete(key);
        }
      }
    }

    const endTime = performance.now();
    console.log(`Tempo de resposta: ${Math.round(endTime - startTime)}ms`);
    
    return new Response(
      JSON.stringify(mockChats),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error getting WhatsApp chats:", error);
    
    return new Response(
      JSON.stringify({ error: "Erro ao buscar conversas do WhatsApp" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Function to generate mock chat data for demonstration
function generateMockChats() {
  const names = ["Maria Silva", "João Santos", "Ana Oliveira", "Carlos Rodrigues", "Juliana Costa"];
  const messages = [
    "Olá, gostaria de saber mais sobre os produtos",
    "Qual o prazo de entrega?",
    "Os produtos têm garantia?",
    "Estou com uma dúvida sobre o pagamento",
    "Vocês entregam no meu CEP?"
  ];
  
  const chats = [];
  const now = Date.now();
  
  for (let i = 0; i < 5; i++) {
    const timeOffset = i * 1000 * 60 * (5 + Math.floor(Math.random() * 20));
    chats.push({
      id: `chat_${i+1}`,
      name: names[i],
      number: `+55119${Math.floor(10000000 + Math.random() * 90000000)}`,
      lastMessage: {
        text: messages[i],
        timestamp: now - timeOffset,
        fromMe: i % 2 === 0
      }
    });
  }
  
  return chats;
}
