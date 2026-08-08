# CRM Inteligente — Reescrita em React (TanStack Start)

Vamos portar o CRM (hoje HTML/JS puro no Netlify) para um app React com backend
seguro: as consultas sensíveis passam a rodar no servidor, e o Supabase atual
continua sendo a fonte de dados.

## Pré-requisito: conectar seu Supabase

O projeto ainda não tem nenhum backend conectado. Como você quer usar o seu
Supabase existente (com os dados reais), o primeiro passo é conectar a
integração Supabase no botão de integrações do projeto (Supabase → Connect) e
autorizar o projeto que já contém `profiles`, `leads`, `chamados` e o bucket
`avatars`. Sem isso não consigo gerar tipos nem ler o schema real.

Depois de conectado eu verifico o schema e as políticas atuais antes de escrever
qualquer migração — nada abaixo assume o estado do seu banco sem checar.

## Etapa 1 — Segurança de acesso (roles)

- Nova tabela `user_roles` (`user_id`, `role` no enum `app_role`:
  ADMIN / VENDEDOR / CORRETOR) + função `has_role(_user_id, _role)`
  (SECURITY DEFINER) para uso nas políticas.
- Migração copia os valores atuais de `profiles.role` para `user_roles`.
  `profiles.role` fica mantida por compatibilidade e deixa de ser usada nas
  políticas (posso remover depois, quando o CRM antigo sair do ar).
- Revisão das políticas: leitura deixa de ser "todos os autenticados veem
  tudo". Cada nível passa a ler só o que lhe cabe (corretor: seus leads;
  vendedor: sua carteira + equipe; admin: tudo), com a filtragem no banco e não
  só na tela.
- `profiles` perde o `INSERT WITH CHECK (true)` — a criação de usuários passa
  para o servidor (Etapa 4).

## Etapa 2 — Base do app

- Login e recuperação de senha (`/auth`, `/reset-password`) com a mesma
  aparência do sistema atual.
- Área protegida com redirecionamento automático conforme o papel:
  ADMIN → `/diretoria`, VENDEDOR → `/vendedor`, CORRETOR → `/corretor`.
- Layout com header, avatar do usuário (bucket `avatars`) e sair.

## Etapa 3 — Telas do CRM

- **Funil Kanban de leads** com as colunas NOVO, CONTATO, PROPOSTA, FECHADO,
  PERDIDO; arrastar para mudar status (respeitando quem pode alterar).
- **Cadastro/edição de lead** (nome, telefone, empreendimento, previsão de
  chaves, corretor, vendedor).
- **KPIs clicáveis** que abrem a gaveta lateral (offcanvas) com a lista
  dinâmica: usuários, avatares e resultados em tempo real — Diretoria com
  panorama global, Vendedor com sua equipe.
- **Chamados**: abertura por corretor/vendedor, e baixa (RESOLVIDO) pela
  Diretoria; exclusão de leads/perfis só para ADMIN.
- **Perfil**: editar nome, whatsapp, username e trocar a foto.

## Etapa 4 — Criação de corretores sem deslogar

Um endpoint de servidor cria o usuário via Admin API do Supabase e já grava
`profiles` + `user_roles` e o vínculo `equipe_id`. O vendedor continua logado —
resolve o problema atual do `auth.signUp` no cliente. O endpoint valida que
quem chama é VENDEDOR ou ADMIN.

## Fora desta etapa

Painéis de Construtoras, Engenharia e Arquitetura ficam para depois, quando as
regras deles estiverem definidas.

## Detalhes técnicos

- Stack: TanStack Start (React 19) + Tailwind v4 + shadcn/ui, já no projeto.
- Rotas protegidas em `src/routes/_authenticated/` (gate gerenciado pela
  integração, `ssr: false`); `/auth` e `/reset-password` públicas.
- Leituras/escritas sensíveis via `createServerFn` com
  `requireSupabaseAuth` — a chave de serviço nunca vai para o navegador.
  A chave publicável no cliente é normal e segura, com RLS ativo.
- Criação de usuário usa o cliente admin carregado dentro do handler.
- Realtime dos KPIs via canal Supabase no cliente, invalidando as queries.
