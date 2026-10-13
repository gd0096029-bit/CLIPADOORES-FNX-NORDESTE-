"use client";

import {
  BURNS_ACCOUNT,
  COMPETITION_RULES,
  EXAMPLES,
  GOLDEN_RULES,
  HEAD_WHATSAPP,
  STEPS,
  WARMUP,
} from "@/lib/clipador/manual";
import { IconAlert, IconBook, IconPhone } from "./icons";

const SECTIONS = [
  { id: "aquecer", label: "Aquecer conta" },
  { id: "passos", label: "Passo a passo" },
  { id: "exemplos", label: "Exemplos" },
  { id: "regras", label: "Regras" },
];

/** Aba "Manual": o conteúdo do QG dos Clipadores dentro do site. */
export function ManualTab({ onOpenRules, onOpenTerms }: { onOpenRules: () => void; onOpenTerms: () => void }) {
  function jump(id: string) {
    document.getElementById(`manual-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="manual">
      <header className="manual-hero">
        <p className="eyebrow">Time de clipadores · Fênix PM</p>
        <h2 className="manual-title">
          Corta. Posta. <span className="gold">Converte.</span>
        </h2>
        <p className="manual-lead">Tudo que o clipador da Fênix precisa num lugar só: como aquecer a conta, o passo a passo do corte e as regras da competição.</p>
        <p className="manual-mission">A missão: o clipe dá o gostinho, o curso entrega o resto.</p>
        <nav className="manual-nav" aria-label="Seções do manual">
          {SECTIONS.map((s) => (
            <button key={s.id} type="button" className="chip chip-sm" onClick={() => jump(s.id)}>
              {s.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="manual-head-contact">
        <span className="eyebrow">Dúvida? Chama o head</span>
        {HEAD_WHATSAPP ? (
          <a className="btn btn-primary btn-sm" href={HEAD_WHATSAPP} target="_blank" rel="noopener noreferrer">
            <IconPhone size={16} /> WhatsApp do head
          </a>
        ) : (
          <span className="placeholder">[WHATSAPP DO HEAD]</span>
        )}
      </div>

      {/* ---------- aquecer ---------- */}
      <section id="manual-aquecer" className="manual-section">
        <p className="eyebrow">Passo 0</p>
        <h3 className="manual-h">Aquecer a conta</h3>
        <p className="manual-p">Conta nova não posta no primeiro dia. Primeiro o TikTok precisa entender que tem gente de verdade ali e que ela curte concurso de PM.</p>
        <div className="manual-grid">
          {WARMUP.map((w) => (
            <article key={w.when} className="manual-card">
              <span className="manual-kicker">{w.when}</span>
              <strong>{w.title}</strong>
              <p>{w.text}</p>
            </article>
          ))}
        </div>
        <div className="manual-danger">
          <strong>O que queima a conta:</strong> {BURNS_ACCOUNT}
        </div>
      </section>

      {/* ---------- passo a passo ---------- */}
      <section id="manual-passos" className="manual-section">
        <p className="eyebrow">Passo a passo</p>
        <h3 className="manual-h">Do corte à venda</h3>
        <ol className="manual-steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="manual-card manual-step">
              <span className="manual-num">{i + 1}</span>
              <div>
                <strong>{s.title}</strong>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- exemplos ---------- */}
      <section id="manual-exemplos" className="manual-section">
        <p className="eyebrow">Exemplos de conta</p>
        <h3 className="manual-h">Contas que tão funcionando</h3>
        <p className="manual-p">Olha o perfil, repara no que se repete nos vídeos que mais bombaram e aplica nos teus clipes.</p>
        <div className="examples">
          {EXAMPLES.map((ex) => (
            <article key={ex.handle} className="example">
              <div className="example-head">
                <h4>
                  {ex.label} <span className="gold">{ex.handle}</span>
                </h4>
                <span className="muted">{ex.range}</span>
              </div>
              {ex.note && <p className="manual-p">{ex.note}</p>}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ex.image} alt={ex.imageAlt} className="example-img" loading="lazy" />
              <strong className="example-sub">O que essa conta faz bem</strong>
              <div className="manual-grid manual-grid-wide">
                {ex.tips.map((t) => (
                  <div key={t.title} className="manual-card">
                    <strong className="gold">{t.title}</strong>
                    <p>{t.text}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- regras ---------- */}
      <section id="manual-regras" className="manual-section">
        <p className="eyebrow">Letra miúda (importante)</p>
        <h3 className="manual-h">Regras da competição</h3>
        <p className="manual-big">
          <strong>
            A Fênix ou a Equipe Fênix precisa ser o <span className="gold">assunto principal</span> do clipe, não o cenário de fundo.
          </strong>{" "}
          <span className="muted">Quem assiste tem que reconhecer logo de cara que é sobre a Fênix. Se a marca aparece só de passagem, o clipe não vale.</span>
        </p>
        <div className="manual-danger">
          <strong>Não vale:</strong> foto ou vídeo de caderno, papel ou tablet sem contexto Fênix; meme de estudo genérico; "aesthetic" de estudo; rotina pessoal estudando; qualquer conteúdo em que a Fênix é só pano de fundo.
        </div>
        <div className="manual-danger">
          <strong>Também não vale:</strong> clipe que até usa a Fênix ou alguém da equipe, mas cuja mensagem principal não traz reconhecimento pra marca nem pra equipe. O que conta é o que o clipe comunica, não só quem aparece nele.
        </div>
        <ul className="diamond-list">
          {COMPETITION_RULES.map((r) => (
            <li key={r.title}>
              <span className="diamond" aria-hidden="true" />
              <span>
                <strong>{r.title}</strong> <span className="muted">{r.text}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="manual-btns">
          <button type="button" className="btn btn-outline btn-sm" onClick={onOpenRules}>
            <IconBook size={16} /> Ver resumo das regras e prêmios
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={onOpenTerms}>
            <IconBook size={16} /> Ler os Termos de participação
          </button>
        </div>
      </section>

      <section className="manual-golden">
        <h3 className="manual-h">Regras de ouro do time</h3>
        <ol>
          {GOLDEN_RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
        <p className="manual-foot">
          <IconAlert size={15} /> Uso interno do time.
        </p>
      </section>
    </div>
  );
}
