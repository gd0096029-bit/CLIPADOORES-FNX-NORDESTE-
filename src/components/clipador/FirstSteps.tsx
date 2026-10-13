"use client";

import { IconCheck, IconX } from "./icons";

export interface Step {
  id: string;
  label: string;
  done: boolean;
  action: () => void;
  cta: string;
}

/** Cartão "Primeiros passos": aparece até o clipador completar o perfil (ou fechar). */
export function FirstSteps({ steps, onDismiss }: { steps: Step[]; onDismiss: () => void }) {
  const done = steps.filter((s) => s.done).length;
  if (done === steps.length) return null;
  return (
    <section className="first-steps" aria-label="Primeiros passos">
      <div className="first-head">
        <div>
          <p className="eyebrow">Primeiros passos</p>
          <h2 className="first-title">
            Complete seu perfil · {done} de {steps.length}
          </h2>
        </div>
        <button type="button" className="icon-btn" aria-label="Esconder primeiros passos" onClick={onDismiss}>
          <IconX size={16} />
        </button>
      </div>
      <div className="first-bar" aria-hidden="true">
        <span style={{ width: `${(done / steps.length) * 100}%` }} />
      </div>
      <ol className="first-list">
        {steps.map((s, i) => (
          <li key={s.id} className={s.done ? "is-done" : ""}>
            <span className="first-num">{s.done ? <IconCheck size={14} /> : i + 1}</span>
            <span className="grow-text">{s.label}</span>
            {!s.done && (
              <button type="button" className="btn btn-outline btn-xs" onClick={s.action}>
                {s.cta}
              </button>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
