import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Save, ArrowLeft, Plus, MapPin, Building2, Lightbulb, User } from "lucide-react";

import { CrmShell } from "@/components/crm/CrmShell";
import { PageHeader } from "@/components/crm/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEMO_PROFILES, type Profile } from "@/lib/crm-data";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/orcamentos/novo")({
  head: () => ({
    meta: [{ title: "Novo Orçamento — NEXMOVE CRM" }],
  }),
  component: NovoOrcamentoPage,
});

const orcamentoSchema = z.object({
  cliente_nome: z.string().min(3, "Nome do cliente é obrigatório"),
  veio_de_escritorio: z.boolean().default(false),
  projetista_nome: z.string().optional(),
  endereco_entrega: z.string().min(5, "Endereço completo é obrigatório para cálculo de impostos"),
  estado_destino: z.string().length(2, "Selecione o estado"),
  ambientes: z.array(z.object({
    nome: z.string().min(1, "Nome do ambiente é obrigatório"),
    numero_circuitos: z.coerce.number().min(1),
    mapa_interruptores: z.string(), // Texto simplificado por enquanto
    itens: z.array(z.any()) // Depois tiparemos os produtos
  })).min(1, "Adicione pelo menos um ambiente")
});

type OrcamentoData = z.infer<typeof orcamentoSchema>;

