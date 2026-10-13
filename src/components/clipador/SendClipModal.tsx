"use client";

import { useMemo, useState } from "react";
import type { Account, Clip } from "@/lib/clipador/types";
import { parseClipUrl, PLATFORM_LABEL } from "@/lib/clipador/platforms";
import { IconAlert, IconCheck, IconInfo, IconScissors, IconSend, PlatformIcon } from "./icons";
import { Modal } from "./Modal";

interface Props {
  clips: Clip[];
  accounts: Account[];
  onClose: () => void;
  onSubmit: (clip: Clip) => void;
  onGoToAccounts: () => void;
}

type Check = { level: "ok" | "info" | "warn" | "block"; text: string; action?: "accounts" };

export function SendClipModal({ clips, accounts, onClose, onSubmit, onGoToAccounts }: Props) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [touched, setTouched] = useState(false);

  const parsed = useMemo(() => (url.trim() ? parseClipUrl(url) : null), [url]);

  const checks: Check[] = useMemo(() => {
    if (!parsed) return [];
    if (!parsed.ok) return [{ level: "block", text: parsed.error }];
    const out: Check[] = [];
    const same = clips.find((c) => sameClip(c.url, parsed.canonicalUrl));
    if (same?.status === "removido") {
      out.push({ level: "block", text: "Esse clipe já foi removido pela equipe. Reenviar um link removido gera advertência." });
      return out;
    }
    if (same) {
      out.push({ level: "block", text: "Você já enviou esse clipe." });
      return out;
    }
    const mine = accounts.filter((a) => a.platform === parsed.platform);
    if (parsed.handle) {
      const acc = mine.find((a) => a.handle === parsed.handle);
      if (!acc) {
        out.push({
          level: "block",
          text: `@${parsed.handle} não está nas suas contas. Cadastre e confirme o @ antes de enviar.`,
          action: "accounts",
        });
        return out;
      }
      if (acc.connection === "manual") {
        out.push({ level: "warn", text: `@${acc.handle} ainda não foi confirmada. O clipe só conta depois que você confirmar a conta.`, action: "accounts" });
      } else {
        out.push({ level: "ok", text: `Postado em @${acc.handle}, conta confirmada.` });
      }
    } else if (mine.length === 0) {
      out.push({ level: "block", text: `Você não tem conta do ${PLATFORM_LABEL[parsed.platform]} cadastrada.`, action: "accounts" });
      return out;
    } else {
      out.push({ level: "info", text: "Vamos conferir de qual @ é o clipe na primeira leitura de views." });
    }
    return out;
  }, [parsed, clips, accounts]);

  const blocked = !parsed || !parsed.ok || checks.some((c) => c.level === "block");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (blocked || !parsed || !parsed.ok) return;
    onSubmit({
      id: `c${Date.now()}`,
      platform: parsed.platform,
      url: parsed.canonicalUrl,
      handle: parsed.handle,
      title: title.trim() || undefined,
      submittedAt: new Date().toISOString(),
      views: 0,
      viewsToday: 0,
      status: "verificando",
    });
  }

  return (
    <Modal
      title="Enviar clipe"
      icon={<IconScissors />}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="send-clip" className="btn btn-primary" disabled={touched && blocked}>
            <IconSend />
            Enviar
          </button>
        </>
      }
    >
      <form id="send-clip" onSubmit={submit} noValidate className="form">
        <p className="panel-desc">Cole o link público do clipe. Aceitamos TikTok, Instagram e YouTube. Todo clipe válido já conta pras suas views do mês.</p>

        <label className="field">
          <span className="field-label">Link do clipe</span>
          <span className="input-icon">
            {parsed?.ok ? <PlatformIcon platform={parsed.platform} size={18} /> : null}
            <input
              className="input"
              type="url"
              inputMode="url"
              autoComplete="off"
              placeholder="https://www.tiktok.com/@voce/video/…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => setTouched(true)}
              aria-invalid={touched && blocked}
              aria-describedby="clip-checks"
            />
          </span>
        </label>

        <ul className="checks" id="clip-checks" aria-live="polite">
          {(touched || parsed?.ok) &&
            checks.map((c, i) => (
              <li key={i} className={`check check-${c.level}`}>
                {c.level === "ok" ? <IconCheck size={16} /> : c.level === "info" ? <IconInfo size={16} /> : <IconAlert size={16} />}
                <span>
                  {c.text}
                  {c.action === "accounts" && (
                    <>
                      {" "}
                      <button type="button" className="link" onClick={onGoToAccounts}>
                        Ir pra Minhas contas
                      </button>
                    </>
                  )}
                </span>
              </li>
            ))}
        </ul>

        <label className="field">
          <span className="field-label">
            Título <span className="muted-inline">(opcional)</span>
          </span>
          <input
            className="input"
            placeholder="Ex.: Corte da aula de Matemática — dica do professor"
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <p className="consent">
          <IconInfo size={15} />
          <span>
            Ao enviar, você autoriza a Fênix a <b>repostar e reutilizar</b> este clipe nos canais e materiais da marca.
          </span>
        </p>
      </form>
    </Modal>
  );
}

function sameClip(a: string, b: string) {
  const pa = parseClipUrl(a);
  const pb = parseClipUrl(b);
  if (pa.ok && pb.ok && pa.videoId && pb.videoId) return pa.platform === pb.platform && pa.videoId === pb.videoId;
  return a.replace(/\/$/, "") === b.replace(/\/$/, "");
}
