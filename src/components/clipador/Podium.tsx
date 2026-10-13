import type { RankingEntry } from "@/lib/clipador/types";
import { prizeForPosition } from "@/lib/clipador/rules";
import { fmtBRLShort, fmtInt } from "@/lib/clipador/format";
import { IconEye, IconTrophy } from "./icons";

interface Props {
  /** ranking já ordenado; só os 3 primeiros vão pro pódio */
  ranking: RankingEntry[];
  meId?: string;
  onSelect?: (clipperId: string) => void;
  /** fotos por clipador */
  avatars?: Record<string, string | undefined>;
}

const PLACE = ["", "1º", "2º", "3º"];

/** Pódio do top 3: 2º à esquerda, 1º no meio (mais alto), 3º à direita. */
export function Podium({ ranking, meId, onSelect, avatars = {} }: Props) {
  const top = ranking.slice(0, 3);
  if (top.length === 0) return null;
  const order = [top[1], top[0], top[2]].map((e, i) => (e ? { e, pos: [2, 1, 3][i] } : null));

  return (
    <ol className="podium" aria-label="Pódio do mês">
      {order.map((item, i) => {
        if (!item) return <li key={`vazio-${i}`} className="podium-spot is-empty" aria-hidden="true" />;
        const { e, pos } = item;
        const isMe = e.clipperId === meId;
        const content = (
          <>
            {pos === 1 && (
              <span className="podium-crown" aria-hidden="true">
                <IconTrophy size={22} />
              </span>
            )}
            <span className="podium-avatar" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {avatars[e.clipperId] ? <img src={avatars[e.clipperId]} alt="" /> : initials(e.name)}
            </span>
            <span className="podium-name">
              {e.name}
              {isMe && <span className="you">você</span>}
            </span>
            <span className="podium-views">
              <IconEye size={14} />
              {fmtInt(e.views)}
            </span>
          </>
        );
        return (
          <li key={e.clipperId} className={`podium-spot place-${pos} ${isMe ? "is-me" : ""}`}>
            {onSelect ? (
              <button type="button" className="podium-person" onClick={() => onSelect(e.clipperId)}>
                {content}
              </button>
            ) : (
              <div className="podium-person">{content}</div>
            )}
            <div className="podium-step">
              <span className="podium-place">{PLACE[pos]}</span>
              <span className="podium-prize">{fmtBRLShort(prizeForPosition(pos))}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}
