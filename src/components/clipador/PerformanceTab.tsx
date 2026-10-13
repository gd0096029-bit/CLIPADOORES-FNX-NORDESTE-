"use client";

import { useState } from "react";
import type { Clip, ClipadorData, MonthResult } from "@/lib/clipador/types";
import { prizeForPosition } from "@/lib/clipador/rules";
import { fmtBRLShort, fmtInt, monthLabel, plural } from "@/lib/clipador/format";
import { IconCalendar, IconCheck, IconCopy, IconEye, IconFilm, IconLock, IconMedal, IconScissors, IconShield, IconTrophy, IconWallet } from "./icons";

interface Props {
  data: ClipadorData;
  /** clipes válidos do mês (não removidos) */
  monthClips: Clip[];
  monthViews: number;
  position: number;
  activeWarnings: number;
  onToast: (m: string) => void;
}

/** Aba "Meu desempenho": cupom, histórico dos meses e conquistas. */
export function PerformanceTab({ data, monthClips, monthViews, position, activeWarnings, onToast }: Props) {
  const history = data.history ?? [];
  const current: MonthResult = { month: data.month, position, views: monthViews, clips: monthClips.length, prize: prizeForPosition(position), paid: false };
  const badges = achievements({ clips: data.clips, monthClips, monthViews, position, history, activeWarnings, clipsAllTime: data.totals.clipsAllTime });
  const unlocked = badges.filter((b) => b.done).length;

  return (
    <div className="perf">
      <div className="panel-head">
        <div className="panel-title">
          <span className="panel-icon">
            <IconMedal />
          </span>
          <h2>Meu desempenho</h2>
        </div>
      </div>

      {data.coupon && <CouponCard coupon={data.coupon} onToast={onToast} />}

      {/* ---------- histórico ---------- */}
      <section className="perf-section">
        <h3 className="perf-h">
          <IconCalendar size={18} /> Histórico dos meses
        </h3>
        <ol className="history">
          {[current, ...history].map((h, i) => (
            <li key={h.month} className={`history-row ${i === 0 ? "is-current" : ""}`}>
              <span className="history-month">
                {capitalize(monthLabel(h.month))}
                {i === 0 && <span className="tag tag-andamento">em andamento</span>}
              </span>
              <span className={`rank-pos pos-${h.position <= 3 ? h.position : "n"}`}>{h.position}º</span>
              <span className="history-stat">
                <IconEye size={14} /> {fmtInt(h.views)}
              </span>
              <span className="history-stat">
                <IconScissors size={14} /> {plural(h.clips, "clipe", "clipes")}
              </span>
              <span className={`history-prize ${h.prize ? "" : "is-empty"}`}>
                {h.prize ? fmtBRLShort(h.prize) : "Sem prêmio"}
                {h.prize > 0 && <span className="clip-meta">{i === 0 ? "se fechar hoje" : h.paid ? "pago" : "a receber"}</span>}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- conquistas ---------- */}
      <section className="perf-section">
        <h3 className="perf-h">
          <IconTrophy size={18} /> Conquistas <span className="muted-inline">· {unlocked} de {badges.length}</span>
        </h3>
        <ul className="badges">
          {badges.map((b) => (
            <li key={b.id} className={`badge-card ${b.done ? "is-done" : ""}`}>
              <span className="badge-icon" aria-hidden="true">
                {b.done ? b.icon : <IconLock size={20} />}
              </span>
              <span className="badge-title">{b.title}</span>
              <span className="badge-desc">{b.desc}</span>
              {!b.done && b.progress !== undefined && (
                <span className="badge-bar" aria-label={`${Math.round(b.progress * 100)}%`}>
                  <span style={{ width: `${Math.max(4, Math.round(b.progress * 100))}%` }} />
                </span>
              )}
              {b.done && (
                <span className="badge-ok">
                  <IconCheck size={13} /> Conquistada
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function CouponCard({ coupon, onToast }: { coupon: NonNullable<ClipadorData["coupon"]>; onToast: (m: string) => void }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      onToast("Cupom copiado.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onToast("Não deu pra copiar. Selecione o cupom e copie.");
    }
  }
  return (
    <section className="coupon">
      <div className="coupon-main">
        <span className="eyebrow">Seu cupom</span>
        <div className="coupon-code-row">
          <span className="coupon-big">{coupon.code}</span>
          <button type="button" className="btn btn-outline btn-sm" onClick={copy}>
            {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
        <p className="muted">
          {coupon.discount} pra quem comprar o curso. Coloque na tela, na descrição e no comentário fixado de todo clipe.
        </p>
      </div>
      <div className="coupon-stats">
        <div>
          <span>Vendas este mês</span>
          <b>{fmtInt(coupon.salesMonth)}</b>
        </div>
        <div>
          <span>Vendas no total</span>
          <b>{fmtInt(coupon.salesTotal)}</b>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Conquistas                                                          */
/* ------------------------------------------------------------------ */

interface Badge {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  done: boolean;
  progress?: number;
}

function achievements(x: {
  clips: Clip[];
  monthClips: Clip[];
  monthViews: number;
  position: number;
  history: MonthResult[];
  activeWarnings: number;
  clipsAllTime: number;
}): Badge[] {
  const best = Math.max(0, ...x.clips.filter((c) => c.status !== "removido").map((c) => c.views));
  const streak = postingStreak(x.clips);
  const everPodium = x.position <= 3 || x.history.some((h) => h.position <= 3);
  const everPrize = x.history.some((h) => h.prize > 0);
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  return [
    { id: "primeiro", title: "Primeiro clipe", desc: "Enviou o primeiro clipe.", icon: <IconFilm size={20} />, done: x.clipsAllTime >= 1, progress: clamp(x.clipsAllTime) },
    { id: "10k", title: "Clipe de 10 mil", desc: "Um clipe passou de 10 mil views.", icon: <IconEye size={20} />, done: best >= 10_000, progress: clamp(best / 10_000) },
    { id: "100k", title: "Clipe de 100 mil", desc: "Um clipe passou de 100 mil views.", icon: <IconEye size={20} />, done: best >= 100_000, progress: clamp(best / 100_000) },
    { id: "mes100k", title: "100 mil no mês", desc: "Somou 100 mil views num mês.", icon: <IconTrophy size={20} />, done: x.monthViews >= 100_000, progress: clamp(x.monthViews / 100_000) },
    { id: "streak", title: "7 dias seguidos", desc: `Postou 7 dias seguidos. Sequência atual: ${plural(streak, "dia", "dias")}.`, icon: <IconCalendar size={20} />, done: streak >= 7, progress: clamp(streak / 7) },
    { id: "50", title: "50 clipes no mês", desc: "Enviou 50 clipes válidos num mês.", icon: <IconScissors size={20} />, done: x.monthClips.length >= 50, progress: clamp(x.monthClips.length / 50) },
    { id: "premiado", title: "Premiado", desc: "Ficou entre os 7 premiados de um mês.", icon: <IconWallet size={20} />, done: everPrize },
    { id: "podio", title: "Pódio", desc: "Ficou no top 3 de um mês.", icon: <IconMedal size={20} />, done: everPodium },
    { id: "limpa", title: "Ficha limpa", desc: "Nenhuma advertência ativa.", icon: <IconShield size={20} />, done: x.activeWarnings === 0 },
  ];
}

/** Quantos dias seguidos (até hoje ou ontem) o clipador enviou pelo menos 1 clipe. */
function postingStreak(clips: Clip[]): number {
  const days = new Set(clips.map((c) => new Date(c.submittedAt).toDateString()));
  const d = new Date();
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(d.toDateString())) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

const capitalize = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
