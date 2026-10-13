"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { Account, Clip, ClipadorData, Notice, PixKey, Platform } from "@/lib/clipador/types";
import { activeWarnings, daysLeftInMonth, prizeForPosition, PRIZES } from "@/lib/clipador/rules";
import { fmtBRL, fmtBRLShort, fmtInt, fmtRelativeDay, monthName, plural } from "@/lib/clipador/format";
import { IconAt, IconBook, IconEye, IconFilm, IconMedal, IconPlus, IconScissors, IconShield, IconTrophy, IconUsers, IconWallet } from "./icons";
import { CommunityTab } from "./CommunityTab";
import { ManualTab } from "./ManualTab";
import { NotificationsBell } from "./NotificationsBell";
import { Backdrop } from "./Backdrop";
import { Topbar } from "./Topbar";
import { AccountModal } from "./AccountModal";
import { RankingTab } from "./RankingTab";
import { ClipsTab } from "./ClipsTab";
import { AccountsTab } from "./AccountsTab";
import { WarningsTab } from "./WarningsTab";
import { SendClipModal } from "./SendClipModal";
import { RulesModal } from "./RulesModal";

/* ------------------------------------------------------------------ */
/* Estado                                                              */
/* ------------------------------------------------------------------ */

export type ClipadorAction =
  | { type: "clip/add"; clip: Clip }
  | { type: "clip/delete"; id: string }
  | { type: "account/add"; account: Account }
  | { type: "account/remove"; id: string }
  | { type: "account/connect"; platform: Platform; handle: string }
  | { type: "pix/save"; pix: PixKey };

function reducer(state: ClipadorData, action: ClipadorAction): ClipadorData {
  switch (action.type) {
    case "clip/add":
      return {
        ...state,
        clips: [action.clip, ...state.clips],
        totals: { ...state.totals, clipsAllTime: state.totals.clipsAllTime + 1 },
      };
    case "clip/delete":
      return { ...state, clips: state.clips.filter((c) => c.id !== action.id) };
    case "account/add":
      return { ...state, accounts: [...state.accounts, action.account] };
    case "account/remove":
      return { ...state, accounts: state.accounts.filter((a) => a.id !== action.id) };
    case "account/connect":
      return {
        ...state,
        accounts: state.accounts.map((a) =>
          a.platform === action.platform && a.handle === action.handle ? { ...a, connection: "oauth" } : a,
        ),
      };
    case "pix/save":
      return { ...state, pix: action.pix };
  }
}

type Tab = "ranking" | "clipadores" | "clipes" | "contas" | "advertencias" | "manual";

export interface ClipadorAppProps {
  initialData: ClipadorData;
  /** "demo": tudo acontece só na tela. "live": cada ação também é enviada pro servidor via onAction. */
  mode?: "demo" | "live";
  /** Chamado a cada ação do clipador (enviar clipe, cadastrar @, salvar Pix...). Use pra gravar no Supabase. */
  onAction?: (action: ClipadorAction) => Promise<void>;
}

/* ------------------------------------------------------------------ */
/* Componente principal                                                */
/* ------------------------------------------------------------------ */

