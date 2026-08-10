import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
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
import { DetailDrawer, type DrawerRow } from "@/components/crm/DetailDrawer";
import { KanbanBoard } from "@/components/crm/KanbanBoard";
import { KpiRow, type Kpi } from "@/components/crm/KpiRow";
import { PageHeader } from "@/components/crm/PageHeader";
import { useLeads } from "@/lib/use-crm-store";
import {
  DEMO_PROFILES,
  formatBRL,
  greeting,
  todayLabel,
  type LeadStatus,
} from "@/lib/crm-data";

export const Route = createFileRoute("/vendedor")({
  head: () => ({
    meta: [
      { title: "Painel do Consultor Entre Rios — NEXMOVE CRM" },
      {
        name: "description",
        content:
          "Canal de vendas ativo, carteira de leads, funil de corretores e KPIs de fechamento de Tuane Carvalho Lopes.",
      },
      { property: "og:title", content: "Painel do Consultor Entre Rios — NEXMOVE CRM" },
      {
        property: "og:description",
        content: "Canal de vendas ativo e funil de recepção de leads de corretores.",
      },
    ],
  }),
  component: VendedorPage,
});

function VendedorPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = typeof window !== "undefined" ? sessionStorage.getItem("nexmove_role") : null;
    if (role === "CORRETOR") {
      toast.error("Acesso restrito! O canal do vendedor é exclusivo para o time interno.");
      navigate({ to: "/corretor", search: {} as any });
    }
  }, [navigate]);

  const user = DEMO_PROFILES.find((profile) => profile.id === "u-vend-tuane") ?? DEMO_PROFILES[0]!;
  const { leads, moveLead } = useLeads();
  const [drawer, setDrawer] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const equipe = DEMO_PROFILES.filter((profile) => profile.equipe_id === user.id);
  const meusLeads = leads.filter((lead) => lead.vendedor_id === user.id);
  const fechados = meusLeads.filter((lead) => lead.status === "FECHADO");
  const carteira = meusLeads.filter((lead) => !["FECHADO", "PERDIDO"].includes(lead.status));
  const novos = meusLeads.filter((lead) => lead.status === "NOVO");

  const kpis: Kpi[] = [
    {
      id: "fechamentos",
      label: "Meus fechamentos (mês)",
      value: String(fechados.length),
      hint: `${formatBRL(fechados.reduce((t, l) => t + l.valor, 0))} faturados (Ver detalhes)`,
    },
    {
      id: "carteira",
      label: "Leads em carteira",
      value: String(carteira.length),
      hint: "Em negociação ativa (Ver)",
    },
    {
      id: "corretores",
      label: "Meus corretores",
      value: String(equipe.length),
      hint: "Trazendo leads este mês (Ver)",
    },
    {
      id: "sla",
      label: "Meu SLA (resposta)",
      value: "45m",
      hint: "Dentro da meta (< 1h)",
      tone: "success",
    },
  ];

  const drawerData = useMemo<{ title: string; description: string; rows: DrawerRow[] }>(() => {
    if (drawer === "corretores" || drawer === null) {
      return {
        title: "Meus corretores",
        description: "Leads trazidos por cada corretor da sua equipe.",
        rows: equipe.map((profile) => ({
          id: profile.id,
          nome: profile.nome,
          detalhe: profile.cargo,
          avatar_url: profile.avatar_url,
          resultado: String(leads.filter((lead) => lead.corretor_id === profile.id).length),
        })),
      };
    }
    if (drawer === "fechamentos") {
      return {
        title: "Fechamentos do mês",
        description: "Leads ganhos na sua carteira.",
        rows: fechados.map((lead) => ({
          id: lead.id,
          nome: lead.nome_cliente,
          detalhe: lead.empreendimento,
          resultado: formatBRL(lead.valor),
        })),
      };
    }
    if (drawer === "carteira") {
      return {
        title: "Leads em carteira",
        description: "Negociações ativas por etapa do funil.",
        rows: carteira.map((lead) => ({
          id: lead.id,
          nome: lead.nome_cliente,
          detalhe: lead.status,
          resultado: formatBRL(lead.valor),
        })),
      };
    }
    return {
      title: "SLA de resposta",
      description: "Tempo médio até o primeiro contato.",
      rows: equipe.map((profile) => ({
        id: profile.id,
        nome: profile.nome,
        detalhe: "Tempo médio",
        avatar_url: profile.avatar_url,
        resultado: "45m",
      })),
    };
  }, [carteira, drawer, equipe, fechados, leads]);

  return (
    <CrmShell
      user={user}
      items={[
        { label: "Meu Funil (Kanban)", to: "/vendedor", icon: "kanban" },
        { label: "Visão Corretor (App)", to: "/corretor", icon: "users" },
        { label: "Orçamentos", to: "/orcamentos", icon: "file-text" },
        { label: "Chamados", to: "/chamados", icon: "tickets" },
        { label: "Voltar à Diretoria", to: "/diretoria", icon: "back" },
      ]}
    >
      <PageHeader
        eyebrow={`Consultor Entre Rios • ${todayLabel()}`}
        title={`${greeting()}, ${user.nome.split(" ")[0]}.`}
        subtitle={`Seu canal de vendas ativo • ${novos.length} lead(s) recebido(s) de corretores.`}
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-sm">
                <Plus className="size-4" aria-hidden />
                Cadastrar Corretor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl font-normal">
                  Cadastrar corretor
                </DialogTitle>
                <DialogDescription>
                  O corretor é criado no servidor e vinculado à sua equipe — você continua logado.
                </DialogDescription>
              </DialogHeader>
              <form
                id="novo-corretor"
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  setDialogOpen(false);
                  toast.info("Conecte o Supabase do projeto para criar o corretor de verdade.");
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="nome" className="label-caps">
                    Nome
                  </Label>
                  <Input id="nome" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-corretor" className="label-caps">
                    E-mail
                  </Label>
                  <Input id="email-corretor" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="label-caps">
                    WhatsApp
                  </Label>
                  <Input id="whatsapp" />
                </div>
              </form>
              <DialogFooter>
                <Button type="submit" form="novo-corretor" className="rounded-sm">
                  Criar corretor
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mt-10">
        <KpiRow items={kpis} onSelect={setDrawer} />
      </div>

      <KanbanBoard
        title="Funil de Leads (Meus Corretores)"
        leads={meusLeads}
        profiles={DEMO_PROFILES}
        canMove
        canDelete={false}
        onMove={(leadId, status: LeadStatus) => moveLead(leadId, status)}
      />

      <DetailDrawer
        open={drawer !== null}
        onOpenChange={(open) => setDrawer(open ? drawer : null)}
        title={drawerData.title}
        description={drawerData.description}
        rows={drawerData.rows}
      />
    </CrmShell>
  );
}
