"use client";

import { useMemo, useState } from "react";
import type { CommunityClipper, Platform } from "@/lib/clipador/types";
import { PLATFORM_LABEL, PLATFORMS, profileUrl } from "@/lib/clipador/platforms";
import { fmtDateTime, fmtInt, plural } from "@/lib/clipador/format";
import { IconExternal, IconEye, IconSearch, IconUsers, PlatformIcon } from "./icons";

const PAGE = 20;

interface Props {
  community: CommunityClipper[];
  meId: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

/**
 * Aba "Clipadores": todo mundo vê os links que os outros clipadores enviaram no mês,
 * organizados pelo nome de cada um, com as views de cada clipe.
 */
export function CommunityTab({ community, meId, selectedId, onSelect }: Props) {
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState<"todas" | Platform>("todas");
  const [sort, setSort] = useState<"views" | "recentes">("views");
  const [limit, setLimit] = useState(PAGE);

  const people = useMemo(() => {
    const term = q.trim().toLowerCase();
    return community
      .map((c, i) => ({ ...c, position: i + 1, views: c.clips.reduce((s, k) => s + k.views, 0) }))
      .filter((c) => !term || c.name.toLowerCase().includes(term) || c.clips.some((k) => k.handle?.includes(term)));
  }, [community, q]);

  const selected = people.find((p) => p.clipperId === selectedId) ?? null;

  const clips = useMemo(() => {
    if (!selected) return [];
    return selected.clips
      .filter((c) => platform === "todas" || c.platform === platform)
      .sort((a, b) => (sort === "views" ? b.views - a.views : b.submittedAt.localeCompare(a.submittedAt)));
  }, [selected, platform, sort]);

  const handles = useMemo(() => {
    if (!selected) return [];
    const seen = new Map<string, { platform: Platform; handle: string }>();
    for (const c of selected.clips) if (c.handle) seen.set(`${c.platform}:${c.handle}`, { platform: c.platform, handle: c.handle });
    return [...seen.values()];
  }, [selected]);

  return (
    <div>
      <div className="panel-head">
        <div className="panel-title">
          <span className="panel-icon">
            <IconUsers />
          </span>
          <h2>Clipadores</h2>
        </div>
      </div>
      <p className="panel-desc">
        Veja os clipes que cada clipador enviou este mês, com as views contadas em todas as redes. Bom pra se inspirar no que está
        dando certo.
      </p>

      <div className={`community ${selected ? "has-selection" : ""}`}>
        {/* ---------- lista de clipadores ---------- */}
        <div className="community-list">
          <label className="search">
            <IconSearch size={16} />
            <span className="sr-only">Buscar clipador</span>
            <input type="search" placeholder="Buscar clipador ou @" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <ul>
            {people.map((p) => (
              <li key={p.clipperId}>
                <button
                  type="button"
                  className={`community-person ${p.clipperId === selectedId ? "is-active" : ""} ${p.clipperId === meId ? "is-me" : ""}`}
                  aria-pressed={p.clipperId === selectedId}
                  onClick={() => {
                    onSelect(p.clipperId);
                    setLimit(PAGE);
                  }}
                >
                  <span className="community-pos">{p.position}º</span>
                  <span className="clip-text">
                    <span className="community-name">
                      {p.name}
                      {p.clipperId === meId && <span className="you">você</span>}
                    </span>
                    <span className="clip-meta">
                      {plural(p.clips.length, "clipe", "clipes")} · {fmtInt(p.views)} views
                    </span>
                  </span>
                </button>
              </li>
            ))}
            {people.length === 0 && <li className="muted community-empty">Ninguém com esse nome.</li>}
          </ul>
        </div>

        {/* ---------- clipes do clipador escolhido ---------- */}
        <div className="community-detail">
          {!selected ? (
            <div className="empty">
              <IconUsers size={28} />
              <p>Escolha um clipador pra ver os clipes dele.</p>
            </div>
          ) : (
            <>
              <button type="button" className="link back-link" onClick={() => onSelect(null)}>
                ← Voltar pra lista
              </button>
              <div className="community-head">
                <div>
                  <h3>
                    {selected.name}
                    {selected.clipperId === meId && <span className="you">você</span>}
                  </h3>
                  <p className="clip-meta">
                    {selected.position}º no ranking · {plural(selected.clips.length, "clipe", "clipes")} · {fmtInt(selected.views)} views
                  </p>
                </div>
                <ul className="handles">
                  {handles.map((h) => (
                    <li key={`${h.platform}:${h.handle}`}>
                      <a href={profileUrl(h.platform, h.handle)} target="_blank" rel="noopener noreferrer">
                        <PlatformIcon platform={h.platform} size={14} />@{h.handle}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="filters">
                <div className="chips" role="group" aria-label="Filtrar por rede">
                  {(["todas", ...PLATFORMS] as const).map((pl) => {
                    const n = pl === "todas" ? selected.clips.length : selected.clips.filter((c) => c.platform === pl).length;
                    return (
                      <button key={pl} type="button" className={`chip chip-sm ${platform === pl ? "is-active" : ""}`}
                        aria-pressed={platform === pl}
                        onClick={() => {
                          setPlatform(pl);
                          setLimit(PAGE);
                        }}
                      >
                        {pl !== "todas" && <PlatformIcon platform={pl} size={14} />}
                        {pl === "todas" ? "Todas" : PLATFORM_LABEL[pl]}
                        <span className="count">{n}</span>
                      </button>
                    );
                  })}
                </div>
                <label className="select-wrap">
                  <span className="sr-only">Ordenar</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
                    <option value="views">Mais views</option>
                    <option value="recentes">Mais recentes</option>
                  </select>
                </label>
              </div>

              {clips.length === 0 ? (
                <div className="empty">
                  <p>Nenhum clipe nessa rede.</p>
                </div>
              ) : (
                <ol className="link-list">
                  {clips.slice(0, limit).map((c) => (
                    <li key={c.id}>
                      <span className="plat">
                        <PlatformIcon platform={c.platform} size={16} />
                      </span>
                      <div className="clip-text">
                        <a href={c.url} target="_blank" rel="noopener noreferrer" className="clip-title">
                          {c.title ?? `Clipe no ${PLATFORM_LABEL[c.platform]}`}
                        </a>
                        <span className="clip-meta">
                          {c.handle ? `@${c.handle} · ` : ""}
                          {fmtDateTime(c.submittedAt)}
                        </span>
                      </div>
                      <span className="link-views">
                        <IconEye size={14} />
                        {fmtInt(c.views)}
                      </span>
                      <a className="icon-btn" href={c.url} target="_blank" rel="noopener noreferrer" aria-label="Abrir clipe">
                        <IconExternal size={16} />
                      </a>
                    </li>
                  ))}
                </ol>
              )}
              {clips.length > limit && (
                <div className="more">
                  <button type="button" className="btn btn-outline" onClick={() => setLimit((l) => l + PAGE)}>
                    Mostrar mais ({fmtInt(clips.length - limit)})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
