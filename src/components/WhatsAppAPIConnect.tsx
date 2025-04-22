import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Check, AlertTriangle, ExternalLink } from "lucide-react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useAuth } from "@/hooks/useAuth";

interface WhatsAppAPIConnectProps {
  onSuccess?: () => void;
}

const WhatsAppAPIConnect: React.FC<WhatsAppAPIConnectProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [connectionType, setConnectionType] = useState<"meta" | "twilio">("meta");
  const supabaseClient = useSupabaseClient();
  const { user } = useAuth();

  // Meta API fields
  const [metaBusinessId, setMetaBusinessId] = useState("");
  const [metaPhoneNumberId, setMetaPhoneNumberId] = useState("");
  const [metaAccessToken, setMetaAccessToken] = useState("");
  
  // Twilio fields
  const [twilioAccountSid, setTwilioAccountSid] = useState("");
  const [twilioAuthToken, setTwilioAuthToken] = useState("");
  const [twilioPhoneNumber, setTwilioPhoneNumber] = useState("");

  const handleApiConnect = async (e: React.FormEvent, type: "meta" | "twilio") => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!user?.id) {
        throw new Error("Not authenticated. Please log in and try again.");
      }

      console.log(`Connecting ${type} API for user ${user.id}`);
      
      // Prepare request body based on connection type
      const requestBody = type === "meta" 
        ? {
            type: "meta",
            businessId: metaBusinessId,
            phoneNumberId: metaPhoneNumberId,
            accessToken: metaAccessToken,
            userId: user.id
          }
        : {
            type: "twilio",
            accountSid: twilioAccountSid,
            authToken: twilioAuthToken,
            phoneNumber: twilioPhoneNumber,
            userId: user.id
          };

      // Call the edge function
      const response = await supabaseClient.functions.invoke('connect-whatsapp-api', {
        body: requestBody
      });
      
      // Check for function level errors
      if (response.error) {
        console.error(`Error connecting ${type} API:`, response.error);
        throw new Error(response.error.message || `Failed to connect ${type} API`);
      }
      
      // Check for HTTP errors
      if (!response.data) {
        console.error(`No data returned from ${type} API connection`);
        throw new Error(`Failed to connect ${type} API: No data returned`);
      }
      
      if (response.data.error) {
        console.error(`Error from ${type} API:`, response.data.error);
        throw new Error(response.data.error);
      }
      
      // Success case
      console.log(`${type} API connected successfully:`, response.data);
      
      toast({
        title: "Conexão realizada com sucesso!",
        description: `Seu ${type === "meta" ? "WhatsApp Business API" : "Twilio"} foi conectado com sucesso.`,
        variant: "default",
      });

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Reload the page after a short delay if no callback is provided
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
      
    } catch (error: any) {
      console.error(`Erro ao conectar ${type === "meta" ? "WhatsApp API" : "Twilio"}:`, error);
      toast({
        title: "Erro na conexão",
        description: error.message || `Falha ao conectar com ${type === "meta" ? "a API do WhatsApp" : "o Twilio"}. Verifique seus dados e tente novamente.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMetaConnect = (e: React.FormEvent) => handleApiConnect(e, "meta");
  const handleTwilioConnect = (e: React.FormEvent) => handleApiConnect(e, "twilio");

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Conecte seu WhatsApp Business API</h3>
        
        {!user?.id && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-md">
            <p className="text-sm text-red-700">
              <strong>Atenção:</strong> Você precisa estar autenticado para conectar a API. Por favor, faça login novamente.
            </p>
          </div>
        )}
        
        <RadioGroup value={connectionType} onValueChange={(value) => setConnectionType(value as "meta" | "twilio")} className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className={`flex items-start space-x-2 p-4 border rounded-lg cursor-pointer ${connectionType === "meta" ? "border-green-500 bg-green-50" : ""}`}>
              <RadioGroupItem value="meta" id="meta" />
              <Label htmlFor="meta" className="cursor-pointer flex-1">
                <div className="font-medium">Meta WhatsApp Cloud API</div>
                <div className="text-sm text-gray-500">Ideal para contas comerciais registradas no Meta Business</div>
              </Label>
            </div>
            
            <div className={`flex items-start space-x-2 p-4 border rounded-lg cursor-pointer ${connectionType === "twilio" ? "border-green-500 bg-green-50" : ""}`}>
              <RadioGroupItem value="twilio" id="twilio" />
              <Label htmlFor="twilio" className="cursor-pointer flex-1">
                <div className="font-medium">Twilio API</div>
                <div className="text-sm text-gray-500">Alternativa para quem não tem uma conta comercial verificada</div>
              </Label>
            </div>
          </div>
        </RadioGroup>
        
        <Tabs defaultValue="meta" value={connectionType} onValueChange={(value) => setConnectionType(value as "meta" | "twilio")} className="mt-6">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="meta">Meta WhatsApp API</TabsTrigger>
            <TabsTrigger value="twilio">Twilio API</TabsTrigger>
          </TabsList>
          
          <TabsContent value="meta">
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleMetaConnect} className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="meta-business-id">ID do Business</Label>
                      <Input 
                        id="meta-business-id"
                        placeholder="12345678901234567"
                        value={metaBusinessId}
                        onChange={(e) => setMetaBusinessId(e.target.value)}
                        required
                      />
                      <p className="text-xs text-gray-500">Encontrado na sua conta do Meta Business.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meta-phone-id">ID do Número de Telefone</Label>
                      <Input 
                        id="meta-phone-id"
                        placeholder="12345678901234567"
                        value={metaPhoneNumberId}
                        onChange={(e) => setMetaPhoneNumberId(e.target.value)}
                        required
                      />
                      <p className="text-xs text-gray-500">Disponível no WhatsApp Business Dashboard.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meta-token">Token de Acesso Permanente</Label>
                      <Input 
                        id="meta-token"
                        type="password"
                        placeholder="••••••••••••••••••••••"
                        value={metaAccessToken}
                        onChange={(e) => setMetaAccessToken(e.target.value)}
                        required
                      />
                      <p className="text-xs text-gray-500">Token permanente para acessar a API.</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    <a 
                      href="#tutorial" 
                      className="text-sm text-blue-600 flex items-center hover:underline"
                    >
                      <span>Ver tutorial detalhado</span>
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                    <Button 
                      type="submit" 
                      className="bg-whatsapp hover:bg-whatsapp/90" 
                      disabled={isLoading || !user?.id}
                    >
                      {isLoading ? "Conectando..." : "Conectar WhatsApp"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="twilio">
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleTwilioConnect} className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="twilio-sid">Account SID</Label>
                      <Input 
                        id="twilio-sid"
                        placeholder="AC1a2b3c4d5e6f7g8h9i0j..."
                        value={twilioAccountSid}
                        onChange={(e) => setTwilioAccountSid(e.target.value)}
                        required
                      />
                      <p className="text-xs text-gray-500">Encontrado no Dashboard do Twilio.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twilio-token">Auth Token</Label>
                      <Input 
                        id="twilio-token"
                        type="password"
                        placeholder="••••••••••••••••••••••"
                        value={twilioAuthToken}
                        onChange={(e) => setTwilioAuthToken(e.target.value)}
                        required
                      />
                      <p className="text-xs text-gray-500">Token de autenticação da sua conta Twilio.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twilio-phone">Número do WhatsApp</Label>
                      <Input 
                        id="twilio-phone"
                        placeholder="+5511999999999"
                        value={twilioPhoneNumber}
                        onChange={(e) => setTwilioPhoneNumber(e.target.value)}
                        required
                      />
                      <p className="text-xs text-gray-500">Número habilitado para WhatsApp no Twilio.</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    <a 
                      href="#tutorial" 
                      className="text-sm text-blue-600 flex items-center hover:underline"
                    >
                      <span>Ver tutorial Twilio</span>
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                    <Button 
                      type="submit" 
                      className="bg-twilio hover:bg-twilio/90 text-white" 
                      disabled={isLoading || !user?.id}
                    >
                      {isLoading ? "Conectando..." : "Conectar Twilio"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Informações importantes</h4>
              <ul className="mt-1 text-xs text-yellow-700 list-disc list-inside space-y-1">
                <li>Seus dados de API são armazenados de forma segura e criptografada.</li>
                <li>Você precisa de uma conta verificada no Meta Business para usar a API oficial.</li>
                <li>A integração via Twilio é uma alternativa para quem não tem conta comercial verificada.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppAPIConnect;
