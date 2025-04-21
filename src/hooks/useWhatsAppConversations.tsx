
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useWhatsAppStatus } from "./useWhatsAppStatus";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

type Conversation = {
  id: string;
  name: string;
  number: string;
  lastMessage: {
    text: string;
    timestamp: number;
    fromMe: boolean;
  }
};

export const useWhatsAppConversations = () => {
  const supabaseClient = useSupabaseClient();
  const { isConnected } = useWhatsAppStatus();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!isConnected) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: apiError } = await supabaseClient.functions.invoke('get-whatsapp-chats');
      
      if (apiError) {
        console.error("Erro ao buscar conversas:", apiError);
        setError("Não foi possível carregar as conversas.");
        toast({
          title: "Erro ao carregar conversas",
          description: "Ocorreu um erro ao buscar suas conversas do WhatsApp.",
          variant: "destructive"
        });
      } else {
        setConversations(data || []);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error("Erro ao buscar conversas:", err);
      setError("Não foi possível carregar as conversas.");
      setIsLoading(false);
      toast({
        title: "Erro ao carregar conversas",
        description: "Ocorreu um erro ao buscar suas conversas do WhatsApp.",
        variant: "destructive"
      });
    }
  }, [isConnected, supabaseClient.functions, toast]);

  useEffect(() => {
    if (isConnected) {
      fetchConversations();
    }
  }, [isConnected, fetchConversations]);

  const refetch = useCallback(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, isLoading, error, refetch };
};
