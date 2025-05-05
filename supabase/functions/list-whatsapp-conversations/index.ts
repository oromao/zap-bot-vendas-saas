import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[DEBUG] Iniciando busca de conversas do WhatsApp");

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Token de autorização ausente");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error("[DEBUG] Erro ao obter usuário:", userError);
      throw new Error("Usuário não autenticado");
    }

    console.log(
      "[DEBUG] Buscando credenciais do WhatsApp para o usuário:",
      user.id
    );

    // Get WhatsApp credentials
    const { data: credentials, error: credentialsError } = await supabaseClient
      .from("whatsapp_credentials")
      .select("phone_number_id, access_token")
      .eq("user_id", user.id)
      .maybeSingle();

    if (credentialsError) {
      console.error("[DEBUG] Erro ao buscar credenciais:", credentialsError);
      throw new Error(
        `Erro ao buscar credenciais: ${credentialsError.message}`
      );
    }

    if (!credentials) {
      console.error(
        "[DEBUG] Nenhuma credencial encontrada para o usuário:",
        user.id
      );
      throw new Error(
        "Credenciais do WhatsApp não encontradas. Por favor, reconecte sua conta do WhatsApp."
      );
    }

    console.log("[DEBUG] Credenciais encontradas:", {
      phoneNumberId: credentials.phone_number_id,
      hasAccessToken: !!credentials.access_token,
      userId: user.id,
    });

    console.log("[DEBUG] Fazendo requisição para a API do WhatsApp");

    // Get messages from WhatsApp API
    const apiVersion = "v18.0";
    const fields = "message_id,from,to,timestamp,text,type";

    // Buscar mensagens diretamente usando o phone_number_id
    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${credentials.phone_number_id}/messages?fields=${fields}&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${credentials.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[DEBUG] Erro na resposta da API do WhatsApp:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        phoneNumberId: credentials.phone_number_id,
        url: `https://graph.facebook.com/${apiVersion}/${credentials.phone_number_id}/messages`,
      });

      // Verificar erros específicos
      if (response.status === 400) {
        throw new Error("Requisição inválida para a API do WhatsApp");
      } else if (response.status === 401) {
        throw new Error("Token de acesso inválido ou expirado");
      } else if (response.status === 404) {
        throw new Error("Phone Number ID não encontrado");
      } else {
        throw new Error(
          `Erro na API do WhatsApp: ${
            errorData.error?.message || response.statusText
          }`
        );
      }
    }

    const data = await response.json();

    // Validar a resposta
    if (!data.data || !Array.isArray(data.data)) {
      console.error("[DEBUG] Resposta inválida da API:", data);
      throw new Error("Formato de resposta inválido da API do WhatsApp");
    }

    // Log para debug
    console.log("[DEBUG] Resposta da API do WhatsApp:", {
      totalMessages: data.data.length,
      firstMessage: data.data[0],
      lastMessage: data.data[data.data.length - 1],
    });

    // Definir interfaces para tipagem
    interface WhatsAppMessage {
      id: string;
      text: string;
      timestamp: string;
      fromMe: boolean;
    }

    interface ConversationGroup {
      [phoneNumber: string]: WhatsAppMessage[];
    }

    // Agrupar mensagens por número de telefone para criar "conversas"
    const messagesByPhone = data.data.reduce(
      (acc: ConversationGroup, msg: unknown) => {
        const phoneNumber = msg.from || msg.to;
        if (!acc[phoneNumber]) {
          acc[phoneNumber] = [];
        }
        acc[phoneNumber].push({
          id: msg.message_id,
          text: msg.text?.body || "",
          timestamp: msg.timestamp,
          fromMe: msg.from === credentials.phone_number_id,
        });
        return acc;
      },
      {}
    );

    // Transformar em lista de conversas
    const conversations = Object.entries(messagesByPhone).map((entry) => {
      const [phoneNumber, messages] = entry as [string, WhatsAppMessage[]];
      return {
        id: phoneNumber,
        number: phoneNumber,
        messages: messages,
        lastMessage: messages[0], // As mensagens já vêm ordenadas por data
      };
    });

    console.log(`[DEBUG] Encontradas ${conversations.length} conversas`);

    const apiResponse = { conversations };

    if (!apiResponse.conversations) {
      console.error("[DEBUG] Resposta inválida:", apiResponse);
      throw new Error("Formato de resposta inválido.");
    }

    console.log("[DEBUG] Conversas recebidas:", apiResponse.conversations);

    return new Response(JSON.stringify(apiResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[DEBUG] Erro na função list-whatsapp-conversations:", error);
    return new Response(
      JSON.stringify({
        error: "Erro ao buscar conversas da API do WhatsApp",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
