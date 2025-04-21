
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useWhatsAppStatus } from "./useWhatsAppStatus";

export const useWhatsAppConversations = () => {
  const { isConnected } = useWhatsAppStatus();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!isConnected) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Aqui usaríamos uma Edge Function do Supabase
      // const { data, error } = await supabaseClient.functions.invoke('get-conversations');
      
      // Mock de resposta
      setTimeout(() => {
        // Dados de exemplo
        const mockConversations = [
          {
            id: "1",
            name: "Maria Silva",
            number: "+5511998765432",
            lastMessage: {
              text: "Olá, gostaria de saber mais sobre o produto X",
              timestamp: Date.now() - 1000 * 60 * 5, // 5 minutos atrás
              fromMe: false
            }
          },
          {
            id: "2",
            name: "João Souza",
            number: "+5511987654321",
            lastMessage: {
              text: "Vou verificar o estoque e te respondo logo",
              timestamp: Date.now() - 1000 * 60 * 30, // 30 minutos atrás
              fromMe: true
            }
          },
          {
            id: "3",
            name: "Ana Oliveira",
            number: "+5511976543210",
            lastMessage: {
              text: "Qual o prazo de entrega para o CEP 01234-567?",
              timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 horas atrás
              fromMe: false
            }
          },
          {
            id: "4",
            name: "Carlos Santos",
            number: "+5511965432109",
            lastMessage: {
              text: "Obrigado pelo atendimento!",
              timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 horas atrás
              fromMe: false
            }
          },
          {
            id: "5",
            name: "Laura Mendes",
            number: "+5511954321098",
            lastMessage: {
              text: "Enviamos seu pedido hoje, o código de rastreio é BR12345678",
              timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 dia atrás
              fromMe: true
            }
          }
        ];
        
        setConversations(mockConversations);
        setIsLoading(false);
      }, 1500);
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
  }, [isConnected, toast]);

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
