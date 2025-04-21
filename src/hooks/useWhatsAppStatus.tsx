
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export const useWhatsAppStatus = () => {
  const supabaseClient = useSupabaseClient();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkConnectionStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error: apiError } = await supabaseClient.functions.invoke('check-whatsapp-status');
      
      if (apiError) {
        console.error("Erro ao verificar status:", apiError);
        setError("Falha ao verificar o status da conexão. Tente novamente.");
        setIsConnected(false);
      } else {
        setIsConnected(data?.connected || false);
        setError(null);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error("Erro ao verificar status do WhatsApp:", err);
      setError("Não foi possível verificar o status da conexão.");
      setIsLoading(false);
    }
  }, [supabaseClient.functions, toast]);

  const connect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: apiError } = await supabaseClient.functions.invoke('generate-whatsapp-qr');
      
      if (apiError) {
        console.error("Erro ao gerar QR Code:", apiError);
        setError("Não foi possível gerar o QR Code. Tente novamente.");
        setIsLoading(false);
        return;
      }
      
      setQrCode(data?.qrCode);
      setIsLoading(false);
      
      // Iniciar polling para verificar status da conexão
      const checkInterval = setInterval(async () => {
        const { data: statusData } = await supabaseClient.functions.invoke('check-whatsapp-status');
        
        if (statusData?.connected) {
          setIsConnected(true);
          setQrCode(null);
          clearInterval(checkInterval);
          
          toast({
            title: "WhatsApp conectado!",
            description: "Seu WhatsApp Business foi conectado com sucesso."
          });
        }
      }, 5000); // Verificar a cada 5 segundos
      
      // Limpar intervalo após 2 minutos (tempo máximo para escanear o QR)
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!isConnected) {
          setQrCode(null);
          setError("Tempo para escanear o QR Code expirou. Tente novamente.");
        }
      }, 120000);
    } catch (err) {
      console.error("Erro ao conectar WhatsApp:", err);
      setError("Não foi possível gerar o QR Code.");
      setIsLoading(false);
    }
  }, [supabaseClient.functions, toast, isConnected]);

  const disconnect = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { error: apiError } = await supabaseClient.functions.invoke('disconnect-whatsapp');
      
      if (apiError) {
        console.error("Erro ao desconectar:", apiError);
        toast({
          title: "Erro ao desconectar",
          description: "Não foi possível desconectar o WhatsApp.",
          variant: "destructive"
        });
      } else {
        setIsConnected(false);
        
        toast({
          title: "WhatsApp desconectado",
          description: "Seu WhatsApp Business foi desconectado com sucesso."
        });
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error("Erro ao desconectar WhatsApp:", err);
      toast({
        title: "Erro ao desconectar",
        description: "Não foi possível desconectar o WhatsApp.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  }, [supabaseClient.functions, toast]);

  const reconnect = useCallback(async () => {
    setError(null);
    connect();
  }, [connect]);

  useEffect(() => {
    checkConnectionStatus();
  }, [checkConnectionStatus]);

  return {
    isConnected,
    isLoading,
    qrCode,
    error,
    connect,
    disconnect,
    reconnect
  };
};
