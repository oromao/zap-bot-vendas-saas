
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppConnect from "@/components/WhatsAppConnect";
import WhatsAppConversations from "@/components/WhatsAppConversations";
import { useWhatsAppStatus } from "@/hooks/useWhatsAppStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WhatsAppPage: React.FC = () => {
  const { isConnected } = useWhatsAppStatus();
  
  return (
    <div>
      <Navbar />
      <main className="py-16 px-4">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Integração <span className="text-gradient">WhatsApp Business</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Conecte seu WhatsApp Business e gerencie suas conversas diretamente na plataforma
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue={isConnected ? "conversas" : "conexao"}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="conexao">Conexão WhatsApp</TabsTrigger>
                <TabsTrigger value="conversas" disabled={!isConnected}>Conversas Recentes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="conexao">
                <Card>
                  <CardHeader>
                    <CardTitle>Conectar WhatsApp Business</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WhatsAppConnect />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="conversas">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Conversas</CardTitle>
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
