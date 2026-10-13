/**
 * DADOS DE DEMONSTRAÇÃO
 * Tudo aqui é fictício (nomes, @, links e números). Serve pra ver e testar a área
 * do clipador sem banco de dados. Quando o Supabase estiver ligado, estes dados
 * são substituídos pelos reais (ver README → "Ligando o banco").
 */
import type { Account, Clip, ClipadorData, DailyViews, Platform, RankingEntry, Warning } from "./types";

/** gerador pseudo-aleatório com semente, pra a demo ser igual em toda renderização */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function fakeId(r: () => number, len: number) {
  let s = "";
  for (let i = 0; i < len; i++) s += ID_CHARS[Math.floor(r() * ID_CHARS.length)];
  return s;
}

const TITLES = [
  "Corte da live de revisão — macete de porcentagem",
  "Resultado de aluno: aprovado na 1ª tentativa",
  "Professor explicando regra de três em 30s",
  "Bastidores do aulão Fênix",
  "Dica de redação que ninguém te conta",
  "Momento engraçado da live de sexta",
  "Depoimento: como estudei com a Fênix",
  "Erro que todo mundo comete em função",
  "Pergunta do aluno ao vivo",
  "Resumo de 1 minuto: geometria",
];

export function buildDemoData(now: Date = new Date()): ClipadorData {
  const r = rng(20261013);
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const accounts: Account[] = [
    { id: "a1", platform: "tiktok", handle: "cortesdofenix", connection: "oauth", addedAt: "2026-08-02T14:00:00" },
    { id: "a2", platform: "tiktok", handle: "fenix.clips2", connection: "oauth", addedAt: "2026-08-10T10:00:00" },
    { id: "a3", platform: "instagram", handle: "cortesdofenix", connection: "oauth", addedAt: "2026-08-02T14:05:00" },
    { id: "a4", platform: "youtube", handle: "cortesdofenix", connection: "oauth", addedAt: "2026-08-03T09:00:00" },
    { id: "a5", platform: "tiktok", handle: "estudacomfenix", connection: "manual", addedAt: new Date(now.getTime() - 3_600_000).toISOString() },
  ];

  // ---- clipes do mês ----
  const clips: Clip[] = [];
  const elapsedMs = Math.max(now.getTime() - monthStart.getTime(), 3_600_000);
  const count = 46;
  for (let i = 0; i < count; i++) {
    const roll = r();
    const platform: Platform = roll < 0.66 ? "tiktok" : roll < 0.84 ? "instagram" : "youtube";
    const submitted = new Date(monthStart.getTime() + elapsedMs * (i / count) + r() * 3_000_000);
    if (submitted > now) submitted.setTime(now.getTime() - (count - i) * 60_000);
    const ageDays = (now.getTime() - submitted.getTime()) / 86_400_000;
    // distribuição de cauda longa: a maioria com pouco, alguns viralizam
    const base = Math.pow(r(), 3.2) * 14000 + r() * 400;
    const views = Math.round(base * Math.min(1, 0.25 + ageDays / 4));
    const fresh = now.getTime() - submitted.getTime() < 2 * 3_600_000;
    const removed = !fresh && r() < 0.05;
    const tiktokAcc = r() < 0.75 ? "cortesdofenix" : "fenix.clips2";
    const handle = platform === "tiktok" ? tiktokAcc : "cortesdofenix";
    const id = platform === "youtube" ? fakeId(r, 11) : platform === "instagram" ? fakeId(r, 11) : String(7_400_000_000_000_000_000 + Math.floor(r() * 1e15));
    const url =
      platform === "tiktok"
        ? `https://www.tiktok.com/@${handle}/video/${id}`
        : platform === "instagram"
          ? `https://www.instagram.com/reel/${id}/`
          : `https://www.youtube.com/shorts/${id}`;
    clips.push({
      id: `c${i}`,
      platform,
      url,
      handle,
      title: r() < 0.7 ? TITLES[Math.floor(r() * TITLES.length)] : undefined,
      submittedAt: submitted.toISOString(),
      views: fresh ? 0 : views,
      viewsToday: fresh ? 0 : Math.round(views * (ageDays < 2 ? 0.45 : 0.04 * r())),
      status: fresh ? "verificando" : removed ? "removido" : "no_ar",
      removalReason: removed ? "Fênix não é o assunto principal do clipe" : undefined,
      lastSyncAt: fresh ? undefined : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12).toISOString(),
    });
  }
  clips.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  const myViews = clips.filter((c) => c.status === "no_ar").reduce((s, c) => s + c.views, 0);

  // ---- ranking (nomes fictícios) ----
  const others: Array<[string, number]> = [
    ["Rafael Moura", 4.4],
    ["Beatriz Lins", 2.55],
    ["Caio Nogueira", 1.27],
    ["Larissa Prado", 0.74],
    ["Thiago Bezerra", 0.72],
    ["Yasmin Freitas", 0.58],
    ["Pedro Henrique Sá", 0.51],
    ["Júlia Rocha", 0.37],
    ["André Cavalcanti", 0.22],
    ["Marina Teles", 0.11],
  ];
  const ranking: RankingEntry[] = others.map(([name, mult], i) => ({
    clipperId: `u${i}`,
    name,
    views: Math.round(myViews * mult + r() * 900),
    clips: Math.round(20 + r() * 90),
  }));
  ranking.push({ clipperId: "me", name: "Lucas Andrade", views: myViews, clips: clips.filter((c) => c.status !== "removido").length });
  ranking.sort((a, b) => b.views - a.views);

  // ---- views por dia ----
  const dailyViews: DailyViews[] = [];
  const today = now.getDate();
  let carry = 0;
  for (let d = 1; d <= today; d++) {
    const day = new Date(now.getFullYear(), now.getMonth(), d);
    const v = d === today ? Math.round(myViews * 0.03) : Math.round((myViews / today) * (0.55 + r() * 0.9));
    carry += v;
    dailyViews.push({ date: `${month}-${String(d).padStart(2, "0")}`, views: v });
    void day;
  }
  // ajusta o total pra bater com as views do mês
  if (carry > 0) {
    const k = myViews / carry;
    for (const dv of dailyViews) dv.views = Math.round(dv.views * k);
  }

  const warnings: Warning[] = [
    {
      id: "w1",
      kind: "remocoes",
      title: "3 clipes removidos pela equipe",
      detail: "Seus clipes removidos chegaram a 9 — a cada 3 removidos, 1 advertência automática.",
      createdAt: new Date(now.getTime() - 26 * 86_400_000).toISOString(),
    },
    {
      id: "w2",
      kind: "link_removido",
      title: "Recolocou link removido",
      detail: "Tentou reenviar um clipe que já tinha sido removido pela equipe.",
      createdAt: new Date(now.getTime() - 41 * 86_400_000).toISOString(),
      annulled: { reason: "Erro na leitura do link — anulada pela equipe." },
    },
    {
      id: "w3",
      kind: "remocoes",
      title: "3 clipes removidos pela equipe",
      detail: "Seus clipes removidos chegaram a 6 — a cada 3 removidos, 1 advertência automática.",
      createdAt: new Date(now.getTime() - 58 * 86_400_000).toISOString(),
      annulled: { reason: "Clipes revisados e reaprovados." },
    },
  ];

  const lastCheck = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  if (lastCheck > now) lastCheck.setDate(lastCheck.getDate() - 1);

  return {
    me: { id: "me", name: "Lucas Andrade", email: "lucas.andrade@exemplo.com", phone: "(81) 99999-0000" },
    month,
    clips,
    accounts,
    warnings,
    ranking,
    dailyViews,
    pix: { type: "email", value: "lucas.andrade@exemplo.com" },
    totals: {
      clipsAllTime: 412 + clips.length,
      viewsAllTime: 731_220 + myViews,
      removedAllTime: 10,
      paidOut: 2500,
      pending: 0,
    },
    lastCheckAt: lastCheck.toISOString(),
  };
}
