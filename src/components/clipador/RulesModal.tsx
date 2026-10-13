"use client";

import { useState } from "react";
import { PAYOUT_BUSINESS_DAY, PRIZES, REMOVALS_PER_WARNING, SUSPENSION_MONTHS, WARNING_WINDOW_MONTHS, WARNINGS_LIMIT } from "@/lib/clipador/rules";
import { fmtBRLShort } from "@/lib/clipador/format";
import { IconAlert, IconAt, IconBook, IconCheck, IconClock, IconEye, IconScissors, IconTrophy, IconX } from "./icons";
import { Modal } from "./Modal";

export function RulesModal({ onClose, onSend }: { onClose: () => void; onSend?: () => void }) {
  const [tab, setTab] = useState<"como" | "regras">("como");

  return (
    <Modal
      title="Como funciona a competição"
      icon={<IconTrophy />}
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Fechar
          </button>
          {onSend && (
            <button type="button" className="btn btn-primary" onClick={onSend}>
              <IconScissors />
              Enviar clipe
            </button>
          )}
        </>
      }
    >
      <div className="seg" role="tablist" aria-label="Seções das regras">
        <button type="button" role="tab" aria-selected={tab === "como"} className={tab === "como" ? "is-active" : ""} onClick={() => setTab("como")}>
          Passo a passo
        </button>
        <button type="button" role="tab" aria-selected={tab === "regras"} className={tab === "regras" ? "is-active" : ""} onClick={() => setTab("regras")}>
          <IconBook size={16} />
          Regras
        </button>
      </div>

      {tab === "como" ? (
        <div className="steps">
          <ol>
            <li>
              <b>Cadastre e confirme os @</b> que você usa pra postar (TikTok, Instagram ou YouTube). A confirmação é pelo
              login oficial da rede, e a gente nunca vê sua senha.
            </li>
            <li>
              Poste clipes com <b>conteúdo da Fênix</b> nesses @ e <b>cole o link de cada clipe</b> aqui na sua área.
            </li>
            <li>
              <b>Todo clipe enviado conta</b> e não precisa de aprovação prévia. A equipe só remove o que quebrar as regras, e
              aí ele deixa de contar.
            </li>
            <li>
              No fim do mês, os <b>{PRIZES.length} clipadores com mais views somadas</b> ganham via Pix:
            </li>
          </ol>
          <ol className="prize-grid">
            {PRIZES.map((p, i) => (
              <li key={i} className={i === 0 ? "is-first" : ""}>
                <span>{i + 1}º lugar</span>
                <b>{fmtBRLShort(p)}</b>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="rules">
          <p className="rules-kicker">Letra miúda (importante)</p>
          <p className="rule-lead">
            <IconScissors size={18} />
            <span>
              <b>A Fênix ou a equipe Fênix precisa ser o assunto principal do clipe</b>, não o cenário de fundo. Quem assiste
              tem que reconhecer logo de cara que aquilo é sobre a Fênix.
            </span>
          </p>
          <div className="rule-box rule-no">
            <p>
              <IconX size={16} /> <b>Não valem</b>
            </p>
            <ul>
              <li>Foto ou vídeo de caderno, papel ou tablet sem contexto Fênix.</li>
              <li>Memes de estudo genéricos, “aesthetic” de estudo, rotina pessoal estudando.</li>
              <li>Conteúdo em que a Fênix é só pano de fundo.</li>
              <li>
                Clipe que até mostra a Fênix ou alguém da equipe, mas cuja mensagem não gera reconhecimento pra marca. O que
                conta é o que o clipe comunica.
              </li>
            </ul>
          </div>
          <div className="rule-box rule-yes">
            <p>
              <IconCheck size={16} /> <b>Valem</b>
            </p>
            <ul>
              <li>Cortes de aula ou live.</li>
              <li>Momentos da equipe.</li>
              <li>Depoimento ou resultado de aluno Fênix.</li>
              <li>Eventos Fênix e edits que envolvam a Fênix.</li>
              <li>Qualquer coisa que gere autoridade, reconhecimento, interesse ou visibilidade pra marca.</li>
            </ul>
          </div>
          <ul className="rule-list">
            <li>
              <IconClock size={18} />
              <span>
                O clipe precisa ter sido <b>postado no mês da competição</b>. Post antigo não vale (herda views acumuladas) e é
                removido automaticamente. Seu total é a soma das views dos clipes válidos.
              </span>
            </li>
            <li>
              <IconEye size={18} />
              <span>As views são conferidas automaticamente pelas APIs oficiais das redes. Pode levar algumas horas até o número mais recente aparecer aqui.</span>
            </li>
            <li>
              <IconAt size={18} />
              <span>
                Só contam clipes postados nos <b>@ cadastrados e confirmados</b> na sua conta.
              </span>
            </li>
            <li>
              <IconAlert size={18} />
              <span>
                A cada {REMOVALS_PER_WARNING} clipes removidos você leva 1 advertência. Reenviar link removido ou clipe de outra
                pessoa também conta. {WARNINGS_LIMIT} advertências em {WARNING_WINDOW_MONTHS} meses = {SUSPENSION_MONTHS} meses
                fora da competição.
              </span>
            </li>
            <li>
              <IconTrophy size={18} />
              <span>Prêmio pago via Pix até o {PAYOUT_BUSINESS_DAY}º dia útil do mês seguinte, na chave cadastrada.</span>
            </li>
          </ul>
        </div>
      )}
    </Modal>
  );
}
