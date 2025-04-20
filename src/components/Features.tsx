
import React from "react";
import { ShoppingCart, FileSearch, MessageSquare, Mail, Clock, Bot, ZapOff, Zap } from "lucide-react";

const features = [
  {
    icon: <MessageSquare className="h-6 w-6 text-whatsapp" />,
    title: "Atendimento inicial automático",
    description: "Saudação personalizada e botões rápidos com opções como: ver promoções, acompanhar pedido e falar com atendente."
  },
  {
    icon: <ShoppingCart className="h-6 w-6 text-whatsapp" />,
    title: "Recuperação de carrinho abandonado",
    description: "Integração com lojas para enviar mensagens automáticas com CTA de finalização de compra."
  },
  {
    icon: <FileSearch className="h-6 w-6 text-whatsapp" />,
    title: "Rastreamento de pedido",
    description: "O cliente informa o número do pedido e o robô responde com o status atual."
  },
  {
    icon: <Mail className="h-6 w-6 text-whatsapp" />,
    title: "WhatsApp Marketing",
    description: "Ferramenta para envio de mensagens promocionais para clientes que deram opt-in."
  },
  {
    icon: <Bot className="h-6 w-6 text-whatsapp" />,
    title: "FAQ inteligente",
    description: "Respostas automáticas para perguntas comuns: formas de pagamento, prazo de entrega, troca, garantia, etc."
  },
  {
    icon: <Clock className="h-6 w-6 text-whatsapp" />,
    title: "Mensagem pós-venda + cupom",
    description: "Envio automático de mensagem de agradecimento com cupom exclusivo para recompra."
  }
];

const Features: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50" id="features">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo que você precisa para <span className="text-gradient">vender mais</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Módulos inteligentes que transformam seu WhatsApp Business em uma máquina de vendas automática
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="feature-card bg-white">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
