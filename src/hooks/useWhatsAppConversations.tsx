
import { useState, useCallback, useEffect, useRef } from "react";
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
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const MIN_FETCH_INTERVAL = 10000; // 10 segundos entre requisições

  const fetchConversations = useCallback(async (force = false) => {
    if (!isConnected) {
      return;
    }

    // Evitar múltiplas requisições simultâneas
    if (isFetchingRef.current) {
      return;
    }

    // Limitar a frequência de requisições, a menos que seja uma atualização forçada
    const now = Date.now();
    if (!force && now - lastFetchTimeRef.current < MIN_FETCH_INTERVAL) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      lastFetchTimeRef.current = now;
      
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
    } catch (err) {
      console.error("Erro ao buscar conversas:", err);
      setError("Não foi possível carregar as conversas.");
      toast({
        title: "Erro ao carregar conversas",
        description: "Ocorreu um erro ao buscar suas conversas do WhatsApp.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [isConnected, supabaseClient.functions, toast]);

  useEffect(() => {
    if (isConnected) {
      fetchConversations();
    }
  }, [isConnected, fetchConversations]);

  const refetch = useCallback(() => {
    fetchConversations(true);
  }, [fetchConversations]);

  return { conversations, isLoading, error, refetch };
};
