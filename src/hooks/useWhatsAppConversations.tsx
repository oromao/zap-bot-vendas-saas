import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { logger } from "../lib/frontend-logger";
import { useToast } from "./use-toast";
import { useWhatsAppStatus } from "./useWhatsAppStatus";

type WhatsAppMessage = {
  id: string;
  text: string;
  timestamp: string;
  fromMe: boolean;
};

type Conversation = {
  id: string;
  number: string;
  messages: WhatsAppMessage[];
  lastMessage: WhatsAppMessage;
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

  const fetchConversations = useCallback(
    async (force = false) => {
      if (!isConnected) {
        logger.warn("Tentativa de buscar conversas sem conexão ativa");
        return;
      }

      if (isFetchingRef.current) {
        logger.debug("Requisição de conversas já em andamento");
        return;
      }

      const now = Date.now();
      if (!force && now - lastFetchTimeRef.current < MIN_FETCH_INTERVAL) {
        logger.debug("Intervalo mínimo entre requisições não atingido");
        return;
      }

      try {
        isFetchingRef.current = true;
        setIsLoading(true);
        setError(null);

        lastFetchTimeRef.current = now;

        logger.info("Iniciando busca de conversas do WhatsApp");
        const { data, error: apiError } = await supabaseClient.functions.invoke(
          "list-whatsapp-conversations"
        );

        if (apiError) {
          logger.error(`Erro ao buscar conversas do WhatsApp: ${apiError}`);
          setError("Não foi possível carregar as conversas.");
          toast({
            title: "Erro ao carregar conversas",
            description:
              "Ocorreu um erro ao buscar suas conversas do WhatsApp.",
            variant: "destructive",
          });
        } else {
          setConversations(data || []);
          logger.info(
            `Conversas carregadas com sucesso - Total: ${data?.length}`
          );
        }
      } catch (err) {
        logger.error(`Erro inesperado ao buscar conversas: ${err}`);
        setError("Não foi possível carregar as conversas.");
        toast({
          title: "Erro ao carregar conversas",
          description: "Ocorreu um erro ao buscar suas conversas do WhatsApp.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [isConnected, supabaseClient.functions, toast]
  );

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
