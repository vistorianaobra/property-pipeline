export type Role = "ADMIN" | "VENDEDOR" | "CORRETOR";

export type LeadStatus = "NOVO" | "CONTATO" | "PROPOSTA" | "FECHADO" | "PERDIDO";

export interface Profile {
  id: string;
  nome: string;
  role: Role;
  cargo: string;
  email: string;
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
    id: "u-dir-tuane",
    nome: "Tuane Carvalho Lopes",
    role: "ADMIN",
    cargo: "DIRETORA COMERCIAL",
    email: "projeto@entreriosdesign.com",
    equipe_id: null,
    avatar_url: null,
    whatsapp: "(11) 92093-7265",
    username: "tuane",
  },
  {
    id: "u-dir-bianca",
    nome: "Bianca Reis",
    role: "ADMIN",
    cargo: "SOCIA CURADORA E DIRETORA CRIATIVA",
    email: "entreriosbianca@gmail.com",
    equipe_id: null,
    avatar_url: null,
    whatsapp: "(11) 99702-0811",
    username: "bianca",
  },
  {
    id: "u-vend-tuane",
    nome: "Tuane Carvalho Lopes",
    role: "VENDEDOR",
    cargo: "CONSULTOR ENTRE RIOS / CLOSER",
    email: "projeto@entreriosdesign.com",
    equipe_id: null,
    avatar_url: null,
    whatsapp: "(11) 92093-7265",
    username: "tuane-consultor",
  },
  {
    id: "u-corr-isly",
    nome: "Isly Fernandes",
    role: "CORRETOR",
    cargo: "Corretora Parceira",
    email: "isly.fernandes@entreriosdesign.com",
    equipe_id: "u-vend-tuane",
    avatar_url: null,
    whatsapp: "(11) 99999-0010",
    username: "isly",
  },
  {
    id: "u-corr-luis",
    nome: "Luis Leme",
    role: "CORRETOR",
    cargo: "Corretor Parceiro",
    email: "luisleme@gmail.com",
    equipe_id: "u-vend-tuane",
    avatar_url: null,
    whatsapp: "(11) 99999-0011",
    username: "luisleme",
  },
];

const LUIS_LEMES_PHONES = [
  '+55 31 8924-2701', '+55 41 9701-0139', '+55 51 9685-4827', '+55 88 9689-1462',
  '+55 11 99625-8107', '+55 11 99627-7512', '+55 11 99687-7279', '+55 11 99830-2510',
  '+55 11 99836-3873', '+55 11 99844-9342', '+55 11 99988-0255', '+55 12 98167-4056',
  '+55 15 99639-1522', '+55 19 99220-3711', '+55 19 99864-3668', '+55 11 99219-4962',
  '+55 11 99229-2359', '+55 11 99269-6163', '+55 11 99388-1052', '+55 11 99411-6927',
  '+55 11 99532-0021', '+55 11 99556-0902', '+55 11 99563-3960', '+55 11 99603-8563',
  '+55 11 99607-1264', '+55 11 99617-0931', '+55 11 98785-8872', '+55 11 98860-2386',
  '+55 11 98875-4585', '+55 11 98902-0995', '+55 11 98911-9076', '+55 11 98936-6929',
  '+55 11 98945-7358', '+55 11 98951-1414', '+55 11 99017-2657', '+55 11 99150-4009',
  '+55 11 99174-8701', '+55 11 98412-4382', '+55 11 98482-2242', '+55 11 98520-0370',
  '+55 11 98564-6293', '+55 11 98571-0742', '+55 11 98612-9234', '+55 11 98632-2413',
  '+55 11 98654-3951', '+55 11 98679-7317', '+55 11 98717-6624', '+55 11 98723-4297',
  '+55 11 97667-8593', '+55 11 97711-9546', '+55 11 97727-9580', '+55 11 97731-2309',
  '+55 11 97788-7144', '+55 11 97793-4052', '+55 11 97886-8731', '+55 11 98040-3925',
  '+55 11 98066-8448', '+55 11 98100-8729', '+55 11 98253-9009', '+55 11 97171-9110',
  '+55 11 97222-8292', '+55 11 97247-8461', '+55 11 97392-7473', '+55 11 97437-8433',
  '+55 11 97500-1317', '+55 11 97578-4822', '+55 11 97633-9298', '+55 11 97653-2926',
  '+55 11 96553-4812', '+55 11 96572-9668', '+55 11 96610-1078', '+55 11 96771-1994',
  '+55 11 96895-3585', '+55 11 97061-3193', '+55 11 97089-6541', '+55 11 97106-9438',
  '+55 11 97151-2660', '+55 11 97153-8421', '+55 11 96082-9468', '+55 11 96182-8336',
  '+55 11 96222-9080', '+55 11 96224-6881', '+55 11 96262-2491', '+55 11 96304-6113',
  '+55 11 96357-2907', '+55 11 96363-9688', '+55 11 96429-1630', '+55 11 96552-7700',
  '+55 11 95363-2666', '+55 11 95465-1821', '+55 11 95466-6025', '+55 11 95808-7784',
  '+55 11 95823-0113', '+55 11 95855-0647', '+55 11 95868-3925', '+55 11 95872-4306',
  '+55 11 95974-9434', '+55 11 96062-7231', '+55 11 94919-2920', '+55 11 94930-8110',
  '+55 11 95078-9099', '+55 11 95106-9474', '+55 11 95136-1050', '+55 11 95154-0958',
  '+55 11 95175-6176', '+55 11 95282-3771', '+55 11 95314-1287', '+55 11 95357-0178',
  '+55 11 94498-0996', '+55 11 94499-9567', '+55 11 94549-5122', '+55 11 94719-7054',
  '+55 11 94721-3480', '+55 11 94724-3047', '+55 11 94768-1396', '+55 11 94820-6242',
  '+55 11 94846-5336', '+55 11 94854-5853', '+55 11 93904-8778', '+55 11 94007-2098',
  '+55 11 94011-0983', '+55 11 94046-0254', '+55 11 94204-6320', '+55 11 94205-3171',
  '+55 11 94240-8808', '+55 11 94262-4744', '+55 11 94285-3710', '+55 11 94376-9868',
  '+55 11 94791-4320', '+351 913 034 295', '+55 11 91060-9019', '+55 11 92184-4666',
  '+55 11 93025-7966', '+55 11 93066-0820', '+55 11 93212-0364', '+55 11 93223-4554',
  '+55 11 93468-0431', '+55 11 93902-0039', '+55 11 99407-9595', '+55 11 95289-7133',
  '+55 11 98604-0081', '+55 11 94786-4029'
];

export const DEMO_LEADS: Lead[] = LUIS_LEMES_PHONES.map((phone, idx) => ({
  id: `l-luis-${idx + 1}`,
  nome_cliente: "Aguardando Contato",
  telefone_cliente: phone,
  empreendimento: "Guedala Park (A Confirmar)",
  previsao_chaves: "A definir",
  status: "NOVO",
  corretor_id: "u-corr-luis",
  vendedor_id: "u-vend-tuane",
  valor: 0,
  created_at: new Date(Date.now() - idx * 3600000).toISOString(),
}));

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
