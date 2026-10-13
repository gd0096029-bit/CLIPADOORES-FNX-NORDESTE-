"use client";

import { useState } from "react";
import type { WarningKind } from "@/lib/clipador/types";
import { REMOVALS_PER_WARNING } from "@/lib/clipador/rules";
import { IconAlert, IconBan, IconShield, IconTrash, IconUndo } from "@/components/clipador/icons";
import { Modal } from "@/components/clipador/Modal";

export const REMOVAL_REASONS = [
  "Fênix não é o assunto principal do clipe",
  "Postado antes do mês da competição",
  "Clipe de outra pessoa",
  "Clipe repetido / reupload",
  "Conta não confirmada",
  "Conteúdo impróprio",
];

/** Remover clipe, com motivo. Avisa quando a remoção vai gerar advertência automática. */
export function RemoveClipModal({
  clipTitle,
  clipperName,
  removedSoFar,
  onClose,
  onConfirm,
}: {
  clipTitle: string;
  clipperName: string;
  removedSoFar: number;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState(REMOVAL_REASONS[0]);
  const [other, setOther] = useState("");
  const willWarn = (removedSoFar + 1) % REMOVALS_PER_WARNING === 0;
  const final = reason === "outro" ? other.trim() : reason;

  return (
    <Modal
      title="Remover clipe"
      icon={<IconTrash />}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-danger" disabled={!final} onClick={() => onConfirm(final)}>
            Remover clipe
          </button>
        </>
      }
    >
      <p className="panel-desc">
        <b>{clipTitle}</b> de <b>{clipperName}</b> deixa de contar no ranking. O clipador vê o motivo em “Meus clipes”.
      </p>
      <fieldset className="radios">
        <legend className="field-label">Motivo</legend>
        {REMOVAL_REASONS.map((r) => (
          <label key={r} className="radio">
            <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} />
            {r}
          </label>
        ))}
        <label className="radio">
          <input type="radio" name="reason" checked={reason === "outro"} onChange={() => setReason("outro")} />
          Outro motivo
        </label>
        {reason === "outro" && <input className="input" autoFocus placeholder="Descreva o motivo" value={other} onChange={(e) => setOther(e.target.value)} />}
      </fieldset>
      {willWarn && (
        <p className="check check-warn">
          <IconAlert size={16} />
          <span>
            Esta é a {removedSoFar + 1}ª remoção de {clipperName}: ele vai receber <b>1 advertência automática</b>.
          </span>
        </p>
      )}
    </Modal>
  );
}

/** Anular advertência */
export function AnnulModal({ title, clipperName, onClose, onConfirm }: { title: string; clipperName: string; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  return (
    <Modal
      title="Anular advertência"
      icon={<IconUndo />}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" disabled={!reason.trim()} onClick={() => onConfirm(reason.trim())}>
            Anular
          </button>
        </>
      }
    >
      <p className="panel-desc">
        <b>{title}</b> de <b>{clipperName}</b> deixa de contar pro limite de advertências. O motivo aparece pro clipador.
      </p>
      <label className="field">
        <span className="field-label">Motivo da anulação</span>
        <input className="input" placeholder="Ex.: clipes revisados e reaprovados" value={reason} onChange={(e) => setReason(e.target.value)} />
      </label>
    </Modal>
  );
}

/** Advertência manual */
export function WarnModal({
  clipperName,
  onClose,
  onConfirm,
}: {
  clipperName: string;
  onClose: () => void;
  onConfirm: (kind: WarningKind, title: string, detail: string) => void;
}) {
  const options: Array<{ kind: WarningKind; title: string }> = [
    { kind: "clipe_de_terceiro", title: "Enviou clipe de outra pessoa" },
    { kind: "link_removido", title: "Recolocou link removido" },
  ];
  const [idx, setIdx] = useState(0);
  const [detail, setDetail] = useState("");
  return (
    <Modal
      title="Dar advertência"
      icon={<IconShield />}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-danger" disabled={!detail.trim()} onClick={() => onConfirm(options[idx].kind, options[idx].title, detail.trim())}>
            Dar advertência
          </button>
        </>
      }
    >
      <p className="panel-desc">
        Advertência manual pra <b>{clipperName}</b>. Remoções de clipe já geram advertência sozinhas, a cada {REMOVALS_PER_WARNING}.
      </p>
      <fieldset className="radios">
        <legend className="field-label">Tipo</legend>
        {options.map((o, i) => (
          <label key={o.kind} className="radio">
            <input type="radio" name="kind" checked={idx === i} onChange={() => setIdx(i)} />
            {o.title}
          </label>
        ))}
      </fieldset>
      <label className="field">
        <span className="field-label">Detalhe (o clipador vê)</span>
        <input className="input" placeholder="Ex.: link https://… é do perfil @outrapessoa" value={detail} onChange={(e) => setDetail(e.target.value)} />
      </label>
    </Modal>
  );
}

/** Suspender clipador */
export function SuspendModal({ clipperName, months, onClose, onConfirm }: { clipperName: string; months: number; onClose: () => void; onConfirm: (until: string) => void }) {
  const [m, setM] = useState(months);
  const until = new Date();
  until.setMonth(until.getMonth() + m);
  const iso = `${until.getFullYear()}-${String(until.getMonth() + 1).padStart(2, "0")}-${String(until.getDate()).padStart(2, "0")}`;
  return (
    <Modal
      title="Suspender clipador"
      icon={<IconBan />}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-danger" onClick={() => onConfirm(iso)}>
            Suspender
          </button>
        </>
      }
    >
      <p className="panel-desc">
        <b>{clipperName}</b> sai do ranking e não pode enviar clipes até {until.toLocaleDateString("pt-BR")}.
      </p>
      <label className="field">
        <span className="field-label">Por quanto tempo</span>
        <span className="select-wrap">
          <select value={m} onChange={(e) => setM(Number(e.target.value))}>
            {[1, 2, 3, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "mês" : "meses"}
                {n === months ? " (regra padrão)" : ""}
              </option>
            ))}
          </select>
        </span>
      </label>
    </Modal>
  );
}
