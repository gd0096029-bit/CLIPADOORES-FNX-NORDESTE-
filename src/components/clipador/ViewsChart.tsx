"use client";

import { useState } from "react";
import type { DailyViews } from "@/lib/clipador/types";
import { fmtCompact, fmtInt } from "@/lib/clipador/format";

/** Barras de views por dia do mês. Uma série só, com tooltip ao passar o mouse/tocar. */
export function ViewsChart({ data, month }: { data: DailyViews[]; month: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();

  const W = 960;
  const H = 170;
  const padL = 40;
  const padB = 22;
  const padT = 8;
  const plotW = W - padL;
  const plotH = H - padB - padT;
  const max = Math.max(1, ...data.map((d) => d.views));
  const nice = niceMax(max);
  const slot = plotW / daysInMonth;
  const barW = Math.max(3, slot - 2); // 2px de respiro entre as barras
  const ticks = [0, nice / 2, nice];

  const byDay = new Map(data.map((d) => [Number(d.date.slice(8, 10)), d.views]));
  const total = data.reduce((s, d) => s + d.views, 0);
  const best = data.reduce((b, d) => (d.views > b.views ? d : b), data[0] ?? { date: "", views: 0 });

  return (
    <figure className="chart">
      <figcaption className="chart-head">
        <span className="chart-title">Suas views por dia</span>
        <span className="chart-sub">
          {fmtInt(total)} no mês{best?.views ? ` · melhor dia: ${best.date.slice(8, 10)}/${best.date.slice(5, 7)}` : ""}
        </span>
      </figcaption>
      <div className="chart-box">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Views por dia em ${month}. Total ${fmtInt(total)}.`}>
          {ticks.map((t) => {
            const yy = padT + plotH - (t / nice) * plotH;
            return (
              <g key={t}>
                <line x1={padL} x2={W} y1={yy} y2={yy} className="chart-grid" />
                <text x={padL - 8} y={yy + 4} textAnchor="end" className="chart-axis">
                  {fmtCompact(t)}
                </text>
              </g>
            );
          })}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const v = byDay.get(day);
            const x = padL + i * slot + 1;
            const h = v ? Math.max(2, (v / nice) * plotH) : 0;
            const yy = padT + plotH - h;
            return (
              <g key={day}>
                {v !== undefined && (
                  <path d={roundedTopBar(x, yy, barW, h, Math.min(4, barW / 2))} className={`chart-bar ${hover === day ? "is-hover" : ""}`} />
                )}
                {(day === 1 || day % 5 === 0) && (
                  <text x={x + barW / 2} y={H - 6} textAnchor="middle" className="chart-axis">
                    {day}
                  </text>
                )}
                {/* área de toque maior que a barra */}
                <rect
                  x={padL + i * slot}
                  y={padT}
                  width={slot}
                  height={plotH}
                  fill="transparent"
                  onMouseEnter={() => setHover(day)}
                  onMouseLeave={() => setHover(null)}
                  onTouchStart={() => setHover(day)}
                />
              </g>
            );
          })}
        </svg>
        {hover !== null && byDay.has(hover) && (
          <div className="chart-tip" style={{ left: `${((padL + (hover - 0.5) * slot) / W) * 100}%` }}>
            <b>{fmtInt(byDay.get(hover) ?? 0)}</b> views
            <span>
              {String(hover).padStart(2, "0")}/{String(m).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>
    </figure>
  );
}

function niceMax(v: number) {
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / exp;
  const n = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return n * exp;
}

function roundedTopBar(x: number, y: number, w: number, h: number, r: number) {
  if (h <= r) return `M${x},${y + h}h${w}v${-h}h${-w}Z`;
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}
