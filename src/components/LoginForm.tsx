
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MailCheck } from "lucide-react";

const LoginForm: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [emailNotConfirmedError, setEmailNotConfirmedError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      setLoading(true);
      setEmailNotConfirmedError(false);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (error) {
        // Check for "Email not confirmed" error
        if (error.message.includes("Email not confirmed")) {
          setEmailNotConfirmedError(true);
          return;
        }
        
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast({
        title: "Erro ao fazer login",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBypassEmailVerification = async () => {
    setLoading(true);
    try {
      // This will force sign in even if email is not verified
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (error && !error.message.includes("Email not confirmed")) {
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast({
        title: "Erro ao fazer login",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setEmailNotConfirmedError(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {emailNotConfirmedError && (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <MailCheck className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            <p className="font-medium">Email não confirmado</p>
            <p className="text-sm mb-2">Você ainda não confirmou seu email, mas pode continuar mesmo assim.</p>
            <Button 
              variant="outline" 
              className="mt-1 border-blue-300 hover:bg-blue-100 text-blue-700"
              onClick={handleBypassEmailVerification}
            >
              Continuar sem confirmar
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
            autoComplete="email"
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
            autoComplete="current-password"
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
