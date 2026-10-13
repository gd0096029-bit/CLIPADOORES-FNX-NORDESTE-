"use client";

import { useState } from "react";
import { PRIZES } from "@/lib/clipador/rules";
import { fmtBRLShort } from "@/lib/clipador/format";
import { FenixMark, IconCheck, IconEye, IconLock, IconMail, IconPhone, IconScissors, IconTrophy, IconUser } from "./icons";
import { isEmail, maskPhone, PasswordField, passwordError, TextField } from "./fields";
import { RulesModal } from "./RulesModal";

type Mode = "login" | "cadastro" | "recuperar";

/**
 * Telas de acesso (entrar, criar conta, recuperar senha).
 * MODO DEMO: valida os campos e leva pra área certa, sem falar com nenhum servidor.
 * Quando o Supabase entrar, troque os `setTimeout` pelas chamadas do Supabase Auth.
 */
export function AuthScreen({ mode }: { mode: Mode }) {
  const total = PRIZES.reduce((a, b) => a + b, 0);
  return (
    <div className="auth">
      <aside className="auth-hero">
        <a className="brand brand-light" href="/login">
          <FenixMark />
          <span>
            Fênix <span className="brand-sep">·</span> Clipadores
          </span>
        </a>
        <div className="auth-hero-body">
          <h1>Transforme seus cortes da Fênix em prêmio.</h1>
          <p>Poste clipes, envie o link e acompanhe suas views. Todo mês os {PRIZES.length} melhores dividem {fmtBRLShort(total)} via Pix.</p>
          <ul className="auth-points">
            <li>
              <IconScissors size={18} /> Envie o link do clipe, sem aprovação prévia
            </li>
            <li>
              <IconEye size={18} /> Views conferidas automaticamente todo dia
            </li>
            <li>
              <IconTrophy size={18} /> 1º lugar leva {fmtBRLShort(PRIZES[0])}
            </li>
          </ul>
        </div>
        <p className="auth-hero-foot">TikTok · Instagram · YouTube</p>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          {mode === "login" && <LoginForm />}
          {mode === "cadastro" && <SignupForm />}
          {mode === "recuperar" && <RecoverForm />}
        </div>
        <p className="auth-demo">Modo demonstração: qualquer e-mail e senha válidos entram.</p>
      </main>
    </div>
  );
}

function LoginForm() {
  const [area, setArea] = useState<"clipador" | "equipe">("clipador");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = { email: isEmail(email) ? null : "Digite um e-mail válido.", password: password ? null : "Digite sua senha." };
    setErrors(errs);
    if (errs.email || errs.password) return;
    setLoading(true);
    setTimeout(() => (window.location.href = area === "clipador" ? "/clipador" : "/admin"), 700);
  }

  return (
    <form onSubmit={submit} noValidate className="form">
      <h2 className="auth-title">Entrar</h2>
      <p className="auth-sub">Bem-vindo de volta! Entre pra ver seus clipes e o ranking.</p>
      <div className="seg" role="radiogroup" aria-label="Tipo de acesso">
        <button type="button" role="radio" aria-checked={area === "clipador"} className={area === "clipador" ? "is-active" : ""} onClick={() => setArea("clipador")}>
          <IconScissors size={16} /> Sou clipador
        </button>
        <button type="button" role="radio" aria-checked={area === "equipe"} className={area === "equipe" ? "is-active" : ""} onClick={() => setArea("equipe")}>
          <IconUser size={16} /> Sou da equipe
        </button>
      </div>
      <TextField label="E-mail" type="email" value={email} onChange={setEmail} error={errors.email} autoComplete="email" placeholder="voce@email.com" icon={<IconMail size={18} />} />
      <PasswordField label="Senha" value={password} onChange={setPassword} error={errors.password} autoComplete="current-password" icon={<IconLock size={18} />} />
      <div className="auth-row">
        <label className="check-label">
          <input type="checkbox" defaultChecked /> Manter conectado
        </label>
        <a href="/recuperar-senha" className="link">
          Esqueci a senha
        </a>
      </div>
      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? "Entrando…" : "Entrar"}
      </button>
      <p className="auth-switch">
        Ainda não é clipador?{" "}
        <a href="/cadastro" className="link">
          Criar conta
        </a>
      </p>
    </form>
  );
}

