import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CrmShell } from "@/components/crm/CrmShell";
import { DetailDrawer, type DrawerRow } from "@/components/crm/DetailDrawer";
import { KanbanBoard } from "@/components/crm/KanbanBoard";
import { KpiRow, type Kpi } from "@/components/crm/KpiRow";
import { PageHeader } from "@/components/crm/PageHeader";
import { useChamados, useLeads } from "@/lib/use-crm-store";
import {
  DEMO_PROFILES,
  formatBRL,
  greeting,
  todayLabel,
  type LeadStatus,
} from "@/lib/crm-data";

export const Route = createFileRoute("/diretoria")({
  validateSearch: (search: Record<string, unknown>) => ({
    user: (search.user as string) || (search.socia as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Painel da Diretoria — NEXMOVE CRM" },
      {
        name: "description",
        content:
          "Panorama global do CRM: faturamento, corretores, funil completo de leads e chamados abertos.",
      },
      { property: "og:title", content: "Painel da Diretoria — NEXMOVE CRM" },
      {
        property: "og:description",
        content: "Faturamento, corretores, funil completo e chamados em um só painel.",
      },
    ],
  }),
  component: DiretoriaPage,
});

function DiretoriaPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();

  useEffect(() => {
    const role = typeof window !== "undefined" ? sessionStorage.getItem("nexmove_role") : null;
    if (role === "CORRETOR") {
      toast.error("Acesso restrito! O painel da Diretoria é exclusivo para a diretoria.");
      navigate({ to: "/corretor", search: {} as any });
    }
  }, [navigate]);

  const directors = DEMO_PROFILES.filter((profile) => profile.role === "ADMIN");
  
  // Dedicated profile identification without cross-switching
  const isBianca = search.user === "bianca";
  const targetId = isBianca ? "u-dir-bianca" : "u-dir-tuane";
  const user = directors.find((d) => d.id === targetId) ?? directors[0]!;
  
  const { leads, moveLead, deleteLead } = useLeads();
  const { chamados, resolveChamado } = useChamados();
  const [drawer, setDrawer] = useState<string | null>(null);

  const corretores = DEMO_PROFILES.filter((profile) => profile.role === "CORRETOR");
  const vendedores = DEMO_PROFILES.filter((profile) => profile.role === "VENDEDOR");
  const faturamento = leads
    .filter((lead) => lead.status === "FECHADO")
    .reduce((total, lead) => total + lead.valor, 0);
  const abertos = chamados.filter((chamado) => chamado.status === "ABERTO");

  const kpis: Kpi[] = [
    {
      id: "faturamento",
      label: "Faturamento (mês)",
      value: formatBRL(faturamento),
      hint: "Por vendedor (Ver detalhes)",
      tone: "success",
    },
    {
      id: "corretores",
      label: "Total de corretores",
      value: String(corretores.length),
      hint: "Equipe ativa (Ver)",
    },
    {
      id: "carteira",
      label: "Leads em negociação",
      value: String(leads.filter((lead) => !["FECHADO", "PERDIDO"].includes(lead.status)).length),
      hint: "Funil global (Ver)",
    },
    {
      id: "chamados",
      label: "Chamados abertos",
      value: String(abertos.length),
      hint: "Solicitações da equipe (Ver)",
    },
  ];

  const drawerData = useMemo<{ title: string; description: string; rows: DrawerRow[] }>(() => {
    if (drawer === "corretores") {
      return {
        title: "Corretores",
        description: "Leads captados por corretor.",
        rows: corretores.map((profile) => ({
          id: profile.id,
          nome: profile.nome,
          detalhe: profile.cargo,
          avatar_url: profile.avatar_url,
          resultado: String(leads.filter((lead) => lead.corretor_id === profile.id).length),
        })),
      };
    }
    if (drawer === "carteira") {
      return {
        title: "Leads em negociação",
        description: "Distribuição por vendedor responsável.",
        rows: vendedores.map((profile) => ({
          id: profile.id,
          nome: profile.nome,
          detalhe: profile.cargo,
          avatar_url: profile.avatar_url,
          resultado: String(
            leads.filter(
              (lead) =>
                lead.vendedor_id === profile.id && !["FECHADO", "PERDIDO"].includes(lead.status),
            ).length,
          ),
        })),
      };
    }
    if (drawer === "chamados") {
      return {
        title: "Chamados",
        description: "Solicitações enviadas para a diretoria.",
        rows: chamados.map((chamado) => ({
          id: chamado.id,
          nome: DEMO_PROFILES.find((p) => p.id === chamado.requerente_id)?.nome ?? "—",
          detalhe: chamado.status,
          resultado: chamado.status === "ABERTO" ? "•" : "✓",
        })),
      };
    }
    return {
      title: "Faturamento por vendedor",
      description: "Somatório dos leads fechados no período.",
      rows: vendedores.map((profile) => ({
        id: profile.id,
        nome: profile.nome,
        detalhe: profile.cargo,
        avatar_url: profile.avatar_url,
        resultado: formatBRL(
          leads
            .filter((lead) => lead.vendedor_id === profile.id && lead.status === "FECHADO")
            .reduce((total, lead) => total + lead.valor, 0),
        ),
      })),
    };
  }, [chamados, corretores, drawer, leads, vendedores]);

  function handleMoveLead(leadId: string, status: LeadStatus) {
    moveLead(leadId, status);
  }

  function handleDeleteLead(leadId: string) {
    deleteLead(leadId);
    toast.success("Lead excluído.");
  }

  function handleImportBackup(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data)) {
          importLeads(data);
          toast.success("Backup importado com sucesso! Seus contatos foram restaurados.");
        } else {
          toast.error("Formato de arquivo de backup inválido.");
        }
      } catch (err) {
        toast.error("Erro ao ler o arquivo de backup.");
      }
    };
    reader.readAsText(file);
  }

  function exportBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(leads, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nexmove_leads_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Backup de leads baixado com sucesso!");
  }

  return (
    <CrmShell
      user={user}
      items={[
        { label: "Funil da Diretoria", to: "/diretoria", icon: "kanban" },
        { label: "Painel de Vendas", to: "/vendedor", icon: "users" },
        { label: "Orçamentos", to: "/orcamentos", icon: "file-text" },
        { label: "Produtos (Base)", to: "/produtos", icon: "package" },
        { label: "Chamados", to: "/chamados", icon: "tickets" },
        { label: "Sair", to: "/", icon: "back" },
      ]}
    >
      <PageHeader
        eyebrow={`${isBianca ? "Diretoria Criativa & Curadoria" : "Diretoria Comercial"} • ${todayLabel()}`}
        title={`${greeting()}, ${user.nome.split(" ")[0]}.`}
        subtitle={`${user.cargo} • Gestão autônoma e panorama geral.`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Sincronizado em tempo real na nuvem
            </span>
            <Button variant="outline" size="sm" onClick={exportBackup} className="rounded-sm text-xs">
              Baixar Backup
            </Button>
            <label className="cursor-pointer">
              <span className="inline-flex items-center justify-center rounded-sm text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1">
                Importar Backup
              </span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        }
      />

      <div className="mt-10">
        <KpiRow items={kpis} onSelect={setDrawer} />
      </div>

      <KanbanBoard
        title="Funil de Leads (Global)"
        leads={leads}
        profiles={DEMO_PROFILES}
        canMove
        canDelete
        onMove={handleMoveLead}
        onDelete={handleDeleteLead}
      />

      <section className="mt-14">
        <h2 className="text-2xl">Chamados</h2>
        <div className="mt-4 divide-y divide-border border border-border bg-card">
          {chamados.map((chamado) => (
            <div key={chamado.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="label-caps text-muted-foreground">
                  {DEMO_PROFILES.find((p) => p.id === chamado.requerente_id)?.nome} • {chamado.status}
                </p>
                <p className="mt-1 text-sm">{chamado.mensagem}</p>
              </div>
              {chamado.status === "ABERTO" ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-sm"
                  onClick={() => {
                    resolveChamado(chamado.id);
                    toast.success("Chamado resolvido.");
                  }}
                >
                  Dar baixa
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </section>

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
