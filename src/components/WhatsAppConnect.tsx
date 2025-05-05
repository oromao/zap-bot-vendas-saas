import React, { useEffect, useState } from "react";
import QRCode from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useWhatsAppStatus } from "@/hooks/useWhatsAppStatus";
import { Check, RefreshCw, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

const WhatsAppConnect: React.FC = () => {
  const { toast } = useToast();
  const {
    isConnected,
    isLoading,
    qrCode,
    connect,
    disconnect,
    reconnect,
    error,
  } = useWhatsAppStatus();
  const [countdown, setCountdown] = useState<number | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      reconnect();
      setCountdown(null);
    }
  }, [countdown, reconnect]);

  const handleConnect = () => {
    connect();
  };

  const handleReconnect = () => {
    reconnect();
  };

  const handleRefresh = () => {
    setCountdown(5);
    toast({
      title: "Reconectando...",
      description: "O QR Code será atualizado em 5 segundos.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-lg">Status da Conexão</h3>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <span className="text-green-600 font-medium flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  Conectado
                </span>
                <Button variant="outline" size="sm" onClick={disconnect}>
                  Desconectar
                </Button>
              </>
            ) : (
              <span className="text-red-600 font-medium flex items-center">
                <X className="h-4 w-4 mr-1" />
                Desconectado
              </span>
            )}
          </div>
        </div>

        {!isConnected && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Conecte seu WhatsApp Business escaneando o QR Code abaixo com seu
              aplicativo do WhatsApp. A sessão será salva para que você não
              precise escanear novamente a cada acesso.
            </p>

            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-1">
                <Card className="border-2 border-dashed bg-white w-full max-w-xs mx-auto overflow-hidden">
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="h-64 flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-12 h-12 border-4 border-t-whatsapp rounded-full animate-spin mb-4"></div>
                        <p className="text-sm text-gray-500">
                          Gerando QR Code...
                        </p>
                      </div>
                    ) : qrCode ? (
                      <div className="p-4 flex items-center justify-center">
                        <QRCode value={qrCode} size={256} />
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center p-4 text-center">
                        <p className="text-sm text-gray-500">
                          {error ||
                            "Clique em 'Conectar WhatsApp' para gerar um QR Code"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="mt-4 flex justify-center">
                  {!isConnected &&
                    (countdown !== null ? (
                      <Button disabled className="bg-gradient">
                        Atualizando em {countdown}s...
                      </Button>
                    ) : qrCode ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        className="flex items-center"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Atualizar QR Code
                      </Button>
                    ) : (
                      <Button onClick={handleConnect} className="bg-gradient">
                        Conectar WhatsApp
                      </Button>
                    ))}

                  {!isConnected && error && !qrCode && (
                    <Button
                      onClick={handleReconnect}
                      className="bg-gradient ml-2"
                    >
                      Tentar novamente
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex-1 bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-medium mb-2">Instruções:</h4>
                <ScrollArea className={isMobile ? "h-48" : "h-64"}>
                  <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
                    <li>Abra o WhatsApp Business no seu celular</li>
                    <li>Toque nos três pontos (⋮) no canto superior direito</li>
                    <li>Selecione "WhatsApp Business Web/Desktop"</li>
                    <li>Aponte a câmera do celular para o QR Code</li>
                    <li>Aguarde a confirmação de conexão</li>
                    <li>Pronto! Seu WhatsApp está conectado à plataforma</li>
                  </ol>

                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-xs text-yellow-700">
                      <strong>Importante:</strong> Mantenha seu celular
                      conectado à internet para que o robô de vendas funcione
                      corretamente. A sessão será salva para que você não
                      precise escanear o QR Code novamente.
                    </p>

                    {isMobile && (
                      <p className="text-xs text-yellow-700 mt-2">
                        <strong>Dica para usuários mobile:</strong> Para
                        escanear este QR code do mesmo dispositivo, você pode
                        fazer uma captura de tela e depois abrir a imagem no seu
                        WhatsApp Business.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppConnect;
