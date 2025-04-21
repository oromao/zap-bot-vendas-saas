
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request data
    const reqData = await req.json();
    const { chatId } = reqData;
    
    if (!chatId) {
      return new Response(
        JSON.stringify({ error: "ID da conversa não fornecido" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the user ID from the JWT token in the request
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if WhatsApp is connected
    const { data: connectionData, error: connectionError } = await supabaseClient
      .from('whatsapp_connections')
      .select('connected')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (!connectionData?.connected) {
      return new Response(
        JSON.stringify({ error: "WhatsApp não está conectado" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // In a real implementation, this would fetch messages from the WhatsApp Business API
    // For this demo, we'll return mock data
    const mockMessages = generateMockMessages(chatId);
    
    console.log(`Retrieved ${mockMessages.length} messages for chat ${chatId}, user ${user.id}`);
    
    return new Response(
      JSON.stringify(mockMessages),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error getting WhatsApp messages:", error);
    
    return new Response(
      JSON.stringify({ error: "Erro ao buscar mensagens do WhatsApp" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Function to generate mock message data for demonstration
function generateMockMessages(chatId: string) {
  const customerMessages = [
    "Olá, tudo bem?",
    "Gostaria de saber mais sobre seus produtos",
    "Qual o prazo de entrega?",
    "Vocês aceitam PIX como pagamento?",
    "Muito obrigado pela informação!"
  ];
  
  const businessMessages = [
    "Olá! Tudo ótimo, como posso ajudar?",
    "Claro! Temos diversos produtos. O que está procurando especificamente?",
    "Nosso prazo de entrega é de 3-5 dias úteis para todo Brasil",
    "Sim, aceitamos PIX, cartão de crédito e boleto bancário",
    "Por nada! Estamos à disposição para mais informações"
  ];
  
  const messages = [];
  const now = Date.now();
  const messageCount = 5 + Math.floor(Math.random() * 5);
  
  // Add a custom conversation flow based on chat ID
  const chatIdNum = parseInt(chatId.replace('chat_', ''));
  const offset = (chatIdNum - 1) * 2; // Make conversations different based on chat ID
  
  for (let i = 0; i < messageCount; i++) {
    const isCustomer = i % 2 === 0;
    const timeOffset = (messageCount - i) * 1000 * 60 * (1 + Math.floor(Math.random() * 5));
    const messageIndex = (i + offset) % 5;
    
    messages.push({
      id: `msg_${chatId}_${i+1}`,
      text: isCustomer ? customerMessages[messageIndex] : businessMessages[messageIndex],
      timestamp: now - timeOffset,
      fromMe: !isCustomer,
      hasMedia: false
    });
  }
  
  return messages;
}
