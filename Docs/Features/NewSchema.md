--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'public', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Extensions
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

--
-- Table: families
--

CREATE TABLE public.families (
    family_id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    owner_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.families OWNER TO postgres;

--
-- Table: tasks
--

CREATE TABLE public.tasks (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    description text,
    reward_points integer NOT NULL DEFAULT 0,
    frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'one-off')),
    status text NOT NULL CHECK (status IN ('assigned', 'pending approval', 'completed', 'rejected')),
    created_by uuid NOT NULL,
    assigned_child_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks OWNER TO postgres;

--
-- Table: users
--

CREATE TABLE public.users (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    family_id uuid,
    points integer NOT NULL DEFAULT 0,
    role text NOT NULL CHECK (role IN ('parent', 'child')),
    user_metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.users OWNER TO postgres;

--
-- Table: awards
--

CREATE TABLE public.awards (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    description text,
    points integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.awards OWNER TO postgres;

--
-- Table: cli_login_sessions
--

CREATE TABLE public.cli_login_sessions (
    session_id uuid NOT NULL DEFAULT uuid_generate_v4(),
    public_key text NOT NULL,
    token_name text,
    device_code text NOT NULL,
    nonce text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cli_login_sessions OWNER TO postgres;

--
-- Table: access_tokens
--

CREATE TABLE public.access_tokens (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    token text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.access_tokens OWNER TO postgres;

--
-- Dump completed on [DATE]
--