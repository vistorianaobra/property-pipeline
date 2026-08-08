export type Role = "ADMIN" | "VENDEDOR" | "CORRETOR";

export type LeadStatus = "NOVO" | "CONTATO" | "PROPOSTA" | "FECHADO" | "PERDIDO";

export interface Profile {
  id: string;
  nome: string;
  role: Role;
  cargo: string;
  equipe_id: string | null;
  avatar_url: string | null;
  whatsapp: string;
  username: string;
}

export interface Lead {
  id: string;
  nome_cliente: string;
  telefone_cliente: string;
  empreendimento: string;
  previsao_chaves: string;
  status: LeadStatus;
  corretor_id: string;
  vendedor_id: string;
  valor: number;
  created_at: string;
}

export interface Chamado {
  id: string;
  requerente_id: string;
  mensagem: string;
  status: "ABERTO" | "RESOLVIDO";
  created_at: string;
}

export const STATUS_COLUMNS: { status: LeadStatus; label: string }[] = [
  { status: "NOVO", label: "Novos leads" },
  { status: "CONTATO", label: "Contato inicial" },
  { status: "PROPOSTA", label: "Proposta enviada" },
  { status: "FECHADO", label: "Fechado (ganho)" },
  { status: "PERDIDO", label: "Perdido" },
];

/**
 * Dados de demonstração usados enquanto o Supabase do cliente não está
 * conectado. Ao conectar, estas funções são substituídas por server functions
 * que leem `profiles`, `leads` e `chamados`.
 */
export const DEMO_PROFILES: Profile[] = [
  {
    id: "u-admin",
    nome: "Helena Duarte",
    role: "ADMIN",
    cargo: "Diretoria / Comercial",
    equipe_id: null,
    avatar_url: null,
    whatsapp: "(11) 99999-0001",
    username: "helena",
  },
  {
    id: "u-vend-1",
    nome: "Tuane Carvalho Lopes",
    role: "VENDEDOR",
    cargo: "Closer / Vendas internas",
    equipe_id: null,
    avatar_url: null,
    whatsapp: "(11) 99999-0002",
    username: "tuane",
  },
  {
    id: "u-vend-2",
    nome: "Rafael Menezes",
    role: "VENDEDOR",
    cargo: "Closer / Vendas externas",
    equipe_id: null,
    avatar_url: null,
    whatsapp: "(11) 99999-0003",
    username: "rafael",
  },
  {
    id: "u-corr-1",
    nome: "Bianca Reis",
    role: "CORRETOR",
    cargo: "Corretora",
    equipe_id: "u-vend-1",
    avatar_url: null,
    whatsapp: "(11) 99999-0004",
    username: "bianca",
  },
  {
    id: "u-corr-2",
    nome: "Diego Prado",
    role: "CORRETOR",
    cargo: "Corretor",
    equipe_id: "u-vend-1",
    avatar_url: null,
    whatsapp: "(11) 99999-0005",
    username: "diego",
  },
  {
    id: "u-corr-3",
    nome: "Marina Alves",
    role: "CORRETOR",
    cargo: "Corretora",
    equipe_id: "u-vend-2",
    avatar_url: null,
    whatsapp: "(11) 99999-0006",
    username: "marina",
  },
];

export const DEMO_LEADS: Lead[] = [];

export const DEMO_CHAMADOS: Chamado[] = [];

export function initials(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function todayLabel(date = new Date()) {
  return date
    .toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })
    .replace(",", ",");
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}
