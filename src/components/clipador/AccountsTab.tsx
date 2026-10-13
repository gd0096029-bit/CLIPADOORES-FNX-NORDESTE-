"use client";

import { useState } from "react";
import type { Account, PixKey, Platform } from "@/lib/clipador/types";
import { isValidHandle, normalizeHandle, PLATFORM_LABEL, PLATFORMS, profileUrl } from "@/lib/clipador/platforms";
import { IconAt, IconBank, IconCheck, IconClock, IconExternal, IconPlus, IconX, PlatformIcon } from "./icons";

interface Props {
  accounts: Account[];
  pix?: PixKey;
  mode: "demo" | "live";
  onAdd: (a: Account) => void;
  onRemove: (id: string) => void;
  onConnect: (platform: Platform, handle: string) => void;
  onSavePix: (pix: PixKey) => void;
}

const PIX_LABEL: Record<PixKey["type"], string> = {
  cpf: "CPF",
  email: "E-mail",
  telefone: "Telefone",
  aleatoria: "Chave aleatória",
};

export function AccountsTab({ accounts, pix, mode, onAdd, onRemove, onConnect, onSavePix }: Props) {
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);

  function add(e: React.FormEvent) {
    e.preventDefault();
    const h = normalizeHandle(handle);
    if (!isValidHandle(h)) {
      setError("Digite um @ válido (letras, números, ponto, traço ou _).");
      return;
    }
    if (accounts.some((a) => a.platform === platform && a.handle === h)) {
      setError(`@${h} já está cadastrado no ${PLATFORM_LABEL[platform]}.`);
      return;
    }
    onAdd({ id: `a${Date.now()}`, platform, handle: h, connection: "manual", addedAt: new Date().toISOString() });
    setHandle("");
    setError(null);
  }

  function connect(a: Account) {
    if (mode === "live") {
      // login oficial da rede (OAuth). A rota volta pra esta página com a conta confirmada.
      window.location.href = `/api/auth/${a.platform}/start?handle=${encodeURIComponent(a.handle)}`;
      return;
    }
    onConnect(a.platform, a.handle);
  }

  return (
    <div className="stack">
      <div>
        <div className="panel-head">
          <div className="panel-title">
            <span className="panel-icon">
              <IconAt />
            </span>
            <h2>Minhas contas</h2>
          </div>
        </div>
        <p className="panel-desc">
          Cadastre os @ que você usa pra postar os clipes e confirme cada um entrando pela própria rede. A gente nunca vê sua
          senha: o login oficial só confirma que a conta é sua e libera a leitura das views. Só contam clipes postados em
          contas confirmadas.
        </p>

        <ul className="accounts">
          {accounts.map((a) => (
            <li key={a.id} className="account">
              <span className={`plat plat-${a.platform}`}>
                <PlatformIcon platform={a.platform} size={16} />
              </span>
              <div className="account-text">
                <a href={profileUrl(a.platform, a.handle)} target="_blank" rel="noopener noreferrer">
                  <span className="handle">@{a.handle}</span>
                  <IconExternal size={13} />
                </a>
                <span className="clip-meta">{PLATFORM_LABEL[a.platform]}</span>
              </div>
              {a.connection === "oauth" ? (
                <span className="badge badge-no_ar">
                  <IconCheck size={14} />
                  Confirmada
                </span>
              ) : (
                <button type="button" className="btn btn-outline btn-xs" onClick={() => connect(a)} aria-label={`Confirmar @${a.handle} no ${PLATFORM_LABEL[a.platform]}`}>
                  <IconClock size={14} />
                  Confirmar
                </button>
              )}
              <button type="button" className="icon-btn" aria-label={`Remover @${a.handle}`} onClick={() => onRemove(a.id)}>
                <IconX size={16} />
              </button>
            </li>
          ))}
        </ul>

        <form className="inline-form" onSubmit={add} noValidate>
          <label className="select-wrap">
            <span className="sr-only">Rede</span>
            <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)}>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_LABEL[p]}
                </option>
              ))}
            </select>
          </label>
          <label className="grow">
            <span className="sr-only">@ da conta</span>
            <input
              className="input"
              placeholder="@seuusuario"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? "acc-err" : undefined}
            />
          </label>
          <button type="submit" className="btn btn-primary">
            <IconPlus />
            Adicionar
          </button>
        </form>
        {error && (
          <p className="field-error" id="acc-err">
            {error}
          </p>
        )}
      </div>

      <PixForm pix={pix} onSave={onSavePix} />
    </div>
  );
}

function PixForm({ pix, onSave }: { pix?: PixKey; onSave: (p: PixKey) => void }) {
  const [type, setType] = useState<PixKey["type"]>(pix?.type ?? "cpf");
  const [value, setValue] = useState(pix?.value ?? "");
  const [error, setError] = useState<string | null>(null);
  const saved = pix && pix.type === type && pix.value === value.trim();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim();
    const err = validatePix(type, v);
    if (err) return setError(err);
    setError(null);
    onSave({ type, value: v });
  }

  return (
    <div className="subpanel">
      <div className="panel-title">
        <span className="panel-icon tone-green">
          <IconBank />
        </span>
        <h2>
          Chave Pix <span className="muted-inline">· pra receber seus prêmios</span>
        </h2>
      </div>
      <p className="panel-desc">
        É pra essa chave que a equipe manda o prêmio se você ficar entre os premiados (pago até o 5º dia útil do mês
        seguinte). Use uma chave no seu nome.
      </p>
      <form className="inline-form" onSubmit={submit} noValidate>
        <label className="select-wrap">
          <span className="sr-only">Tipo de chave</span>
          <select value={type} onChange={(e) => setType(e.target.value as PixKey["type"])}>
            {(Object.keys(PIX_LABEL) as PixKey["type"][]).map((t) => (
              <option key={t} value={t}>
                {PIX_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="grow">
          <span className="sr-only">Chave Pix</span>
          <input className="input" value={value} onChange={(e) => setValue(e.target.value)} aria-invalid={!!error} />
        </label>
        <button type="submit" className="btn btn-primary" disabled={!!saved}>
          {saved ? "Salva" : "Salvar"}
        </button>
      </form>
      {error ? (
        <p className="field-error">{error}</p>
      ) : (
        pix && (
          <p className="field-ok">
            <IconCheck size={14} /> Chave cadastrada ({PIX_LABEL[pix.type]})
          </p>
        )
      )}
    </div>
  );
}

function validatePix(type: PixKey["type"], v: string): string | null {
  if (!v) return "Digite a chave.";
  const digits = v.replace(/\D/g, "");
  if (type === "cpf" && digits.length !== 11) return "CPF precisa ter 11 números.";
  if (type === "telefone" && (digits.length < 10 || digits.length > 13)) return "Telefone com DDD, ex.: (81) 99999-9999.";
  if (type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "E-mail inválido.";
  if (type === "aleatoria" && !/^[0-9a-f-]{32,36}$/i.test(v)) return "Chave aleatória inválida.";
  return null;
}
