import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  STATUS_COLUMNS,
  formatBRL,
  type Lead,
  type LeadStatus,
  type Profile,
} from "@/lib/crm-data";

export function KanbanBoard({
  title,
  leads,
  profiles,
  canMove,
  canDelete,
  onMove,
  onDelete,
}: {
  title: string;
  leads: Lead[];
  profiles: Profile[];
  canMove: boolean;
  canDelete: boolean;
  onMove?: (leadId: string, status: LeadStatus) => void;
  onDelete?: (leadId: string) => void;
}) {
  const nameOf = (id: string) => profiles.find((p) => p.id === id)?.nome ?? "—";

  return (
    <section className="mt-12">
      <h2 className="text-2xl">{title}</h2>
      <div className="mt-4 border-t border-border pt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {STATUS_COLUMNS.map((column) => {
            const columnLeads = leads.filter((lead) => lead.status === column.status);
            return (
              <div
                key={column.status}
                onDragOver={(event) => {
                  if (canMove) event.preventDefault();
                }}
                onDrop={(event) => {
                  if (!canMove) return;
                  event.preventDefault();
                  const leadId = event.dataTransfer.getData("text/plain");
                  if (leadId) onMove?.(leadId, column.status);
                }}
                className="flex min-h-[22rem] flex-col border border-border bg-card"
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
                  <p className="label-caps">{column.label}</p>
                  <span className="text-xs text-muted-foreground">{columnLeads.length}</span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-3">
                  {columnLeads.map((lead) => (
                    <article
                      key={lead.id}
                      draggable={canMove}
                      onDragStart={(event) => event.dataTransfer.setData("text/plain", lead.id)}
                      className="group border border-border bg-background p-3 transition-colors hover:border-foreground/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-snug">{lead.nome_cliente}</p>
                        {canDelete ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Excluir ${lead.nome_cliente}`}
                            className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={() => onDelete?.(lead.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{lead.empreendimento}</p>
                      <p className="mt-3 font-display text-lg leading-none">
                        {formatBRL(lead.valor)}
                      </p>
                      <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between gap-2">
                          <dt>Corretor</dt>
                          <dd className="text-foreground/80">{nameOf(lead.corretor_id)}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt>Chaves</dt>
                          <dd className="text-foreground/80">{lead.previsao_chaves}</dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                  {columnLeads.length === 0 ? (
                    <p className="px-1 py-2 text-xs text-muted-foreground">Nenhum lead aqui.</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {canMove ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Arraste um card para mudar o status do lead.
        </p>
      ) : null}
    </section>
  );
}
