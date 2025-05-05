import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppAPIConnect from "../components/WhatsAppAPIConnect";
import WhatsAppSetupTutorial from "../components/WhatsAppSetupTutorial";
import WhatsAppConversations from "../components/WhatsAppConversations";
import { useWhatsAppStatus } from "../hooks/useWhatsAppStatus";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

const WhatsAppPage: React.FC = () => {
  const { isConnected, checkStatus } = useWhatsAppStatus();
  const [activeTab, setActiveTab] = useState<string>(
    isConnected ? "conversas" : "conexao"
  );

  // Verificar o status ao montar o componente e quando o activeTab mudar
  useEffect(() => {
    // Verificar o status novamente ao mudar para a aba de conexão
    if (activeTab === "conexao") {
      checkStatus(true); // Forçar verificação
    }
  }, [activeTab, checkStatus]);

  // Se estiver conectado, mudar para a aba de conversas
  useEffect(() => {
    if (isConnected && activeTab === "conexao") {
      setActiveTab("conversas");
    }
  }, [isConnected, activeTab]);

  return (
    <div>
      <Navbar />
      <main className="py-12 px-4">
        <div className="container">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Integração{" "}
              <span className="text-gradient">WhatsApp Business API</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Conecte sua conta do WhatsApp Business API para automatizar
              conversas e aumentar suas vendas
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="conexao">Conectar WhatsApp</TabsTrigger>
                <TabsTrigger value="tutorial">Tutorial Guiado</TabsTrigger>
                <TabsTrigger value="conversas" disabled={!isConnected}>
                  Conversas Recentes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="conexao">
                <WhatsAppAPIConnect
                  onSuccess={() => {
                    checkStatus(true);
                    setActiveTab("conversas");
                  }}
                />
              </TabsContent>

              <TabsContent value="tutorial">
                <WhatsAppSetupTutorial />
              </TabsContent>

              <TabsContent value="conversas">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      Histórico de Conversas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WhatsAppConversations />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WhatsAppPage;
