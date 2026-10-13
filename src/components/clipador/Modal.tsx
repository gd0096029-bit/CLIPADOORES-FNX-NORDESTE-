"use client";

import { useEffect, useRef } from "react";
import { IconX } from "./icons";

interface Props {
  title: React.ReactNode;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}

/** Janela modal acessível: fecha com Esc ou clicando fora, e prende o foco dentro dela. */
export function Modal({ title, icon, onClose, children, footer, wide }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const first = el?.querySelector<HTMLElement>("input, select, textarea, button:not(.modal-close)");
    (first ?? el)?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab" && el) {
        const items = Array.from(
          el.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'),
        );
        if (!items.length) return;
        const firstItem = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstItem) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          firstItem.focus();
        }
      }
    }
    el?.addEventListener("keydown", onKey);
    return () => {
      el?.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prev?.focus();
    };
  }, []);

  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={ref} className={`modal ${wide ? "modal-wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1}>
        <div className="modal-head">
          <h2 id="modal-title">
            {icon}
            {title}
          </h2>
          <button type="button" className="icon-btn modal-close" aria-label="Fechar" onClick={onClose}>
            <IconX size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
