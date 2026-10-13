"use client";

import { useState } from "react";
import type { PixKey } from "@/lib/clipador/types";
import { IconBank, IconLock, IconMail, IconPhone, IconUser } from "./icons";
import { PixForm } from "./AccountsTab";
import { Modal } from "./Modal";
import { isEmail, maskPhone, PasswordField, passwordError, TextField } from "./fields";

interface Props {
  name: string;
  email?: string;
  phone?: string;
  pix?: PixKey;
  onSavePix: (pix: PixKey) => void;
  /** aba que abre primeiro */
  initialSection?: "dados" | "senha" | "pix";
  onClose: () => void;
  onSaved: (message: string) => void;
}

export function AccountModal({ name: n0, email: e0 = "", phone: p0 = "", pix, onSavePix, initialSection = "dados", onClose, onSaved }: Props) {
  const [section, setSection] = useState<"dados" | "senha" | "pix">(initialSection);
  const [name, setName] = useState(n0);
  const [email, setEmail] = useState(e0);
  const [phone, setPhone] = useState(p0);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string | null> = {};
    if (section === "dados") {
      if (name.trim().split(/\s+/).length < 2) errs.name = "Digite nome e sobrenome.";
      if (!isEmail(email)) errs.email = "E-mail inválido.";
      if (phone.replace(/\D/g, "").length < 10) errs.phone = "WhatsApp com DDD.";
    } else {
      if (!current) errs.current = "Digite sua senha atual.";
      errs.next = passwordError(next);
      if (confirm !== next) errs.confirm = "As senhas não são iguais.";
    }
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setSaving(true);
    // DEMO: simula o tempo de salvar
    setTimeout(() => onSaved(section === "dados" ? "Dados atualizados." : "Senha alterada."), 600);
  }

  return (
    <Modal
      title="Minha conta"
      icon={<IconUser />}
      onClose={onClose}
      footer={
        section === "pix" ? (
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Fechar
          </button>
        ) : (
          <>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" form="account-form" className="btn btn-primary" disabled={saving}>
              {saving ? "Salvando…" : "Salvar"}
            </button>
          </>
        )
      }
    >
      <div className="seg" role="tablist" aria-label="Seções da conta">
        <button type="button" role="tab" aria-selected={section === "dados"} className={section === "dados" ? "is-active" : ""} onClick={() => setSection("dados")}>
          <IconUser size={16} />
          Meus dados
        </button>
        <button type="button" role="tab" aria-selected={section === "senha"} className={section === "senha" ? "is-active" : ""} onClick={() => setSection("senha")}>
          <IconLock size={16} />
          Senha
        </button>
        <button type="button" role="tab" aria-selected={section === "pix"} className={section === "pix" ? "is-active" : ""} onClick={() => setSection("pix")}>
          <IconBank size={16} />
          Chave Pix
        </button>
      </div>
      {section === "pix" && <PixForm pix={pix} onSave={onSavePix} bare />}
      {section !== "pix" && (
      <form id="account-form" className="form" onSubmit={submit} noValidate>
        {section === "dados" ? (
          <>
            <TextField label="Nome completo" value={name} onChange={setName} error={errors.name} autoComplete="name" icon={<IconUser size={18} />} hint="É o nome que aparece no ranking." />
            <TextField label="E-mail" type="email" value={email} onChange={setEmail} error={errors.email} autoComplete="email" icon={<IconMail size={18} />} />
            <TextField
              label="WhatsApp"
              value={phone}
              onChange={(v) => setPhone(maskPhone(v))}
              error={errors.phone}
              inputMode="tel"
              autoComplete="tel"
              icon={<IconPhone size={18} />}
              hint="A equipe usa pra avisar sobre prêmios e advertências."
            />
          </>
        ) : (
          <>
            <PasswordField label="Senha atual" value={current} onChange={setCurrent} error={errors.current} autoComplete="current-password" icon={<IconLock size={18} />} />
            <PasswordField label="Nova senha" value={next} onChange={setNext} error={errors.next} autoComplete="new-password" icon={<IconLock size={18} />} hint="Pelo menos 8 caracteres, com letras e números." />
            <PasswordField label="Confirme a nova senha" value={confirm} onChange={setConfirm} error={errors.confirm} autoComplete="new-password" icon={<IconLock size={18} />} />
          </>
        )}
      </form>
      )}
    </Modal>
  );
}
