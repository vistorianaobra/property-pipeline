import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Lock, UserCheck, Building2, Briefcase, Compass, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEXMOVE CRM — CRM Operacional Imobiliário" },
      {
        name: "description",
        content:
          "Um método silencioso, um resultado preciso. Acesso exclusivo para Consultores, Escritórios, Corretores e Incorporadoras.",
      },
      { property: "og:title", content: "NEXMOVE CRM" },
      {
        property: "og:description",
        content: "Um método silencioso, um resultado preciso.",
      },
      { property: "og:image", content: "https://erhubsistema.netlify.app/og-image.jpg" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "1200" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://erhubsistema.netlify.app/og-image.jpg" },
    ],
  }),
  component: HomePage,
});

type AxisKey = "consultor" | "escritorio" | "corretor" | "incorporadora";

interface AxisItem {
  key: AxisKey;
  title: string;
  subtitle: string;
  badge?: string;
  targetRoute: string;
  icon: typeof UserCheck;
  loginTitle: string;
  registerTitle: string;
  roleLabel: string;
}

const AXIS_ITEMS: AxisItem[] = [
  {
    key: "consultor",
    title: "Consultor Entre Rios",
    subtitle: "Acesso para representantes e time interno de vendas.",
    targetRoute: "/vendedor",
    icon: UserCheck,
    loginTitle: "Login do Consultor",
    registerTitle: "Autocadastro de Consultor",
    roleLabel: "Representante / Vendedor",
  },
  {
    key: "escritorio",
    title: "Escritório Arquitetura, Design e Eng.",
    subtitle: "Acompanhamento e curadoria de projetos (Em breve).",
    badge: "(Em breve)",
    targetRoute: "/chamados",
    icon: Compass,
    loginTitle: "Acesso Escritório Parceiro",
    registerTitle: "Credenciamento de Escritório",
    roleLabel: "Arquiteto / Engenheiro / Designer",
  },
  {
    key: "corretor",
    title: "Corretor de Imóveis",
    subtitle: "Plataforma parceira para indicação de clientes.",
    targetRoute: "/corretor",
    icon: Briefcase,
    loginTitle: "Portal do Corretor",
    registerTitle: "Autocadastro de Corretor Parceiro",
    roleLabel: "Corretor de Imóveis / Imobiliária",
  },
  {
    key: "incorporadora",
    title: "Incorporadora / Construtora",
    subtitle: "Presença técnica e acompanhamento de obras (Em breve).",
    badge: "(Em breve)",
    targetRoute: "/diretoria",
    icon: Building2,
    loginTitle: "Painel da Incorporadora & Diretoria",
    registerTitle: "Cadastro de Construtora / Incorporadora",
    roleLabel: "Diretor / Gestor de Obras",
  },
];

