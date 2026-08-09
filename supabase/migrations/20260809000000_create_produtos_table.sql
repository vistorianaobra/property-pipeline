CREATE TABLE IF NOT EXISTS public.produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    sku TEXT UNIQUE,
    categoria TEXT,
    descricao TEXT,
    usabilidade TEXT,
    imagem_url TEXT,
    filtros JSONB DEFAULT '{}'::jsonb,
    
    -- Custos Base (Custo de Aquisição)
    custo_fornecedor NUMERIC(10, 2) DEFAULT 0,
    frete_entrada NUMERIC(10, 2) DEFAULT 0,
    impostos_entrada NUMERIC(10, 2) DEFAULT 0,
    custo_operacional NUMERIC(10, 2) DEFAULT 0,
    
    -- Comercialização e Margens
    margem_lucro_alvo_pct NUMERIC(5, 2) DEFAULT 20.00,
    comissao_rt_pct NUMERIC(5, 2) DEFAULT 10.00,
    impostos_venda_pct NUMERIC(5, 2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- Criar política de acesso para produtos (Temporariamente permitindo acesso total para desenvolvimento)
-- Importante: Refinar isso para permitir apenas usuários autenticados da organização
CREATE POLICY "Permitir acesso total temporario aos produtos" ON public.produtos
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Criar trigger para atualizar o updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop the trigger if it exists to avoid errors on multiple runs
DROP TRIGGER IF EXISTS handle_produtos_updated_at ON public.produtos;

CREATE TRIGGER handle_produtos_updated_at
    BEFORE UPDATE ON public.produtos
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();
