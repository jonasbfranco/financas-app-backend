-- Adminer 5.4.2 PostgreSQL 17.8 dump

CREATE DATABASE "financas-app";
\connect "financas-app";

DROP TABLE IF EXISTS "categorias";
DROP SEQUENCE IF EXISTS "public".categorias_id_seq;
CREATE SEQUENCE "public".categorias_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE "public"."categorias" (
    "id" bigint DEFAULT nextval('categorias_id_seq') NOT NULL,
    "nome" character varying(100) NOT NULL,
    "tipo" character varying(100) NOT NULL,
    "ativo" boolean DEFAULT true NOT NULL,
    "criado_em" timestamptz DEFAULT now() NOT NULL,
    "atualizado_em" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX categorias_nome_key ON public.categorias USING btree (nome);

CREATE INDEX idx_categorias_nome_lower ON public.categorias USING btree (lower((nome)::text));

CREATE INDEX idx_categorias_tipo_lower ON public.categorias USING btree (lower((tipo)::text));

INSERT INTO "categorias" ("id", "nome", "tipo", "ativo", "criado_em", "atualizado_em") VALUES
(1,	'SALARIO',	'RECEITA',	'1',	'2026-09-13 19:12:00.083814+00',	'2026-09-13 19:12:00.083814+00'),
(2,	'ALUGUEL',	'RECEITA',	'1',	'2026-09-13 19:12:00.083814+00',	'2026-09-13 19:12:00.083814+00'),
(3,	'PARC TERRENO',	'RECEITA',	'1',	'2026-09-13 19:12:00.083814+00',	'2026-09-13 19:12:00.083814+00'),
(4,	'FINANCIAMENTO',	'DESPESA',	'1',	'2026-09-13 19:12:00.083814+00',	'2026-09-13 19:12:00.083814+00'),
(5,	'INTERNET',	'DESPESA',	'1',	'2026-09-13 19:12:00.083814+00',	'2026-09-13 19:12:00.083814+00');

DROP TABLE IF EXISTS "transacoes";
DROP SEQUENCE IF EXISTS "public".transacoes_id_seq;
CREATE SEQUENCE "public".transacoes_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE "public"."transacoes" (
    "id" bigint DEFAULT nextval('transacoes_id_seq') NOT NULL,
    "usuario_id" bigint,
    "categoria_id" bigint,
    "tipo" character varying(100) NOT NULL,
    "valor" numeric(15,2) DEFAULT '0' NOT NULL,
    "forma_pagamento" character varying(100) NOT NULL,
    "data" date NOT NULL,
    "status" character varying(100) NOT NULL,
    "descricao" character varying(255) NOT NULL,
    "criado_em" timestamptz DEFAULT now() NOT NULL,
    "atualizado_em" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "transacoes_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE INDEX idx_transacoes_tipo_lower ON public.transacoes USING btree (lower((tipo)::text));

CREATE INDEX idx_transacoes_valor ON public.transacoes USING btree (valor);


DROP TABLE IF EXISTS "usuarios";
DROP SEQUENCE IF EXISTS "public".usuarios_id_seq;
CREATE SEQUENCE "public".usuarios_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE "public"."usuarios" (
    "id" bigint DEFAULT nextval('usuarios_id_seq') NOT NULL,
    "nome" character varying(150) NOT NULL,
    "login" character varying(80) NOT NULL,
    "email" character varying(180) NOT NULL,
    "senha_hash" character varying(255) NOT NULL,
    "ativo" boolean DEFAULT true NOT NULL,
    "criado_em" timestamptz DEFAULT now() NOT NULL,
    "atualizado_em" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX usuarios_login_key ON public.usuarios USING btree (login);

CREATE UNIQUE INDEX usuarios_email_key ON public.usuarios USING btree (email);

CREATE INDEX idx_usuarios_login_lower ON public.usuarios USING btree (lower((login)::text));

CREATE INDEX idx_usuarios_email_lower ON public.usuarios USING btree (lower((email)::text));


ALTER TABLE ONLY "public"."transacoes" ADD CONSTRAINT "transacoes_categoria_id_fkey" FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL;
ALTER TABLE ONLY "public"."transacoes" ADD CONSTRAINT "transacoes_usuario_id_fkey" FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;

INSERT INTO "usuarios" ("id", "nome", "login", "email", "senha_hash", "ativo", "criado_em", "atualizado_em") VALUES
(1,	'JONAS BAPTISTA FRANCO',	'jonas',	'jonasbfranco@gmail.com',	'$2b$12$02pl6Pp5LPdULy6faAI32OxEkU/9kbK5Cc7Ksuib3Zno9v4m9ZcNm',	'1',	'2026-09-12 00:30:21.180646+00',	'2026-09-12 00:31:01.417018+00');

-- 2026-09-13 19:30:12 UTC