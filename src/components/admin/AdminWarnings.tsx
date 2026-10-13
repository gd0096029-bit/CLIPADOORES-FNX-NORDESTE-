"use client";

import { useMemo, useState } from "react";
import type { AdminClipper, AdminWarning } from "@/lib/clipador/admin-demo-data";
import { activeWarnings, isWarningActive, REMOVALS_PER_WARNING, SUSPENSION_MONTHS, WARNING_WINDOW_MONTHS, WARNINGS_LIMIT } from "@/lib/clipador/rules";
import { fmtDateTime } from "@/lib/clipador/format";
import { IconAlert, IconCheck, IconShield, IconUndo } from "@/components/clipador/icons";
import type { AdminAction } from "./AdminApp";
import { AnnulModal } from "./AdminModals";
import { WarnDots } from "./AdminClippers";

interface Props {
  warnings: AdminWarning[];
  clippers: AdminClipper[];
  onAction: (a: AdminAction, message?: string) => void;
}

export function AdminWarnings({ warnings, clippers, onAction }: Props) {
  const [filter, setFilter] = useState<"ativas" | "todas" | "anuladas">("ativas");
  const [annul, setAnnul] = useState<AdminWarning | null>(null);
  const names = useMemo(() => new Map(clippers.map((c) => [c.id, c.name])), [clippers]);

  const list = [...warnings]
    .filter((w) => (filter === "todas" ? true : filter === "ativas" ? isWarningActive(w) : !!w.annulled))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const atRisk = clippers
    .filter((c) => !c.suspendedUntil)
    .map((c) => ({ c, n: activeWarnings(warnings.filter((w) => w.clipperId === c.id)).length }))
    .filter((x) => x.n >= WARNINGS_LIMIT - 1)
    .sort((a, b) => b.n - a.n);

  return (
    <div>
      <div className="panel-head">
        <div className="panel-title">
          <span className="panel-icon">
            <IconShield />
          </span>
          <h2>Advertências</h2>
        </div>
      </div>
      <p className="panel-desc">
        A cada {REMOVALS_PER_WARNING} clipes removidos o sistema dá 1 advertência sozinho. {WARNINGS_LIMIT} ativas em {WARNING_WINDOW_MONTHS} meses ={" "}
        {SUSPENSION_MONTHS} meses fora. Anule as que foram erro.
      </p>

      {atRisk.length > 0 && (
        <div className="risk">
          <p className="risk-title">
            <IconAlert size={16} /> Perto da suspensão
          </p>
          <ul>
            {atRisk.map(({ c, n }) => (
              <li key={c.id}>
                <span>{c.name}</span>
                <WarnDots n={n} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="chips" role="group" aria-label="Filtrar advertências" style={{ marginBottom: 12 }}>
        {(
          [
            ["ativas", "Ativas"],
            ["anuladas", "Anuladas"],
            ["todas", "Todas"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" className={`chip ${filter === id ? "is-active" : ""}`} aria-pressed={filter === id} onClick={() => setFilter(id)}>
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <p>Nenhuma advertência aqui.</p>
        </div>
      ) : (
        <ul className="warnings">
          {list.map((w) => {
            const active = isWarningActive(w);
            const state = w.annulled ? "anulada" : active ? "ativa" : "vencida";
            return (
              <li key={w.id} className={`warning ${active ? "is-active" : ""}`}>
                <span className="warning-icon">{active ? <IconAlert size={18} /> : <IconCheck size={18} />}</span>
                <div className="grow-text">
                  <p className="warning-title">
                    {names.get(w.clipperId)} · {w.title} <span className={`tag tag-${state}`}>{state}</span>
                  </p>
                  <p className="warning-detail">{w.detail}</p>
                  {w.annulled && <p className="warning-detail">Motivo da anulação: {w.annulled.reason}</p>}
                  <p className="warning-date">{fmtDateTime(w.createdAt)}</p>
                </div>
                {active && (
                  <button type="button" className="btn btn-outline btn-xs" onClick={() => setAnnul(w)}>
                    <IconUndo size={14} />
                    Anular
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {annul && (
        <AnnulModal
          title={annul.title}
          clipperName={names.get(annul.clipperId) ?? ""}
          onClose={() => setAnnul(null)}
          onConfirm={(reason) => {
            onAction({ type: "warning/annul", id: annul.id, reason }, "Advertência anulada.");
            setAnnul(null);
          }}
        />
      )}
    </div>
  );
}
