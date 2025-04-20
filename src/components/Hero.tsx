
import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Bot, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Hero: React.FC = () => {
  return (
    <section className="py-20 px-4 md:px-0">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-zapbot-light text-zapbot-purple mb-4">
              <Sparkles className="h-4 w-4 mr-2" /> Lançamento Especial: 7 dias grátis
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Crie seu <span className="text-gradient">robô de vendas</span> para WhatsApp em minutos
            </h1>
            <p className="text-gray-600 text-lg md:text-xl mb-8 max-w-2xl">
              Automatize seu atendimento, recupere carrinhos abandonados e aumente suas vendas com uma ferramenta simples e poderosa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/cadastro">
                <Button className="bg-gradient hover:opacity-90 transition-opacity text-lg px-8 py-6 h-auto">
                  Começar agora
                </Button>
              </Link>
              <Link to="/demonstracao">
                <Button variant="outline" className="text-lg px-8 py-6 h-auto">
                  Ver demonstração
                </Button>
              </Link>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              Não precisa de cartão de crédito para começar
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-whatsapp/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-zapbot-blue/10 rounded-full blur-3xl"></div>
              <div className="relative bg-white border rounded-xl shadow-lg p-6 whatsapp-bg">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="ml-2 text-sm font-medium text-gray-700">WhatsApp Business</div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="chat-bubble chat-bubble-received">
                    <p className="text-sm">Olá! Sou o robô de atendimento da <b>Moda Express</b>. Como posso te ajudar hoje?</p>
                  </div>
                  <div className="flex flex-col gap-2">
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
                    <p className="text-sm">🔥 <b>PROMOÇÕES IMPERDÍVEIS!</b> 🔥</p>
                    <p className="text-sm">20% OFF em todos os produtos da nova coleção. Use o cupom <b>ZAPBOT20</b></p>
                    <div className="w-full bg-white rounded-lg overflow-hidden border">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <Zap className="h-12 w-12 text-whatsapp animate-pulse" />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium">Compre agora com desconto!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
