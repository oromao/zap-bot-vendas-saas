import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAsyncFeedback } from "@/hooks/useAsyncFeedback";
import { useFormValidation } from "@/hooks/useFormValidation";
import { supabase } from "@/integrations/supabase/client";
import { MailCheck } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginForm: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { form, handleChange, errors, validate } = useFormValidation({
    email: "",
    password: "",
  });
  const { loading, run } = useAsyncFeedback();
  const [emailNotConfirmedError, setEmailNotConfirmedError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validate({
      email: (v) => (!v ? "Email obrigatório" : null),
      password: (v) => (!v ? "Senha obrigatória" : null),
    });
    if (!isValid) {
      toast({
        title: "Campos obrigatórios",
        description: Object.values(errors).join("\n"),
        variant: "destructive",
      });
      return;
    }
    run(async () => {
      setEmailNotConfirmedError(false);
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setEmailNotConfirmedError(true);
          return;
        }
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard.",
      });
      navigate("/dashboard");
    });
  };

  const handleBypassEmailVerification = async () => {
    run(async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error && !error.message.includes("Email not confirmed")) {
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard.",
      });
      navigate("/dashboard");
      setEmailNotConfirmedError(false);
    });
  };

  return (
    <div className="w-full max-w-md">
      {emailNotConfirmedError && (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <MailCheck className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            <p className="font-medium">Email não confirmado</p>
            <p className="text-sm mb-2">
              Você ainda não confirmou seu email, mas pode continuar mesmo
              assim.
            </p>
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
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
          {errors.email && (
            <span className="text-xs text-red-500">{errors.email}</span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <a
              href="/recuperar-senha"
              className="text-xs text-whatsapp hover:underline"
            >
              Esqueceu sua senha?
            </a>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Digite sua senha"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
          {errors.password && (
            <span className="text-xs text-red-500">{errors.password}</span>
          )}
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
          <a
            href="/cadastro"
            className="text-whatsapp hover:underline font-medium"
          >
            Cadastre-se
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
