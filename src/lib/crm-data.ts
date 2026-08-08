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

export const DEMO_LEADS: Lead[] = [
  {
    id: "l-1",
    nome_cliente: "Ana Paula Ribeiro",
    telefone_cliente: "(11) 98888-1010",
    empreendimento: "Reserva Alto da Serra",
    previsao_chaves: "Dez/2027",
    status: "NOVO",
    corretor_id: "u-corr-1",
    vendedor_id: "u-vend-1",
    valor: 720000,
    created_at: "2026-08-06T12:00:00Z",
  },
  {
    id: "l-2",
    nome_cliente: "Marcelo Tavares",
    telefone_cliente: "(11) 98888-2020",
    empreendimento: "Edifício Vega",
    previsao_chaves: "Jun/2026",
    status: "CONTATO",
    corretor_id: "u-corr-2",
    vendedor_id: "u-vend-1",
    valor: 480000,
    created_at: "2026-08-04T12:00:00Z",
  },
  {
    id: "l-3",
    nome_cliente: "Família Nogueira",
    telefone_cliente: "(11) 98888-3030",
    empreendimento: "Parque das Águas",
    previsao_chaves: "Mar/2028",
    status: "PROPOSTA",
    corretor_id: "u-corr-1",
    vendedor_id: "u-vend-1",
    valor: 1150000,
    created_at: "2026-07-29T12:00:00Z",
  },
  {
    id: "l-4",
    nome_cliente: "Juliana Castro",
    telefone_cliente: "(11) 98888-4040",
    empreendimento: "Edifício Vega",
    previsao_chaves: "Jun/2026",
    status: "FECHADO",
    corretor_id: "u-corr-2",
    vendedor_id: "u-vend-1",
    valor: 535000,
    created_at: "2026-07-20T12:00:00Z",
  },
  {
    id: "l-5",
    nome_cliente: "Otávio Lima",
    telefone_cliente: "(11) 98888-5050",
    empreendimento: "Reserva Alto da Serra",
    previsao_chaves: "Dez/2027",
    status: "PERDIDO",
    corretor_id: "u-corr-3",
    vendedor_id: "u-vend-2",
    valor: 690000,
    created_at: "2026-07-11T12:00:00Z",
  },
  {
    id: "l-6",
    nome_cliente: "Construtora Bela Vista",
    telefone_cliente: "(11) 98888-6060",
    empreendimento: "Corporate One",
    previsao_chaves: "Set/2027",
    status: "PROPOSTA",
    corretor_id: "u-corr-3",
    vendedor_id: "u-vend-2",
    valor: 2400000,
    created_at: "2026-08-01T12:00:00Z",
  },
  {
    id: "l-7",
    nome_cliente: "Sérgio e Camila",
    telefone_cliente: "(11) 98888-7070",
    empreendimento: "Parque das Águas",
    previsao_chaves: "Mar/2028",
    status: "FECHADO",
    corretor_id: "u-corr-3",
    vendedor_id: "u-vend-2",
    valor: 890000,
    created_at: "2026-06-28T12:00:00Z",
  },
];

export const DEMO_CHAMADOS: Chamado[] = [
  {
    id: "c-1",
    requerente_id: "u-vend-1",
    mensagem: "Excluir lead duplicado de Ana Paula Ribeiro (dois cadastros).",
    status: "ABERTO",
    created_at: "2026-08-07T12:00:00Z",
  },
  {
    id: "c-2",
    requerente_id: "u-corr-2",
    mensagem: "Corrigir telefone do cliente Marcelo Tavares.",
    status: "RESOLVIDO",
    created_at: "2026-08-02T12:00:00Z",
  },
];

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
