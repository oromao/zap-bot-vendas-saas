import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SignupForm from "../components/SignupForm";
import { MessageSquare } from "lucide-react";

const SignupPage: React.FC = () => {
  return (
    <div>
      <Navbar />
      <main className="py-16 px-4">
        <div className="container max-w-5xl">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Crie sua conta</h1>
              <p className="text-gray-600 mb-6">
                Experimente grátis por 7 dias. Sem compromisso.
              </p>
              <SignupForm />
            </div>

            <div className="flex-1">
              <div className="bg-gray-50 rounded-xl p-6 border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-whatsapp-light flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-whatsapp" />
                  </div>
                  <h2 className="font-bold text-lg">ZapBot Vendas</h2>
                </div>

                <h3 className="font-bold text-xl mb-3">O que você ganha:</h3>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-whatsapp text-lg">✓</span>
                    <span>Robô de atendimento automático para WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-whatsapp text-lg">✓</span>
                    <span>Recuperação de carrinhos abandonados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-whatsapp text-lg">✓</span>
                    <span>Envio de promoções e cupons exclusivos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-whatsapp text-lg">✓</span>
                    <span>Integração com sua plataforma de e-commerce</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-whatsapp text-lg">✓</span>
                    <span>Painel de controle intuitivo</span>
                  </li>
                </ul>

                <div className="bg-white border rounded-md p-4 mb-4">
                  <p className="text-sm text-gray-700">
                    "Desde que implementamos o ZapBot, nossa taxa de conversão
                    aumentou 23%. Os clientes adoram a resposta instantânea!"
                  </p>
                  <div className="mt-3 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
                    <div className="ml-3">
                      <div className="font-medium text-sm">
                        Ricardo Oliveira
                      </div>
                      <div className="text-xs text-gray-600">Tech Shop</div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Ao final do período gratuito de 7 dias, você será cobrado
                  R$29/mês caso opte por continuar com o plano Premium.
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

export default SignupPage;
