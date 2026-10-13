/**
 * DADOS DE DEMONSTRAÇÃO do painel da equipe. Tudo fictício.
 */
import type { Account, Clip, PixKey, Platform, Warning } from "./types";
import { PRIZES } from "./rules";

export interface AdminClipper {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedAt: string;
  accounts: Account[];
  pix?: PixKey;
  removedAllTime: number;
  suspendedUntil?: string; // YYYY-MM-DD
}

export interface AdminClip extends Clip {
  clipperId: string;
}

export interface AdminWarning extends Warning {
  clipperId: string;
}

export interface Payout {
  clipperId: string;
  name: string;
  position: number;
  views: number;
  amount: number;
  pix?: PixKey;
  paidAt?: string;
}

export interface AdminData {
  me: { name: string };
  month: string; // YYYY-MM
  prevMonth: string;
  clippers: AdminClipper[];
  clips: AdminClip[];
  warnings: AdminWarning[];
  prevPayouts: Payout[];
  lastCheckAt: string;
}

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

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const id11 = (r: () => number) => Array.from({ length: 11 }, () => CHARS[Math.floor(r() * CHARS.length)]).join("");

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
  "Meme de estudo genérico",
  "Rotina de estudos aesthetic",
];

const PEOPLE: Array<[string, number]> = [
  ["Rafael Moura", 9],
  ["Beatriz Lins", 6],
  ["Caio Nogueira", 4.2],
  ["Lucas Andrade", 3.5],
  ["Larissa Prado", 2.6],
  ["Thiago Bezerra", 2.5],
  ["Yasmin Freitas", 2.1],
  ["Pedro Henrique Sá", 1.8],
  ["Júlia Rocha", 1.3],
  ["André Cavalcanti", 0.8],
  ["Marina Teles", 0.4],
  ["Diego Farias", 0.25],
];

const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const slug = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]+/g, "");

export function buildAdminDemoData(now: Date = new Date()): AdminData {
  const r = rng(77031);
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const elapsed = Math.max(now.getTime() - monthStart.getTime(), 3_600_000);
  const noon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  if (noon > now) noon.setDate(noon.getDate() - 1);

  const clippers: AdminClipper[] = [];
  const clips: AdminClip[] = [];
  const warnings: AdminWarning[] = [];

  PEOPLE.forEach(([name, weight], i) => {
    const id = `u${i}`;
    const s = slug(name);
    const accounts: Account[] = [
      { id: `${id}a1`, platform: "tiktok", handle: `${s}.cortes`, connection: "oauth", addedAt: "2026-07-01T10:00:00" },
      { id: `${id}a2`, platform: "instagram", handle: `${s}`, connection: r() < 0.8 ? "oauth" : "manual", addedAt: "2026-07-01T10:00:00" },
    ];
    if (r() < 0.5) accounts.push({ id: `${id}a3`, platform: "youtube", handle: `${s}fenix`, connection: "oauth", addedAt: "2026-07-03T10:00:00" });

    const removedBefore = Math.floor(r() * 7);
    clippers.push({
      id,
      name,
      email: `${s}@exemplo.com`,
      phone: `(81) 9${Math.floor(1000 + r() * 8999)}-${Math.floor(1000 + r() * 8999)}`,
      joinedAt: new Date(2026, 5 + Math.floor(r() * 3), 1 + Math.floor(r() * 27)).toISOString(),
      accounts,
      pix: i === 10 ? undefined : { type: "email", value: `${s}@exemplo.com` },
      removedAllTime: removedBefore,
      suspendedUntil: i === 11 ? isoDate(new Date(now.getFullYear(), now.getMonth() + 2, 1)) : undefined,
    });

    if (i === 11) return; // suspenso: sem clipes no mês
    const n = Math.round(6 + weight * 3 + r() * 6);
    for (let k = 0; k < n; k++) {
      const roll = r();
      const platform: Platform = roll < 0.65 ? "tiktok" : roll < 0.85 ? "instagram" : accounts.some((a) => a.platform === "youtube") ? "youtube" : "tiktok";
      const acc = accounts.find((a) => a.platform === platform)!;
      const submitted = new Date(monthStart.getTime() + elapsed * r());
      const age = (now.getTime() - submitted.getTime()) / 86_400_000;
      const fresh = age < 0.08;
      const views = fresh ? 0 : Math.round((Math.pow(r(), 2.6) * 9000 + 300) * weight * Math.min(1, 0.3 + age / 4));
      const removed = !fresh && r() < 0.06;
      const vid = platform === "tiktok" ? String(7_400_000_000_000_000_000 + Math.floor(r() * 1e15)) : id11(r);
      clips.push({
        id: `${id}c${k}`,
        clipperId: id,
        platform,
        handle: acc.handle,
        url:
          platform === "tiktok"
            ? `https://www.tiktok.com/@${acc.handle}/video/${vid}`
            : platform === "instagram"
              ? `https://www.instagram.com/reel/${vid}/`
              : `https://www.youtube.com/shorts/${vid}`,
        title: r() < 0.75 ? TITLES[Math.floor(r() * TITLES.length)] : undefined,
        submittedAt: submitted.toISOString(),
        views,
        viewsToday: fresh ? 0 : Math.round(views * (age < 2 ? 0.4 : 0.03 * r())),
        status: fresh ? "verificando" : removed ? "removido" : "no_ar",
        removalReason: removed ? "Fênix não é o assunto principal do clipe" : undefined,
        lastSyncAt: fresh ? undefined : noon.toISOString(),
      });
    }

    const wn = Math.floor(r() * 3);
    for (let w = 0; w < wn; w++) {
      const annulled = r() < 0.35;
      warnings.push({
        id: `${id}w${w}`,
        clipperId: id,
        kind: w === 1 && r() < 0.5 ? "link_removido" : "remocoes",
        title: w === 1 ? "Recolocou link removido" : "3 clipes removidos pela equipe",
        detail: w === 1 ? "Tentou reenviar um clipe que já tinha sido removido pela equipe." : "A cada 3 removidos, 1 advertência automática.",
        createdAt: new Date(now.getTime() - (10 + r() * 120) * 86_400_000).toISOString(),
        annulled: annulled ? { reason: "Revisado pela equipe." } : undefined,
      });
    }
  });
  clips.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  // total de removidos inclui os removidos deste mês
  for (const c of clippers) c.removedAllTime += clips.filter((k) => k.clipperId === c.id && k.status === "removido").length;

  // pagamentos do mês passado (fechado)
  const prevViews = PEOPLE.slice(0, 11).map(([name, w], i) => ({ id: `u${i}`, name, views: Math.round(w * 52_000 + r() * 20_000) }));
  prevViews.sort((a, b) => b.views - a.views);
  const prevPayouts: Payout[] = prevViews.slice(0, PRIZES.length).map((p, i) => ({
    clipperId: p.id,
    name: p.name,
    position: i + 1,
    views: p.views,
    amount: PRIZES[i],
    pix: clippers.find((c) => c.id === p.id)?.pix,
    paidAt: i < 3 ? new Date(now.getFullYear(), now.getMonth(), 3, 10, 15).toISOString() : undefined,
  }));

  return { me: { name: "Equipe Fênix" }, month, prevMonth, clippers, clips, warnings, prevPayouts, lastCheckAt: noon.toISOString() };
}
