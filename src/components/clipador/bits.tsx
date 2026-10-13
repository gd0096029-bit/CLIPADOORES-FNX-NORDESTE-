"use client";

import { useEffect, useState } from "react";

/** Foto de perfil redonda; sem foto, mostra as iniciais. */
export function Avatar({ name, src, size = 36, className = "" }: { name: string; src?: string; size?: number; className?: string }) {
  const p = name.trim().split(/\s+/);
  const ini = (p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "");
  return (
    <span className={`avatar-pic ${className}`} style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt="" /> : ini.toUpperCase()}
    </span>
  );
}

/** Contagem regressiva até o fim do mês da competição (YYYY-MM), atualiza a cada 30 s. */
export function Countdown({ month }: { month: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const [y, m] = month.split("-").map(Number);
  const ms = Math.max(0, new Date(y, m, 1).getTime() - now);
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const min = Math.floor((ms % 3_600_000) / 60_000);
  const urgent = ms < 3 * 86_400_000;
  if (ms === 0) return <span className="countdown is-urgent">mês encerrado</span>;
  return (
    <span className={`countdown ${urgent ? "is-urgent" : ""}`} title="Tempo até o fechamento do mês">
      fecha em{" "}
      <b>
        {d > 0 && `${d}d `}
        {String(h).padStart(2, "0")}h {String(min).padStart(2, "0")}min
      </b>
    </span>
  );
}
