import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles, LogIn, Phone, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/recursos" className="text-sm font-medium hover:text-whatsapp transition-colors">
            Recursos
          </Link>
          <Link to="/precos" className="text-sm font-medium hover:text-whatsapp transition-colors">
            Preços
          </Link>
          <Link to="/whatsapp" className="text-sm font-medium hover:text-whatsapp transition-colors flex items-center">
            <Phone className="h-4 w-4 mr-1" />
            WhatsApp
          </Link>
          <Link to="/suporte" className="text-sm font-medium hover:text-whatsapp transition-colors">
            Suporte
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
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
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] sm:w-[350px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/recursos" className="text-sm font-medium hover:text-whatsapp transition-colors px-2 py-1">
                  Recursos
                </Link>
                <Link to="/precos" className="text-sm font-medium hover:text-whatsapp transition-colors px-2 py-1">
                  Preços
                </Link>
                <Link to="/whatsapp" className="text-sm font-medium hover:text-whatsapp transition-colors px-2 py-1 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </Link>
                <Link to="/suporte" className="text-sm font-medium hover:text-whatsapp transition-colors px-2 py-1">
                  Suporte
                </Link>
                <div className="flex flex-col gap-2 mt-4">
                  <Link to="/login">
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <LogIn className="h-4 w-4" />
                      Entrar
                    </Button>
                  </Link>
                  <Link to="/cadastro">
                    <Button className="w-full bg-gradient hover:opacity-90 transition-opacity">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Teste 7 dias grátis
                    </Button>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
