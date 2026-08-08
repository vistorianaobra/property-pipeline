import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar — NEXMOVE CRM" },
      {
        name: "description",
        content:
          "Acesse o CRM NEXMOVE: funil de vendas, KPIs em tempo real e gestão de equipes imobiliárias.",
      },
      { property: "og:title", content: "Entrar — NEXMOVE CRM" },
      {
        property: "og:description",
        content: "Acesse o CRM NEXMOVE: funil de vendas, KPIs e gestão de equipes.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between border-r border-border bg-sidebar p-12 lg:flex">
        <p className="label-caps text-sm tracking-[0.28em]">NEXMOVE</p>
        <div>
          <h2 className="max-w-md text-4xl leading-tight">
            O funil, a equipe e os números no mesmo lugar.
          </h2>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Kanban de leads, KPIs em tempo real, gestão de corretores e chamados para a diretoria.
          </p>
        </div>
        <p className="label-caps text-muted-foreground">CRM operacional imobiliário</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <p className="label-caps text-muted-foreground">Acesso ao painel</p>
          <h1 className="mt-3 text-4xl leading-none">Entrar</h1>

          <form
            className="mt-8 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              toast.info("Conecte o Supabase do projeto para ativar o login real.");
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="label-caps">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@empresa.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha" className="label-caps">
                Senha
              </Label>
              <Input
                id="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full rounded-sm">
              Entrar
            </Button>
            <Link
              to="/reset-password"
              className="block text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Esqueci minha senha
            </Link>
          </form>

          <div className="mt-10 border-t border-border pt-6">
            <p className="label-caps text-muted-foreground">Ver os painéis</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm" className="rounded-sm">
                <Link to="/diretoria">Diretoria</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-sm">
                <Link to="/vendedor">Vendedor</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-sm">
                <Link to="/corretor">Corretor</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
