import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAsyncFeedback } from "@/hooks/useAsyncFeedback";
import { useFormValidation } from "@/hooks/useFormValidation";
import { supabase } from "@/integrations/supabase/client";
import React from "react";
import { useNavigate } from "react-router-dom";

const SignupForm: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { form, handleChange, errors, validate } = useFormValidation({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { loading, run } = useAsyncFeedback();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validate({
      name: (v) => (!v ? "Nome obrigatório" : null),
      email: (v) => (!v ? "Email obrigatório" : null),
      password: (v) => (!v ? "Senha obrigatória" : null),
      confirmPassword: (v) =>
        v !== form.password ? "Senhas não conferem" : null,
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
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { name: form.name } },
      });
      if (error) {
        toast({
          title: "Erro ao criar conta",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar sua conta.",
      });
      navigate("/login");
    });
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
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
          />
          {errors.name && (
            <span className="text-xs text-red-500">{errors.name}</span>
          )}
        </div>

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
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Crie uma senha segura"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
          {errors.password && (
            <span className="text-xs text-red-500">{errors.password}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirme sua senha</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Digite sua senha novamente"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <span className="text-xs text-red-500">
              {errors.confirmPassword}
            </span>
          )}
        </div>

        <div className="text-xs text-gray-500 mt-2">
          Ao se cadastrar, você concorda com nossos{" "}
          <a href="/termos" className="text-whatsapp hover:underline">
            Termos de Serviço
          </a>{" "}
          e{" "}
          <a href="/privacidade" className="text-whatsapp hover:underline">
            Política de Privacidade
          </a>
          .
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
          <a
            href="/login"
            className="text-whatsapp hover:underline font-medium"
          >
            Faça login
          </a>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;
