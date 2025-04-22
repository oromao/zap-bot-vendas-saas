
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ExternalLink } from "lucide-react";

const WhatsAppSetupTutorial = () => {
  const steps = [
    {
      title: "Criar conta no Meta Business",
      description: "Registre-se no Meta Business Manager e crie sua conta",
      link: "https://business.facebook.com/overview",
    },
    {
      title: "Configurar WhatsApp Business",
      description: "Obtenha o ID do WhatsApp Business e token da API",
      link: "https://developers.facebook.com/docs/whatsapp/cloud-api/get-started",
    },
    {
      title: "Registrar número",
      description: "Registre seu número de telefone comercial",
      link: "https://business.facebook.com/wa/manage/phone-numbers/",
    },
    {
      title: "Verificar configurações",
      description: "Certifique-se de que todas as configurações estão corretas",
      link: "https://business.facebook.com/settings/whatsapp-business-account/",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold mb-6">Tutorial de Configuração</h3>
            
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg bg-white">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  
                  <div className="flex-grow">
                    <h4 className="text-lg font-medium">{step.title}</h4>
                    <p className="text-gray-600 mt-1">{step.description}</p>
                    
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-2"
                    >
                      Ver instruções
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  </div>
                  
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                    <span className="font-semibold text-gray-700">{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/your-video-id"
                  title="Tutorial de configuração do WhatsApp Business API"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                Precisa de ajuda? Nossa equipe de suporte está disponível para auxiliar na configuração.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppSetupTutorial;
