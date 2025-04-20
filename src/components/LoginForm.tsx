
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const LoginForm: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    if (!formData.email || !formData.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    // Simular login
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard.",
      });

      // Simulando redirecionamento
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    }, 1500);
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <a href="/recuperar-senha" className="text-xs text-whatsapp hover:underline">
              Esqueceu sua senha?
            </a>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Digite sua senha"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient hover:opacity-90"
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </Button>

        <div className="text-center text-sm">
          Não tem uma conta?{" "}
          <a href="/cadastro" className="text-whatsapp hover:underline font-medium">
            Cadastre-se
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
