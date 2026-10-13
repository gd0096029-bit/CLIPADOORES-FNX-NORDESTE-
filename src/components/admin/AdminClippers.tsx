"use client";

import { useMemo, useState } from "react";
import type { AdminClip, AdminClipper, AdminWarning } from "@/lib/clipador/admin-demo-data";
import { isWarningActive, WARNINGS_LIMIT } from "@/lib/clipador/rules";
import { PLATFORM_LABEL, profileUrl } from "@/lib/clipador/platforms";
import { fmtDateTime, fmtInt, plural } from "@/lib/clipador/format";
import { IconBan, IconCheck, IconClock, IconExternal, IconMail, IconPhone, IconSearch, IconShield, IconUndo, IconUsers, PlatformIcon } from "@/components/clipador/icons";
import { Modal } from "@/components/clipador/Modal";
import type { AdminAction, ClipperStats } from "./AdminApp";
import { SuspendModal, WarnModal } from "./AdminModals";

interface Props {
  clippers: AdminClipper[];
  stats: Map<string, ClipperStats>;
  clips: AdminClip[];
  warnings: AdminWarning[];
  suspensionMonths: number;
  onAction: (a: AdminAction, message?: string) => void;
}

export function AdminClippers({ clippers, stats, clips, warnings, suspensionMonths, onAction }: Props) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"todos" | "risco" | "suspensos" | "sem_pix">("todos");
  const [openId, setOpenId] = useState<string | null>(null);
  const [warnFor, setWarnFor] = useState<AdminClipper | null>(null);
  const [suspendFor, setSuspendFor] = useState<AdminClipper | null>(null);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return clippers
      .filter((c) => !term || `${c.name} ${c.email} ${c.accounts.map((a) => a.handle).join(" ")}`.toLowerCase().includes(term))
      .filter((c) => {
        const s = stats.get(c.id)!;
        if (filter === "risco") return s.activeWarnings >= WARNINGS_LIMIT - 1 && !c.suspendedUntil;
        if (filter === "suspensos") return !!c.suspendedUntil;
        if (filter === "sem_pix") return !c.pix;
        return true;
      })
      .sort((a, b) => (stats.get(b.id)?.views ?? 0) - (stats.get(a.id)?.views ?? 0));
  }, [clippers, stats, q, filter]);

  const open = clippers.find((c) => c.id === openId) ?? null;

  return (
    <div>
      <div className="panel-head">
        <div className="panel-title">
          <span className="panel-icon">
            <IconUsers />
          </span>
          <h2>Clipadores</h2>
        </div>
      </div>

      <div className="filters">
        <div className="chips" role="group" aria-label="Filtrar clipadores">
          {(
            [
              ["todos", "Todos"],
              ["risco", "Perto da suspensão"],
              ["suspensos", "Suspensos"],
              ["sem_pix", "Sem Pix"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" className={`chip ${filter === id ? "is-active" : ""}`} aria-pressed={filter === id} onClick={() => setFilter(id)}>
              {label}
            </button>
          ))}
        </div>
        <label className="search">
          <IconSearch size={16} />
          <span className="sr-only">Buscar clipador</span>
          <input type="search" placeholder="Buscar por nome, e-mail ou @" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <p>Nenhum clipador nesse filtro.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="clips people">
            <thead>
              <tr>
                <th scope="col">Clipador</th>
                <th scope="col" className="num">
                  Posição
                </th>
                <th scope="col" className="num">
                  Clipes
                </th>
                <th scope="col" className="num">
                  Views no mês
                </th>
                <th scope="col" className="num">
                  Vendas (cupom)
                </th>
                <th scope="col">Advertências</th>
                <th scope="col">Situação</th>
                <th scope="col">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => {
                const s = stats.get(c.id)!;
                return (
                  <tr key={c.id}>
                    <td>
                      <button type="button" className="person" onClick={() => setOpenId(c.id)}>
                        <span className="avatar" aria-hidden="true">
                          {initials(c.name)}
                        </span>
                        <span className="clip-text">
                          <span className="clip-title">{c.name}</span>
                          <span className="clip-meta">{c.accounts.map((a) => `@${a.handle}`).join(" · ")}</span>
                        </span>
                      </button>
                    </td>
                    <td className="num" data-label="Posição">
                      {s.position ? `${s.position}º` : "—"}
                    </td>
                    <td className="num" data-label="Clipes">
                      {fmtInt(s.clips)}
                    </td>
                    <td className="num" data-label="Views">
                      <b>{fmtInt(s.views)}</b>
                    </td>
                    <td className="num" data-label="Vendas">
                      <b>{c.coupon?.salesMonth ?? 0}</b>
                      {c.coupon && <span className="clip-meta coupon-code">{c.coupon.code}</span>}
                    </td>
                    <td data-label="Advertências">
                      <WarnDots n={s.activeWarnings} />
                    </td>
                    <td data-label="Situação">
                      {c.suspendedUntil ? (
                        <span className="badge badge-removido">Suspenso até {new Date(c.suspendedUntil + "T12:00").toLocaleDateString("pt-BR")}</span>
                      ) : !c.pix ? (
                        <span className="badge badge-verificando">Sem chave Pix</span>
                      ) : (
                        <span className="badge badge-no_ar">Ativo</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <div className="actions">
                        <button type="button" className="btn btn-outline btn-xs" onClick={() => setOpenId(c.id)}>
                          Ver ficha
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <ClipperSheet
          clipper={open}
          stats={stats.get(open.id)!}
          clips={clips.filter((c) => c.clipperId === open.id)}
          warnings={warnings.filter((w) => w.clipperId === open.id)}
          onClose={() => setOpenId(null)}
          onWarn={() => setWarnFor(open)}
          onSuspend={() => setSuspendFor(open)}
          onUnsuspend={() => onAction({ type: "clipper/unsuspend", id: open.id }, `${open.name} voltou pra competição.`)}
        />
      )}
      {warnFor && (
        <WarnModal
          clipperName={warnFor.name}
          onClose={() => setWarnFor(null)}
          onConfirm={(kind, title, detail) => {
            onAction({ type: "warning/add", clipperId: warnFor.id, kind, title, detail }, `Advertência registrada pra ${warnFor.name}.`);
            setWarnFor(null);
          }}
        />
      )}
      {suspendFor && (
        <SuspendModal
          clipperName={suspendFor.name}
          months={suspensionMonths}
          onClose={() => setSuspendFor(null)}
          onConfirm={(until) => {
            onAction({ type: "clipper/suspend", id: suspendFor.id, until }, `${suspendFor.name} foi suspenso.`);
            setSuspendFor(null);
          }}
        />
      )}
    </div>
  );
}

export function WarnDots({ n }: { n: number }) {
  const level = n >= WARNINGS_LIMIT ? "danger" : n >= WARNINGS_LIMIT - 1 ? "danger" : n > 0 ? "warn" : "ok";
  return (
    <span className={`mini-dots mini-${level}`} aria-label={`${n} de ${WARNINGS_LIMIT} advertências ativas`}>
      {Array.from({ length: WARNINGS_LIMIT }, (_, i) => (
        <span key={i} className={i < n ? "on" : ""} />
      ))}
      <span className="mini-txt">
        {n}/{WARNINGS_LIMIT}
      </span>
    </span>
  );
}

function initials(name: string) {
  const p = name.split(/\s+/);
  return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

function ClipperSheet({
  clipper,
  stats,
  clips,
  warnings,
  onClose,
  onWarn,
  onSuspend,
  onUnsuspend,
}: {
  clipper: AdminClipper;
  stats: ClipperStats;
  clips: AdminClip[];
  warnings: AdminWarning[];
  onClose: () => void;
  onWarn: () => void;
  onSuspend: () => void;
  onUnsuspend: () => void;
}) {
  const top = [...clips].filter((c) => c.status !== "removido").sort((a, b) => b.views - a.views).slice(0, 5);
  const removedMonth = clips.filter((c) => c.status === "removido").length;
  return (
    <Modal
      title={clipper.name}
      icon={<IconUsers />}
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onWarn}>
            <IconShield size={16} />
            Dar advertência
          </button>
          {clipper.suspendedUntil ? (
            <button type="button" className="btn btn-primary" onClick={onUnsuspend}>
              <IconUndo size={16} />
              Reativar
            </button>
          ) : (
            <button type="button" className="btn btn-danger" onClick={onSuspend}>
              <IconBan size={16} />
              Suspender
            </button>
          )}
        </>
      }
    >
      <div className="sheet-grid">
        <div className="sheet-stat">
          <span>Posição</span>
          <b>{stats.position ? `${stats.position}º` : "—"}</b>
        </div>
        <div className="sheet-stat">
          <span>Views no mês</span>
          <b>{fmtInt(stats.views)}</b>
        </div>
        <div className="sheet-stat">
          <span>Clipes válidos</span>
          <b>{fmtInt(stats.clips)}</b>
        </div>
        <div className="sheet-stat">
          <span>Vendas com cupom</span>
          <b>{clipper.coupon?.salesMonth ?? 0}</b>
        </div>
        <div className="sheet-stat">
          <span>Removidos (total)</span>
          <b>{fmtInt(clipper.removedAllTime)}</b>
        </div>
      </div>

      <h3 className="sheet-h">Contato</h3>
      <ul className="sheet-list">
        <li>
          <IconMail size={16} /> {clipper.email}
        </li>
        <li>
          <IconPhone size={16} /> {clipper.phone}
        </li>
        <li>
          <IconClock size={16} /> Cadastrado em {new Date(clipper.joinedAt).toLocaleDateString("pt-BR")}
        </li>
        <li>{clipper.pix ? <>Pix ({clipper.pix.type}): {clipper.pix.value}</> : <span className="text-warn">Ainda não cadastrou chave Pix</span>}</li>
      </ul>

      <h3 className="sheet-h">Contas</h3>
      <ul className="sheet-list">
        {clipper.accounts.map((a) => (
          <li key={a.id}>
            <PlatformIcon platform={a.platform} size={16} />
            <a href={profileUrl(a.platform, a.handle)} target="_blank" rel="noopener noreferrer">
              @{a.handle} <IconExternal size={12} />
            </a>
            <span className="clip-meta">{PLATFORM_LABEL[a.platform]}</span>
            {a.connection === "oauth" ? (
              <span className="badge badge-no_ar">
                <IconCheck size={13} /> Confirmada
              </span>
            ) : (
              <span className="badge badge-verificando">Não confirmada</span>
            )}
          </li>
        ))}
      </ul>

      <h3 className="sheet-h">Melhores clipes do mês</h3>
      {top.length ? (
        <ol className="sheet-list numbered">
          {top.map((c) => (
            <li key={c.id}>
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="grow-text">
                {c.title ?? `Clipe no ${PLATFORM_LABEL[c.platform]}`}
              </a>
              <b>{fmtInt(c.views)}</b>
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted">Nenhum clipe válido este mês.</p>
      )}
      {removedMonth > 0 && <p className="hint">{plural(removedMonth, "clipe removido", "clipes removidos")} este mês.</p>}

      <h3 className="sheet-h">Advertências</h3>
      {warnings.length ? (
        <ul className="sheet-list">
          {warnings.map((w) => (
            <li key={w.id}>
              <span className={`tag tag-${w.annulled ? "anulada" : isWarningActive(w) ? "ativa" : "vencida"}`}>{w.annulled ? "anulada" : isWarningActive(w) ? "ativa" : "vencida"}</span>
              <span className="grow-text">{w.title}</span>
              <span className="clip-meta">{fmtDateTime(w.createdAt)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Nenhuma advertência.</p>
      )}
    </Modal>
  );
}
