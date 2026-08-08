import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CrmShell } from "@/components/crm/CrmShell";
import { PageHeader } from "@/components/crm/PageHeader";
import { DEMO_PROFILES, initials, todayLabel } from "@/lib/crm-data";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Meu perfil — NEXMOVE CRM" },
      {
        name: "description",
        content: "Atualize nome, WhatsApp, usuário e foto de perfil no CRM NEXMOVE.",
      },
      { property: "og:title", content: "Meu perfil — NEXMOVE CRM" },
      {
        property: "og:description",
        content: "Atualize nome, WhatsApp, usuário e foto de perfil.",
      },
    ],
  }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const user = DEMO_PROFILES.find((profile) => profile.role === "VENDEDOR")!;
  const [form, setForm] = useState({
    nome: user.nome,
    whatsapp: user.whatsapp,
    username: user.username,
  });

  return (
    <CrmShell
      user={user}
      items={[
        { label: "Meu Funil (Kanban)", to: "/vendedor", icon: "kanban" },
        { label: "Chamados", to: "/chamados", icon: "tickets" },
        { label: "Sair", to: "/", icon: "back" },
      ]}
    >
      <PageHeader
        eyebrow={`Configurações • ${todayLabel()}`}
        title="Meu perfil."
        subtitle="Estes dados aparecem para a sua equipe e nos relatórios da diretoria."
      />

      <form
        className="mt-10 max-w-xl space-y-6 border border-border bg-card p-8"
        onSubmit={(event) => {
          event.preventDefault();
          toast.info("Conecte o Supabase do projeto para salvar o perfil.");
        }}
      >
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="bg-accent">{initials(form.nome)}</AvatarFallback>
          </Avatar>
          <div>
            <Label htmlFor="foto" className="label-caps">
              Foto de perfil
            </Label>
            <Input id="foto" type="file" accept="image/*" className="mt-2" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nome" className="label-caps">
            Nome
          </Label>
          <Input
            id="nome"
            value={form.nome}
            onChange={(event) => setForm({ ...form, nome: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp" className="label-caps">
            WhatsApp
          </Label>
          <Input
            id="whatsapp"
            value={form.whatsapp}
            onChange={(event) => setForm({ ...form, whatsapp: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username" className="label-caps">
            Usuário
          </Label>
          <Input
            id="username"
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
          />
        </div>

        <Button type="submit" className="rounded-sm">
          Salvar alterações
        </Button>
      </form>
    </CrmShell>
  );
}
