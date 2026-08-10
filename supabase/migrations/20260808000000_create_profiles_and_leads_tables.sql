-- Migration: Criar tabelas profiles, leads e chamados
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'VENDEDOR',
    cargo TEXT,
    email TEXT UNIQUE,
    equipe_id UUID REFERENCES public.profiles(id),
    avatar_url TEXT,
    whatsapp TEXT,
    username TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir acesso total aos profiles" ON public.profiles;
CREATE POLICY "Permitir acesso total aos profiles" ON public.profiles
    FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_cliente TEXT NOT NULL DEFAULT 'Aguardando Contato',
    telefone_cliente TEXT NOT NULL,
    empreendimento TEXT DEFAULT 'Guedala Park (A Confirmar)',
    previsao_chaves TEXT DEFAULT 'A definir',
    status TEXT NOT NULL DEFAULT 'NOVO',
    corretor_id UUID REFERENCES public.profiles(id),
    vendedor_id UUID REFERENCES public.profiles(id),
    valor NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir acesso total aos leads" ON public.leads;
CREATE POLICY "Permitir acesso total aos leads" ON public.leads
    FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.chamados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requerente_id UUID REFERENCES public.profiles(id),
    mensagem TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ABERTO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.chamados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir acesso total aos chamados" ON public.chamados;
CREATE POLICY "Permitir acesso total aos chamados" ON public.chamados
    FOR ALL USING (true) WITH CHECK (true);
