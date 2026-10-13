"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import type { AdminData } from "@/lib/clipador/admin-demo-data";
import type { WarningKind } from "@/lib/clipador/types";
import { activeWarnings, daysLeftInMonth, PRIZES, REMOVALS_PER_WARNING, SUSPENSION_MONTHS, WARNINGS_LIMIT } from "@/lib/clipador/rules";
import { fmtBRLShort, fmtInt, fmtRelativeDay, monthName, plural } from "@/lib/clipador/format";
import { IconEye, IconFilm, IconScissors, IconShield, IconTrophy, IconUsers, IconWallet } from "@/components/clipador/icons";
import { Topbar } from "@/components/clipador/Topbar";
import { AdminClips } from "./AdminClips";
import { AdminClippers } from "./AdminClippers";
import { AdminRanking } from "./AdminRanking";
import { AdminWarnings } from "./AdminWarnings";

/* ------------------------------------------------------------------ */
/* Estado (modo demo: tudo fica só na tela)                            */
/* ------------------------------------------------------------------ */

export type AdminAction =
  | { type: "clip/remove"; id: string; reason: string }
  | { type: "clip/restore"; id: string }
  | { type: "warning/add"; clipperId: string; kind: WarningKind; title: string; detail: string }
  | { type: "warning/annul"; id: string; reason: string }
  | { type: "clipper/suspend"; id: string; until: string }
  | { type: "clipper/unsuspend"; id: string }
  | { type: "payout/pay"; clipperId: string };

function reducer(s: AdminData, a: AdminAction): AdminData {
  const now = new Date().toISOString();
  switch (a.type) {
    case "clip/remove": {
      const clip = s.clips.find((c) => c.id === a.id);
      if (!clip || clip.status === "removido") return s;
      const clipper = s.clippers.find((c) => c.id === clip.clipperId)!;
      const removed = clipper.removedAllTime + 1;
      const warnings = [...s.warnings];
      // regra: a cada 3 removidos, 1 advertência automática
      if (removed % REMOVALS_PER_WARNING === 0) {
        warnings.unshift({
          id: `w${Date.now()}`,
          clipperId: clipper.id,
          kind: "remocoes",
          title: "3 clipes removidos pela equipe",
          detail: `Clipes removidos chegaram a ${removed}. A cada ${REMOVALS_PER_WARNING} removidos, 1 advertência automática.`,
          createdAt: now,
        });
      }
      return {
        ...s,
        warnings,
        clips: s.clips.map((c) => (c.id === a.id ? { ...c, status: "removido", removalReason: a.reason } : c)),
        clippers: s.clippers.map((c) => (c.id === clipper.id ? { ...c, removedAllTime: removed } : c)),
      };
    }
    case "clip/restore": {
      const clip = s.clips.find((c) => c.id === a.id);
      if (!clip) return s;
      return {
        ...s,
        clips: s.clips.map((c) => (c.id === a.id ? { ...c, status: "no_ar", removalReason: undefined } : c)),
        clippers: s.clippers.map((c) => (c.id === clip.clipperId ? { ...c, removedAllTime: Math.max(0, c.removedAllTime - 1) } : c)),
      };
    }
    case "warning/add":
      return {
        ...s,
        warnings: [{ id: `w${Date.now()}`, clipperId: a.clipperId, kind: a.kind, title: a.title, detail: a.detail, createdAt: now }, ...s.warnings],
      };
    case "warning/annul":
      return { ...s, warnings: s.warnings.map((w) => (w.id === a.id ? { ...w, annulled: { reason: a.reason } } : w)) };
    case "clipper/suspend":
      return { ...s, clippers: s.clippers.map((c) => (c.id === a.id ? { ...c, suspendedUntil: a.until } : c)) };
    case "clipper/unsuspend":
      return { ...s, clippers: s.clippers.map((c) => (c.id === a.id ? { ...c, suspendedUntil: undefined } : c)) };
    case "payout/pay":
      return { ...s, prevPayouts: s.prevPayouts.map((p) => (p.clipperId === a.clipperId ? { ...p, paidAt: now } : p)) };
  }
}

export interface ClipperStats {
  views: number;
  clips: number;
  position: number;
  activeWarnings: number;
}

type Tab = "clipes" | "clipadores" | "ranking" | "advertencias";

