import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Integration from "../components/Integration";
import HowItWorks from "../components/HowItWorks";
import Pricing from "../components/Pricing";
import Footer from "../components/Footer";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Integration />
        <Pricing />
        <section className="py-8 md:py-12 bg-gradient px-4">
          <div className="container text-center text-white">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Pronto para automatizar suas vendas?
            </h2>
            <p className="text-base md:text-xl mb-6 max-w-2xl mx-auto">
              Crie seu robô de WhatsApp agora e aumente suas vendas com
              atendimento 24/7.
            </p>
            <a
              href="/cadastro"
              className="inline-flex items-center justify-center rounded-md bg-white text-whatsapp px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-lg font-medium shadow hover:bg-gray-100 transition-colors"
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
