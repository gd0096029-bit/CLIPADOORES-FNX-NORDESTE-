"use client";

import { useId, useState } from "react";
import { IconEye, IconEyeOff } from "./icons";

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  hint?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function TextField({ label, value, onChange, error, hint, type = "text", placeholder, autoComplete, inputMode, icon, disabled }: FieldProps) {
  const id = useId();
  const msgId = `${id}-msg`;
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <span className={`input-icon ${icon ? "" : "no-icon"}`}>
        {icon}
        <input
          id={id}
          className="input"
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error || hint ? msgId : undefined}
        />
      </span>
      {error ? (
        <p className="field-error" id={msgId}>
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint" id={msgId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function PasswordField(props: Omit<FieldProps, "type">) {
  const [show, setShow] = useState(false);
  const id = useId();
  const msgId = `${id}-msg`;
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {props.label}
      </label>
      <span className={`input-icon has-action ${props.icon ? "" : "no-icon"}`}>
        {props.icon}
        <input
          id={id}
          className="input"
          type={show ? "text" : "password"}
          value={props.value}
          placeholder={props.placeholder}
          autoComplete={props.autoComplete}
          onChange={(e) => props.onChange(e.target.value)}
          aria-invalid={!!props.error}
          aria-describedby={props.error || props.hint ? msgId : undefined}
        />
        <button type="button" className="input-action" onClick={() => setShow((s) => !s)} aria-label={show ? "Esconder senha" : "Mostrar senha"}>
          {show ? <IconEyeOff size={18} /> : <IconEye size={18} />}
        </button>
      </span>
      {props.error ? (
        <p className="field-error" id={msgId}>
          {props.error}
        </p>
      ) : props.hint ? (
        <p className="field-hint" id={msgId}>
          {props.hint}
        </p>
      ) : null}
    </div>
  );
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/** (81) 99999-0000 */
export function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function passwordError(v: string): string | null {
  if (v.length < 8) return "Use pelo menos 8 caracteres.";
  if (!/[a-zA-Z]/.test(v) || !/\d/.test(v)) return "Misture letras e números.";
  return null;
}
