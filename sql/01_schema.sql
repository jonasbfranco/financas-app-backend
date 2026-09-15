CREATE TABLE IF NOT EXISTS categorias (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(100) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transacoes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
    categoria_id BIGINT REFERENCES categorias(id) ON DELETE SET NULL,
    tipo VARCHAR(100) NOT NULL,
    valor NUMERIC(15,2) NOT NULL DEFAULT 0,
    forma_pagamento VARCHAR(100) NOT NULL DEFAULT 'CARTAO',
    data DATE NOT NULL,
    status VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    login VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(180) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_usuarios_login_lower ON usuarios (LOWER(login));
CREATE INDEX IF NOT EXISTS idx_usuarios_email_lower ON usuarios (LOWER(email));

CREATE INDEX IF NOT EXISTS idx_categorias_nome_lower ON categorias (LOWER(nome));
CREATE INDEX IF NOT EXISTS idx_categorias_tipo_lower ON categorias (LOWER(tipo));

CREATE INDEX IF NOT EXISTS idx_transacoes_valor ON transacoes (valor);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo_lower ON transacoes (LOWER(tipo));


INSERT INTO categorias (nome, tipo)
VALUES 
('SALARIO', 'RECEITA'),
('ALUGUEL', 'RECEITA'),
('PARC TERRENO', 'RECEITA'),
('FINANCIAMENTO', 'DESPESA'),
('INTERNET', 'DESPESA')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO "usuarios" ("id", "nome", "login", "email", "senha_hash", "ativo", "criado_em", "atualizado_em") VALUES
(1,	'JONAS BAPTISTA FRANCO',	'jonas',	'jonasbfranco@gmail.com',	'$2b$12$02pl6Pp5LPdULy6faAI32OxEkU/9kbK5Cc7Ksuib3Zno9v4m9ZcNm',	'1',	'2026-09-12 00:30:21.180646+00',	'2026-09-12 00:31:01.417018+00');

ALTER TABLE transacoes
ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(100) NOT NULL DEFAULT 'CARTAO';

ALTER TABLE transacoes
ADD COLUMN IF NOT EXISTS valor NUMERIC(15,2) NOT NULL DEFAULT 0;

UPDATE transacoes
SET valor = 0
WHERE valor IS NULL;

ALTER TABLE transacoes
ALTER COLUMN valor TYPE NUMERIC(15,2)
USING valor::NUMERIC(15,2);

ALTER TABLE transacoes
ALTER COLUMN valor SET DEFAULT 0;

ALTER TABLE transacoes
ALTER COLUMN valor SET NOT NULL;


/*

ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS perfil_id BIGINT REFERENCES perfis(id) ON DELETE SET NULL;


INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT p.id, pe.id
FROM perfis p
JOIN permissoes pe ON pe.codigo = 'DASHBOARD_VISUALIZAR'
WHERE p.nome = 'Usuário Padrão'
ON CONFLICT DO NOTHING;


INSERT INTO permissoes (codigo, nome, descricao) VALUES
('DASHBOARD_VISUALIZAR', 'Visualizar dashboard', 'Acesso ao dashboard principal'),
('USUARIOS_GERENCIAR', 'Gerenciar usuários', 'Criar, editar, ativar e inativar usuários'),
('PERFIS_GERENCIAR', 'Gerenciar perfis', 'Criar e configurar perfis de acesso'),
('MODULOS_GERENCIAR', 'Gerenciar módulos', 'Cadastrar e administrar módulos do portal')
ON CONFLICT (codigo) DO NOTHING;


INSERT INTO modulos (nome, codigo, descricao, rota) VALUES
('Administração', 'ADMINISTRACAO', 'Gestão de usuários, perfis e módulos', '/admin'),
('Dashboard', 'DASHBOARD', 'Indicadores e informações principais', '/dashboard')
ON CONFLICT (codigo) DO NOTHING;


*/