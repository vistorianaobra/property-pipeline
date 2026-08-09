import { useState } from "react";
import { CrmShell } from "@/components/crm/CrmShell";
import { PageHeader } from "@/components/crm/PageHeader";
import { Button } from "@/components/ui/button";
import { FileUp, Plus, Copy } from "lucide-react";
import { DEMO_PROFILES } from "@/lib/crm-data";
import { FormularioProduto } from "./FormularioProduto";

export function ListagemProdutos() {
  const [formOpen, setFormOpen] = useState(false);
  const [produtoEdit, setProdutoEdit] = useState<any>(null);

  // TODO: Fetch from Supabase
  const produtos = [];
  
  // This is a temporary user logic to keep the shell working
  const user = DEMO_PROFILES.find((p) => p.role === "ADMIN") || DEMO_PROFILES[0];

  const handleNovoProduto = () => {
    setProdutoEdit(null);
    setFormOpen(true);
  };

  return (
    <CrmShell
      user={user}
      items={[
        { label: "Funil da Diretoria", to: "/diretoria", icon: "kanban" },
        { label: "Painel de Vendas", to: "/vendedor", icon: "users" },
        { label: "Produtos (Base)", to: "/produtos", icon: "package" },
        { label: "Chamados", to: "/chamados", icon: "tickets" },
        { label: "Sair", to: "/", icon: "back" },
      ]}
    >
      <div className="flex items-center justify-between mb-8">
        <PageHeader
          eyebrow="Base de Estoque e Precificação"
          title="Produtos"
          subtitle="Gerencie os produtos, custos base, usabilidade e simule preços."
        />
        
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <FileUp className="size-4" />
            Importar Planilha
          </Button>
          <Button onClick={handleNovoProduto} className="gap-2 bg-black text-white hover:bg-black/90">
            <Plus className="size-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">O estoque está vazio. Clique em "Novo Produto" ou importe uma planilha para começar.</p>
      </div>

      <FormularioProduto 
        open={formOpen} 
        onOpenChange={setFormOpen} 
        produtoInicial={produtoEdit}
      />
    </CrmShell>
  );
}
