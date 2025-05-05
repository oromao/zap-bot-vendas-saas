import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BotPreviewProps {
  storeName?: string;
  storeUrl?: string;
}

const BotPreview: React.FC<BotPreviewProps> = ({
  storeName = "Moda Express",
  storeUrl = "www.modaexpress.com.br",
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("preview");

  const handleCopy = () => {
    // Aqui seria o código para copiar ao clipboard
    toast({
      title: "Copiado!",
      description: "Comandos copiados para a área de transferência.",
    });
  };

  const handleOpenWhatsApp = () => {
    window.open("https://web.whatsapp.com", "_blank");
  };

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm">
      <div className="flex border-b">
        <button
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === "preview"
              ? "text-whatsapp border-b-2 border-whatsapp"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("preview")}
        >
          Preview do Robô
        </button>
        <button
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === "code"
              ? "text-whatsapp border-b-2 border-whatsapp"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("code")}
        >
          Comandos
        </button>
        <button
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === "integration"
              ? "text-whatsapp border-b-2 border-whatsapp"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("integration")}
        >
          Integração
        </button>
      </div>

      <div className="bg-gray-50 p-4">
        {activeTab === "preview" && (
          <div className="whatsapp-bg rounded-lg p-4 max-h-[500px] overflow-y-auto">
            <div className="chat-bubble chat-bubble-received">
              <p className="text-sm">
                Olá! Eu sou o robô de atendimento da <b>{storeName}</b>. Como
                posso te ajudar hoje?
              </p>
            </div>
            <div className="flex flex-col gap-2 my-2">
              <button className="bg-white text-left text-sm py-2 px-3 rounded-md border hover:bg-gray-50 transition-colors">
                1 - Ver promoções
              </button>
              <button className="bg-white text-left text-sm py-2 px-3 rounded-md border hover:bg-gray-50 transition-colors">
                2 - Acompanhar pedido
              </button>
              <button className="bg-white text-left text-sm py-2 px-3 rounded-md border hover:bg-gray-50 transition-colors">
                3 - Falar com atendente
              </button>
            </div>

            <div className="chat-bubble chat-bubble-sent">
              <p className="text-sm">1</p>
            </div>

            <div className="chat-bubble chat-bubble-received flex flex-col gap-3">
              <p className="text-sm">
                🔥 <b>PROMOÇÕES DA SEMANA!</b> 🔥
              </p>
              <p className="text-sm">
                20% OFF em todos os produtos da nova coleção. Use o cupom{" "}
                <b>ZAPBOT20</b>
              </p>
              <div className="w-full bg-white rounded-lg overflow-hidden border">
                <div className="aspect-video bg-gray-100"></div>
                <div className="p-3">
                  <p className="text-sm font-medium">
                    Compre agora com desconto!
                  </p>
                  <p className="text-xs text-gray-500">{storeUrl}</p>
                </div>
              </div>
            </div>

            <div className="chat-bubble chat-bubble-sent">
              <p className="text-sm">2</p>
            </div>

            <div className="chat-bubble chat-bubble-received">
              <p className="text-sm">
                Por favor, informe o número do seu pedido:
              </p>
            </div>

            <div className="chat-bubble chat-bubble-sent">
              <p className="text-sm">#12345</p>
            </div>

            <div className="chat-bubble chat-bubble-received">
              <p className="text-sm">Encontrei seu pedido #12345!</p>
              <p className="text-sm mt-1">
                Status: <b>Em trânsito</b>
              </p>
              <p className="text-sm mt-1">
                Previsão de entrega: <b>23/04/2025</b>
              </p>
              <p className="text-sm mt-3">Precisa de mais alguma informação?</p>
            </div>
          </div>
        )}

        {activeTab === "code" && (
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-sm mb-4">
              Copie e cole estes comandos nas respostas rápidas do seu WhatsApp
              Business:
            </p>

            <div className="bg-gray-100 p-4 rounded-lg mb-4 font-mono text-xs overflow-auto max-h-[300px]">
              <p className="mb-2">*Saudação*</p>
              <p className="mb-4">
                Olá! Eu sou o robô de atendimento da *{storeName}*. Como posso
                te ajudar hoje?
                <br />
                <br />
                1 - Ver promoções
                <br />
                2 - Acompanhar pedido
                <br />3 - Falar com atendente
              </p>

              <p className="mb-2">*Promoções*</p>
              <p className="mb-4">
                🔥 *PROMOÇÕES DA SEMANA!* 🔥
                <br />
                <br />
                20% OFF em todos os produtos da nova coleção. Use o cupom
                *ZAPBOT20*
                <br />
                <br />
                Acesse agora: {storeUrl}
              </p>

              <p className="mb-2">*Rastreamento*</p>
              <p className="mb-4">Por favor, informe o número do seu pedido:</p>

              <p className="mb-2">*FAQ Pagamento*</p>
              <p>
                Aceitamos os seguintes métodos de pagamento:
                <br />
                <br />
                - Cartão de crédito (até 12x)
                <br />
                - Cartão de débito
                <br />
                - Boleto bancário
                <br />- PIX
              </p>
            </div>

            <Button
              onClick={handleCopy}
              className="w-full flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copiar comandos
            </Button>
          </div>
        )}

        {activeTab === "integration" && (
          <div className="bg-white rounded-lg p-4 border">
            <h4 className="font-medium mb-3">
              Tutorial para configurar no WhatsApp Business
            </h4>

            <ul className="space-y-3 mb-4">
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-whatsapp mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  Abra o WhatsApp Business no seu celular
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-whatsapp mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  Vá em Configurações &gt; Ferramentas para Empresas &gt;
                  Respostas Rápidas
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-whatsapp mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  Adicione novas respostas rápidas para cada comando
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-whatsapp mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  Use atalhos como /saudacao, /promos, /rastreio, etc.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-whatsapp mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  Salve e teste enviando uma mensagem para você mesmo
                </span>
              </li>
            </ul>

            <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm border">
              <p className="font-medium mb-1">💡 Dica profissional:</p>
              <p className="text-gray-600 text-xs">
                Configure mensagens de ausência e respostas automáticas nas
                configurações do WhatsApp Business para ativar seu robô 24/7.
              </p>
            </div>

            <Button
              onClick={handleOpenWhatsApp}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir WhatsApp Business
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BotPreview;