function HomePage() {
  const navigate = useNavigate();
  const [activeAxis, setActiveAxis] = useState<AxisItem | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAxis = (item: AxisItem) => {
    setActiveAxis(item);
    setAuthMode("login");
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAxis) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      if (authMode === "login") {
        const cleanLogin = email.trim().toLowerCase();
        
        // Exact and fuzzy match for Tuane (Diretoria & Consultoria)
        if (
          cleanLogin.includes("tuane") ||
          cleanLogin.includes("projeto@") ||
          cleanLogin.includes("entreriosdesign")
        ) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("nexmove_role", "ADMIN");
            sessionStorage.setItem("nexmove_user_id", "u-dir-tuane");
          }
          toast.success("Bem-vinda, Tuane Carvalho Lopes! Acesso liberado.");
          setActiveAxis(null);
          const target = activeAxis.key === "incorporadora" ? "/diretoria?user=tuane" : "/vendedor";
          navigate({ to: target });
          return;
        }

        // Exact and fuzzy match for Bianca (Diretoria & Curadoria)
        if (cleanLogin.includes("bianca")) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("nexmove_role", "ADMIN");
            sessionStorage.setItem("nexmove_user_id", "u-dir-bianca");
          }
          toast.success("Bem-vinda, Bianca Reis! Acessando painel exclusivo de Diretoria...");
          setActiveAxis(null);
          navigate({ to: "/diretoria?user=bianca" });
          return;
        }

        // Exact and fuzzy match for Luis Leme (Corretor)
        if (cleanLogin.includes("luis") || cleanLogin.includes("leme")) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("nexmove_role", "CORRETOR");
            sessionStorage.setItem("nexmove_user_id", "u-corr-luis");
          }
          toast.success("Bem-vindo, Luis Leme! Acessando seus 136 leads...");
          setActiveAxis(null);
          navigate({ to: "/corretor?user=luisleme" });
          return;
        }

        // Exact and fuzzy match for Isly Fernandes (Corretora)
        if (cleanLogin.includes("isly")) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("nexmove_role", "CORRETOR");
            sessionStorage.setItem("nexmove_user_id", "u-corr-isly");
          }
          toast.success("Bem-vinda, Isly Fernandes! Acessando seu painel...");
          setActiveAxis(null);
          navigate({ to: "/corretor?user=isly" });
          return;
        }

        // Universal fallback: Any valid login succeeds
        toast.success(`Acesso autorizado! Bem-vindo ao portal ${activeAxis.title}.`);
        setActiveAxis(null);
        navigate({ to: activeAxis.targetRoute });
        return;
      } else {
        toast.success(`Autocadastro realizado com sucesso para ${activeAxis.title}!`);
      }

      setActiveAxis(null);
      navigate({ to: activeAxis.targetRoute });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F1E1B] flex flex-col justify-between selection:bg-[#2C2A25] selection:text-[#FAF8F5] font-['Work_Sans',sans-serif]">
      {/* Container Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-8 sm:px-12 md:px-16 py-16 md:py-24 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-16 lg:gap-24 items-center">
          
          {/* Coluna Esquerda: Título Editorial */}
          <div className="flex flex-col items-start justify-center">
            {/* Top Eyebrow */}
            <span className="text-[11px] font-medium tracking-[0.35em] text-[#8C877D] uppercase mb-12 sm:mb-16">
              N E X M O V E &nbsp; C R M
            </span>

            {/* Main Heading em Serif Elegante com 'silencioso' em Itálico */}
            <h1 className="font-['Instrument_Serif',Georgia,serif] text-5xl sm:text-6xl md:text-7xl lg:text-[5.2rem] font-normal leading-[1.08] text-[#1F1E1B] tracking-[-0.02em]">
              Um método <br />
              <span className="italic font-normal">silencioso</span>, um <br />
              resultado <br />
              preciso.
            </h1>
          </div>

          {/* Coluna Direita: Eixos de Acesso / Portais */}
          <div className="w-full flex flex-col justify-center">
            <div className="border-t border-[#E4DFD5]">
              {AXIS_ITEMS.map((item) => (
                <div
                  key={item.key}
                  onClick={() => handleOpenAxis(item)}
                  className="group cursor-pointer border-b border-[#E4DFD5] py-7 px-2 flex items-center justify-between transition-all duration-300 hover:bg-[#F2ECE1]/50 hover:px-4"
                >
                  <div className="flex flex-col pr-6">
                    <h3 className="font-['Instrument_Serif',Georgia,serif] text-2xl sm:text-3xl text-[#1F1E1B] font-normal tracking-[-0.01em] group-hover:text-[#000000] transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-[#787368] font-normal leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center text-[#8C877D] group-hover:text-[#1F1E1B] group-hover:translate-x-1 transition-all duration-300">
                    <ArrowRight className="w-5 h-5 stroke-[1.5]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Footer minimalista */}
      <footer className="max-w-7xl w-full mx-auto px-8 sm:px-12 md:px-16 py-8 border-t border-[#E4DFD5]/60 flex flex-col sm:flex-row justify-between items-center text-xs text-[#8C877D] gap-4">
        <span>© 2026 NEXMOVE CRM — Todos os direitos reservados.</span>
        <span className="tracking-[0.15em] text-[10px] uppercase font-medium">CRM Operacional Imobiliário</span>
      </footer>

      {/* MODAL DE LOGIN / AUTOCADASTRO DO EIXO SELECIONADO */}
      <Dialog open={!!activeAxis} onOpenChange={(open) => !open && setActiveAxis(null)}>
        {activeAxis && (
          <DialogContent className="bg-[#FAF8F5] border border-[#E4DFD5] p-8 max-w-md rounded-none shadow-2xl">
            <DialogHeader className="space-y-2 text-left pb-4 border-b border-[#E4DFD5]">
              <span className="text-[10px] font-semibold tracking-[0.25em] text-[#8C877D] uppercase">
                {activeAxis.roleLabel}
              </span>
              <DialogTitle className="font-['Instrument_Serif',serif] text-3xl font-normal text-[#1F1E1B]">
                {authMode === "login" ? activeAxis.loginTitle : activeAxis.registerTitle}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#787368]">
                {authMode === "login"
                  ? "Entre com suas credenciais para acessar a plataforma."
                  : "Preencha os dados abaixo para criar seu acesso imediato."}
              </DialogDescription>
            </DialogHeader>

            {/* Alternador de Abas: Login vs Autocadastro */}
            <div className="flex border-b border-[#E4DFD5] my-4">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                  authMode === "login"
                    ? "border-[#1F1E1B] text-[#1F1E1B]"
                    : "border-transparent text-[#8C877D] hover:text-[#1F1E1B]"
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                  authMode === "register"
                    ? "border-[#1F1E1B] text-[#1F1E1B]"
                    : "border-transparent text-[#8C877D] hover:text-[#1F1E1B]"
                }`}
              >
                Autocadastro
              </button>
            </div>

            {/* Form de Autenticação / Cadastro */}
            <form onSubmit={handleAuthSubmit} className="space-y-4 pt-2">
              {authMode === "register" && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs text-[#57534A] uppercase tracking-wider font-medium">Nome Completo</Label>
                    <Input
                      required
                      type="text"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white border-[#E4DFD5] focus-visible:ring-[#1F1E1B] text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-[#57534A] uppercase tracking-wider font-medium">
                      {activeAxis.key === "corretor" ? "CRECI / CPF" : "CPF / CNPJ"}
                    </Label>
                    <Input
                      required
                      type="text"
                      placeholder="000.000.000-00"
                      value={document}
                      onChange={(e) => setDocument(e.target.value)}
                      className="bg-white border-[#E4DFD5] focus-visible:ring-[#1F1E1B] text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-[#57534A] uppercase tracking-wider font-medium">Celular / WhatsApp</Label>
                    <Input
                      required
                      type="text"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-white border-[#E4DFD5] focus-visible:ring-[#1F1E1B] text-sm"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <Label className="text-xs text-[#57534A] uppercase tracking-wider font-medium">E-mail Profissional</Label>
                <Input
                  required
                  type="email"
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white border-[#E4DFD5] focus-visible:ring-[#1F1E1B] text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-[#57534A] uppercase tracking-wider font-medium">Senha</Label>
                <Input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border-[#E4DFD5] focus-visible:ring-[#1F1E1B] text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1F1E1B] hover:bg-[#33312C] text-[#FAF8F5] rounded-none py-5 font-semibold text-xs tracking-widest uppercase transition-all mt-4"
              >
                {isSubmitting
                  ? "Processando..."
                  : authMode === "login"
                  ? "Entrar no Painel"
                  : "Finalizar Autocadastro"}
              </Button>

              <div className="pt-2 text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setActiveAxis(null);
                    navigate({ to: activeAxis.targetRoute });
                  }}
                  className="text-xs text-[#787368] hover:text-[#1F1E1B] underline hover:bg-transparent"
                >
                  Acessar painel demonstrativo diretamente →
                </Button>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
