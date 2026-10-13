-- =====================================================================
-- Clipador Fênix: estrutura do banco (PROPOSTA)
-- Rode no SQL Editor do Supabase ou com `supabase db push`.
-- Pode ser adaptada pra encaixar no banco que a dash já usa.
-- =====================================================================

-- ---------- tipos ----------
create type public.clip_platform as enum ('tiktok', 'instagram', 'youtube');
create type public.clip_status as enum ('verificando', 'no_ar', 'removido');
create type public.account_connection as enum ('manual', 'oauth');
create type public.warning_kind as enum ('remocoes', 'link_removido', 'clipe_de_terceiro');
create type public.pix_type as enum ('cpf', 'email', 'telefone', 'aleatoria');

-- ---------- clipadores ----------
-- 1 linha por usuário do Supabase Auth que participa (ou administra) a competição.
create table public.clippers (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  role text not null default 'clipper' check (role in ('clipper', 'admin')),
  pix_type public.pix_type,
  pix_key text,
  suspended_until date,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.clippers where id = auth.uid() and role = 'admin');
$$;

-- ---------- contas (@) dos clipadores ----------
create table public.clipper_accounts (
  id uuid primary key default gen_random_uuid(),
  clipper_id uuid not null references public.clippers (id) on delete cascade,
  platform public.clip_platform not null,
  handle text not null check (handle ~ '^[a-z0-9._-]{2,30}$'),
  connection public.account_connection not null default 'manual',
  external_user_id text,              -- id da conta na rede (vem do login oficial)
  created_at timestamptz not null default now(),
  unique (platform, handle)           -- o mesmo @ não pode ser de duas pessoas
);
create index on public.clipper_accounts (clipper_id);

-- Tokens do login oficial (OAuth). SEM políticas de RLS = ninguém lê pelo navegador;
-- só o servidor, com a service role key.
create table public.clipper_account_tokens (
  account_id uuid primary key references public.clipper_accounts (id) on delete cascade,
  access_token text not null,         -- guarde criptografado (ver README)
  refresh_token text,
  expires_at timestamptz,
  scopes text,
  updated_at timestamptz not null default now()
);

-- ---------- clipes ----------
create table public.clips (
  id uuid primary key default gen_random_uuid(),
  clipper_id uuid not null references public.clippers (id) on delete cascade,
  account_id uuid references public.clipper_accounts (id) on delete set null,
  platform public.clip_platform not null,
  url text not null,
  video_id text,                      -- id do vídeo na rede (preenchido no envio ou na 1ª sincronização)
  handle text,
  title text check (char_length(title) <= 120),
  competition_month date not null default date_trunc('month', now())::date,
  submitted_at timestamptz not null default now(),
  posted_at timestamptz,              -- data de publicação na rede (vem da API)
  views bigint not null default 0,
  views_yesterday bigint not null default 0,
  status public.clip_status not null default 'verificando',
  removal_reason text,
  removed_by uuid references public.clippers (id),
  removed_at timestamptz,
  last_sync_at timestamptz,
  sync_error text
);
create unique index clips_unique_video on public.clips (platform, video_id) where video_id is not null;
create index on public.clips (clipper_id, competition_month);
create index on public.clips (competition_month, status);

-- histórico de leituras (pra gráfico e auditoria)
create table public.clip_metrics (
  id bigint generated always as identity primary key,
  clip_id uuid not null references public.clips (id) on delete cascade,
  views bigint not null,
  likes bigint,
  comments bigint,
  shares bigint,
  captured_at timestamptz not null default now()
);
create index on public.clip_metrics (clip_id, captured_at desc);

-- ---------- advertências ----------
create table public.warnings (
  id uuid primary key default gen_random_uuid(),
  clipper_id uuid not null references public.clippers (id) on delete cascade,
  kind public.warning_kind not null,
  title text not null,
  detail text not null,
  created_at timestamptz not null default now(),
  annulled_at timestamptz,
  annulled_reason text
);
create index on public.warnings (clipper_id, created_at desc);

-- ---------- pagamentos ----------
create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  clipper_id uuid not null references public.clippers (id) on delete cascade,
  competition_month date not null,
  position int not null,
  amount numeric(10, 2) not null,
  paid_at timestamptz,
  unique (clipper_id, competition_month)
);

-- ---------- registro das sincronizações ----------
create table public.sync_runs (
  id bigint generated always as identity primary key,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  clips_checked int default 0,
  clips_failed int default 0,
  error text
);

-- =====================================================================
-- Regras automáticas
-- =====================================================================

