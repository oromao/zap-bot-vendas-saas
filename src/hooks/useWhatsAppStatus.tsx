
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
  const [retryCount, setRetryCount] = useState(0);

  const checkConnectionStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error: apiError } = await supabaseClient.functions.invoke('check-whatsapp-status', {
        method: 'POST',
        body: { timestamp: new Date().getTime() }, // Add cache-busting parameter
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      if (apiError) {
        console.error("Erro ao verificar status:", apiError);
        setError("Falha ao verificar o status da conexão. Tente novamente.");
        
        // If it's a connection error, we don't want to set isConnected to false
        // as it might be a temporary issue and the actual status hasn't changed
        if (retryCount < 3) {
          setRetryCount(retryCount + 1);
          setTimeout(() => checkConnectionStatus(), 2000); // Retry after 2 seconds
          return;
        } else {
          setIsConnected(false);
        }
      } else {
        setIsConnected(data?.connected || false);
        setError(null);
        setRetryCount(0);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error("Erro ao verificar status do WhatsApp:", err);
      setError("Não foi possível verificar o status da conexão.");
      setIsLoading(false);
      
      // Same retry logic as above
      if (retryCount < 3) {
        setRetryCount(retryCount + 1);
        setTimeout(() => checkConnectionStatus(), 2000);
      }
    }
  }, [supabaseClient.functions, toast, retryCount]);

  const connect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setRetryCount(0);
      
      const { data, error: apiError } = await supabaseClient.functions.invoke('generate-whatsapp-qr', {
        method: 'POST',
        body: { timestamp: new Date().getTime() }, // Add cache-busting parameter
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
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
        try {
          const { data: statusData, error: statusError } = await supabaseClient.functions.invoke('check-whatsapp-status', {
            method: 'POST',
            body: { timestamp: new Date().getTime() },
            headers: {
              'Cache-Control': 'no-cache',
            }
          });
          
          if (statusError) {
            console.error("Erro ao verificar status durante polling:", statusError);
            return; // Continue trying rather than stopping the interval
          }
          
          if (statusData?.connected) {
            setIsConnected(true);
            setQrCode(null);
            clearInterval(checkInterval);
            
            toast({
              title: "WhatsApp conectado!",
              description: "Seu WhatsApp Business foi conectado com sucesso."
            });
          }
        } catch (err) {
          console.error("Erro durante polling de status:", err);
          // We don't stop the interval here as it might be a temporary error
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
      setRetryCount(0);
      
      const { error: apiError } = await supabaseClient.functions.invoke('disconnect-whatsapp', {
        method: 'POST',
        body: { timestamp: new Date().getTime() },
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
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
    setRetryCount(0);
    connect();
  }, [connect]);

  useEffect(() => {
    checkConnectionStatus();
    
    // Set up an interval to periodically check connection status
    // This makes sure the status is always up to date
    const statusInterval = setInterval(() => {
      if (!isLoading) {  // Only check if we're not already loading
        checkConnectionStatus();
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(statusInterval);
  }, [checkConnectionStatus, isLoading]);

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
