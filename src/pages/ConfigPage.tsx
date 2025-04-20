
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FormSetup from "@/components/FormSetup";

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
          
          <FormSetup />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ConfigPage;
