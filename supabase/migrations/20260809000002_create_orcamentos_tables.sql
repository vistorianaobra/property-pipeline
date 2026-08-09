-- Alterar tabela de produtos para incluir classificação, subcategoria e atributos técnicos jsonb
ALTER TABLE public.produtos 
ADD COLUMN IF NOT EXISTS classificacao VARCHAR(50),
ADD COLUMN IF NOT EXISTS subcategoria VARCHAR(50),
ADD COLUMN IF NOT EXISTS atributos JSONB DEFAULT '{}'::jsonb;

-- Tabela de Orçamentos
CREATE TABLE IF NOT EXISTS public.orcamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    vendedor_id UUID REFERENCES auth.users(id),
    vendedor_nome VARCHAR(255),
    cliente_nome VARCHAR(255) NOT NULL,
    veio_de_escritorio BOOLEAN DEFAULT false,
    projetista_nome VARCHAR(255),
    endereco_entrega TEXT,
    estado_destino VARCHAR(2),
    valor_total NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Rascunho', -- Rascunho, Enviado, Aprovado, Rejeitado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Habilitar RLS para orcamentos
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendedores podem ver todos os orcamentos"
    ON public.orcamentos FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Vendedores podem inserir orcamentos"
    ON public.orcamentos FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Vendedores podem atualizar orcamentos"
    ON public.orcamentos FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Vendedores podem deletar orcamentos"
    ON public.orcamentos FOR DELETE
    USING (auth.role() = 'authenticated');

-- Tabela de Ambientes do Orçamento
CREATE TABLE IF NOT EXISTS public.orcamento_ambientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orcamento_id UUID REFERENCES public.orcamentos(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    numero_circuitos INTEGER DEFAULT 1,
    mapa_interruptores JSONB DEFAULT '[]'::jsonb, -- ex: [{"local": "entrada", "quantidade": 1}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Habilitar RLS para orcamento_ambientes
ALTER TABLE public.orcamento_ambientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso liberado para orcamento_ambientes autenticados"
    ON public.orcamento_ambientes FOR ALL
    USING (auth.role() = 'authenticated');

-- Tabela de Itens do Orçamento
CREATE TABLE IF NOT EXISTS public.orcamento_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ambiente_id UUID REFERENCES public.orcamento_ambientes(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES public.produtos(id),
    item_pai_id UUID REFERENCES public.orcamento_itens(id) ON DELETE CASCADE, -- Para hierarquia (Fonte vinculada à Fita)
    circuito_numero INTEGER NOT NULL DEFAULT 1, -- Vínculo obrigatório com o circuito do ambiente
    quantidade NUMERIC(10, 2) NOT NULL DEFAULT 1,
    preco_unitario NUMERIC(10, 2) NOT NULL,
    preco_total NUMERIC(10, 2) NOT NULL,
    detalhes_selecionados JSONB DEFAULT '{}'::jsonb, -- Ex: Temperatura 3000K, Ângulo 24°
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Habilitar RLS para orcamento_itens
ALTER TABLE public.orcamento_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso liberado para orcamento_itens autenticados"
    ON public.orcamento_itens FOR ALL
    USING (auth.role() = 'authenticated');
