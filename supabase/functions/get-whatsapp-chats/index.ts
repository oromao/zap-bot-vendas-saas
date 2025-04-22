
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
      .select('connected, status')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (!connectionData?.connected || connectionData?.status !== 'active') {
      return new Response(
        JSON.stringify({ error: "WhatsApp não está conectado" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // In a real implementation, this would fetch chats from the WhatsApp Business API
    // For this demo, we'll return mock data
    const mockChats = generateMockChats();
    
    console.log(`Retrieved ${mockChats.length} chats for user ${user.id}`);
    
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
