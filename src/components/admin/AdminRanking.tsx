"use client";

import { useState } from "react";
import type { Payout } from "@/lib/clipador/admin-demo-data";
import { PRIZES, prizeForPosition } from "@/lib/clipador/rules";
import { fmtBRL, fmtBRLShort, fmtDateTime, fmtInt, monthLabel } from "@/lib/clipador/format";
import { downloadCsv } from "@/lib/clipador/csv";
import { PIX_TYPE_LABEL } from "@/lib/clipador/platforms";
import { IconCalendar, IconCheck, IconCopy, IconEye, IconLock, IconTrophy, IconWallet } from "@/components/clipador/icons";
import type { AdminAction } from "./AdminApp";
import { Podium } from "@/components/clipador/Podium";

interface Props {
  month: string;
  prevMonth: string;
  ranking: Array<{ clipperId: string; name: string; views: number; clips: number }>;
  payouts: Payout[];
  closed?: { month: string; at: string };
  onAction: (a: AdminAction, message?: string) => void;
  onToast: (m: string) => void;
  onCloseMonth: () => void;
}

export function AdminRanking({ month, prevMonth, ranking, payouts, closed, onAction, onToast, onCloseMonth }: Props) {
  const isClosed = closed?.month === month;
  const [view, setView] = useState<"atual" | "anterior">("atual");
  const leader = ranking[0]?.views || 1;
  const paid = payouts.filter((p) => p.paidAt).reduce((s, p) => s + p.amount, 0);
  const total = payouts.reduce((s, p) => s + p.amount, 0);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      onToast("Chave Pix copiada.");
    } catch {
      onToast("Não deu pra copiar. Selecione e copie manualmente.");
    }
  }

  return (
    <div>
      <div className="panel-head">
        <div className="panel-title">
          <span className="panel-icon">
            <IconTrophy />
          </span>
          <h2>Ranking e prêmios</h2>
        </div>
        <div className="seg seg-inline" role="tablist" aria-label="Mês">
          <button type="button" role="tab" aria-selected={view === "atual"} className={view === "atual" ? "is-active" : ""} onClick={() => setView("atual")}>
            {monthLabel(month)}
            {isClosed ? "" : " (parcial)"}
          </button>
          <button type="button" role="tab" aria-selected={view === "anterior"} className={view === "anterior" ? "is-active" : ""} onClick={() => setView("anterior")}>
            {monthLabel(prevMonth)}
          </button>
        </div>
      </div>

      {view === "atual" ? (
        <>
          {isClosed ? (
            <p className="check check-ok closed-banner">
              <IconLock size={16} />
              <span>
                Mês fechado em {fmtDateTime(closed!.at)}. Ranking congelado e pagamentos gerados na aba ao lado.
              </span>
            </p>
          ) : (
            <div className="close-row">
              <p className="panel-desc">Prévia do mês em andamento. No fechamento, os {PRIZES.length} primeiros entram na lista de pagamentos.</p>
              <div className="panel-tools">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() =>
                    downloadCsv(`ranking-${month}.csv`, [
                      ["Posição", "Clipador", "Clipes", "Views", "Prêmio (R$)"],
                      ...ranking.map((e, i) => [i + 1, e.name, e.clips, e.views, prizeForPosition(i + 1)]),
                    ])
                  }
                >
                  Exportar planilha
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={onCloseMonth}>
                  <IconCalendar size={16} /> Fechar o mês
                </button>
              </div>
            </div>
          )}
          <Podium ranking={ranking} />
          {ranking.length > 3 && <h3 className="list-title">Do 4º lugar em diante</h3>}
          <ol className="ranking" start={4}>
            {ranking.slice(3).map((e, i) => {
              const pos = i + 4;
              const prize = prizeForPosition(pos);
              return (
                <li key={e.clipperId} className={`rank-row ${pos === PRIZES.length ? "is-cutoff" : ""}`}>
                  <span className={`rank-pos pos-${pos <= 3 ? pos : "n"}`}>{pos}º</span>
                  <div className="rank-main">
                    <div className="rank-name">{e.name}</div>
                    <div className="rank-bar" aria-hidden="true">
                      <span style={{ width: `${Math.max(2, Math.round((e.views / leader) * 100))}%` }} />
                    </div>
                  </div>
                  <span className="rank-clips">{fmtInt(e.clips)} clipes</span>
                  <span className="rank-views">
                    <IconEye size={15} />
                    {fmtInt(e.views)}
                  </span>
                  <span className={`rank-prize ${prize ? "" : "is-empty"}`}>{prize ? fmtBRLShort(prize) : "—"}</span>
                </li>
              );
            })}
          </ol>
        </>
      ) : (
        <>
          <div className="pay-summary">
            <div>
              <span>Total do mês</span>
              <b>{fmtBRL(total)}</b>
            </div>
            <div>
              <span>Pago</span>
              <b className="up">{fmtBRL(paid)}</b>
            </div>
            <div>
              <span>Falta pagar</span>
              <b>{fmtBRL(total - paid)}</b>
            </div>
            <div className="pay-bar" aria-hidden="true">
              <span style={{ width: `${total ? (paid / total) * 100 : 0}%` }} />
            </div>
          </div>
          <div className="close-row">
            <p className="panel-desc">Prazo: até o 5º dia útil. Copie a chave, faça o Pix no banco e marque como pago.</p>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() =>
                downloadCsv(`pagamentos-${prevMonth}.csv`, [
                  ["Posição", "Clipador", "Views", "Valor (R$)", "Tipo de chave", "Chave Pix", "Situação"],
                  ...payouts.map((p) => [p.position, p.name, p.views, p.amount, p.pix ? PIX_TYPE_LABEL[p.pix.type] : "", p.pix?.value ?? "", p.paidAt ? "Pago" : "A pagar"]),
                ])
              }
            >
              Exportar planilha
            </button>
          </div>
          <ul className="payouts">
            {payouts.map((p) => (
              <li key={p.clipperId} className={`payout ${p.paidAt ? "is-paid" : ""}`}>
                <span className={`rank-pos pos-${p.position <= 3 ? p.position : "n"}`}>{p.position}º</span>
                <div className="payout-main">
                  <span className="rank-name">{p.name}</span>
                  <span className="clip-meta">{fmtInt(p.views)} views</span>
                </div>
                <div className="payout-pix">
                  {p.pix ? (
                    <>
                      <span className="clip-meta">Pix ({p.pix.type})</span>
                      <button type="button" className="pix-copy" onClick={() => copy(p.pix!.value)} aria-label={`Copiar chave Pix de ${p.name}`}>
                        <span>{p.pix.value}</span>
                        <IconCopy size={14} />
                      </button>
                    </>
                  ) : (
                    <span className="text-warn">Sem chave Pix cadastrada</span>
                  )}
                </div>
                <b className="payout-amount">{fmtBRLShort(p.amount)}</b>
                {p.paidAt ? (
                  <span className="badge badge-no_ar" title={`Pago em ${fmtDateTime(p.paidAt)}`}>
                    <IconCheck size={14} /> Pago
                  </span>
                ) : (
                  <button type="button" className="btn btn-primary btn-xs" disabled={!p.pix} onClick={() => onAction({ type: "payout/pay", clipperId: p.clipperId }, `Pagamento de ${p.name} marcado como feito.`)}>
                    <IconWallet size={14} />
                    Marcar pago
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