export function ClipadorApp({ initialData, mode = "demo", onAction }: ClipadorAppProps) {
  const [data, rawDispatch] = useReducer(reducer, initialData);
  const [tab, setTab] = useState<Tab>("ranking");
  const [sendOpen, setSendOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState<false | "dados" | "pix">(false);
  const [selectedClipper, setSelectedClipper] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>(() => {
    const list = [...(initialData.notices ?? [])];
    const left = daysLeftInMonth(initialData.month);
    if (left <= 3) {
      list.push({
        id: "fechamento",
        kind: "fechamento",
        title: left <= 1 ? "O mês fecha hoje" : `Faltam ${left} dias pro fechamento`,
        body: "Envie seus últimos clipes do mês antes do ranking congelar.",
        createdAt: new Date().toISOString(),
        read: false,
        tab: "ranking",
      });
    }
    return list;
  });
  const pushNotice = useCallback((n: Omit<Notice, "id" | "createdAt" | "read">) => {
    setNotices((list) => [{ ...n, id: `n${Date.now()}${Math.random()}`, createdAt: new Date().toISOString(), read: false }, ...list]);
  }, []);
  const [toast, setToast] = useState<string | null>(null);

  const dispatch = useCallback(
    (action: ClipadorAction) => {
      rawDispatch(action);
      onAction?.(action).catch(() => setToast("Não foi possível salvar. Tente de novo em instantes."));
    },
    [onAction],
  );

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---------- números derivados ---------- */
  const derived = useMemo(() => {
    const monthClips = data.clips.filter((c) => c.submittedAt.startsWith(data.month));
    const counting = monthClips.filter((c) => c.status !== "removido");
    const monthViews = counting.reduce((s, c) => s + c.views, 0);
    const viewsToday = counting.reduce((s, c) => s + c.viewsToday, 0);

    // ranking sempre com as views atuais do clipador logado
    const ranking = data.ranking
      .map((e) => (e.clipperId === data.me.id ? { ...e, views: monthViews, clips: counting.length } : e))
      .sort((a, b) => b.views - a.views);
    const myIndex = ranking.findIndex((e) => e.clipperId === data.me.id);
    const position = myIndex + 1;
    const prize = prizeForPosition(position);

    // quanto falta pra subir
    let nextGoal: { views: number; position: number; prize: number } | null = null;
    if (myIndex > 0) {
      const target = Math.min(myIndex, PRIZES.length) - 1; // se estiver fora do top 7, a meta é o 7º
      const above = ranking[target];
      nextGoal = { views: above.views - monthViews + 1, position: target + 1, prize: prizeForPosition(target + 1) };
    }

    // clipes de todo mundo, na ordem do ranking (os meus sempre atualizados)
    const myPublic = counting.map(({ id, platform, url, handle, title, submittedAt, views }) => ({ id, platform, url, handle, title, submittedAt, views }));
    const byId = new Map(data.community.map((c) => [c.clipperId, c]));
    const community = ranking.map((e) =>
      e.clipperId === data.me.id ? { clipperId: e.clipperId, name: e.name, clips: myPublic } : (byId.get(e.clipperId) ?? { clipperId: e.clipperId, name: e.name, clips: [] }),
    );

    return { monthClips, counting, monthViews, viewsToday, ranking, position, prize, nextGoal, community };
  }, [data]);

  // avisa quando a posição no ranking muda
  const lastPos = useRef(derived.position);
  useEffect(() => {
    const prev = lastPos.current;
    const cur = derived.position;
    if (cur !== prev) {
      lastPos.current = cur;
      pushNotice(
        cur < prev
          ? { kind: "subiu", title: `Você subiu pro ${cur}º lugar`, body: derived.prize ? `Se o mês fechasse agora, seriam ${fmtBRLShort(derived.prize)}.` : undefined, tab: "ranking" }
          : { kind: "caiu", title: `Você caiu pro ${cur}º lugar`, body: "Mande mais clipes pra recuperar a posição.", tab: "ranking" },
      );
    }
  }, [derived.position, derived.prize, pushNotice]);

  const warningsActive = activeWarnings(data.warnings).length;
  const daysLeft = daysLeftInMonth(data.month);
  const pendingAccounts = data.accounts.filter((a) => a.connection === "manual").length;
  const mName = monthName(data.month);

  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode; badge?: React.ReactNode }> = [
    { id: "ranking", label: "Ranking", icon: <IconTrophy /> },
    { id: "clipadores", label: "Clipadores", icon: <IconUsers /> },
    { id: "manual", label: "Manual", icon: <IconBook /> },
    { id: "clipes", label: "Meus clipes", icon: <IconScissors />, badge: <span className="count">{fmtInt(derived.monthClips.length)}</span> },
    {
      id: "contas",
      label: "Minhas contas",
      icon: <IconAt />,
      badge: pendingAccounts ? <span className="dot dot-amber" aria-label={`${pendingAccounts} conta aguardando confirmação`} /> : undefined,
    },
    {
      id: "advertencias",
      label: "Advertências",
      icon: <IconShield />,
      badge: warningsActive ? <span className="dot dot-red" aria-label={`${warningsActive} advertência ativa`} /> : undefined,
    },
  ];

  return (
    <div className="app">
      <Backdrop />
      <Topbar
        name={data.me.name}
        area="clipador"
        canSwitch={mode === "demo"}
        onAccount={() => setAccountOpen("dados")}
        demo={mode === "demo"}
        bell={
          <NotificationsBell
            notices={notices}
            onMarkAllRead={() => setNotices((l) => l.map((n) => ({ ...n, read: true })))}
            onOpen={(n) => {
              setNotices((l) => l.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
              if (n.tab) setTab(n.tab as Tab);
            }}
          />
        }
      />

      <main className="container">
        {/* ---------- resumo ---------- */}
        <section className="stats" aria-label="Seu resumo do mês">
          <StatCard
            icon={<IconFilm />}
            tone="accent"
            label={`Clipes em ${mName}`}
            value={fmtInt(derived.counting.length)}
            foot={`Desde o início: ${fmtInt(data.totals.clipsAllTime)}`}
          />
          <StatCard
            icon={<IconEye />}
            tone="accent"
            label={`Views em ${mName}`}
            value={fmtInt(derived.monthViews)}
            foot={
              <>
                {derived.viewsToday > 0 && <span className="up">+{fmtInt(derived.viewsToday)} desde ontem · </span>}
                Total: {fmtInt(data.totals.viewsAllTime)}
              </>
            }
          />
          <StatCard
            icon={<IconMedal />}
            tone={derived.prize ? "green" : "neutral"}
            label="Sua posição"
            value={`${derived.position}º`}
            foot={
              derived.nextGoal ? (
                <>
                  Faltam <b>{fmtInt(derived.nextGoal.views)}</b> views pro {derived.nextGoal.position}º
                </>
              ) : derived.position === 1 ? (
                "Você está na liderança!"
              ) : (
                ""
              )
            }
          />
          <StatCard
            icon={<IconWallet />}
            tone="green"
            label="Prêmio se fechar hoje"
            value={derived.prize ? fmtBRLShort(derived.prize) : "R$ 0"}
            foot={
              <>
                Já recebido: {fmtBRL(data.totals.paidOut)}
                <br />
                <button type="button" className={`link pix-link ${data.pix ? "" : "is-missing"}`} onClick={() => setAccountOpen("pix")}>
                  {data.pix ? "Minha chave Pix" : "Cadastrar chave Pix"}
                </button>
              </>
            }
          />
        </section>

        <div className="checked-line">
          <span className="pulse" aria-hidden="true" />
          Views conferidas {fmtRelativeDay(data.lastCheckAt)} · o mês fecha em {plural(daysLeft, "dia", "dias")}
        </div>

        {/* ---------- abas ---------- */}
        <div className="tabs-row">
          <div className="tabs" role="tablist" aria-label="Seções">
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
          <button type="button" className="btn btn-primary send-btn" onClick={() => setSendOpen(true)}>
            <IconPlus />
            Enviar clipe
          </button>
        </div>

        <section className="panel" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === "ranking" && (
            <RankingTab
              month={data.month}
              ranking={derived.ranking}
              meId={data.me.id}
              lastCheckAt={data.lastCheckAt}
              daysLeft={daysLeft}
              nextGoal={derived.nextGoal}
              position={derived.position}
              onOpenRules={() => setRulesOpen(true)}
              onSelectClipper={(id) => {
                setSelectedClipper(id);
                setTab("clipadores");
              }}
            />
          )}
          {tab === "manual" && <ManualTab onOpenRules={() => setRulesOpen(true)} />}
          {tab === "clipadores" && (
            <CommunityTab community={derived.community} meId={data.me.id} selectedId={selectedClipper} onSelect={setSelectedClipper} />
          )}
          {tab === "clipes" && (
            <ClipsTab
              clips={derived.monthClips}
              dailyViews={data.dailyViews}
              month={data.month}
              onDelete={(id) => {
                dispatch({ type: "clip/delete", id });
                setToast("Clipe excluído.");
              }}
              onSend={() => setSendOpen(true)}
            />
          )}
          {tab === "contas" && (
            <AccountsTab
              accounts={data.accounts}
              pix={data.pix}
              mode={mode}
              onAdd={(account) => dispatch({ type: "account/add", account })}
              onRemove={(id) => dispatch({ type: "account/remove", id })}
              onConnect={(platform, handle) => {
                dispatch({ type: "account/connect", platform, handle });
                setToast(`@${handle} confirmada.`);
              }}
              onSavePix={(pix) => {
                dispatch({ type: "pix/save", pix });
                setToast("Chave Pix salva.");
              }}
            />
          )}
          {tab === "advertencias" && <WarningsTab warnings={data.warnings} removedAllTime={data.totals.removedAllTime} />}
        </section>

        <footer className="foot">
          Prêmios pagos via Pix até o 5º dia útil do mês seguinte.{" "}
          <button type="button" className="link" onClick={() => setRulesOpen(true)}>
            Ver regras
          </button>
        </footer>
      </main>

      {sendOpen && (
        <SendClipModal
          clips={data.clips}
          accounts={data.accounts}
          onClose={() => setSendOpen(false)}
          onGoToAccounts={() => {
            setSendOpen(false);
            setTab("contas");
          }}
          onSubmit={(clip) => {
            dispatch({ type: "clip/add", clip });
            setSendOpen(false);
            setTab("clipes");
            setToast("Clipe enviado! As views aparecem na próxima conferência.");
            pushNotice({ kind: "clipe", title: "Clipe recebido", body: "Ele já está valendo. As views aparecem na próxima conferência.", tab: "clipes" });
          }}
        />
      )}
      {rulesOpen && (
        <RulesModal
          onClose={() => setRulesOpen(false)}
          onSend={() => {
            setRulesOpen(false);
            setSendOpen(true);
          }}
        />
      )}

      {accountOpen && (
        <AccountModal
          initialSection={accountOpen}
          pix={data.pix}
          onSavePix={(pix) => {
            dispatch({ type: "pix/save", pix });
            setToast("Chave Pix salva.");
          }}
          name={data.me.name}
          email={data.me.email}
          phone={data.me.phone}
          onClose={() => setAccountOpen(false)}
          onSaved={(msg) => {
            setAccountOpen(false);
            setToast(msg);
          }}
        />
      )}

      <div className="toast-region" role="status" aria-live="polite">
        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  foot,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  foot: React.ReactNode;
  tone: "accent" | "green" | "neutral";
}) {
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
