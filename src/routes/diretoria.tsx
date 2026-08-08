import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CrmShell } from "@/components/crm/CrmShell";
import { DetailDrawer, type DrawerRow } from "@/components/crm/DetailDrawer";
import { KanbanBoard } from "@/components/crm/KanbanBoard";
import { KpiRow, type Kpi } from "@/components/crm/KpiRow";
import { PageHeader } from "@/components/crm/PageHeader";
import {
  DEMO_CHAMADOS,
  DEMO_LEADS,
  DEMO_PROFILES,
  formatBRL,
  greeting,
  todayLabel,
  type Chamado,
  type Lead,
  type LeadStatus,
} from "@/lib/crm-data";

export const Route = createFileRoute("/diretoria")({
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
  const directors = DEMO_PROFILES.filter((profile) => profile.role === "ADMIN");
  const [selectedDirectorId, setSelectedDirectorId] = useState<string>(directors[0]?.id ?? "u-dir-tuane");
  const user = directors.find((d) => d.id === selectedDirectorId) ?? directors[0]!;
  
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS);
  const [chamados, setChamados] = useState<Chamado[]>(DEMO_CHAMADOS);
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

  function moveLead(leadId: string, status: LeadStatus) {
    setLeads((current) =>
      current.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)),
    );
  }

  function deleteLead(leadId: string) {
    setLeads((current) => current.filter((lead) => lead.id !== leadId));
    toast.success("Lead excluído.");
  }

  return (
    <CrmShell
      user={user}
      items={[
        { label: "Funil global", to: "/diretoria", icon: "kanban" },
        { label: "Painel do vendedor", to: "/vendedor", icon: "users" },
        { label: "Chamados", to: "/chamados", icon: "tickets" },
        { label: "Sair", to: "/", icon: "back" },
      ]}
    >
      <PageHeader
        eyebrow={`Diretoria • ${todayLabel()}`}
        title={`${greeting()}, ${user.nome.split(" ")[0]}.`}
        subtitle={`${user.cargo} • ${abertos.length} chamado(s) em aberto.`}
        action={
          <div className="flex items-center gap-2 bg-[#FAF8F5] p-1 border border-[#E4DFD5]">
            {directors.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDirectorId(d.id)}
                className={`px-3 py-1.5 text-xs font-medium transition-all ${
                  d.id === user.id
                    ? "bg-[#1F1E1B] text-[#FAF8F5] shadow-xs"
                    : "text-[#787368] hover:text-[#1F1E1B]"
                }`}
              >
                {d.nome.split(" ")[0]} ({d.username === "tuane" ? "Comercial" : "Criativa"})
              </button>
            ))}
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
        onMove={moveLead}
        onDelete={deleteLead}
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
                    setChamados((current) =>
                      current.map((item) =>
                        item.id === chamado.id ? { ...item, status: "RESOLVIDO" } : item,
                      ),
                    );
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
