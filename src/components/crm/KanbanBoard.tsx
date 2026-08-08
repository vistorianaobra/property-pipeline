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
                        <div>
                          <p className="text-sm font-semibold leading-snug text-foreground">
                            {lead.nome_cliente === "Aguardando Contato" && lead.telefone_cliente
                              ? lead.telefone_cliente
                              : lead.nome_cliente}
                          </p>
                          {lead.nome_cliente !== "Aguardando Contato" && lead.telefone_cliente ? (
                            <p className="text-xs font-mono text-muted-foreground mt-0.5">
                              {lead.telefone_cliente}
                            </p>
                          ) : (
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Contato por telefone
                            </p>
                          )}
                        </div>
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

                      <p className="mt-1.5 text-xs text-muted-foreground">{lead.empreendimento}</p>

                      {/* Direct WhatsApp Call-to-Action for Tuane */}
                      {lead.telefone_cliente && (
                        <a
                          href={`https://wa.me/${lead.telefone_cliente.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Sou a Tuane Carvalho Lopes da Entre Rios / Vistoria na Obra. Gostaria de conversar sobre o seu imóvel.")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2.5 inline-flex items-center justify-center gap-1.5 w-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#1E7E34] hover:text-white px-2.5 py-1.5 rounded-sm text-xs font-medium transition-all no-underline border border-[#25D366]/30"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.978L2 22l5.188-1.361a9.924 9.924 0 0 0 4.817 1.239h.005c5.507 0 9.99-4.478 9.99-9.985.001-2.67-1.037-5.18-2.927-7.072C17.18 3.037 14.67 2 12.012 2zm5.717 14.28c-.247.696-1.442 1.282-1.996 1.356-.505.068-1.162.102-1.85-.12a9.421 9.421 0 0 1-4.017-2.483 9.49 9.49 0 0 1-2.433-3.923c-.392-1.133-.04-1.954.218-2.316.223-.314.502-.456.657-.557.155-.101.309-.126.433-.126h.314c.144 0 .341-.013.51.393.206.495.706 1.724.768 1.849.062.126.103.271.015.441-.088.172-.175.29-.35.49-.175.202-.371.44-.53.593-.176.168-.361.352-.155.707.206.353.918 1.513 1.968 2.45a7.842 7.842 0 0 0 2.859 1.764c.371.18.598.152.825-.098.226-.252.989-1.156 1.246-1.552.258-.396.516-.328.877-.193.36.135 2.292 1.08 2.686 1.277.394.197.658.293.755.457.098.163.098.948-.149 1.644z" />
                          </svg>
                          WhatsApp {lead.telefone_cliente}
                        </a>
                      )}

                      <dl className="mt-3 space-y-1 text-xs text-muted-foreground border-t border-border/40 pt-2">
                        <div className="flex justify-between gap-2">
                          <dt>Corretor</dt>
                          <dd className="text-foreground font-medium">{nameOf(lead.corretor_id)}</dd>
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
