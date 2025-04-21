
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FormSetup from "@/components/FormSetup";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { Link } from "react-router-dom";

const ConfigPage: React.FC = () => {
  return (
    <div>
      <Navbar />
      <main className="py-16 px-4">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Configure seu <span className="text-gradient">robô de vendas</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Preencha as informações abaixo para criar seu robô de WhatsApp personalizado em minutos
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto mb-8">
            <Link to="/whatsapp">
              <Button className="w-full bg-green-500 hover:bg-green-600 flex items-center justify-center gap-2 py-6">
                <Phone className="h-5 w-5" />
                <span className="text-base">Conectar WhatsApp Business</span>
              </Button>
            </Link>
            <p className="text-xs text-center text-gray-500 mt-2">
              Conecte seu WhatsApp para ativar o robô de vendas e visualizar conversas
            </p>
          </div>
          
          <FormSetup />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ConfigPage;