function NovoOrcamentoPage() {
  const navigate = useNavigate();
  const role = typeof window !== "undefined" ? sessionStorage.getItem("nexmove_role") : null;
  const username = typeof window !== "undefined" ? sessionStorage.getItem("nexmove_user") : null;

  useEffect(() => {
    if (!role) navigate({ to: "/" });
  }, [role, navigate]);

  const user: Profile = DEMO_PROFILES.find((p) => p.role === role) ?? DEMO_PROFILES[0]!;

  // Gera o código automaticamente ER[XX][XX]26001
  const [codigoGerado, setCodigoGerado] = useState("ER...26001");
  
  useEffect(() => {
    if (user) {
      const parts = user.nome.split(" ");
      const first = (parts[0]?.substring(0, 2) || "XX").toUpperCase();
      const last = (parts.length > 1 ? parts[parts.length - 1]?.substring(0, 2) || "XX" : "XX").toUpperCase();
      const year = new Date().getFullYear().toString().substring(2);
      // Aqui num cenário real buscaríamos o número sequencial no banco
      const sequencial = "001";
      setCodigoGerado(`ER${first}${last}${year}${sequencial}`);
    }
  }, [user]);

  const form = useForm<OrcamentoData>({
    resolver: zodResolver(orcamentoSchema) as any,
    defaultValues: {
      cliente_nome: "",
      veio_de_escritorio: false,
      projetista_nome: "",
      endereco_entrega: "",
      estado_destino: "SP",
      ambientes: [
        { nome: "Sala de Estar", numero_circuitos: 1, mapa_interruptores: "1 Entrada", itens: [] }
      ]
    } as any
  });

  const { control, handleSubmit, watch, register } = form;
  const veioDeEscritorio = watch("veio_de_escritorio");
  const ambientes = watch("ambientes");
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ambientes"
  });

  const [activeTab, setActiveTab] = useState(0);

  const onSubmit = async (data: OrcamentoData) => {
    try {
      toast.loading("Salvando orçamento...", { id: "save-orcamento" });
      
      // Inserir Cabeçalho do Orçamento
      const { data: orcamentoId, error: orcError } = await supabase
        .from("orcamentos")
        .insert({
          codigo: codigoGerado,
          vendedor_id: null, // Idealmente o UUID do auth
          vendedor_nome: user.nome,
          cliente_nome: data.cliente_nome,
          veio_de_escritorio: data.veio_de_escritorio,
          projetista_nome: data.veio_de_escritorio ? data.projetista_nome : null,
          endereco_entrega: data.endereco_entrega,
          estado_destino: data.estado_destino,
          status: "Rascunho"
        })
        .select("id")
        .single();
        
      if (orcError) throw orcError;

      // Inserir Ambientes
      for (const amb of data.ambientes) {
        const { error: ambError } = await supabase
          .from("orcamento_ambientes")
          .insert({
            orcamento_id: orcamentoId.id,
            nome: amb.nome,
            numero_circuitos: amb.numero_circuitos,
            mapa_interruptores: JSON.stringify([{ local: amb.mapa_interruptores }])
          });
        if (ambError) throw ambError;
      }

      toast.success("Orçamento salvo com sucesso!", { id: "save-orcamento" });
      navigate({ to: "/orcamentos" });
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar orçamento", { id: "save-orcamento" });
    }
  };

  return (
    <CrmShell
      user={user}
      items={[
        { label: "Dashboard", to: role === "ADMIN" ? "/diretoria" : "/vendedor", icon: "home" },
        { label: "Orçamentos", to: "/orcamentos", icon: "file-text" },
        { label: "Produtos (Base)", to: "/produtos", icon: "package" },
        { label: "Sair", to: "/", icon: "back" },
      ]}
    >
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/orcamentos" })} className="-ml-3 mb-2 text-muted-foreground">
            <ArrowLeft className="mr-2 size-4" /> Voltar
          </Button>
          <PageHeader
            eyebrow="Orçamento"
            title="Novo Orçamento"
            subtitle="Estruture os ambientes, os circuitos e adicione os produtos."
          />
        </div>
        <div className="text-right bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">Código Gerado</p>
          <p className="text-xl font-bold font-mono">{codigoGerado}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="mt-8 space-y-8">
        
        {/* CABEÇALHO DO CLIENTE */}
        <div className="bg-card border border-border p-6 rounded-lg space-y-6">
          <div className="flex items-center gap-2 border-b pb-4">
            <User className="size-5 text-muted-foreground" />
            <h3 className="text-lg font-medium">Dados do Cliente</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Nome do Cliente</Label>
              <Input {...register("cliente_nome")} placeholder="Ex: João da Silva" />
              {form.formState.errors.cliente_nome && <span className="text-destructive text-xs">{form.formState.errors.cliente_nome.message}</span>}
            </div>

            <div className="space-y-2 bg-muted/30 p-3 rounded-md border border-border">
              <div className="flex items-center justify-between mb-2">
                <Label className="flex items-center gap-2 cursor-pointer" htmlFor="veio_escritorio">
                  <Building2 className="size-4" /> Parceria com Escritório?
                </Label>
                <Controller
                  control={control}
                  name="veio_de_escritorio"
                  render={({ field }) => (
                    <Switch id="veio_escritorio" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
              {veioDeEscritorio && (
                <div className="pt-2">
                  <Input {...register("projetista_nome")} placeholder="Nome do Escritório ou Projetista" />
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="flex items-center gap-2"><MapPin className="size-4" /> Endereço de Entrega (Completo)</Label>
              <Textarea {...register("endereco_entrega")} placeholder="Rua, Número, Bairro, CEP..." rows={2} />
              {form.formState.errors.endereco_entrega && <span className="text-destructive text-xs">{form.formState.errors.endereco_entrega.message}</span>}
            </div>

            <div className="space-y-2">
              <Label>Estado Destino (ICMS)</Label>
              <Controller
                control={control}
                name="estado_destino"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecione o Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="SP">São Paulo (SP)</SelectItem>
                        <SelectItem value="RJ">Rio de Janeiro (RJ)</SelectItem>
                        <SelectItem value="MG">Minas Gerais (MG)</SelectItem>
                        <SelectItem value="PR">Paraná (PR)</SelectItem>
                        <SelectItem value="SC">Santa Catarina (SC)</SelectItem>
                        <SelectItem value="RS">Rio Grande do Sul (RS)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </div>

        {/* ESTRUTURA DOS AMBIENTES */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex flex-wrap border-b bg-muted/20">
            {fields.map((field, index) => (
              <button
                key={field.id}
                type="button"
                className={`px-4 py-3 text-sm font-medium border-r transition-colors flex items-center gap-2
                  ${activeTab === index ? 'bg-background border-b-2 border-b-primary text-primary' : 'hover:bg-muted/50 text-muted-foreground'}`}
                onClick={() => setActiveTab(index)}
              >
                {ambientes[index]?.nome || `Ambiente ${index + 1}`}
              </button>
            ))}
            <button
              type="button"
              className="px-4 py-3 text-sm font-medium text-primary hover:bg-primary/5 transition-colors flex items-center"
              onClick={() => {
                append({ nome: "", numero_circuitos: 1, mapa_interruptores: "", itens: [] });
                setActiveTab(fields.length);
              }}
            >
              <Plus className="size-4 mr-1" /> Novo Ambiente
            </button>
          </div>

          <div className="p-6">
            {fields.map((field, index) => (
              <div key={field.id} className={activeTab === index ? "block" : "hidden"}>
                <div className="flex justify-between items-start mb-6 border-b pb-4">
                  <h3 className="text-lg font-medium flex items-center gap-2"><Lightbulb className="size-5" /> Detalhes do Ambiente</h3>
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => {
                      remove(index);
                      setActiveTab(Math.max(0, index - 1));
                    }}>
                      Remover Ambiente
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="space-y-2">
                    <Label>Nome do Ambiente</Label>
                    <Input {...register(`ambientes.${index}.nome`)} placeholder="Ex: Sala de Estar, Cozinha..." />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Número de Circuitos</Label>
                    <Input type="number" min={1} {...register(`ambientes.${index}.numero_circuitos`)} />
                    <p className="text-xs text-muted-foreground">Exigido no Mapa de Instalação</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Mapa de Interruptores</Label>
                    <Input {...register(`ambientes.${index}.mapa_interruptores`)} placeholder="Ex: 1 na entrada, 2 na cama" />
                    <p className="text-xs text-muted-foreground">Diretório de botões/espelhos</p>
                  </div>
                </div>

                <div className="bg-muted/30 border border-dashed border-border rounded-lg p-12 text-center flex flex-col items-center">
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Package className="size-6 text-primary" />
                  </div>
                  <h4 className="text-lg font-medium">Buscador Inteligente de Produtos</h4>
                  <p className="text-muted-foreground text-sm mt-2 max-w-md">
                    O buscador de produtos e as regras de hierarquia (Lâmpadas, Fontes, Perfis) serão construídos na próxima etapa.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" className="px-8">
            <Save className="size-4 mr-2" /> Salvar Orçamento
          </Button>
        </div>
      </form>
    </CrmShell>
  );
}

// Dummy icon component for Package since it wasn't imported at the top
const Package = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
);