function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accept, setAccept] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [rules, setRules] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string | null> = {
      name: name.trim().split(/\s+/).length >= 2 ? null : "Digite nome e sobrenome.",
      email: isEmail(email) ? null : "Digite um e-mail válido.",
      phone: phone.replace(/\D/g, "").length >= 10 ? null : "WhatsApp com DDD.",
      password: passwordError(password),
      confirm: confirm === password ? null : "As senhas não são iguais.",
      accept: accept ? null : "Você precisa aceitar as regras pra participar.",
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 800);
  }

  if (done) {
    return (
      <div className="auth-done">
        <span className="auth-done-icon">
          <IconCheck size={28} />
        </span>
        <h2 className="auth-title">Conta criada!</h2>
        <p className="auth-sub">
          Mandamos um link de confirmação pra <b>{email}</b>. Depois de confirmar, cadastre seus @ e envie o primeiro clipe.
        </p>
        <a className="btn btn-primary btn-block" href="/clipador">
          Ir pra minha área
        </a>
      </div>
    );
  }

  return (
    <>
    <form onSubmit={submit} noValidate className="form">
      <h2 className="auth-title">Criar conta de clipador</h2>
      <p className="auth-sub">Leva 1 minuto. Depois é só cadastrar seus @ e começar a enviar clipes.</p>
      <TextField label="Nome completo" value={name} onChange={setName} error={errors.name} autoComplete="name" icon={<IconUser size={18} />} hint="Aparece no ranking." />
      <TextField label="E-mail" type="email" value={email} onChange={setEmail} error={errors.email} autoComplete="email" placeholder="voce@email.com" icon={<IconMail size={18} />} />
      <TextField label="WhatsApp" value={phone} onChange={(v) => setPhone(maskPhone(v))} error={errors.phone} inputMode="tel" autoComplete="tel" placeholder="(81) 99999-9999" icon={<IconPhone size={18} />} />
      <div className="two">
        <PasswordField label="Senha" value={password} onChange={setPassword} error={errors.password} autoComplete="new-password" icon={<IconLock size={18} />} />
        <PasswordField label="Confirme a senha" value={confirm} onChange={setConfirm} error={errors.confirm} autoComplete="new-password" icon={<IconLock size={18} />} />
      </div>
      <label className="check-label accept">
        <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} aria-invalid={!!errors.accept} />
        <span>
          Li e aceito as{" "}
          <button type="button" className="link" onClick={() => setRules(true)}>
            regras da competição
          </button>{" "}
          e autorizo a Fênix a repostar meus clipes.
        </span>
      </label>
      {errors.accept && <p className="field-error">{errors.accept}</p>}
      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? "Criando conta…" : "Criar conta"}
      </button>
      <p className="auth-switch">
        Já tem conta?{" "}
        <a href="/login" className="link">
          Entrar
        </a>
      </p>
    </form>
    {rules && <RulesModal onClose={() => setRules(false)} />}
    </>
  );
}

function RecoverForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isEmail(email)) return setError("Digite um e-mail válido.");
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 700);
  }

  if (sent) {
    return (
      <div className="auth-done">
        <span className="auth-done-icon">
          <IconMail size={26} />
        </span>
        <h2 className="auth-title">Confira seu e-mail</h2>
        <p className="auth-sub">
          Se <b>{email}</b> tiver conta, você vai receber um link pra criar uma senha nova. Olhe também o spam.
        </p>
        <a className="btn btn-outline btn-block" href="/login">
          Voltar pra entrar
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="form">
      <h2 className="auth-title">Recuperar senha</h2>
      <p className="auth-sub">Digite o e-mail da sua conta que a gente manda um link pra você criar uma senha nova.</p>
      <TextField label="E-mail" type="email" value={email} onChange={setEmail} error={error} autoComplete="email" placeholder="voce@email.com" icon={<IconMail size={18} />} />
      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? "Enviando…" : "Enviar link"}
      </button>
      <p className="auth-switch">
        Lembrou?{" "}
        <a href="/login" className="link">
          Entrar
        </a>
      </p>
    </form>
  );
}
