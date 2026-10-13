# Fênix · Clipadores (Nordeste)

Área do clipador: cada clipador cadastra os @ dele, envia os links dos clipes, acompanha as views
e vê o ranking do mês. Os 7 com mais views somadas ganham prêmio via Pix.

Stack: **Next.js 15 + React 19 + TypeScript**, banco **Supabase**, deploy **Vercel**.

---

## Rodar no seu computador

Precisa do [Node.js 20+](https://nodejs.org).

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Sem nenhuma configuração, o site abre em **modo demonstração**
(dados fictícios, nada é salvo), então dá pra ver e testar todas as telas.

## O que tem

| Aba / tela | O que faz |
|---|---|
| **Resumo** | Clipes e views do mês (com o ganho desde ontem), sua posição, quanto falta pro próximo lugar e o prêmio se o mês fechasse hoje |
| **Ranking** | Ranking do mês com barra de progresso, faixa de prêmios, linha de corte do último premiado e destaque "você" |
| **Meus clipes** | Gráfico de views por dia, filtro por rede e por status, busca, ordenação, "mostrar mais", excluir com confirmação |
| **Minhas contas** | Cadastro dos @ e confirmação pelo login oficial da rede; chave Pix com validação por tipo |
| **Advertências** | Medidor 0–3, quando vem a próxima advertência automática e o histórico (ativa / anulada / vencida) |
| **Enviar clipe** | Reconhece o link (TikTok, Instagram, YouTube), limpa os parâmetros, bloqueia clipe repetido, link já removido e @ que não é seu |
| **Regras** | Passo a passo e letra miúda |

Funciona no celular, e os botões são acessíveis por teclado e leitor de tela.

As regras (prêmios, advertências, prazos) estão todas em `src/lib/clipador/rules.ts`.
Pra mudar a premiação, edite `PRIZES`.

## Estrutura

```
src/
  app/
    clipador/page.tsx        página da área do clipador
    api/cron/sync/route.ts   sincronização de views (roda no Vercel Cron)
    globals.css              visual (cores e fontes no topo do arquivo)
  components/clipador/       telas e componentes
  lib/clipador/
    types.ts                 formato dos dados
    rules.ts                 regras da competição
    platforms.ts             leitura dos links de TikTok / Instagram / YouTube
    data.ts                  carrega os dados (demo ou Supabase)
    demo-data.ts             dados fictícios do modo demo
    providers/               APIs oficiais (YouTube, TikTok, Instagram)
supabase/migrations/         estrutura do banco (SQL)
```

---

## Para quem vai colocar no ar

### 1. Banco (Supabase)

1. Rode `supabase/migrations/20261013000000_clipador.sql` no **SQL Editor** do projeto (ou `supabase db push`).
   O arquivo cria as tabelas, as regras automáticas (advertência a cada 3 removidos, ranking, views por dia) e o RLS.
2. Cada clipador precisa de uma linha em `clippers` ligada ao usuário do Supabase Auth (`id = auth.users.id`).
   Quem administra recebe `role = 'admin'`.
3. É uma **proposta**: se a dash já tem tabela de usuários, dá pra trocar `clippers` por ela.

Segurança, já incluída no SQL:
- Cada clipador só vê os próprios clipes, contas e advertências. O ranking geral vem da função `get_ranking`.
- Views, status e confirmação de conta só o servidor (service role) ou um admin alteram.
- Tokens do login oficial ficam em `clipper_account_tokens`, sem acesso pelo navegador.
  Recomendado: criptografar antes de gravar (ex.: Supabase Vault ou AES com uma chave só do servidor).

### 2. Ligar a página no banco

Em `src/app/clipador/page.tsx`, troque `loadClipadorData()` por `loadFromSupabase(supabase, user.id)`
(de `src/lib/clipador/data.ts`), usando o cliente do Supabase com a sessão do usuário logado (o mesmo login da dash).
Passe também `mode="live"` e um `onAction` que grava cada ação (enviar clipe, cadastrar @, salvar Pix) no Supabase.

### 3. Variáveis de ambiente (Vercel → Settings → Environment Variables)

Veja a lista completa em `.env.example`.

| Variável | Onde pegar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Mesmo lugar. **Só servidor**, nunca no front |
| `YOUTUBE_API_KEY` | Google Cloud Console → ative "YouTube Data API v3" → Credenciais → Chave de API |
| `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET` | developers.tiktok.com → app com Login Kit + Display API (escopos `user.info.basic`, `video.list`) |
| `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET` | developers.facebook.com → app com "Instagram API com login do Instagram" |
| `CRON_SECRET` | Qualquer texto longo e aleatório |

### 4. Leitura de views (APIs oficiais)

| Rede | Como lê | Precisa |
|---|---|---|
| YouTube | `videos.list` com chave de API | Só a chave. Cota padrão de 10.000 unidades/dia (1 unidade a cada 50 vídeos) |
| TikTok | Display API `video/query` | Login oficial de cada clipador. O app passa por revisão do TikTok |
| Instagram | `/me/media` + `/{id}/insights?metric=views` | Conta Profissional (Business/Creator) e login oficial de cada clipador. O app passa por revisão da Meta |

No TikTok e no Instagram, a API oficial **não** lê views de um vídeo qualquer só pelo link: é preciso o login do dono
da conta. Por isso o botão "Confirmar" em Minhas contas faz o login oficial, que ao mesmo tempo confirma que o @ é
do clipador e libera a leitura das views.

**Falta implementar:** as rotas do login oficial (`/api/auth/tiktok/start`, `/api/auth/instagram/start` e os callbacks),
que gravam o token em `clipper_account_tokens` e marcam a conta como `oauth`. A tela já chama essas rotas no modo `live`.

A sincronização (`/api/cron/sync`) já está pronta. Ela lê as views, grava o histórico em `clip_metrics`
e remove sozinha o clipe postado antes do mês da competição.
O `vercel.json` agenda uma vez por dia às 12:00 (horário de Brasília). No plano Hobby da Vercel o cron só pode
rodar 1x por dia; pra rodar várias vezes, use o plano Pro ou o pg_cron do Supabase chamando a mesma rota.

Antes de pôr no ar, confira na documentação atual de cada rede se endpoints e permissões mudaram:
- https://developers.google.com/youtube/v3/docs/videos/list
- https://developers.tiktok.com/doc/tiktok-api-v2-video-query
- https://developers.facebook.com/docs/instagram-platform
