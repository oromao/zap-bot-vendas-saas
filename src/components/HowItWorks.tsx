import React from "react";
import { FileText, Smartphone, BarChart, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Configure seu robô",
    description:
      "Preencha o formulário com informações da sua loja e escolha os módulos que deseja ativar.",
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: "Conecte ao WhatsApp",
    description:
      "Siga nosso tutorial simples para configurar as respostas automáticas no WhatsApp Business.",
  },
  {
    icon: <BarChart className="h-6 w-6" />,
    title: "Acompanhe os resultados",
    description:
      "Visualize relatórios de desempenho e aumente suas vendas com atendimento automático.",
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Como <span className="text-gradient">funciona</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Três passos simples para transformar seu WhatsApp em uma ferramenta
            de vendas automática
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-zapbot-light flex items-center justify-center mb-4">
                <div className="text-zapbot-purple">{step.icon}</div>
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>

              {index < steps.length - 1 && (
                <div className="hidden md:flex justify-center my-4">
                  <ArrowRight className="h-6 w-6 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-whatsapp-light rounded-lg p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-2/3">
              <h3 className="text-2xl font-bold mb-4">
                Resultados reais para sua loja
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-whatsapp">+27%</div>
                  <div className="text-sm text-gray-600">Aumento em vendas</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-whatsapp">82%</div>
                  <div className="text-sm text-gray-600">Taxa de resposta</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-whatsapp">5min</div>
                  <div className="text-sm text-gray-600">
                    Tempo de configuração
                  </div>
                </div>
              </div>
              <p className="text-gray-700">
                "Começamos a usar o ZapBot há 2 meses e já recuperamos mais de
                30 carrinhos abandonados. A ferramenta é super intuitiva e os
                clientes adoram a rapidez nas respostas."
              </p>
              <div className="mt-4 flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
                <div className="ml-3">
                  <div className="font-medium">Ana Oliveira</div>
                  <div className="text-sm text-gray-600">
                    Moda Express Store
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <img
                src="https://cdn-icons-png.flaticon.com/512/889/889101.png"
                alt="Results"
                className="w-40 h-40 object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
