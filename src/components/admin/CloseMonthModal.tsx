"use client";

import { useState } from "react";
import { PRIZES } from "@/lib/clipador/rules";
import { fmtBRL, fmtBRLShort, fmtInt, monthLabel } from "@/lib/clipador/format";
import { IconAlert, IconCalendar } from "@/components/clipador/icons";
import { Modal } from "@/components/clipador/Modal";

interface Props {
  month: string;
  ranking: Array<{ clipperId: string; name: string; views: number }>;
  daysLeft: number;
  noPix: string[];
  onClose: () => void;
  onConfirm: () => void;
}

/** Confirmação do fechamento do mês: congela o ranking e gera os pagamentos. */
export function CloseMonthModal({ month, ranking, daysLeft, noPix, onClose, onConfirm }: Props) {
  const [typed, setTyped] = useState("");
  const winners = ranking.slice(0, PRIZES.length);
  const total = winners.reduce((s, _, i) => s + PRIZES[i], 0);
  const word = "FECHAR";

  return (
    <Modal
      title={`Fechar ${monthLabel(month)}`}
      icon={<IconCalendar />}
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" disabled={typed.trim().toUpperCase() !== word} onClick={onConfirm}>
            Fechar o mês
          </button>
        </>
      }
    >
      <p className="panel-desc">
        O ranking fica congelado, a lista de pagamentos é gerada com os {PRIZES.length} premiados e a contagem do mês novo começa do zero.
      </p>
      {daysLeft > 0 && (
        <p className="check check-warn">
          <IconAlert size={16} />
          <span>
            Ainda faltam <b>{daysLeft} {daysLeft === 1 ? "dia" : "dias"}</b> pro fim do mês. Normalmente o fechamento é feito no 1º dia do mês seguinte.
          </span>
        </p>
      )}
      <ol className="close-list">
        {winners.map((w, i) => (
          <li key={w.clipperId}>
            <span className={`rank-pos pos-${i < 3 ? i + 1 : "n"}`}>{i + 1}º</span>
            <span className="grow-text">
              {w.name}
              {noPix.includes(w.clipperId) && <span className="text-warn"> · sem chave Pix</span>}
            </span>
            <span className="muted">{fmtInt(w.views)} views</span>
            <b className="payout-amount">{fmtBRLShort(PRIZES[i])}</b>
          </li>
        ))}
      </ol>
      <p className="close-total">
        Total a pagar: <b>{fmtBRL(total)}</b>
      </p>
      <label className="field">
        <span className="field-label">
          Pra confirmar, digite <b>{word}</b>
        </span>
        <input className="input" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
      </label>
    </Modal>
  );
}
