
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const SignupForm: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "Por favor, verifique se as senhas estão iguais.",
        variant: "destructive"
      });
      return;
    }

    // Simular registro
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Conta criada com sucesso!",
        description: "Redirecionando para a configuração do seu robô.",
      });

      // Simulando redirecionamento
      setTimeout(() => {
        window.location.href = "/configurar";
      }, 1000);
    }, 1500);
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            name="name"
            placeholder="Digite seu nome"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Digite seu email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Crie uma senha segura"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirme sua senha</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Digite sua senha novamente"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>

        <div className="text-xs text-gray-500 mt-2">
          Ao se cadastrar, você concorda com nossos <a href="/termos" className="text-whatsapp hover:underline">Termos de Serviço</a> e <a href="/privacidade" className="text-whatsapp hover:underline">Política de Privacidade</a>.
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient hover:opacity-90"
          disabled={loading}
        >
          {loading ? "Processando..." : "Criar conta grátis"}
        </Button>

        <div className="text-center text-sm">
          Já tem uma conta?{" "}
          <a href="/login" className="text-whatsapp hover:underline font-medium">
            Faça login
          </a>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;
