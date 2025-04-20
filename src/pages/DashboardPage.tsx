
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BotPreview from "@/components/BotPreview";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  MessageSquare, 
  BarChart, 
  Settings, 
  Share2,
  ChevronUp
} from "lucide-react";

const DashboardPage: React.FC = () => {
  return (
    <div>
      <Navbar />
      <main className="py-8 px-4">
        <div className="container">
          <div className="flex flex-col md:flex-row items-start gap-6 md:mb-8">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-gray-600 mb-4">
                Gerencie seu robô de vendas e acompanhe seu desempenho
              </p>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Editar robô
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Compartilhar
                </Button>
              </div>
            </div>
            
            <div className="w-full md:w-auto flex flex-col md:flex-row gap-3 bg-gray-50 p-4 rounded-lg border">
              <div className="text-center px-6 py-2">
                <div className="text-3xl font-bold text-whatsapp flex items-center justify-center">
                  256 <ChevronUp className="h-4 w-4 ml-1" />
                </div>
                <div className="text-xs text-gray-600">Interações</div>
              </div>
              
              <div className="text-center px-6 py-2 border-t md:border-t-0 md:border-l border-gray-200">
                <div className="text-3xl font-bold text-whatsapp flex items-center justify-center">
                  12 <ChevronUp className="h-4 w-4 ml-1" />
                </div>
                <div className="text-xs text-gray-600">Vendas</div>
              </div>
              
              <div className="text-center px-6 py-2 border-t md:border-t-0 md:border-l border-gray-200">
                <div className="text-3xl font-bold text-whatsapp flex items-center justify-center">
                  67%
                </div>
                <div className="text-xs text-gray-600">Taxa de resposta</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Seu robô</h2>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Ativo
                  </span>
                </div>
                <BotPreview storeName="Moda Express" storeUrl="www.modaexpress.com.br" />
              </div>
              
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-bold mb-3">Módulos ativos</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Atendimento inicial automático
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Recuperação de carrinho abandonado
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Rastreamento de pedido
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    WhatsApp Marketing
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    FAQ inteligente
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Mensagem pós-venda + cupom
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg border">
                <div className="p-4 border-b">
                  <div className="flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-gray-500" />
                    <h3 className="font-bold">Desempenho das mensagens</h3>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md border text-gray-500 text-sm">
                    Gráfico de desempenho das mensagens
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border">
                <div className="p-4 border-b">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <h3 className="font-bold">Conversas recentes</h3>
                  </div>
                </div>
                
                <div className="p-4">
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div>
                          <div className="font-medium text-sm">Maria Silva</div>
                          <div className="text-xs text-gray-500">Quero ver promoções</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">12:45</div>
                    </li>
                    <li className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div>
                          <div className="font-medium text-sm">João Santos</div>
                          <div className="text-xs text-gray-500">Rastreamento de pedido</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">11:32</div>
                    </li>
                    <li className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div>
                          <div className="font-medium text-sm">Ana Costa</div>
                          <div className="text-xs text-gray-500">Qual prazo de entrega?</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">10:18</div>
                    </li>
                    <li className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div>
                          <div className="font-medium text-sm">Carlos Gomes</div>
                          <div className="text-xs text-gray-500">Preciso de ajuda</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">09:45</div>
                    </li>
                  </ul>
                  
                  <div className="mt-4 text-center">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Ver todas as conversas
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
