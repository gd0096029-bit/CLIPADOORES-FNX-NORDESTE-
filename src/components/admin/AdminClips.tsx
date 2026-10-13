"use client";

import { useMemo, useState } from "react";
import type { AdminClip, AdminClipper } from "@/lib/clipador/admin-demo-data";
import type { ClipStatus, Platform } from "@/lib/clipador/types";
import { PLATFORM_LABEL, PLATFORMS } from "@/lib/clipador/platforms";
import { fmtDateTime, fmtInt } from "@/lib/clipador/format";
import { IconClock, IconExternal, IconEye, IconScissors, IconSearch, IconTrash, IconUndo, PlatformIcon } from "@/components/clipador/icons";
import type { AdminAction } from "./AdminApp";
import { RemoveClipModal } from "./AdminModals";

const PAGE = 20;
const STATUS_LABEL: Record<ClipStatus, string> = { no_ar: "No ar", verificando: "Lendo views", removido: "Removido" };

interface Props {
  clips: AdminClip[];
  clippers: AdminClipper[];
  onAction: (a: AdminAction, message?: string) => void;
}

export function AdminClips({ clips, clippers, onAction }: Props) {
  const [platform, setPlatform] = useState<"todas" | Platform>("todas");
  const [status, setStatus] = useState<"todos" | ClipStatus>("todos");
  const [clipper, setClipper] = useState("todos");
  const [sort, setSort] = useState<"recentes" | "views">("recentes");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [removing, setRemoving] = useState<AdminClip | null>(null);

  const names = useMemo(() => new Map(clippers.map((c) => [c.id, c])), [clippers]);
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
      .filter((c) => clipper === "todos" || c.clipperId === clipper)
      .filter((c) => !term || `${c.title ?? ""} ${c.handle ?? ""} ${c.url} ${names.get(c.clipperId)?.name ?? ""}`.toLowerCase().includes(term))
      .sort((a, b) => (sort === "views" ? b.views - a.views : b.submittedAt.localeCompare(a.submittedAt)));
  }, [clips, platform, status, clipper, sort, q, names]);

  const visible = filtered.slice(0, limit);

  return (
    <div>
      <div className="panel-head">
        <div className="panel-title">
          <span className="panel-icon">
            <IconScissors />
          </span>
          <h2>Clipes do mês</h2>
        </div>
      </div>
      <p className="panel-desc">Todo clipe enviado já conta. Confira os mais recentes e remova os que quebrarem as regras: o clipador vê o motivo.</p>

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
      </div>
      <div className="filter-tools filter-tools-wide">
        <label className="search">
          <IconSearch size={16} />
          <span className="sr-only">Buscar</span>
          <input type="search" placeholder="Buscar por título, @, link ou clipador" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <label className="select-wrap">
          <span className="sr-only">Clipador</span>
          <select value={clipper} onChange={(e) => setClipper(e.target.value)}>
            <option value="todos">Todos os clipadores</option>
            {clippers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="select-wrap">
          <span className="sr-only">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="todos">Todos os status</option>
            <option value="no_ar">No ar</option>
            <option value="verificando">Lendo views</option>
            <option value="removido">Removidos</option>
          </select>
        </label>
        <label className="select-wrap">
          <span className="sr-only">Ordenar</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="recentes">Mais recentes</option>
            <option value="views">Mais views</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <p>Nenhum clipe com esses filtros.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="clips">
            <thead>
              <tr>
                <th scope="col">Clipe</th>
                <th scope="col">Clipador</th>
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
              {visible.map((c) => {
                const who = names.get(c.clipperId);
                const title = c.title ?? `Clipe no ${PLATFORM_LABEL[c.platform]}`;
                return (
                  <tr key={c.id} className={c.status === "removido" ? "is-removed" : ""}>
                    <td>
                      <div className="clip-cell">
                        <span className="plat">
                          <PlatformIcon platform={c.platform} size={16} />
                        </span>
                        <div className="clip-text">
                          <a href={c.url} target="_blank" rel="noopener noreferrer" className="clip-title">
                            {title}
                          </a>
                          <span className="clip-meta">
                            {c.handle ? `@${c.handle} · ` : ""}
                            {PLATFORM_LABEL[c.platform]}
                            {c.removalReason ? ` · ${c.removalReason}` : ""}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Clipador" className="nowrap">
                      {who?.name}
                    </td>
                    <td className="nowrap muted" data-label="Enviado em">
                      {fmtDateTime(c.submittedAt)}
                    </td>
                    <td className="num" data-label="Views">
                      <span className="views">
                        <IconEye size={14} className="only-sm" />
                        {c.status === "verificando" ? "—" : fmtInt(c.views)}
                      </span>
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
                        {c.status === "removido" ? (
                          <button type="button" className="btn btn-outline btn-xs" onClick={() => onAction({ type: "clip/restore", id: c.id }, "Clipe restaurado. Voltou a contar.")}>
                            <IconUndo size={14} />
                            Restaurar
                          </button>
                        ) : (
                          <button type="button" className="btn btn-outline btn-xs btn-danger-outline" onClick={() => setRemoving(c)}>
                            <IconTrash size={14} />
                            Remover
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
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

      {removing && (
        <RemoveClipModal
          clipTitle={removing.title ?? `Clipe no ${PLATFORM_LABEL[removing.platform]}`}
          clipperName={names.get(removing.clipperId)?.name ?? ""}
          removedSoFar={names.get(removing.clipperId)?.removedAllTime ?? 0}
          onClose={() => setRemoving(null)}
          onConfirm={(reason) => {
            onAction({ type: "clip/remove", id: removing.id, reason }, "Clipe removido.");
            setRemoving(null);
          }}
        />
      )}
    </div>
  );
}
