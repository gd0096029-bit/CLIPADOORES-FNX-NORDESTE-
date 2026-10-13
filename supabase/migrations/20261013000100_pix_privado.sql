-- =====================================================================
-- Chave Pix privada
-- A chave sai da tabela de clipadores e vai pra uma tabela só dela.
-- Só o próprio clipador e a equipe (admin) conseguem ler ou mudar.
-- Assim, mesmo que no futuro outros clipadores possam ver o nome
-- uns dos outros (aba "Clipadores"), a chave nunca vaza.
-- =====================================================================

create table public.clipper_pix (
  clipper_id uuid primary key references public.clippers (id) on delete cascade,
  pix_type public.pix_type not null,
  pix_key text not null check (char_length(pix_key) between 3 and 140),
  updated_at timestamptz not null default now()
);

-- leva o que já existia
insert into public.clipper_pix (clipper_id, pix_type, pix_key)
select id, pix_type, pix_key from public.clippers
where pix_type is not null and pix_key is not null;

alter table public.clippers drop column pix_type;
alter table public.clippers drop column pix_key;

alter table public.clipper_pix enable row level security;

create policy "pix: dono ou admin le" on public.clipper_pix
  for select using (clipper_id = auth.uid() or public.is_admin());
create policy "pix: dono cadastra" on public.clipper_pix
  for insert with check (clipper_id = auth.uid());
create policy "pix: dono ou admin altera" on public.clipper_pix
  for update using (clipper_id = auth.uid() or public.is_admin())
  with check (clipper_id = auth.uid() or public.is_admin());
create policy "pix: dono ou admin apaga" on public.clipper_pix
  for delete using (clipper_id = auth.uid() or public.is_admin());

-- nenhuma função pública (ranking, clipes da galera) devolve a chave Pix
