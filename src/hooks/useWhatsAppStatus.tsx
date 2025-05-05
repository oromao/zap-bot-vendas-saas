import { useCallback, useEffect, useRef, useState } from "react";
import { logger } from "../lib/frontend-logger";
import { useToast } from "./use-toast";

export const useWhatsAppStatus = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Use refs to track active requests and intervals to prevent race conditions
  const statusRequestInProgress = useRef(false);
  const lastCheckTime = useRef(0);
  const statusCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const qrPollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
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

  const checkConnectionStatus = useCallback(
    async (forceCheck = false) => {
      logger.info(
        `Verificando status da conexão do WhatsApp - Força: ${forceCheck}`
      );
      const now = Date.now();
      if (
        statusRequestInProgress.current ||
        (!forceCheck && now - lastCheckTime.current < 10000)
      ) {
        logger.debug(
          "Ignorando verificação de status devido a condições de bloqueio"
        );
        return;
      }

      statusRequestInProgress.current = true;

      try {
        if (!isLoading) setIsLoading(true);

        const { data, error: apiError } = await fetch(
          "/check-whatsapp-status",
          {
            method: "POST",
            body: JSON.stringify({ timestamp: now }),
            headers: { "Content-Type": "application/json" },
          }
        );

        if (apiError) {
          logger.error(`Erro ao verificar status do WhatsApp: ${apiError}`);

          // Se o erro for de autenticação ou permissão, não tentar novamente
          if (apiError.status === 401 || apiError.status === 403) {
            setError(
              "Sem autorização para verificar o status. Por favor, faça login novamente."
            );
            setIsConnected(false);
            setRetryCount(0); // Reset retry count on auth errors
          } else if (retryCount < maxRetries) {
            // Para outros erros, tentar novamente algumas vezes
            setRetryCount((prev) => prev + 1);
            setError(
              `Tentando reconectar... (${retryCount + 1}/${maxRetries})`
            );

            // Atrasar progressivamente as novas tentativas
            setTimeout(() => {
              statusRequestInProgress.current = false; // Permitir nova tentativa
              checkConnectionStatus(true);
            }, 2000 * (retryCount + 1));
            return;
          } else {
            // Após tentativas máximas, desistir
            setError(
              "Falha ao verificar o status da conexão após várias tentativas."
            );
            setIsConnected(false);
            setRetryCount(0); // Reset for future attempts
          }
        } else {
          logger.info(
            `Status do WhatsApp verificado com sucesso - Conectado: ${data?.connected}`
          );
          // Sucesso na verificação
          setIsConnected(data?.connected || false);
          setError(null);
          setRetryCount(0);
        }
      } catch (err) {
        logger.error(`Exceção ao verificar status do WhatsApp: ${err}`);
        console.error("Exceção ao verificar status do WhatsApp:", err);
        setError("Não foi possível verificar o status da conexão.");

        // Mesmo comportamento de retry para exceções
        if (retryCount < maxRetries) {
          setRetryCount((prev) => prev + 1);
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
    },
    [isLoading, retryCount]
  );

  const fetchQrFromBackend = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/whatsapp-qr");
      if (res.ok) {
        const data = await res.json();
        setQrCode(data.qr);
        setError(null);
      } else {
        setQrCode(null);
        setError("QR code não disponível");
      }
    } catch (e) {
      setQrCode(null);
      setError("Erro ao buscar QR code");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let interval;
    if (!isConnected) {
      fetchQrFromBackend();
      interval = setInterval(fetchQrFromBackend, 2000);
    }
    return () => interval && clearInterval(interval);
  }, [isConnected, fetchQrFromBackend]);

  const connect = fetchQrFromBackend;
  const disconnect = () => {};
  const reconnect = fetchQrFromBackend;

  useEffect(() => {
    // Verificar status na inicialização
    checkConnectionStatus(true);

    // Configurar intervalo para verificar status periodicamente
    statusCheckIntervalRef.current = setInterval(() => {
      if (!statusRequestInProgress.current) {
        // Somente verificar se não houver requisição em andamento
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
    checkStatus: checkConnectionStatus, // Exportar função para componentes poderem forçar verificação
  };
};