export function AdminApp({ initialData }: { initialData: AdminData }) {
  const [data, dispatchRaw] = useReducer(reducer, initialData);
  const [tab, setTab] = useState<Tab>("clipes");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  function dispatch(a: AdminAction, message?: string) {
    // avisa quando a remoção gera advertência automática
    if (a.type === "clip/remove") {
      const clip = data.clips.find((c) => c.id === a.id);
      const clipper = data.clippers.find((c) => c.id === clip?.clipperId);
      if (clipper && (clipper.removedAllTime + 1) % REMOVALS_PER_WARNING === 0) {
        message = `Clipe removido. ${clipper.name} recebeu 1 advertência automática.`;
      }
    }
    dispatchRaw(a);
    if (message) setToast(message);
  }

  const derived = useMemo(() => {
    const monthClips = data.clips.filter((c) => c.submittedAt.startsWith(data.month));
    const valid = monthClips.filter((c) => c.status !== "removido");
    const views = valid.reduce((s, c) => s + c.views, 0);
    const viewsToday = valid.reduce((s, c) => s + c.viewsToday, 0);
    const today = new Date().toDateString();
    const clipsToday = monthClips.filter((c) => new Date(c.submittedAt).toDateString() === today).length;

    const byClipper = new Map<string, { views: number; clips: number }>();
    for (const c of valid) {
      const cur = byClipper.get(c.clipperId) ?? { views: 0, clips: 0 };
      byClipper.set(c.clipperId, { views: cur.views + c.views, clips: cur.clips + 1 });
    }
    const ranking = data.clippers
      .filter((c) => !c.suspendedUntil)
      .map((c) => ({ clipperId: c.id, name: c.name, ...(byClipper.get(c.id) ?? { views: 0, clips: 0 }) }))
      .filter((e) => e.clips > 0)
      .sort((a, b) => b.views - a.views);

    const stats = new Map<string, ClipperStats>();
    for (const c of data.clippers) {
      const pos = ranking.findIndex((e) => e.clipperId === c.id) + 1;
      stats.set(c.id, {
        ...(byClipper.get(c.id) ?? { views: 0, clips: 0 }),
        position: pos,
        activeWarnings: activeWarnings(data.warnings.filter((w) => w.clipperId === c.id)).length,
      });
    }
    return { monthClips, valid, views, viewsToday, clipsToday, ranking, stats };
  }, [data]);

  const active = data.clippers.filter((c) => !c.suspendedUntil).length;
  const unpaid = data.prevPayouts.filter((p) => !p.paidAt);
  const unpaidTotal = unpaid.reduce((s, p) => s + p.amount, 0);
  const atRisk = data.clippers.filter((c) => (derived.stats.get(c.id)?.activeWarnings ?? 0) >= WARNINGS_LIMIT - 1 && !c.suspendedUntil).length;
  const pendingReview = derived.monthClips.filter((c) => c.status === "verificando").length;
  const mName = monthName(data.month);

  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode; badge?: React.ReactNode }> = [
    { id: "clipes", label: "Clipes", icon: <IconScissors />, badge: <span className="count">{fmtInt(derived.monthClips.length)}</span> },
    { id: "clipadores", label: "Clipadores", icon: <IconUsers />, badge: <span className="count">{fmtInt(data.clippers.length)}</span> },
    { id: "ranking", label: "Ranking e prêmios", icon: <IconTrophy />, badge: unpaid.length ? <span className="dot dot-amber" aria-label={`${unpaid.length} prêmios a pagar`} /> : undefined },
    { id: "advertencias", label: "Advertências", icon: <IconShield />, badge: atRisk ? <span className="dot dot-red" aria-label={`${atRisk} clipadores perto da suspensão`} /> : undefined },
  ];

  return (
    <div className="app">
      <Topbar name={data.me.name} area="equipe" canSwitch demo />

      <main className="container">
        <section className="stats" aria-label={`Resumo de ${mName}`}>
          <Stat icon={<IconUsers />} tone="accent" label="Clipadores ativos" value={fmtInt(active)} foot={`${plural(data.clippers.length - active, "suspenso", "suspensos")}`} />
          <Stat
            icon={<IconFilm />}
            tone="accent"
            label={`Clipes em ${mName}`}
            value={fmtInt(derived.valid.length)}
            foot={
              <>
                +{fmtInt(derived.clipsToday)} hoje{pendingReview ? ` · ${pendingReview} lendo views` : ""}
              </>
            }
          />
          <Stat
            icon={<IconEye />}
            tone="accent"
            label={`Views em ${mName}`}
            value={fmtInt(derived.views)}
            foot={<span className="up">+{fmtInt(derived.viewsToday)} desde ontem</span>}
          />
          <Stat
            icon={<IconWallet />}
            tone="green"
            label="Prêmios a pagar"
            value={fmtBRLShort(unpaidTotal)}
            foot={unpaid.length ? `${plural(unpaid.length, "pagamento", "pagamentos")} de ${monthName(data.prevMonth)}` : `Tudo pago de ${monthName(data.prevMonth)}`}
          />
        </section>

        <div className="checked-line">
          <span className="pulse" aria-hidden="true" />
          Views conferidas {fmtRelativeDay(data.lastCheckAt)} · o mês fecha em {plural(daysLeftInMonth(data.month), "dia", "dias")} · prêmios do mês:{" "}
          {fmtBRLShort(PRIZES.reduce((a, b) => a + b, 0))}
        </div>

        <div className="tabs-row">
          <div className="tabs" role="tablist" aria-label="Seções do painel">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`}
                className={`tab ${tab === t.id ? "is-active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.icon}
                <span>{t.label}</span>
                {t.badge}
              </button>
            ))}
          </div>
        </div>

        <section className="panel" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === "clipes" && <AdminClips clips={derived.monthClips} clippers={data.clippers} onAction={dispatch} />}
          {tab === "clipadores" && (
            <AdminClippers clippers={data.clippers} stats={derived.stats} clips={derived.monthClips} warnings={data.warnings} onAction={dispatch} suspensionMonths={SUSPENSION_MONTHS} />
          )}
          {tab === "ranking" && <AdminRanking month={data.month} prevMonth={data.prevMonth} ranking={derived.ranking} payouts={data.prevPayouts} onAction={dispatch} onToast={setToast} />}
          {tab === "advertencias" && <AdminWarnings warnings={data.warnings} clippers={data.clippers} onAction={dispatch} />}
        </section>
      </main>

      <div className="toast-region" role="status" aria-live="polite">
        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  );
}

function Stat({ icon, label, value, foot, tone }: { icon: React.ReactNode; label: string; value: string; foot: React.ReactNode; tone: "accent" | "green" }) {
  return (
    <div className="stat">
      <div className={`stat-icon tone-${tone}`}>{icon}</div>
      <div className="stat-body">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-foot">{foot}</div>
      </div>
    </div>
  );
}
