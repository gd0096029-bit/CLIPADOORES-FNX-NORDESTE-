import type { RankingEntry } from "@/lib/clipador/types";
import { PRIZES, prizeForPosition } from "@/lib/clipador/rules";
import { fmtBRLShort, fmtInt, fmtRelativeDay, monthLabel, plural } from "@/lib/clipador/format";
import { IconArrowUp, IconBook, IconEye, IconTrophy } from "./icons";

interface Props {
  month: string;
  ranking: RankingEntry[];
  meId: string;
  lastCheckAt: string;
  daysLeft: number;
  position: number;
  nextGoal: { views: number; position: number; prize: number } | null;
  onOpenRules: () => void;
  /** abre os clipes do clipador na aba "Clipadores" */
  onSelectClipper?: (clipperId: string) => void;
}

export function RankingTab({ month, ranking, meId, lastCheckAt, daysLeft, position, nextGoal, onOpenRules, onSelectClipper }: Props) {
  const leader = ranking[0]?.views || 1;
  const prizeCount = PRIZES.length;

  return (
    <div>
      <div className="panel-head">
        <div className="panel-title">
          <span className="panel-icon">
            <IconTrophy />
          </span>
          <h2>
            Ranking do mês <span className="muted-inline">· {monthLabel(month)}</span>
          </h2>
        </div>
        <div className="panel-tools">
          <span className="pill pill-green">
            <span className="pulse" aria-hidden="true" />
            Conferido {fmtRelativeDay(lastCheckAt)}
          </span>
          <button type="button" className="btn btn-outline btn-sm" onClick={onOpenRules}>
            <IconBook size={16} />
            Regras
          </button>
        </div>
      </div>

      <p className="panel-desc">
        No fim do mês, os {prizeCount} clipadores com mais views somadas nos clipes válidos ganham via Pix. Faltam{" "}
        <b>{plural(daysLeft, "dia", "dias")}</b>.
      </p>

      <ol className="prize-strip" aria-label="Premiação">
        {PRIZES.map((p, i) => (
          <li key={i} className={i === 0 ? "is-first" : ""}>
            <span className="prize-pos">{i + 1}º</span>
            <span className="prize-val">{fmtBRLShort(p)}</span>
          </li>
        ))}
      </ol>

      {nextGoal && (
        <div className="goal">
          <span className="goal-icon">
            <IconArrowUp size={16} />
          </span>
          <p>
            Você está em <b>{position}º</b>. Faltam <b>{fmtInt(nextGoal.views)} views</b> pra chegar em{" "}
            <b>{nextGoal.position}º</b> e garantir <b>{fmtBRLShort(nextGoal.prize)}</b>.
          </p>
        </div>
      )}

      <ol className="ranking">
        {ranking.map((e, i) => {
          const pos = i + 1;
          const prize = prizeForPosition(pos);
          const isMe = e.clipperId === meId;
          const pct = Math.max(2, Math.round((e.views / leader) * 100));
          return (
            <li key={e.clipperId} className={`rank-row ${isMe ? "is-me" : ""} ${pos === prizeCount ? "is-cutoff" : ""}`}>
              <span className={`rank-pos pos-${pos <= 3 ? pos : "n"}`}>{pos}º</span>
              <div className="rank-main">
                <div className="rank-name">
                  {onSelectClipper ? (
                    <button type="button" className="name-btn" onClick={() => onSelectClipper(e.clipperId)} aria-label={`Ver clipes de ${e.name}`}>
                      {e.name}
                    </button>
                  ) : (
                    e.name
                  )}
                  {isMe && <span className="you">você</span>}
                </div>
                <div className="rank-bar" aria-hidden="true">
                  <span style={{ width: `${pct}%` }} />
                </div>
              </div>
              <span className="rank-clips">{plural(e.clips, "clipe", "clipes")}</span>
              <span className="rank-views">
                <IconEye size={15} />
                {fmtInt(e.views)}
              </span>
              <span className={`rank-prize ${prize ? "" : "is-empty"}`}>{prize ? fmtBRLShort(prize) : "—"}</span>
            </li>
          );
        })}
      </ol>
      <p className="hint">A linha tracejada marca o último lugar premiado. Toque num nome pra ver os clipes da pessoa.</p>
    </div>
  );
}
