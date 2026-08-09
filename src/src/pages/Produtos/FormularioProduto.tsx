import { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Camera, Save, X, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatBRL } from "@/lib/crm-data";

const produtoSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  sku: z.string().min(1, "O SKU é obrigatório"),
  categoria: z.string(),
  descricao: z.string().optional(),
  usabilidade: z.string().optional(),
  
  custo_fornecedor: z.coerce.number().min(0),
  frete_entrada: z.coerce.number().min(0),
  impostos_entrada: z.coerce.number().min(0),
  custo_operacional: z.coerce.number().min(0),
  
  estado_origem: z.string().default("SP"),
  importado: z.boolean().default(false),
  
  margem_lucro_alvo_pct: z.coerce.number().min(0).max(100),
  comissao_rt_pct: z.coerce.number().min(0).max(100),
  impostos_venda_pct: z.coerce.number().min(0).max(100),
});

type ProdutoFormValues = z.infer<typeof produtoSchema>;

export function FormularioProduto({ 
  open, 
  onOpenChange,
  produtoInicial = null 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  produtoInicial?: any;
}) {
  const [imagemUrl, setImagemUrl] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<{chave: string, valor: string}[]>([]);
  const [comissaoVendedor, setComissaoVendedor] = useState([10]); // Slider state (7 a 17)

  const form = useForm<ProdutoFormValues>({
    resolver: zodResolver(produtoSchema) as any,
    defaultValues: {
      nome: "", sku: "", categoria: "", descricao: "", usabilidade: "",
      custo_fornecedor: 0, frete_entrada: 0, impostos_entrada: 0, custo_operacional: 0,
      estado_origem: "SP", importado: false,
      margem_lucro_alvo_pct: 20, comissao_rt_pct: 10, impostos_venda_pct: 0
    } as any
  });

  const { watch, control, handleSubmit, setValue } = form;
  const values = watch();

  // Calcula DIFAL / Antecipação (Simples Nacional) e Custo Operacional automaticamente
  useEffect(() => {
    const custoF = Number(values.custo_fornecedor) || 0;
    const frete = Number(values.frete_entrada) || 0;
    
    // Regra DIFAL Simplificada para SP (Alíquota Interna 18%)
    let aliquotaInterestadual = 0;
    
    if (values.importado) {
      aliquotaInterestadual = 4; // Produtos Importados
    } else if (values.estado_origem === "SP") {
      aliquotaInterestadual = 18; // Sem DIFAL para compra interna
    } else {
      // Simplificação: Sul e Sudeste (exceto ES) = 12%, Norte/NE/CO/ES = 7%
      const estados12 = ["MG", "RJ", "PR", "SC", "RS"];
      aliquotaInterestadual = estados12.includes(values.estado_origem) ? 12 : 7;
    }
    
    const aliquotaInternaSP = 18;
    const difal = Math.max(0, aliquotaInternaSP - aliquotaInterestadual);
    
    // Calcula o imposto (Base de cálculo simples)
    const impostosCalculados = custoF * (difal / 100);
    
    // O Custo Operacional é 10% sobre o custo prévio (Fornecedor + Frete + Imposto)
    const custoPrevio = custoF + frete + impostosCalculados;
    const custoOperacionalCalculado = custoPrevio * 0.10;

    // Só atualiza se for diferente para evitar loop infinito
    // Usamos setTimeout para desvincular do ciclo síncrono do Radix Select
    setTimeout(() => {
      if (Math.abs(Number(values.impostos_entrada) - impostosCalculados) > 0.01) {
        setValue("impostos_entrada", Number(impostosCalculados.toFixed(2)));
      }
      if (Math.abs(Number(values.custo_operacional) - custoOperacionalCalculado) > 0.01) {
        setValue("custo_operacional", Number(custoOperacionalCalculado.toFixed(2)));
      }
    }, 0);
  }, [values.custo_fornecedor, values.estado_origem, values.importado, values.frete_entrada, setValue, values.impostos_entrada, values.custo_operacional]);

  const custoBase = useMemo(() => {
    return (
      (Number(values.custo_fornecedor) || 0) +
      (Number(values.frete_entrada) || 0) +
      (Number(values.impostos_entrada) || 0) +
      (Number(values.custo_operacional) || 0)
    );
  }, [values.custo_fornecedor, values.frete_entrada, values.impostos_entrada, values.custo_operacional]);

  const precoVendaSugerido = useMemo(() => {
    // Preço = Custo / (1 - (Despesas Variáveis / 100))
    const despesasVariaveis = 
      (Number(values.margem_lucro_alvo_pct) || 0) + 
      (Number(values.comissao_rt_pct) || 0) + 
      (Number(values.impostos_venda_pct) || 0) + 
      (comissaoVendedor[0] || 0);

    // Se as despesas passarem ou igualarem a 100%, a fórmula quebra (Markup infinito).
    // Prevenimos isso limitando a 99% para efeito de cálculo
    const divisor = 1 - (Math.min(despesasVariaveis, 99.9) / 100);
    return custoBase / divisor;
  }, [custoBase, values.margem_lucro_alvo_pct, values.comissao_rt_pct, values.impostos_venda_pct, comissaoVendedor]);

  const handleSalvar = (data: ProdutoFormValues) => {
    toast.success(`Produto "${data.nome}" salvo com sucesso!`);
    onOpenChange(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImagemUrl(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {produtoInicial ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleSalvar as any)} className="space-y-6 mt-4">
          <Tabs defaultValue="vitrine" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="vitrine">1. Vitrine</TabsTrigger>
              <TabsTrigger value="custos">2. Custos Base</TabsTrigger>
              <TabsTrigger value="simulador">3. Simulador de Preço</TabsTrigger>
            </TabsList>
            
            {/* TAB: VITRINE */}
            <TabsContent value="vitrine" className="space-y-4 pt-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <div className="relative size-40 rounded-lg border-2 border-dashed border-border overflow-hidden bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors cursor-pointer" onClick={() => document.getElementById("img-upload")?.click()}>
                    {imagemUrl ? (
                      <img src={imagemUrl} alt="Produto" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-muted-foreground flex flex-col items-center">
                        <Camera className="size-8 mb-2" />
                        <span className="text-xs">Adicionar Foto</span>
                      </div>
                    )}
                  </div>
                  <input id="img-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome do Produto</Label>
                    <Input id="nome" {...form.register("nome")} placeholder="Ex: Cadeira Escritório Ergonômica" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU (Código)</Label>
                    <Input id="sku" {...form.register("sku")} placeholder="Ex: CAD-ESC-001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Input id="categoria" {...form.register("categoria")} placeholder="Ex: Móveis Corporativos" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usabilidade">Usabilidade</Label>
                    <Input id="usabilidade" {...form.register("usabilidade")} placeholder="Ex: Salas de reunião e diretoria" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="descricao">Descrição Completa</Label>
                    <Textarea id="descricao" {...form.register("descricao")} className="resize-none" rows={3} />
                  </div>
                </div>
              </div>

              {/* Filtros */}
              <div className="mt-6 border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <Label>Filtros (Atributos da peça)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => setFiltros([...filtros, {chave: "", valor: ""}])}>
                    <Plus className="size-3 mr-1" /> Add Filtro
                  </Button>
                </div>
                {filtros.map((filtro, idx) => (
                  <div key={idx} className="flex items-center gap-3 mb-2">
                    <Input placeholder="Ex: Cor" value={filtro.chave} onChange={(e) => {
                      const newF = [...filtros]; if(newF[idx]) newF[idx].chave = e.target.value; setFiltros(newF);
                    }} className="w-1/3" />
                    <Input placeholder="Ex: Preto Fosco" value={filtro.valor} onChange={(e) => {
                      const newF = [...filtros]; if(newF[idx]) newF[idx].valor = e.target.value; setFiltros(newF);
                    }} className="flex-1" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => setFiltros(filtros.filter((_, i) => i !== idx))}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* TAB: CUSTOS BASE */}
            <TabsContent value="custos" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-2">
                  <Label>Custo Fornecedor (R$)</Label>
                  <Input type="number" step="0.01" {...form.register("custo_fornecedor")} />
                </div>
                <div className="space-y-2">
                  <Label>Frete de Entrada (R$)</Label>
                  <Input type="number" step="0.01" {...form.register("frete_entrada")} />
                </div>
                
                <div className="space-y-2 bg-muted/50 p-3 rounded-md border border-border">
                  <Label>Estado de Origem do Fornecedor</Label>
                  <Controller
                    control={control}
                    name="estado_origem"
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
                            <SelectItem value="BA">Bahia (BA)</SelectItem>
                            <SelectItem value="GO">Goiás (GO)</SelectItem>
                            <SelectItem value="ES">Espírito Santo (ES)</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <div className="flex items-center space-x-2 mt-4">
                    <Controller
                      control={control}
                      name="importado"
                      render={({ field }) => (
                        <Switch id="importado" checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                    <Label htmlFor="importado" className="font-normal text-sm cursor-pointer">
                      Produto Importado (Alíquota 4%)
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex justify-between">
                      <span>Impostos na Compra (DIFAL) (R$)</span>
                      <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Automático</span>
                    </Label>
                    <Input type="number" step="0.01" {...form.register("impostos_entrada")} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex justify-between">
                      <span>Custo Operacional (+10%) (R$)</span>
                      <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Travado</span>
                    </Label>
                    <Input type="number" step="0.01" {...form.register("custo_operacional")} disabled className="bg-muted text-muted-foreground opacity-100" />
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg flex items-center justify-between border border-primary/10">
                <span className="font-medium text-lg">Custo Base Total (Landed Cost):</span>
                <span className="text-2xl font-bold tracking-tight">{formatBRL(custoBase)}</span>
              </div>
            </TabsContent>

            {/* TAB: SIMULADOR DE PREÇO */}
            <TabsContent value="simulador" className="space-y-6 pt-4">
              <div className="bg-muted p-4 rounded-lg flex flex-col items-center justify-center border border-border mb-6">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">Preço Sugerido</span>
                <span className="text-4xl font-extrabold text-primary">{formatBRL(precoVendaSugerido)}</span>
                <span className="text-xs text-muted-foreground mt-2">Calculado com base nos custos e despesas abaixo</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Margem Lucro Empresa (%)</Label>
                  <div className="relative">
                    <Input type="number" step="0.1" {...form.register("margem_lucro_alvo_pct")} className="pr-8" />
                    <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reserva Técnica - RT (%)</Label>
                  <div className="relative">
                    <Input type="number" step="0.1" {...form.register("comissao_rt_pct")} className="pr-8" />
                    <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Impostos S/ Venda (%)</Label>
                  <div className="relative">
                    <Input type="number" step="0.1" {...form.register("impostos_venda_pct")} className="pr-8" />
                    <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-base font-semibold">Simular Comissão do Vendedor</Label>
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
                    {comissaoVendedor[0]}%
                  </span>
                </div>
                <Slider
                  defaultValue={[10]}
                  min={7}
                  max={17}
                  step={0.5}
                  value={comissaoVendedor}
                  onValueChange={setComissaoVendedor}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
                  <span>Mínimo: 7%</span>
                  <span>Máximo: 17%</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-4 mt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="gap-2">
              <Save className="size-4" /> Salvar Produto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
