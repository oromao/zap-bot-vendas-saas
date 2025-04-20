
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Zap, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50" id="pricing">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Planos <span className="text-gradient">simples e acessíveis</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Escolha o plano ideal para o seu negócio e comece a automatizar seu WhatsApp hoje mesmo
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-heading text-lg font-bold">Plano Gratuito</h3>
                <p className="text-gray-500 text-sm">Comece a automatizar seu atendimento</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">R$0</span>
                <p className="text-gray-500 text-xs">para sempre</p>
              </div>
            </div>

            <div className="border-t border-b py-4 my-4">
              <ul className="space-y-3">
                <li className="flex gap-2 items-center text-sm">
                  <Check className="h-4 w-4 text-whatsapp" />
                  <span>Atendimento inicial automático</span>
                </li>
                <li className="flex gap-2 items-center text-sm">
                  <Check className="h-4 w-4 text-whatsapp" />
                  <span>FAQ inteligente</span>
                </li>
                <li className="flex gap-2 items-center text-sm">
                  <Check className="h-4 w-4 text-whatsapp" />
                  <span>Rastreamento de pedido</span>
                </li>
                <li className="flex gap-2 items-center text-sm text-gray-400">
                  <span className="h-4 w-4 flex items-center justify-center text-xs">1</span>
                  <span>Apenas 1 robô ativo</span>
                </li>
              </ul>
            </div>

            <Link to="/cadastro">
              <Button variant="outline" className="w-full">
                Criar conta grátis
              </Button>
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-xl border-2 border-whatsapp p-6 relative shadow-lg">
            <div className="absolute -top-3 right-4 bg-gradient text-white text-xs py-1 px-3 rounded-full flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Recomendado
            </div>

            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-heading text-lg font-bold">Plano Premium</h3>
                <p className="text-gray-500 text-sm">Automatização completa para suas vendas</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">R$29</span>
                <p className="text-gray-500 text-xs">/mês</p>
              </div>
            </div>

            <div className="border-t border-b py-4 my-4">
              <ul className="space-y-3">
                <li className="flex gap-2 items-center text-sm">
                  <Check className="h-4 w-4 text-whatsapp" />
                  <span>Todos os recursos do plano gratuito</span>
                </li>
                <li className="flex gap-2 items-center text-sm">
                  <Check className="h-4 w-4 text-whatsapp" />
                  <span>Recuperação de carrinho abandonado</span>
                </li>
                <li className="flex gap-2 items-center text-sm">
                  <Check className="h-4 w-4 text-whatsapp" />
                  <span>WhatsApp Marketing</span>
                </li>
                <li className="flex gap-2 items-center text-sm">
                  <Check className="h-4 w-4 text-whatsapp" />
                  <span>Mensagem pós-venda + cupom</span>
                </li>
                <li className="flex gap-2 items-center text-sm">
                  <Check className="h-4 w-4 text-whatsapp" />
                  <span>Alertas e Gatilhos inteligentes</span>
                </li>
                <li className="flex gap-2 items-center text-sm">
                  <Check className="h-4 w-4 text-whatsapp" />
                  <span>Múltiplos robôs ativos</span>
                </li>
                <li className="flex gap-2 items-center text-sm">
                  <Check className="h-4 w-4 text-whatsapp" />
                  <span>Relatórios de engajamento</span>
                </li>
              </ul>
            </div>

            <Link to="/cadastro">
              <Button className="w-full bg-gradient hover:opacity-90 transition-opacity flex items-center gap-2">
                <Zap className="h-4 w-4" /> 
                Teste 7 dias grátis
              </Button>
            </Link>
            <p className="text-xs text-center mt-2 text-gray-500">
              Cancele a qualquer momento. Sem compromisso.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
