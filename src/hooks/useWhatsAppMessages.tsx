
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export const useWhatsAppMessages = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
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
      
      // Aqui usaríamos uma Edge Function do Supabase
      // const { data, error } = await supabaseClient.functions.invoke('get-messages', { chatId });
      
      // Mock de resposta
      setTimeout(() => {
        // Dados de exemplo
        const mockMessages = Array(10).fill(null).map((_, index) => {
          const isEven = index % 2 === 0;
          const timestamp = Date.now() - 1000 * 60 * (index + 1);
          
          return {
            id: `msg_${chatId}_${index}`,
            text: isEven 
              ? "Lorem ipsum dolor sit amet, consectetur adipiscing elit." 
              : "Suspendisse potenti. Nullam eu felis at magna feugiat tincidunt.",
            timestamp,
            fromMe: !isEven,
            hasMedia: index === 2,
            mediaUrl: index === 2 ? "https://example.com/image.jpg" : undefined
          };
        });
        
        setMessages(mockMessages);
        setIsLoading(false);
      }, 1000);
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
  }, [currentChatId, messages.length, toast]);

  return { messages, isLoading, error, fetchMessages };
};
