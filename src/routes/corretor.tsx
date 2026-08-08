import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CrmShell } from "@/components/crm/CrmShell";
import { DetailDrawer } from "@/components/crm/DetailDrawer";
import { KanbanBoard } from "@/components/crm/KanbanBoard";
import { KpiRow, type Kpi } from "@/components/crm/KpiRow";
import { PageHeader } from "@/components/crm/PageHeader";
import {
  DEMO_LEADS,
  DEMO_PROFILES,
  formatBRL,
  greeting,
  todayLabel,
  type Lead,
} from "@/lib/crm-data";

export const Route = createFileRoute("/corretor")({
  validateSearch: (search: Record<string, unknown>) => ({
    user: (search.user as string) || (search.corretor as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Painel do Corretor — NEXMOVE CRM" },
      {
        name: "description",
        content: "Seus leads captados, etapas do funil e cadastro rápido de novos clientes.",
      },
      { property: "og:title", content: "Painel do Corretor — NEXMOVE CRM" },
      {
        property: "og:description",
        content: "Seus leads captados, etapas do funil e cadastro rápido de clientes.",
      },
    ],
  }),
  component: CorretorPage,
});

function CorretorPage() {
  const search = Route.useSearch();
  const corretores = DEMO_PROFILES.filter((profile) => profile.role === "CORRETOR");
  
  const isIsly = search.user === "isly";
  const targetId = isIsly ? "u-corr-isly" : "u-corr-luis";
  const user = corretores.find((c) => c.id === targetId) ?? corretores[0] ?? DEMO_PROFILES[0]!;

  const [allLeads, setAllLeads] = useState<Lead[]>(DEMO_LEADS);
  const leads = useMemo(
    () => allLeads.filter((lead) => lead.corretor_id === user.id),
    [allLeads, user.id],
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    nome_cliente: "",
    telefone_cliente: "",
    empreendimento: "",
    previsao_chaves: "",
  });

  const ativos = leads.filter((lead) => !["FECHADO", "PERDIDO"].includes(lead.status));
  const kpis: Kpi[] = [
    {
      id: "captados",
      label: "Leads captados",
      value: String(leads.length),
      hint: "Total na sua carteira (Ver)",
    },
    {
      id: "ativos",
      label: "Em andamento",
      value: String(ativos.length),
      hint: "Aguardando a consultora (Ver)",
    },
    {
      id: "fechados",
      label: "Fechados",
      value: String(leads.filter((lead) => lead.status === "FECHADO").length),
      hint: "Convertidos em venda (Ver)",
      tone: "success",
    },
    {
      id: "vgv",
      label: "VGV potencial",
      value: formatBRL(leads.reduce((total, lead) => total + lead.valor, 0)),
      hint: "Somatório dos seus leads (Ver)",
    },
  ];

  return (
    <CrmShell
      user={user}
      items={[
        { label: "Meus leads", to: "/corretor", icon: "kanban" },
        { label: "Chamados", to: "/chamados", icon: "tickets" },
        { label: "Sair", to: "/", icon: "back" },
      ]}
    >
      <PageHeader
        eyebrow={`Corretor Parceiro • ${todayLabel()}`}
        title={`${greeting()}, ${user.nome.split(" ")[0]}.`}
        subtitle={`${ativos.length} lead(s) em andamento com Tuane (Consultora).`}
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-sm">
                <Plus className="size-4" aria-hidden />
                Novo Lead
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl font-normal">Novo lead</DialogTitle>
                <DialogDescription>
                  O lead entra no funil como NOVO e vai para o seu vendedor.
                </DialogDescription>
              </DialogHeader>
              <form
                id="novo-lead"
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  setAllLeads((current) => [
                    {
                      id: `l-${current.length + 1}-${form.nome_cliente.length}`,
                      nome_cliente: form.nome_cliente,
                      telefone_cliente: form.telefone_cliente,
                      empreendimento: form.empreendimento,
                      previsao_chaves: form.previsao_chaves,
                      status: "NOVO",
                      corretor_id: user.id,
                      vendedor_id: user.equipe_id ?? "u-vend-tuane",
                      valor: 0,
                      created_at: new Date().toISOString(),
                    },
                    ...current,
                  ]);
                  setForm({
                    nome_cliente: "",
                    telefone_cliente: "",
                    empreendimento: "",
                    previsao_chaves: "",
                  });
                  setDialogOpen(false);
                  toast.success("Lead adicionado ao funil.");
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="cliente" className="label-caps">
                    Nome do cliente
                  </Label>
                  <Input
                    id="cliente"
                    required
                    value={form.nome_cliente}
                    onChange={(event) => setForm({ ...form, nome_cliente: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone" className="label-caps">
                    Telefone
                  </Label>
                  <Input
                    id="telefone"
                    value={form.telefone_cliente}
                    onChange={(event) => setForm({ ...form, telefone_cliente: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empreendimento" className="label-caps">
                    Empreendimento
                  </Label>
                  <Input
                    id="empreendimento"
                    value={form.empreendimento}
                    onChange={(event) => setForm({ ...form, empreendimento: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chaves" className="label-caps">
                    Previsão de chaves
                  </Label>
                  <Input
                    id="chaves"
                    placeholder="Dez/2027"
                    value={form.previsao_chaves}
                    onChange={(event) => setForm({ ...form, previsao_chaves: event.target.value })}
                  />
                </div>
              </form>
              <DialogFooter>
                <Button type="submit" form="novo-lead" className="rounded-sm">
                  Adicionar lead
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mt-10">
        <KpiRow items={kpis} onSelect={() => setDrawerOpen(true)} />
      </div>

      <KanbanBoard
        title="Meus Leads"
        leads={leads}
        profiles={DEMO_PROFILES}
        canMove={false}
        canDelete={false}
      />

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Meus leads"
        description="Situação de cada lead que você captou."
        rows={leads.map((lead) => ({
          id: lead.id,
          nome: lead.nome_cliente,
          detalhe: lead.status,
          resultado: formatBRL(lead.valor),
        }))}
      />
    </CrmShell>
  );
}
