import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CrmShell } from "@/components/crm/CrmShell";
import { PageHeader } from "@/components/crm/PageHeader";
import { useChamados } from "@/lib/use-crm-store";
import { DEMO_PROFILES, todayLabel } from "@/lib/crm-data";

export const Route = createFileRoute("/chamados")({
  head: () => ({
    meta: [
      { title: "Chamados — NEXMOVE CRM" },
      {
        name: "description",
        content:
          "Abra chamados para a diretoria solicitar exclusões e correções na base de clientes.",
      },
      { property: "og:title", content: "Chamados — NEXMOVE CRM" },
      {
        property: "og:description",
        content: "Solicite exclusões e correções na base de clientes à diretoria.",
      },
    ],
  }),
  component: ChamadosPage,
});

function ChamadosPage() {
  const user = DEMO_PROFILES.find((profile) => profile.role === "VENDEDOR")!;
  const { chamados, addChamado } = useChamados();
  const [mensagem, setMensagem] = useState("");

  return (
    <CrmShell
      user={user}
      items={[
        { label: "Meu Funil (Kanban)", to: "/vendedor", icon: "kanban" },
        { label: "Chamados", to: "/chamados", icon: "tickets" },
        { label: "Voltar à Diretoria", to: "/diretoria", icon: "back" },
      ]}
    >
      <PageHeader
        eyebrow={`Chamados • ${todayLabel()}`}
        title="Solicitações à diretoria."
        subtitle="Exclusões e correções na base de clientes são executadas apenas pela diretoria."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,24rem)_1fr]">
        <form
          className="space-y-4 border border-border bg-card p-6"
          onSubmit={(event) => {
            event.preventDefault();
            addChamado({
              id: `c-${Date.now()}`,
              requerente_id: user.id,
              mensagem,
              status: "ABERTO",
              created_at: new Date().toISOString(),
            });
            setMensagem("");
            toast.success("Chamado aberto.");
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="mensagem" className="label-caps">
              Novo chamado
            </Label>
            <Textarea
              id="mensagem"
              required
              rows={5}
              value={mensagem}
              onChange={(event) => setMensagem(event.target.value)}
              placeholder="Descreva a alteração necessária..."
            />
          </div>
          <Button type="submit" className="w-full rounded-sm">
            Abrir chamado
          </Button>
        </form>

        <div className="divide-y divide-border border border-border bg-card">
          {chamados.map((chamado) => (
            <div key={chamado.id} className="px-5 py-4">
              <p className="label-caps text-muted-foreground">
                {DEMO_PROFILES.find((p) => p.id === chamado.requerente_id)?.nome} • {chamado.status}
              </p>
              <p className="mt-1 text-sm">{chamado.mensagem}</p>
            </div>
          ))}
        </div>
      </div>
    </CrmShell>
  );
}