-- A cada 3 clipes removidos pela equipe, 1 advertência automática.
create or replace function public.on_clip_removed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  total int;
begin
  if new.status = 'removido' and old.status is distinct from 'removido' then
    new.removed_at := now();
    select count(*) + 1 into total
      from public.clips
      where clipper_id = new.clipper_id and status = 'removido' and id <> new.id;
    if total % 3 = 0 then
      insert into public.warnings (clipper_id, kind, title, detail)
      values (
        new.clipper_id, 'remocoes', '3 clipes removidos pela equipe',
        format('Seus clipes removidos chegaram a %s — a cada 3 removidos, 1 advertência automática.', total)
      );
    end if;
  end if;
  return new;
end;
$$;

create trigger clips_on_removed
  before update of status on public.clips
  for each row execute function public.on_clip_removed();

-- Ranking do mês: nome, views e nº de clipes válidos de cada clipador.
-- security definer pra que cada clipador veja o ranking geral sem ver os clipes dos outros.
create or replace function public.get_ranking(p_month date default date_trunc('month', now())::date)
returns table (clipper_id uuid, name text, views bigint, clips bigint)
language sql
stable
security definer
set search_path = public
as $$
  select c.id, c.name, coalesce(sum(k.views), 0)::bigint, count(k.id)
  from public.clippers c
  join public.clips k on k.clipper_id = c.id
   and k.competition_month = p_month
   and k.status <> 'removido'
  where c.role = 'clipper'
    and (c.suspended_until is null or c.suspended_until < p_month)
  group by c.id, c.name
  order by 3 desc;
$$;

-- Views por dia de um clipador (diferença entre leituras), pro gráfico.
create or replace function public.get_daily_views(p_clipper uuid, p_month date default date_trunc('month', now())::date)
returns table (day date, views bigint)
language sql
stable
security definer
set search_path = public
as $$
  with daily as (
    select m.clip_id, (m.captured_at at time zone 'America/Sao_Paulo')::date as day, max(m.views) as v
    from public.clip_metrics m
    join public.clips k on k.id = m.clip_id
    where k.clipper_id = p_clipper
      and k.competition_month = p_month
      and k.status <> 'removido'
      and (p_clipper = auth.uid() or public.is_admin())
    group by 1, 2
  ),
  diffs as (
    select day, v - coalesce(lag(v) over (partition by clip_id order by day), 0) as gained
    from daily
  )
  select day, sum(gained)::bigint from diffs group by day order by day;
$$;

-- =====================================================================
-- Segurança (RLS)
-- =====================================================================
alter table public.clippers enable row level security;
alter table public.clipper_accounts enable row level security;
alter table public.clipper_account_tokens enable row level security; -- sem políticas: só service role
alter table public.clips enable row level security;
alter table public.clip_metrics enable row level security;
alter table public.warnings enable row level security;
alter table public.payouts enable row level security;
alter table public.sync_runs enable row level security;               -- sem políticas: só service role

-- clipadores: cada um vê e edita o próprio cadastro (nome e Pix); admin vê todos
create policy "clipper le o proprio" on public.clippers for select using (id = auth.uid() or public.is_admin());
create policy "clipper edita o proprio" on public.clippers for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.clippers where id = auth.uid()));
create policy "admin edita todos" on public.clippers for all using (public.is_admin()) with check (public.is_admin());

-- contas: cada um gerencia as próprias; a confirmação (oauth) só o servidor grava
create policy "contas: ler" on public.clipper_accounts for select using (clipper_id = auth.uid() or public.is_admin());
create policy "contas: cadastrar" on public.clipper_accounts for insert
  with check (clipper_id = auth.uid() and connection = 'manual');
create policy "contas: remover" on public.clipper_accounts for delete using (clipper_id = auth.uid() or public.is_admin());

-- clipes: cada um envia e apaga os próprios; views e status só o servidor/admin alteram
create policy "clipes: ler" on public.clips for select using (clipper_id = auth.uid() or public.is_admin());
create policy "clipes: enviar" on public.clips for insert
  with check (clipper_id = auth.uid() and status = 'verificando' and views = 0);
create policy "clipes: apagar" on public.clips for delete using (clipper_id = auth.uid() and status <> 'removido');
create policy "clipes: admin altera" on public.clips for update using (public.is_admin()) with check (public.is_admin());

create policy "metricas: ler" on public.clip_metrics for select
  using (exists (select 1 from public.clips k where k.id = clip_id and (k.clipper_id = auth.uid() or public.is_admin())));

create policy "advertencias: ler" on public.warnings for select using (clipper_id = auth.uid() or public.is_admin());
create policy "advertencias: admin" on public.warnings for all using (public.is_admin()) with check (public.is_admin());

create policy "pagamentos: ler" on public.payouts for select using (clipper_id = auth.uid() or public.is_admin());
create policy "pagamentos: admin" on public.payouts for all using (public.is_admin()) with check (public.is_admin());
