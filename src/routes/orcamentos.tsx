import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { CrmShell } from "@/components/crm/CrmShell";
import { PageHeader } from "@/components/crm/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { DEMO_PROFILES, type Profile } from "@/lib/crm-data";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { formatBRL } from "@/lib/crm-data";

export const Route = createFileRoute("/orcamentos")({
  head: () => ({
    meta: [{ title: "Orçamentos — NEXMOVE CRM" }],
  }),
  component: OrcamentosListagem,
});

function OrcamentosListagem() {
  const navigate = useNavigate();
  const role = typeof window !== "undefined" ? sessionStorage.getItem("nexmove_role") : null;
  const username = typeof window !== "undefined" ? sessionStorage.getItem("nexmove_user") : null;

  useEffect(() => {
    if (!role) navigate({ to: "/" });
  }, [role, navigate]);

  const user: Profile = DEMO_PROFILES.find((p) => p.role === role) ?? DEMO_PROFILES[0]!;

  const { data: orcamentos, isLoading } = useQuery({
    queryKey: ["orcamentos-lista"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamentos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

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
      <PageHeader
        eyebrow="Módulo de Vendas"
        title="Gestão de Orçamentos"
        subtitle="Crie orçamentos detalhados com mapa de instalação e hierarquia de produtos."
      />

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Seus Orçamentos</h2>
          <Button onClick={() => navigate({ to: "/orcamentos/novo" })}>
            <Plus className="mr-2 size-4" /> Novo Orçamento
          </Button>
        </div>

        <div className="mt-6 border border-border bg-card rounded-md">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando orçamentos...</div>
          ) : !orcamentos || orcamentos.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <FileText className="size-10 mb-4 opacity-20" />
              <p>Nenhum orçamento criado ainda.</p>
              <Button variant="link" onClick={() => navigate({ to: "/orcamentos/novo" })}>
                Criar o primeiro orçamento
              </Button>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Valor Total</th>
                  <th className="px-4 py-3 font-medium text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orcamentos.map((orcamento: any) => (
                  <tr key={orcamento.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-semibold">{orcamento.codigo}</td>
                    <td className="px-4 py-3">{orcamento.cliente_nome}</td>
                    <td className="px-4 py-3">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-semibold">
                        {orcamento.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{formatBRL(orcamento.valor_total || 0)}</td>
                    <td className="px-4 py-3 text-center">
                      <Button variant="ghost" size="sm">Editar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </CrmShell>
  );
}
