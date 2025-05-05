import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Sparkles,
  LogIn,
  Phone,
  Menu,
  User,
  BarChart,
  Send,
  Link as LinkIcon,
  HelpCircle,
  LogOut,
  PanelTop,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContext } from "react";
import { ThemeContext } from "../theme/ThemeContext";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useContext(ThemeContext);

  const isAdmin =
    user?.email === "admin@zapbot.com" || user?.email === "seu@email.com";

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getInitials = (email: string) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="w-full border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-whatsapp" />
            <span className="font-heading text-xl font-bold">
              Zap<span className="text-whatsapp">Bot</span>
            </span>
          </Link>
        </div>

        {isAuthenticated ? (
          // Nav for authenticated users
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/dashboard"
              className="text-sm font-medium hover:text-whatsapp transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/campanhas"
              className="text-sm font-medium hover:text-whatsapp transition-colors"
            >
              Campanhas
            </Link>
            <Link
              to="/relatorios"
              className="text-sm font-medium hover:text-whatsapp transition-colors"
            >
              Relatórios
            </Link>
            <Link
              to="/integracao"
              className="text-sm font-medium hover:text-whatsapp transition-colors"
            >
              Integrações
            </Link>
            <Link
              to="/suporte"
              className="text-sm font-medium hover:text-whatsapp transition-colors"
            >
              Suporte
            </Link>
            <Link
              to="/workflows"
              className="text-sm font-medium hover:text-whatsapp transition-colors"
            >
              Workflows
            </Link>
          </nav>
        ) : (
          // Nav for public users
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/recursos"
              className="text-sm font-medium hover:text-whatsapp transition-colors"
            >
              Recursos
            </Link>
            <Link
              to="/precos"
              className="text-sm font-medium hover:text-whatsapp transition-colors"
            >
              Preços
            </Link>
            <Link
              to="/whatsapp"
              className="text-sm font-medium hover:text-whatsapp transition-colors flex items-center"
            >
              <Phone className="h-4 w-4 mr-1" />
              WhatsApp
            </Link>
            <Link
              to="/suporte"
              className="text-sm font-medium hover:text-whatsapp transition-colors"
            >
              Suporte
            </Link>
          </nav>
        )}

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            // Authenticated user controls
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.user_metadata?.avatar_url}
                      alt={user?.email || ""}
                    />
                    <AvatarFallback>
                      {getInitials(user?.email || "")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user?.user_metadata?.name || user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <PanelTop className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/configurar")}>
                    <Phone className="mr-2 h-4 w-4" />
                    <span>Configurar WhatsApp</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/perfil")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <PanelTop className="mr-2 h-4 w-4" />
                      <span>Painel Admin</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Public user controls
            <>
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Entrar
                </Button>
              </Link>
              <Link to="/cadastro">
                <Button className="bg-gradient hover:opacity-90 transition-opacity">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Teste 7 dias grátis
                </Button>
              </Link>
            </>
          )}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="ml-4 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
        </div>

        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] sm:w-[350px] py-8">
              {isAuthenticated ? (
                // Mobile menu for authenticated users
                <nav className="flex flex-col gap-4">
                  {/* User info */}
                  <div className="flex items-center gap-3 py-4 border-b">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user?.user_metadata?.avatar_url}
                        alt={user?.email || ""}
                      />
                      <AvatarFallback>
                        {getInitials(user?.email || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {user?.user_metadata?.name || user?.email}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>

                  {/* Menu items */}
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 py-3 px-2 hover:bg-gray-50 rounded-md"
                  >
                    <PanelTop className="h-5 w-5 text-whatsapp" />
                    <span className="font-medium">Dashboard</span>
                  </Link>

                  <Link
                    to="/campanhas"
                    className="flex items-center gap-3 py-3 px-2 hover:bg-gray-50 rounded-md"
                  >
                    <Send className="h-5 w-5 text-whatsapp" />
                    <span className="font-medium">Campanhas</span>
                  </Link>

                  <Link
                    to="/relatorios"
                    className="flex items-center gap-3 py-3 px-2 hover:bg-gray-50 rounded-md"
                  >
                    <BarChart className="h-5 w-5 text-whatsapp" />
                    <span className="font-medium">Relatórios</span>
                  </Link>

                  <Link
                    to="/integracao"
                    className="flex items-center gap-3 py-3 px-2 hover:bg-gray-50 rounded-md"
                  >
                    <LinkIcon className="h-5 w-5 text-whatsapp" />
                    <span className="font-medium">Integrações</span>
                  </Link>

                  <Link
                    to="/suporte"
                    className="flex items-center gap-3 py-3 px-2 hover:bg-gray-50 rounded-md"
                  >
                    <HelpCircle className="h-5 w-5 text-whatsapp" />
                    <span className="font-medium">Suporte</span>
                  </Link>

                  <Link
                    to="/workflows"
                    className="flex items-center gap-3 py-3 px-2 hover:bg-gray-50 rounded-md"
                  >
                    <Send className="h-5 w-5 text-whatsapp" />
                    <span className="font-medium">Workflows</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 py-3 px-2 hover:bg-gray-50 rounded-md"
                    >
                      <PanelTop className="h-5 w-5 text-whatsapp" />
                      <span className="font-medium">Painel Admin</span>
                    </Link>
                  )}

                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                </nav>
              ) : (
                // Mobile menu for public users
                <nav className="flex flex-col gap-4 mt-8">
                  <Link to="/login">
                    <Button
                      variant="default"
                      className="w-full justify-start gap-2"
                    >
                      <LogIn className="h-4 w-4" />
                      Entrar / Criar conta
                    </Button>
                  </Link>
                </nav>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
