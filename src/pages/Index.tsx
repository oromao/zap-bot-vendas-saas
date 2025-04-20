
import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Integration from "@/components/Integration";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

const Index: React.FC = () => {
  return (
    <div>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Integration />
        <Pricing />
        <section className="py-12 bg-gradient">
          <div className="container text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para automatizar suas vendas?
            </h2>
            <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto">
              Crie seu robô de WhatsApp agora e aumente suas vendas com atendimento 24/7.
            </p>
            <a 
              href="/cadastro" 
              className="inline-flex items-center justify-center rounded-md bg-white text-whatsapp px-8 py-3 text-lg font-medium shadow hover:bg-gray-100 transition-colors"
            >
              Começar teste grátis
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
