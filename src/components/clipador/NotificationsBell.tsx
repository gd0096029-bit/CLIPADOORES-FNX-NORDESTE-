"use client";

import { useEffect, useRef, useState } from "react";
import type { Notice } from "@/lib/clipador/types";
import { IconAlert, IconArrowUp, IconAt, IconBell, IconClock, IconEye, IconScissors, IconShield, IconTrash, IconWallet } from "./icons";

interface Props {
  notices: Notice[];
  onOpen: (notice: Notice) => void;
  onMarkAllRead: () => void;
}

/** Sininho do topo: lista de avisos com contador de não lidos. */
export function NotificationsBell({ notices, onOpen, onMarkAllRead }: Props) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const unread = notices.filter((n) => !n.read).length;
  const sorted = [...notices].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="bell-wrap" ref={wrap}>
      <button
        type="button"
        className="btn btn-ghost btn-sm bell-btn"
        aria-label={unread ? `Avisos, ${unread} não lidos` : "Avisos"}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
      >
        <IconBell size={18} />
        {unread > 0 && <span className="bell-count">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        <div className="bell-panel" role="dialog" aria-label="Avisos">
          <div className="bell-head">
            <strong>Avisos</strong>
            {unread > 0 && (
              <button type="button" className="link" onClick={onMarkAllRead}>
                Marcar todos como lidos
              </button>
            )}
          </div>
          {sorted.length === 0 ? (
            <p className="bell-empty">Nenhum aviso por enquanto.</p>
          ) : (
            <ul className="bell-list">
              {sorted.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={`bell-item ${n.read ? "" : "is-unread"}`}
                    onClick={() => {
                      onOpen(n);
                      setOpen(false);
                    }}
                  >
                    <span className={`bell-icon kind-${n.kind}`}>{iconFor(n.kind)}</span>
                    <span className="bell-text">
                      <span className="bell-title">{n.title}</span>
                      {n.body && <span className="bell-body">{n.body}</span>}
                      <span className="bell-time">{timeAgo(n.createdAt)}</span>
                    </span>
                    {!n.read && <span className="bell-dot" aria-label="não lido" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="bell-foot">Depois, esses avisos também podem chegar pelo WhatsApp.</p>
        </div>
      )}
    </div>
  );
}

function iconFor(kind: Notice["kind"]) {
  switch (kind) {
    case "subiu":
      return <IconArrowUp size={16} />;
    case "caiu":
      return <IconArrowUp size={16} style={{ transform: "rotate(180deg)" }} />;
    case "removido":
      return <IconTrash size={16} />;
    case "advertencia":
      return <IconShield size={16} />;
    case "fechamento":
      return <IconClock size={16} />;
    case "pagamento":
      return <IconWallet size={16} />;
    case "conta":
      return <IconAt size={16} />;
    case "marca":
      return <IconEye size={16} />;
    case "clipe":
      return <IconScissors size={16} />;
    default:
      return <IconAlert size={16} />;
  }
}

function timeAgo(iso: string) {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "ontem";
  return `há ${d} dias`;
}

