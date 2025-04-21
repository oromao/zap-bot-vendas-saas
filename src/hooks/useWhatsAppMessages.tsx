
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

type Message = {
  id: string;
  text: string;
  timestamp: number;
  fromMe: boolean;
  hasMedia: boolean;
  mediaUrl?: string;
};

export const useWhatsAppMessages = () => {
  const supabaseClient = useSupabaseClient();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const fetchMessages = useCallback(async (chatId: string) => {
    if (currentChatId === chatId && messages.length > 0) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setCurrentChatId(chatId);
      
      const { data, error: apiError } = await supabaseClient.functions.invoke('get-whatsapp-messages', {
        body: { chatId }
      });
      
      if (apiError) {
        console.error("Erro ao buscar mensagens:", apiError);
        setError("Não foi possível carregar as mensagens.");
        toast({
          title: "Erro ao carregar mensagens",
          description: "Ocorreu um erro ao buscar as mensagens desta conversa.",
          variant: "destructive"
        });
      } else {
        setMessages(data || []);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error("Erro ao buscar mensagens:", err);
      setError("Não foi possível carregar as mensagens.");
      setIsLoading(false);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Ocorreu um erro ao buscar as mensagens desta conversa.",
        variant: "destructive"
      });
    }
  }, [currentChatId, messages.length, supabaseClient.functions, toast]);

  return { messages, isLoading, error, fetchMessages };
};
