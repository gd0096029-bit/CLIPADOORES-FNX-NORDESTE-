"use client";

import { useMemo, useState } from "react";
import type { Clip, ClipStatus, DailyViews, Platform } from "@/lib/clipador/types";
import { PLATFORM_LABEL, PLATFORMS } from "@/lib/clipador/platforms";
import { fmtDateTime, fmtInt } from "@/lib/clipador/format";
import { IconClock, IconEye, IconExternal, IconPlus, IconScissors, IconSearch, IconTrash, PlatformIcon } from "./icons";
import { ViewsChart } from "./ViewsChart";

const PAGE = 15;

type Sort = "recentes" | "views";
type StatusFilter = "todos" | ClipStatus;

const STATUS_LABEL: Record<ClipStatus, string> = {
  no_ar: "No ar",
  verificando: "Lendo views",
  removido: "Removido",
};

interface Props {
  clips: Clip[];
  dailyViews: DailyViews[];
  month: string;
  onDelete: (id: string) => void;
  onSend: () => void;
}

export function ClipsTab({ clips, dailyViews, month, onDelete, onSend }: Props) {
  const [platform, setPlatform] = useState<"todas" | Platform>("todas");
  const [status, setStatus] = useState<StatusFilter>("todos");
  const [sort, setSort] = useState<Sort>("recentes");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { todas: clips.length };
    for (const p of PLATFORMS) c[p] = clips.filter((x) => x.platform === p).length;
    return c;
  }, [clips]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return clips
      .filter((c) => platform === "todas" || c.platform === platform)
      .filter((c) => status === "todos" || c.status === status)
      .filter((c) => !term || `${c.title ?? ""} ${c.handle ?? ""} ${c.url}`.toLowerCase().includes(term))
      .sort((a, b) => (sort === "views" ? b.views - a.views : b.submittedAt.localeCompare(a.submittedAt)));
  }, [clips, platform, status, sort, q]);

  const visible = filtered.slice(0, limit);

  return (
    <div>
      <div className="panel-head">
        <div className="panel-title">
          <span className="panel-icon">
            <IconScissors />
          </span>
          <h2>Meus clipes</h2>
        </div>
      </div>

      <ViewsChart data={dailyViews} month={month} />

      <div className="filters">
        <div className="chips" role="group" aria-label="Filtrar por rede">
          {(["todas", ...PLATFORMS] as const).map((p) => (
            <button
              key={p}
              type="button"
              className={`chip ${platform === p ? "is-active" : ""}`}
              aria-pressed={platform === p}
              onClick={() => {
                setPlatform(p);
                setLimit(PAGE);
              }}
            >
              {p !== "todas" && <PlatformIcon platform={p} size={16} />}
              {p === "todas" ? "Todas" : PLATFORM_LABEL[p]}
              <span className="count">{fmtInt(counts[p] ?? 0)}</span>
            </button>
          ))}
        </div>
        <div className="filter-tools">
          <label className="search">
            <IconSearch size={16} />
            <span className="sr-only">Buscar clipe</span>
            <input type="search" placeholder="Buscar por título, @ ou link" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <label className="select-wrap">
            <span className="sr-only">Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
              <option value="todos">Todos os status</option>
              <option value="no_ar">No ar</option>
              <option value="verificando">Lendo views</option>
              <option value="removido">Removidos</option>
            </select>
          </label>
          <label className="select-wrap">
            <span className="sr-only">Ordenar</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="recentes">Mais recentes</option>
              <option value="views">Mais views</option>
            </select>
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <p>{clips.length === 0 ? "Você ainda não enviou clipes este mês." : "Nenhum clipe com esses filtros."}</p>
          {clips.length === 0 && (
            <button type="button" className="btn btn-primary" onClick={onSend}>
              <IconPlus />
              Enviar primeiro clipe
            </button>
          )}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="clips">
            <thead>
              <tr>
                <th scope="col">Clipe</th>
                <th scope="col">Enviado em</th>
                <th scope="col" className="num">
                  Views
                </th>
                <th scope="col">Status</th>
                <th scope="col">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr key={c.id} className={c.status === "removido" ? "is-removed" : ""}>
                  <td>
                    <div className="clip-cell">
                      <span className={`plat plat-${c.platform}`}>
                        <PlatformIcon platform={c.platform} size={16} />
                      </span>
                      <div className="clip-text">
                        <a href={c.url} target="_blank" rel="noopener noreferrer" className="clip-title">
                          {c.title ?? `Clipe no ${PLATFORM_LABEL[c.platform]}`}
                        </a>
                        <span className="clip-meta">
                          {c.handle ? `@${c.handle} · ` : ""}
                          {PLATFORM_LABEL[c.platform]}
                          {c.removalReason ? ` · ${c.removalReason}` : ""}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="nowrap muted" data-label="Enviado em">
                    {fmtDateTime(c.submittedAt)}
                  </td>
                  <td className="num" data-label="Views">
                    <span className="views">
                      <IconEye size={14} className="only-sm" />
                      {c.status === "verificando" ? "—" : fmtInt(c.views)}
                    </span>
                    {c.viewsToday > 0 && c.status === "no_ar" && <span className="delta">+{fmtInt(c.viewsToday)}</span>}
                  </td>
                  <td data-label="Status">
                    <span className={`badge badge-${c.status}`}>
                      {c.status === "no_ar" ? <IconEye size={14} /> : c.status === "verificando" ? <IconClock size={14} /> : null}
                      {STATUS_LABEL[c.status]}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div className="actions">
                    <a className="icon-btn" href={c.url} target="_blank" rel="noopener noreferrer" aria-label="Abrir clipe">
                      <IconExternal size={16} />
                    </a>
                    {confirmId === c.id ? (
                      <span className="confirm">
                        <button
                          type="button"
                          className="btn btn-danger btn-xs"
                          onClick={() => {
                            onDelete(c.id);
                            setConfirmId(null);
                          }}
                        >
                          Excluir
                        </button>
                        <button type="button" className="btn btn-ghost btn-xs" onClick={() => setConfirmId(null)}>
                          Cancelar
                        </button>
                      </span>
                    ) : (
                      <button type="button" className="icon-btn" aria-label="Excluir clipe" onClick={() => setConfirmId(c.id)}>
                        <IconTrash size={16} />
                      </button>
                    )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > limit && (
        <div className="more">
          <button type="button" className="btn btn-outline" onClick={() => setLimit((l) => l + PAGE)}>
            Mostrar mais ({fmtInt(filtered.length - limit)})
          </button>
        </div>
      )}
    </div>
  );
}
