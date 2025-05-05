import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoginForm from "../components/LoginForm";
import { MessageSquare } from "lucide-react";

const LoginPage: React.FC = () => {
  return (
    <div>
      <Navbar />
      <main className="py-16 px-4">
        <div className="container max-w-5xl">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Entre na sua conta</h1>
              <p className="text-gray-600 mb-6">
                Acesse o painel de controle do seu robô de vendas
              </p>
              <LoginForm />
            </div>

            <div className="flex-1">
              <div className="bg-gray-50 rounded-xl p-6 border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-whatsapp-light flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-whatsapp" />
                  </div>
                  <h2 className="font-bold text-lg">ZapBot Vendas</h2>
                </div>

                <div className="mb-6">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/889/889101.png"
                    alt="WhatsApp Bot"
                    className="w-48 h-48 mx-auto"
                  />
                </div>

                <div className="text-center">
                  <h3 className="font-bold text-xl mb-3">Não tem uma conta?</h3>
                  <p className="mb-4 text-gray-600">
                    Experimente o ZapBot por 7 dias gratuitamente e transforme
                    seu WhatsApp em uma ferramenta de vendas automática.
                  </p>
                  <a
                    href="/cadastro"
                    className="block w-full py-2 px-4 bg-gradient text-white rounded-md font-medium hover:opacity-90 transition-opacity"
                  >
                    Criar conta grátis
                  </a>
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

export default LoginPage;
