
import React from "react";
import { Button } from "@/components/ui/button";
import { Webhook, Smartphone, ArrowRight } from "lucide-react";

const platforms = [
  { name: "Nuvemshop", logo: "https://cdn3.freelogovectors.net/wp-content/uploads/2022/03/nuvemshop-logo-freelogovectors.net_.png" },
  { name: "WooCommerce", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/WooCommerce_logo.svg/1200px-WooCommerce_logo.svg.png" },
  { name: "Tray", logo: "https://149368500.v2.pressablecdn.com/wp-content/uploads/2022/10/2022-marketplace-pressroom-tray-logo-12_og.jpg" },
  { name: "Shopify", logo: "https://1000logos.net/wp-content/uploads/2023/01/Shopify-logo-500x281.jpg" },
];

const Integration: React.FC = () => {
  return (
    <section className="py-16">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="rounded-xl bg-gray-100 p-6 relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Webhook className="h-6 w-6 text-zapbot-blue" />
                  <span className="font-medium">Integração fácil</span>
                </div>
                <div className="bg-white px-2 py-1 rounded text-xs font-medium text-gray-500">
                  Conectado
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-whatsapp" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <div className="bg-white p-3 rounded-lg flex-1 border">
                    <div className="text-sm font-medium">Integração WhatsApp Business</div>
                    <div className="text-xs text-gray-500 mt-1">Conectado com +55 (11) 98765-4321</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <img src={platforms[0].logo} alt="Nuvemshop" className="w-8 h-8 object-contain" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <div className="bg-white p-3 rounded-lg flex-1 border">
                    <div className="text-sm font-medium">Integração Nuvemshop</div>
                    <div className="text-xs text-gray-500 mt-1">Conectado com Moda Express Store</div>
                  </div>
                </div>
                
                <div className="p-3 bg-white rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Configurações avançadas</div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Editar
                    </Button>
                  </div>
                  <ul className="mt-2 space-y-2 text-xs">
                    <li className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      Recuperação de carrinho: Ativado
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      Notificações de pedido: Ativado
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      Marketing: Ativado
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Integração <span className="text-gradient">sem complicação</span>
            </h2>
            <p className="text-gray-600 mb-6">
              Conecte sua loja em minutos com nosso sistema de integração simplificado. 
              Compatível com as principais plataformas de e-commerce do Brasil.
            </p>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Plataformas compatíveis:</h3>
              <div className="flex flex-wrap gap-4">
                {platforms.map((platform, index) => (
                  <div key={index} className="bg-white border rounded-md p-2 flex items-center gap-2 w-36">
                    <div className="w-8 h-8 flex-shrink-0">
                      <img 
                        src={platform.logo} 
                        alt={platform.name} 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <span className="text-sm font-medium">{platform.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium mb-2 text-sm">Também disponível via:</h4>
              <div className="flex gap-4">
                <div className="bg-white border rounded-md p-2 flex items-center gap-2">
                  <img 
                    src="https://assets-global.website-files.com/5d3e265ac89f6a2f75eec26b/5d9e1e536a503f25e899bc14_zapier-1.svg" 
                    alt="Zapier" 
                    className="w-6 h-6 object-contain" 
                  />
                  <span className="text-sm font-medium">Zapier</span>
                </div>
                <div className="bg-white border rounded-md p-2 flex items-center gap-2">
                  <img 
                    src="https://play-lh.googleusercontent.com/5TspYNBYA1pj4QbedM-T_mHDgKS4ORXzBdF9MzY2t6rvLRNbpHd5eTVmKGYQ0xnlLIEA" 
                    alt="Webhooks" 
                    className="w-6 h-6 object-contain"
                  />
                  <span className="text-sm font-medium">Webhook</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integration;
