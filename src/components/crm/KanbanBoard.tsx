import { Check, Copy, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  STATUS_COLUMNS,
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
  onUpdate,
}: {
  title: string;
  leads: Lead[];
  profiles: Profile[];
  canMove: boolean;
  canDelete: boolean;
  onMove?: (leadId: string, status: LeadStatus) => void;
  onDelete?: (leadId: string) => void;
  onUpdate?: (leadId: string, updates: Partial<Lead>) => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editName, setEditName] = useState("");
  const [editObs, setEditObs] = useState("");

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

  const startEditing = (lead: Lead, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingLead(lead);
    setEditName(lead.nome_cliente === "Aguardando Contato" ? "" : lead.nome_cliente);
    setEditObs(lead.observacao || "");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    const finalName = editName.trim() || "Aguardando Contato";
    onUpdate?.(editingLead.id, {
      nome_cliente: finalName,
      observacao: editObs.trim(),
    });

    toast.success("Informações do contato salvas com sucesso!");
    setEditingLead(null);
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
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-snug text-foreground truncate">
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

                        <div className="flex items-center gap-0.5 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Editar Nome e Comentário"
                            aria-label={`Editar ${lead.nome_cliente}`}
                            className="size-7 text-muted-foreground hover:text-foreground"
                            onClick={(e) => startEditing(lead, e)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>

                          {canDelete ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Excluir ${lead.nome_cliente}`}
                              className="size-7 text-muted-foreground hover:text-destructive"
                              onClick={() => onDelete?.(lead.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      <p className="mt-1.5 text-xs text-muted-foreground">{lead.empreendimento}</p>

                      {/* Direct Copy-to-Clipboard Action */}
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

                      {/* Display Comment / Notes if present */}
                      {lead.observacao ? (
                        <div className="mt-2.5 bg-[#FAF7F2] border border-[#E8E2D7] rounded p-2.5 text-xs text-[#3E3A32]">
                          <div className="flex items-center gap-1.5 font-semibold text-[10px] text-[#8C8475] uppercase tracking-wider mb-1">
                            <MessageSquare className="w-3 h-3 text-[#A89F8F]" />
                            <span>Observação</span>
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed text-foreground">{lead.observacao}</p>
                        </div>
                      ) : null}

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

                      {canMove && (
                        <div className="mt-2.5 border-t border-border/40 pt-2">
                          <label htmlFor={`select-status-${lead.id}`} className="sr-only">
                            Mover etapa
                          </label>
                          <select
                            id={`select-status-${lead.id}`}
                            value={lead.status}
                            onChange={(e) => onMove?.(lead.id, e.target.value as LeadStatus)}
                            className="w-full text-[11px] font-medium bg-background border border-border rounded-sm px-2 py-1 text-foreground hover:border-foreground/40 focus:outline-none cursor-pointer"
                          >
                            <option value="NOVO">Mover: Novos leads</option>
                            <option value="CONTATO">Mover: Contato inicial</option>
                            <option value="PROPOSTA">Mover: Proposta enviada</option>
                            <option value="FECHADO">Mover: Fechado (ganho)</option>
                            <option value="PERDIDO">Mover: Perdido</option>
                          </select>
                        </div>
                      )}
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
          Arraste um card ou use o menu seletor para mudar a etapa do lead.
        </p>
      ) : null}

      {/* Edit Modal Dialog for Name & Comment */}
      <Dialog open={editingLead !== null} onOpenChange={(open) => !open && setEditingLead(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-normal">
              Editar Contato & Observações
            </DialogTitle>
            <DialogDescription>
              Atualize o nome da pessoa e registre observações sobre a negociação ({editingLead?.telefone_cliente}).
            </DialogDescription>
          </DialogHeader>

          <form id="edit-lead-form" onSubmit={handleSaveEdit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="label-caps">
                Nome da Pessoa / Cliente
              </Label>
              <Input
                id="edit-name"
                placeholder="Ex: João Silva (ou deixe em branco se ainda não souber)"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-obs" className="label-caps">
                Comentário / Observações da Negociação
              </Label>
              <Textarea
                id="edit-obs"
                rows={4}
                placeholder="Escreva notas, histórico de conversas, horários de contato, preferências do imóvel, etc..."
                value={editObs}
                onChange={(e) => setEditObs(e.target.value)}
              />
            </div>
          </form>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingLead(null)}
              className="rounded-sm"
            >
              Cancelar
            </Button>
            <Button type="submit" form="edit-lead-form" className="rounded-sm">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
