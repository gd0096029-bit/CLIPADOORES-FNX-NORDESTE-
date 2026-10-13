import type { Warning } from "@/lib/clipador/types";
import {
  activeWarnings,
  isWarningActive,
  REMOVALS_PER_WARNING,
  removalsUntilNextWarning,
  SUSPENSION_MONTHS,
  WARNING_WINDOW_MONTHS,
  WARNINGS_LIMIT,
} from "@/lib/clipador/rules";
import { fmtDateTime, plural } from "@/lib/clipador/format";
import { IconAlert, IconCheck, IconShield } from "./icons";

export function WarningsTab({ warnings, removedAllTime }: { warnings: Warning[]; removedAllTime: number }) {
  const active = activeWarnings(warnings).length;
  const untilNext = removalsUntilNextWarning(removedAllTime);
  const sorted = [...warnings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const level = active === 0 ? "ok" : active >= WARNINGS_LIMIT - 1 ? "danger" : "warn";

  return (
    <div>
      <div className="panel-head">
        <div className="panel-title">
          <span className="panel-icon">
            <IconShield />
          </span>
          <h2>Minhas advertências</h2>
        </div>
      </div>

      <div className={`meter meter-${level}`}>
        <div className="meter-dots" aria-hidden="true">
          {Array.from({ length: WARNINGS_LIMIT }, (_, i) => (
            <span key={i} className={i < active ? "on" : ""} />
          ))}
        </div>
        <div>
          <p className="meter-title">
            {active} de {WARNINGS_LIMIT} advertências nos últimos {WARNING_WINDOW_MONTHS} meses
          </p>
          <p className="meter-sub">
            {active >= WARNINGS_LIMIT
              ? `Você está fora da competição por ${SUSPENSION_MONTHS} meses.`
              : `Com ${WARNINGS_LIMIT} você fica ${SUSPENSION_MONTHS} meses fora da competição. Próxima advertência automática em ${plural(untilNext, "clipe removido", "clipes removidos")}.`}
          </p>
        </div>
      </div>

      <p className="panel-desc">
        Advertência é o registro de conduta fora das regras: a cada <b>{REMOVALS_PER_WARNING} clipes removidos pela equipe</b>{" "}
        você leva <b>1 advertência</b> automática. Reenviar um link já removido ou enviar clipe de outra pessoa também conta.
        Advertências vencem depois de {WARNING_WINDOW_MONTHS} meses.
      </p>

      {sorted.length === 0 ? (
        <div className="empty">
          <p>Nenhuma advertência. Continue assim!</p>
        </div>
      ) : (
        <ul className="warnings">
          {sorted.map((w) => {
            const isActive = isWarningActive(w);
            const state = w.annulled ? "anulada" : isActive ? "ativa" : "vencida";
            return (
              <li key={w.id} className={`warning ${isActive ? "is-active" : ""}`}>
                <span className="warning-icon">{isActive ? <IconAlert size={18} /> : <IconCheck size={18} />}</span>
                <div>
                  <p className="warning-title">
                    {w.title} <span className={`tag tag-${state}`}>{state}</span>
                  </p>
                  <p className="warning-detail">{w.detail}</p>
                  {w.annulled && <p className="warning-detail">Motivo da anulação: {w.annulled.reason}</p>}
                  <p className="warning-date">{fmtDateTime(w.createdAt)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
