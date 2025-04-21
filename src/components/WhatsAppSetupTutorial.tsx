
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const WhatsAppSetupTutorial: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const toggleStep = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) {
      setCompletedSteps(completedSteps.filter(step => step !== stepNumber));
    } else {
      setCompletedSteps([...completedSteps, stepNumber]);
    }
  };
  
  const isStepCompleted = (stepNumber: number) => completedSteps.includes(stepNumber);

  return (
    <div className="space-y-6" id="tutorial">
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Tutorial de configuração</h3>
        
        <Tabs defaultValue="meta">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="meta">Meta WhatsApp API</TabsTrigger>
            <TabsTrigger value="twilio">Twilio API</TabsTrigger>
          </TabsList>
          
          <TabsContent value="meta">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-500">Concluído: {completedSteps.length}/5 etapas</p>
              <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full"
                  style={{ width: `${(completedSteps.length / 5) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute left-3.5 top-5 h-[calc(100%-50px)] w-px bg-gray-200"></div>
              
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-8 relative">
                  {/* Step 1 */}
                  <div className="relative">
                    <button 
                      onClick={() => toggleStep(1)} 
                      className={`absolute left-0 top-1 w-7 h-7 rounded-full border flex items-center justify-center ${isStepCompleted(1) ? "bg-green-100 border-green-500" : "bg-white border-gray-300"}`}
                    >
                      {isStepCompleted(1) ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <span className="text-sm font-medium">1</span>
                      )}
                    </button>
                    
                    <div className="ml-12">
                      <h4 className="text-lg font-medium">Criar conta no Meta Business Manager</h4>
                      <p className="text-gray-600 mt-1 mb-3">
                        Acesse o Meta Business Manager e crie uma nova conta comercial verificada.
                      </p>
                      
                      <div className="mt-4 flex flex-col space-y-2">
                        <a 
                          href="https://business.facebook.com/overview" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:underline"
                        >
                          <span>Acessar Meta Business Manager</span>
                          <ExternalLink className="ml-1 h-4 w-4" />
                        </a>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="justify-start w-fit"
                          onClick={() => window.open("https://www.youtube.com/embed/VIDEO_ID", "_blank")}
                        >
                          Ver vídeo tutorial
                        </Button>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className={`mt-4 ${isStepCompleted(1) ? "bg-green-500 hover:bg-green-600" : ""}`} 
                        onClick={() => toggleStep(1)}
                      >
                        {isStepCompleted(1) ? "Concluído ✓" : "Marcar como concluído"}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="relative">
                    <button 
                      onClick={() => toggleStep(2)} 
                      className={`absolute left-0 top-1 w-7 h-7 rounded-full border flex items-center justify-center ${isStepCompleted(2) ? "bg-green-100 border-green-500" : "bg-white border-gray-300"}`}
                    >
                      {isStepCompleted(2) ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <span className="text-sm font-medium">2</span>
                      )}
                    </button>
                    
                    <div className="ml-12">
                      <h4 className="text-lg font-medium">Obter ID do WhatsApp Business e token da API</h4>
                      <p className="text-gray-600 mt-1 mb-3">
                        Acesse o painel de desenvolvimento do Meta para criar uma app e obter as credenciais necessárias.
                      </p>
                      
                      <div className="space-y-2 bg-gray-50 p-4 rounded-md border border-gray-200">
                        <p className="text-sm"><strong>Business ID:</strong> Encontrado no seu Business Manager</p>
                        <p className="text-sm"><strong>Phone Number ID:</strong> Na seção WhatsApp > API Setup</p>
                        <p className="text-sm"><strong>Access Token:</strong> Generate Token na seção API Access</p>
                      </div>
                      
                      <div className="mt-4 flex flex-col space-y-2">
                        <a 
                          href="https://developers.facebook.com/apps/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:underline"
                        >
                          <span>Meta for Developers</span>
                          <ExternalLink className="ml-1 h-4 w-4" />
                        </a>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="justify-start w-fit"
                          onClick={() => window.open("https://www.youtube.com/embed/VIDEO_ID", "_blank")}
                        >
                          Ver vídeo tutorial
                        </Button>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className={`mt-4 ${isStepCompleted(2) ? "bg-green-500 hover:bg-green-600" : ""}`} 
                        onClick={() => toggleStep(2)}
                      >
                        {isStepCompleted(2) ? "Concluído ✓" : "Marcar como concluído"}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="relative">
                    <button 
                      onClick={() => toggleStep(3)} 
                      className={`absolute left-0 top-1 w-7 h-7 rounded-full border flex items-center justify-center ${isStepCompleted(3) ? "bg-green-100 border-green-500" : "bg-white border-gray-300"}`}
                    >
                      {isStepCompleted(3) ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <span className="text-sm font-medium">3</span>
                      )}
                    </button>
                    
                    <div className="ml-12">
                      <h4 className="text-lg font-medium">Registrar número de telefone</h4>
                      <p className="text-gray-600 mt-1 mb-3">
                        Registre e verifique seu número de telefone comercial no WhatsApp Business.
                      </p>
                      
                      <div className="space-y-2 bg-gray-50 p-4 rounded-md border border-gray-200">
                        <p className="text-sm">1. Acesse WhatsApp Manager no Business Manager</p>
                        <p className="text-sm">2. Selecione "Add phone number"</p>
                        <p className="text-sm">3. Siga o processo de verificação</p>
                        <p className="text-sm">4. Aguarde a aprovação (pode levar até 48h)</p>
                      </div>
                      
                      <div className="mt-4 flex flex-col space-y-2">
                        <a 
                          href="https://business.facebook.com/wa/manage/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:underline"
                        >
                          <span>WhatsApp Manager</span>
                          <ExternalLink className="ml-1 h-4 w-4" />
                        </a>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className={`mt-4 ${isStepCompleted(3) ? "bg-green-500 hover:bg-green-600" : ""}`} 
                        onClick={() => toggleStep(3)}
                      >
                        {isStepCompleted(3) ? "Concluído ✓" : "Marcar como concluído"}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Step 4 */}
                  <div className="relative">
                    <button 
                      onClick={() => toggleStep(4)} 
                      className={`absolute left-0 top-1 w-7 h-7 rounded-full border flex items-center justify-center ${isStepCompleted(4) ? "bg-green-100 border-green-500" : "bg-white border-gray-300"}`}
                    >
                      {isStepCompleted(4) ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <span className="text-sm font-medium">4</span>
                      )}
                    </button>
                    
                    <div className="ml-12">
                      <h4 className="text-lg font-medium">Inserir dados no painel</h4>
                      <p className="text-gray-600 mt-1 mb-3">
                        Insira os dados obtidos nas etapas anteriores no formulário de conexão.
                      </p>
                      
                      <div className="space-y-2 bg-gray-50 p-4 rounded-md border border-gray-200">
                        <p className="text-sm">1. Volte ao formulário "Conectar WhatsApp Business API"</p>
                        <p className="text-sm">2. Insira o Business ID, Phone Number ID e Token</p>
                        <p className="text-sm">3. Clique em "Conectar WhatsApp"</p>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className={`mt-4 ${isStepCompleted(4) ? "bg-green-500 hover:bg-green-600" : ""}`} 
                        onClick={() => toggleStep(4)}
                      >
                        {isStepCompleted(4) ? "Concluído ✓" : "Marcar como concluído"}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Step 5 */}
                  <div className="relative">
                    <button 
                      onClick={() => toggleStep(5)} 
                      className={`absolute left-0 top-1 w-7 h-7 rounded-full border flex items-center justify-center ${isStepCompleted(5) ? "bg-green-100 border-green-500" : "bg-white border-gray-300"}`}
                    >
                      {isStepCompleted(5) ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <span className="text-sm font-medium">5</span>
                      )}
                    </button>
                    
                    <div className="ml-12">
                      <h4 className="text-lg font-medium">Testar envio de mensagem</h4>
                      <p className="text-gray-600 mt-1 mb-3">
                        Envie uma mensagem de teste para confirmar que tudo está funcionando corretamente.
                      </p>
                      
                      <div className="space-y-2 bg-gray-50 p-4 rounded-md border border-gray-200">
                        <p className="text-sm">1. Vá para a seção "Testar conexão" no painel</p>
                        <p className="text-sm">2. Insira um número para teste</p>
                        <p className="text-sm">3. Clique em "Enviar mensagem de teste"</p>
                        <p className="text-sm">4. Verifique se a mensagem foi recebida no número informado</p>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className={`mt-4 ${isStepCompleted(5) ? "bg-green-500 hover:bg-green-600" : ""}`} 
                        onClick={() => toggleStep(5)}
                      >
                        {isStepCompleted(5) ? "Concluído ✓" : "Marcar como concluído"}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Success completion */}
                  {completedSteps.length === 5 && (
                    <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center">
                        <Check className="h-6 w-6 text-green-600 mr-2" />
                        <div>
                          <h4 className="font-medium text-green-800">Configuração concluída!</h4>
                          <p className="text-sm text-green-600">
                            Parabéns! Você configurou com sucesso a integração com a API do WhatsApp Business.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium mb-2">Vídeo tutorial completo</h4>
              <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center border">
                <div className="text-center p-4">
                  <p className="text-gray-500 mb-2">Tutorial em vídeo</p>
                  <Button onClick={() => window.open("https://www.youtube.com/embed/VIDEO_ID", "_blank")}>
                    Assistir tutorial completo
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="twilio">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-500">Concluído: {completedSteps.length}/4 etapas</p>
              <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-twilio h-2.5 rounded-full"
                  style={{ width: `${(completedSteps.length / 4) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-8 relative">
                <div className="absolute left-3.5 top-5 h-[calc(100%-50px)] w-px bg-gray-200"></div>
                
                {/* Twilio step 1 */}
                <div className="relative">
                  <button 
                    onClick={() => toggleStep(1)} 
                    className={`absolute left-0 top-1 w-7 h-7 rounded-full border flex items-center justify-center ${isStepCompleted(1) ? "bg-twilio/20 border-twilio" : "bg-white border-gray-300"}`}
                  >
                    {isStepCompleted(1) ? (
                      <Check className="h-4 w-4 text-twilio" />
                    ) : (
                      <span className="text-sm font-medium">1</span>
                    )}
                  </button>
                  
                  <div className="ml-12">
                    <h4 className="text-lg font-medium">Criar conta no Twilio</h4>
                    <p className="text-gray-600 mt-1 mb-3">
                      Acesse o site do Twilio e crie uma nova conta de desenvolvedor.
                    </p>
                    
                    <div className="mt-4 flex flex-col space-y-2">
                      <a 
                        href="https://www.twilio.com/try-twilio" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-twilio hover:underline"
                      >
                        <span>Criar conta no Twilio</span>
                        <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className={`mt-4 ${isStepCompleted(1) ? "bg-twilio hover:bg-twilio/90" : ""}`} 
                      onClick={() => toggleStep(1)}
                    >
                      {isStepCompleted(1) ? "Concluído ✓" : "Marcar como concluído"}
                    </Button>
                  </div>
                </div>
                
                {/* Twilio remaining steps */}
                {/* Include similar structures for the remaining Twilio steps */}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WhatsAppSetupTutorial;
