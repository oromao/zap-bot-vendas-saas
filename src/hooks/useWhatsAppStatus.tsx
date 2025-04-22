
import { useState, useCallback, useEffect, useRef } from "react";
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
  
  // Use refs to track active requests and intervals to prevent race conditions
  const statusRequestInProgress = useRef(false);
  const lastCheckTime = useRef(0);
  const statusCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qrPollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxRetries = 3;
  
  // Helper to cancel existing intervals
  const clearAllIntervals = useCallback(() => {
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }
    
    if (qrPollingIntervalRef.current) {
      clearInterval(qrPollingIntervalRef.current);
      qrPollingIntervalRef.current = null;
    }
  }, []);

  const checkConnectionStatus = useCallback(async (forceCheck = false) => {
    // Prevent concurrent requests or too frequent checking
    const now = Date.now();
    if (
      statusRequestInProgress.current || 
      (!forceCheck && now - lastCheckTime.current < 10000) // Não verificar mais frequentemente que 10s, a menos que forçado
    ) {
      return;
    }

    // Bloquear novas requisições até esta terminar
    statusRequestInProgress.current = true;
    
    try {
      if (!isLoading) setIsLoading(true);
      
      const { data, error: apiError } = await supabaseClient.functions.invoke('check-whatsapp-status', {
        method: 'POST',
        body: { timestamp: now } // Cache-busting parameter
      });
      
      // Atualizar timestamp da última verificação
      lastCheckTime.current = now;
      
      if (apiError) {
        console.error("Erro ao verificar status:", apiError);
        
        // Se o erro for de autenticação ou permissão, não tentar novamente
        if (apiError.status === 401 || apiError.status === 403) {
          setError("Sem autorização para verificar o status. Por favor, faça login novamente.");
          setIsConnected(false);
          setRetryCount(0); // Reset retry count on auth errors
        } else if (retryCount < maxRetries) {
          // Para outros erros, tentar novamente algumas vezes
          setRetryCount(prev => prev + 1);
          setError(`Tentando reconectar... (${retryCount + 1}/${maxRetries})`);
          
          // Atrasar progressivamente as novas tentativas
          setTimeout(() => {
            statusRequestInProgress.current = false; // Permitir nova tentativa
            checkConnectionStatus(true);
          }, 2000 * (retryCount + 1));
          return;
        } else {
          // Após tentativas máximas, desistir
          setError("Falha ao verificar o status da conexão após várias tentativas.");
          setIsConnected(false);
          setRetryCount(0); // Reset for future attempts
        }
      } else {
        // Sucesso na verificação
        setIsConnected(data?.connected || false);
        setError(null);
        setRetryCount(0);
      }
    } catch (err) {
      console.error("Exceção ao verificar status do WhatsApp:", err);
      setError("Não foi possível verificar o status da conexão.");
      
      // Mesmo comportamento de retry para exceções
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          statusRequestInProgress.current = false;
          checkConnectionStatus(true);
        }, 2000 * (retryCount + 1));
        return;
      } else {
        setIsConnected(false);
        setRetryCount(0);
      }
    } finally {
      // Se não houver retry pendente, liberar lock e remover loading
      if (retryCount >= maxRetries || retryCount === 0) {
        setIsLoading(false);
        statusRequestInProgress.current = false;
      }
    }
  }, [supabaseClient.functions, isLoading, retryCount]);

  const connect = useCallback(async () => {
    try {
      // Limpar todos os intervalos existentes
      clearAllIntervals();
      
      setIsLoading(true);
      setError(null);
      setRetryCount(0);
      
      const { data, error: apiError } = await supabaseClient.functions.invoke('generate-whatsapp-qr', {
        method: 'POST',
        body: { timestamp: Date.now() }
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
      qrPollingIntervalRef.current = setInterval(async () => {
        // Usar uma variável para não interferir com o state do componente
        // que pode estar desatualizado dentro deste closure
        let connected = false;
        
        try {
          const { data: statusData, error: statusError } = await supabaseClient.functions.invoke('check-whatsapp-status', {
            method: 'POST',
            body: { timestamp: Date.now() }
          });
          
          if (statusError) {
            console.error("Erro ao verificar status durante polling:", statusError);
            return; // Continue trying rather than stopping the interval
          }
          
          connected = statusData?.connected || false;
          
          if (connected) {
            setIsConnected(true);
            setQrCode(null);
            clearAllIntervals();
            
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
        if (qrPollingIntervalRef.current) {
          clearInterval(qrPollingIntervalRef.current);
          qrPollingIntervalRef.current = null;
          
          // Verificar novamente o status para ter certeza
          checkConnectionStatus(true).then(() => {
            if (!isConnected) {
              setQrCode(null);
              setError("Tempo para escanear o QR Code expirou. Tente novamente.");
            }
          });
        }
      }, 120000);
    } catch (err) {
      console.error("Erro ao conectar WhatsApp:", err);
      setError("Não foi possível gerar o QR Code.");
      setIsLoading(false);
    }
  }, [supabaseClient.functions, toast, isConnected, clearAllIntervals, checkConnectionStatus]);

  const disconnect = useCallback(async () => {
    try {
      setIsLoading(true);
      setRetryCount(0);
      
      const { error: apiError } = await supabaseClient.functions.invoke('disconnect-whatsapp', {
        method: 'POST',
        body: { timestamp: Date.now() }
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
    // Verificar status na inicialização
    checkConnectionStatus(true);
    
    // Configurar intervalo para verificar status periodicamente
    statusCheckIntervalRef.current = setInterval(() => {
      if (!statusRequestInProgress.current) {  // Somente verificar se não houver requisição em andamento
        checkConnectionStatus();
      }
    }, 60000); // Verificar a cada minuto
    
    // Cleanup ao desmontar o componente
    return () => {
      clearAllIntervals();
    };
  }, [checkConnectionStatus, clearAllIntervals]);

  return {
    isConnected,
    isLoading,
    qrCode,
    error,
    connect,
    disconnect,
    reconnect,
    checkStatus: checkConnectionStatus // Exportar função para componentes poderem forçar verificação
  };
};
