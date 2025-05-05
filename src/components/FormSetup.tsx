import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAsyncFeedback } from "@/hooks/useAsyncFeedback";
import { useFormValidation } from "@/hooks/useFormValidation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import React, { useState } from "react";

const FormSetup: React.FC = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<number>(1);
  const { form, setForm, errors, validate, handleChange } = useFormValidation({
    storeName: "",
    storeUrl: "",
    whatsappLink: "",
    platform: "",
    description: "",
    tone: "",
  });
  const { loading, run } = useAsyncFeedback();

  const handleSelectChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      const isValid = validate({
        storeName: (v) => (!v ? "Nome da loja obrigatório" : null),
        storeUrl: (v) => (!v ? "URL da loja obrigatória" : null),
        whatsappLink: (v) => (!v ? "Link do WhatsApp obrigatório" : null),
      });
      if (!isValid) {
        toast({
          title: "Campos obrigatórios",
          description: Object.values(errors).join("\n"),
          variant: "destructive",
        });
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      // Aqui seria enviado para o backend
      toast({
        title: "Robô configurado com sucesso!",
        description: "Redirecionando para o painel de gerenciamento.",
      });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    });
  };

  const platforms = [
    "Nuvemshop",
    "WooCommerce",
    "Shopify",
    "Tray",
    "VTEX",
    "Outro",
  ];
  const tones = [
    "Descontraído",
    "Carinhoso",
    "Profissional",
    "Jovem",
    "Formal",
    "Empolgante",
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            Configurar seu robô de WhatsApp
          </h2>
          <div className="text-sm text-gray-500">Passo {step} de 2</div>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div
            className="bg-whatsapp h-full rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Nome da loja</Label>
                <Input
                  id="storeName"
                  name="storeName"
                  placeholder="Ex: Moda Express"
                  value={form.storeName}
                  onChange={handleChange}
                />
                {errors.storeName && (
                  <span className="text-xs text-red-500">
                    {errors.storeName}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeUrl">URL da loja</Label>
                <Input
                  id="storeUrl"
                  name="storeUrl"
                  placeholder="Ex: www.modaexpress.com.br"
                  value={form.storeUrl}
                  onChange={handleChange}
                />
                {errors.storeUrl && (
                  <span className="text-xs text-red-500">
                    {errors.storeUrl}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappLink">Link do WhatsApp oficial</Label>
                <Input
                  id="whatsappLink"
                  name="whatsappLink"
                  placeholder="Ex: https://wa.me/5511987654321"
                  value={form.whatsappLink}
                  onChange={handleChange}
                />
                {errors.whatsappLink && (
                  <span className="text-xs text-red-500">
                    {errors.whatsappLink}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform">Qual sistema usa?</Label>
                <Select
                  value={form.platform}
                  onValueChange={(value) =>
                    handleSelectChange("platform", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                onClick={handleNext}
                className="bg-gradient hover:opacity-90"
              >
                Próximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">
                  Descrição da loja (ou principais produtos)
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Descreva brevemente sua loja ou seus principais produtos..."
                  className="min-h-[100px]"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Tom de voz desejado</Label>
                <Select
                  value={form.tone}
                  onValueChange={(value) => handleSelectChange("tone", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha o tom de voz para seu robô" />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((tone) => (
                      <SelectItem key={tone} value={tone}>
                        {tone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 border rounded-md p-4 bg-gray-50">
                <div className="font-medium mb-2">Módulos do robô</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="welcome"
                      className="rounded text-whatsapp"
                      defaultChecked
                    />
                    <Label htmlFor="welcome" className="text-sm">
                      Atendimento inicial
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="cart"
                      className="rounded text-whatsapp"
                      defaultChecked
                    />
                    <Label htmlFor="cart" className="text-sm">
                      Carrinho abandonado
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="tracking"
                      className="rounded text-whatsapp"
                      defaultChecked
                    />
                    <Label htmlFor="tracking" className="text-sm">
                      Rastreamento de pedido
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="marketing"
                      className="rounded text-whatsapp"
                      defaultChecked
                    />
                    <Label htmlFor="marketing" className="text-sm">
                      WhatsApp Marketing
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="faq"
                      className="rounded text-whatsapp"
                      defaultChecked
                    />
                    <Label htmlFor="faq" className="text-sm">
                      FAQ inteligente
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="postsale"
                      className="rounded text-whatsapp"
                      defaultChecked
                    />
                    <Label htmlFor="postsale" className="text-sm">
                      Mensagem pós-venda
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="alerts"
                      className="rounded text-whatsapp"
                      defaultChecked
                    />
                    <Label htmlFor="alerts" className="text-sm">
                      Alertas inteligentes
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>

              <Button
                type="submit"
                className="bg-gradient hover:opacity-90"
                disabled={loading}
              >
                {loading ? "Processando..." : "Criar meu robô"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default FormSetup;
