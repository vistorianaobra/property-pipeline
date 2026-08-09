import { createFileRoute } from "@tanstack/react-router";
import { ListagemProdutos } from "@/pages/Produtos/ListagemProdutos";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos — NEXMOVE CRM" },
    ],
  }),
  component: ListagemProdutos,
});
