
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ConfigPage from "./pages/ConfigPage";
import DashboardPage from "./pages/DashboardPage";
import WhatsAppPage from "./pages/WhatsAppPage";
import NotFound from "./pages/NotFound";

// Obtenha as variáveis de ambiente do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação das variáveis necessárias
if (!supabaseUrl || supabaseUrl === "" || !supabaseAnonKey || supabaseAnonKey === "") {
  console.error("Erro: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórios. Por favor, configure-os nas configurações do projeto Lovable.");
}

// Inicialize o cliente Supabase com verificação explícita de strings vazias
const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

function App() {
  const [queryClient] = useState(() => new QueryClient());
  
  // Se as credenciais do Supabase estiverem faltando, exiba uma mensagem de erro em vez do aplicativo
  if (!supabaseUrl || supabaseUrl === "" || !supabaseAnonKey || supabaseAnonKey === "") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro de Configuração</h1>
          <p className="mb-4">
            As credenciais do Supabase não estão configuradas corretamente. Por favor, verifique se você:
          </p>
          <ol className="list-decimal text-left ml-6 mb-6">
            <li className="mb-2">Ativou a integração com Supabase no projeto Lovable</li>
            <li className="mb-2">Definiu as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas configurações do projeto</li>
            <li>Reiniciou o aplicativo após a configuração</li>
          </ol>
          <p className="text-sm text-gray-600">
            Se o problema persistir, entre em contato com o suporte.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cadastro" element={<SignupPage />} />
              <Route path="/configurar" element={<ConfigPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/whatsapp" element={<WhatsAppPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </SessionContextProvider>
  );
}

export default App;
