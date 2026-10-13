"use client";

import { useMemo, useState } from "react";
import type { AdminClip, AdminClipper } from "@/lib/clipador/admin-demo-data";
import { PLATFORM_LABEL } from "@/lib/clipador/platforms";
import { fmtDateTime, fmtInt, plural } from "@/lib/clipador/format";
import { IconCheck, IconExternal, IconEye, IconShield, IconTrash, PlatformIcon } from "@/components/clipador/icons";
import type { AdminAction } from "./AdminApp";
import { RemoveClipModal } from "./AdminModals";

interface Props {
  clips: AdminClip[];
  clippers: AdminClipper[];
  onAction: (a: AdminAction, message?: string) => void;
}

/**
 * Fila de conferência: os clipes novos que a equipe ainda não olhou.
 * "Tá OK" tira da fila; "Remover" abre o motivo. O clipe já conta enquanto espera.
 */
export function AdminReview({ clips, clippers, onAction }: Props) {
  const [removing, setRemoving] = useState<AdminClip | null>(null);
  const byId = useMemo(() => new Map(clippers.map((c) => [c.id, c])), [clippers]);
  const queue = clips.filter((c) => !c.reviewed && c.status !== "removido").sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const reviewedToday = clips.filter((c) => c.reviewed && new Date(c.submittedAt).toDateString() === new Date().toDateString()).length;

  return (
    <div>
      <div className="panel-head">
        <div className="panel-title">
          <span className="panel-icon">
            <IconShield />
          </span>
          <h2>Fila de conferência</h2>
        </div>
        <span className={`pill ${queue.length ? "pill-amber" : "pill-green"}`}>
          {queue.length ? `${plural(queue.length, "clipe", "clipes")} pra conferir` : "Tudo conferido"}
        </span>
      </div>
      <p className="panel-desc">
        Clipes novos entram aqui, do mais antigo pro mais novo. Eles já contam no ranking enquanto esperam. Abra o link, veja se segue as regras e clique em
        <b> Tá OK</b> ou <b>Remover</b>.
      </p>

      {queue.length === 0 ? (
        <div className="empty review-empty">
          <IconCheck size={30} />
          <p>Nenhum clipe esperando. {reviewedToday ? `${plural(reviewedToday, "clipe conferido", "clipes conferidos")} hoje.` : ""}</p>
        </div>
      ) : (
        <ul className="review-list">
          {queue.map((c) => {
            const who = byId.get(c.clipperId);
            const title = c.title ?? `Clipe no ${PLATFORM_LABEL[c.platform]}`;
            return (
              <li key={c.id} className="review-card">
                <span className={`plat plat-${c.platform}`}>
                  <PlatformIcon platform={c.platform} size={18} />
                </span>
                <div className="review-main">
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="clip-title">
                    {title} <IconExternal size={13} />
                  </a>
                  <span className="clip-meta">
                    <b>{who?.name}</b> · {c.handle ? `@${c.handle} · ` : ""}
                    {PLATFORM_LABEL[c.platform]} · enviado {fmtDateTime(c.submittedAt)}
                  </span>
                </div>
                <span className="link-views">
                  <IconEye size={14} />
                  {c.status === "verificando" ? "—" : fmtInt(c.views)}
                </span>
                <div className="review-actions">
                  <button type="button" className="btn btn-outline btn-sm btn-danger-outline" onClick={() => setRemoving(c)}>
                    <IconTrash size={15} /> Remover
                  </button>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => onAction({ type: "clip/approve", id: c.id }, "Clipe conferido.")}>
                    <IconCheck size={15} /> Tá OK
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {queue.length > 1 && (
        <div className="more">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onAction({ type: "clip/approve-all" }, `${plural(queue.length, "clipe conferido", "clipes conferidos")}.`)}>
            Marcar todos como OK
          </button>
        </div>
      )}

      {removing && (
        <RemoveClipModal
          clipTitle={removing.title ?? `Clipe no ${PLATFORM_LABEL[removing.platform]}`}
          clipperName={byId.get(removing.clipperId)?.name ?? ""}
          removedSoFar={byId.get(removing.clipperId)?.removedAllTime ?? 0}
          onClose={() => setRemoving(null)}
          onConfirm={(reason) => {
            onAction({ type: "clip/remove", id: removing.id, reason }, "Clipe removido.");
            setRemoving(null);
          }}
        />
      )}
    </div>
  );
}
