import { Copy, Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const nameOf = (id: string) => profiles.find((p) => p.id === id)?.nome ?? "—";

  const handleCopyPhone = (leadId: string, phone: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(phone);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = phone;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
    } catch {}

    setCopiedId(leadId);
    toast.success(`Número ${phone} copiado! Dê Ctrl+V no WhatsApp.`, {
      duration: 3000,
    });

    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

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

                      {/* Direct Copy-to-Clipboard Action for Tuane */}
                      {lead.telefone_cliente && (
                        <button
                          type="button"
                          onClick={(e) => handleCopyPhone(lead.id, lead.telefone_cliente, e)}
                          className={`mt-2.5 inline-flex items-center justify-center gap-2 w-full px-2.5 py-2 rounded-sm text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
                            copiedId === lead.id
                              ? "bg-emerald-700 border-emerald-700 text-white shadow-sm"
                              : "bg-[#FAF8F5] hover:bg-[#F2ECE1] text-[#1F1E1B] border-[#E4DFD5] hover:border-[#1F1E1B]/40"
                          }`}
                        >
                          {copiedId === lead.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>COPIADO COM SUCESSO!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-[#787368]" />
                              <span>COPIAR NÚMERO ({lead.telefone_cliente})</span>
                            </>
                          )}
                        </button>
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
