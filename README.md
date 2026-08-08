# Property Pipeline

# CRM Inteligente - Documentação de Arquitetura e Contexto

Este documento contém todo o contexto, regras de negócio e estrutura de banco de dados do sistema desenvolvido até o momento. Ele serve como "ponto de partida" (prompt de contexto) para a IDE Antigravity ou para plataformas como o Lovable, a fim de evoluir o projeto para um backend robusto (como Node.js, Next.js, etc).

## 1. Visão Geral do Projeto

Trata-se de um **CRM Operacional e Sistema de Gestão** focado no mercado imobiliário/consultoria. O sistema possui controle de funil de vendas (Kanban), relatórios e KPIs em tempo real, gestão de equipes e abertura de chamados.

- **Stack Atual:** Frontend Estático (Vanilla HTML, CSS, Javascript) sem uso de frameworks.

- **Backend as a Service:** Supabase (PostgreSQL, Auth, Storage).

- **Hospedagem Atual:** Netlify (Drag and Drop).

## 2. Hierarquia e Regras de Negócio

O sistema é dividido em três níveis de acesso (Roles):

1. **DIRETORIA (ADMIN):** Possui controle total. Apenas este nível pode excluir dados do sistema (Leads, Perfis). Pode visualizar o panorama geral (Faturamento, Total de Corretores, KPIs globais). Acesso via `diretoria.html`.

2. **VENDEDOR:** Gerencia sua própria carteira de leads e a sua equipe de corretores vinculados. Pode alterar o status dos leads no funil, mas não pode apagá-los. Acesso via `vendedor.html`.

3. **CORRETOR:** Nível operacional base. Vê apenas os seus próprios leads e os alimenta. Acesso via `corretor.html`.

**Funcionalidades Principais:**

- **Cadastro Nativo (Opção B):** Vendedores podem cadastrar Corretores diretamente pelo painel. Por segurança do Supabase Client, ao usar o método `auth.signUp` na sessão do cliente, o Vendedor é desconectado automaticamente e deve logar novamente. (Isso evita envio de e-mails de convite).

- **Recuperação de Senha:** Implementada com `resetPasswordForEmail` do Supabase.

- **Gavetas Laterais (Offcanvas):** KPIs da Diretoria e Vendedor são clicáveis e abrem um painel lateral dinâmico para listar usuários, avatares e resultados em tempo real.

## 3. Estrutura do Banco de Dados (Supabase PostgreSQL)

### Tabela: `profiles`

Armazena os dados públicos e funções dos usuários, vinculada diretamente à tabela `auth.users` do Supabase.

- `id` (UUID, PK, REFERENCES auth.users)

- `nome` (TEXT)

- `role` (TEXT) - 'ADMIN', 'VENDEDOR', 'CORRETOR'

- `equipe_id` (UUID) - Se for corretor, armazena o ID do vendedor líder.

- `avatar_url` (TEXT) - Nome do arquivo da foto de perfil.

- `whatsapp` (TEXT)

- `username` (TEXT)

### Tabela: `leads`

Armazena os negócios e clientes em andamento.

- `id` (UUID, PK)

- `nome_cliente` (TEXT)

- `telefone_cliente` (TEXT)

- `empreendimento` (TEXT)

- `previsao_chaves` (TEXT)

- `status` (TEXT) - 'NOVO', 'CONTATO', 'PROPOSTA', 'FECHADO', 'PERDIDO'

- `corretor_id` (UUID) - Quem captou o lead.

- `vendedor_id` (UUID) - Quem está fechando a venda.

- `created_at` (TIMESTAMP)

### Tabela: `chamados` (Tickets)

Usada pelos usuários para solicitar alterações na base de clientes para a Diretoria (já que eles não têm permissão de exclusão).

- `id` (UUID, PK)

- `requerente_id` (UUID, REFERENCES profiles.id)

- `mensagem` (TEXT)

- `status` (TEXT) - 'ABERTO' ou 'RESOLVIDO'

- `created_at` (TIMESTAMP)

### Storage (Buckets)

- `avatars`: Bucket público que armazena as fotos de perfil. O nome do arquivo segue o formato `{user.id}.extensao`.

## 4. Políticas de Segurança (Row Level Security - RLS)

A base está completamente blindada por políticas de segurança no nível do banco.

- **Leitura:** Todos os usuários autenticados (`authenticated`) podem fazer `SELECT`. A interface do frontend filtra o que cada um vê baseando-se no `user.id`.

- **Inserção:** Todos os autenticados podem inserir `leads` e `chamados`. A tabela `profiles` possui uma política `FOR INSERT WITH CHECK (true)` para permitir o cadastro nativo pelo frontend.

- **Atualização:** O usuário só pode atualizar o próprio perfil. Apenas ADMIN ou o Dono do Lead podem atualizar os `leads`. Apenas ADMIN pode atualizar os `chamados` (para dar baixa).

- **Exclusão:** Somente usuários com `role = 'ADMIN'` podem executar ações de `DELETE` em qualquer tabela.

## 5. Próximos Passos (Objetivo com o Lovable/Backend)

O objetivo de levar este contexto para um ambiente de backend é:

1. Migrar a lógica pura de cliente (onde as chaves do Supabase ficam expostas no HTML/JS) para um backend seguro e escalável.

2. Implementar a criação de usuários através de um `Admin API` do Supabase via servidor (ex: Edge Functions, Node.js), eliminando a necessidade de desconectar o Vendedor toda vez que ele cadastra um Corretor.

3. Criar os painéis modulares faltantes (Construtoras, Engenharia, Arquitetura) usando um framework moderno de UI (React/Vue).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1e3dbbdf-5b1a-4394-be42-54bfa66038ac).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
