import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "./integrations/supabase/client";
import AuthGuard from "./components/AuthGuard";
import { ThemeProvider } from "./theme/ThemeContext";

import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ConfigPage from "./pages/ConfigPage";
import DashboardPage from "./pages/DashboardPage";
import WhatsAppPage from "./pages/WhatsAppPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import Workflows from "./pages/workflows";
import WorkflowsPage from "./pages/WorkflowsPage";

function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ThemeProvider>
      <SessionContextProvider supabaseClient={supabase}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route element={<AuthGuard />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/cadastro" element={<SignupPage />} />
                </Route>

                {/* Protected routes */}
                <Route element={<AuthGuard requireAuth />}>
                  <Route path="/configurar" element={<ConfigPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/whatsapp" element={<WhatsAppPage />} />
                  <Route path="/campanhas" element={<DashboardPage />} />
                  <Route path="/relatorios" element={<DashboardPage />} />
                  <Route path="/integracao" element={<ConfigPage />} />
                  <Route path="/suporte" element={<DashboardPage />} />
                  <Route path="/workflows" element={<Workflows />} />
                  <Route path="/workflows/:id" element={<WorkflowsPage />} />
                </Route>

                {/* Admin-only route */}
                <Route element={<AuthGuard requireAuth isAdminOnly />}>
                  <Route path="/admin" element={<AdminPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </SessionContextProvider>
    </ThemeProvider>
  );
}

export default App;
