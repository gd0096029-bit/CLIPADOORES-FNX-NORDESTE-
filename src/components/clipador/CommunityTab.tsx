"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CommunityClipper, Platform, PublicClip } from "@/lib/clipador/types";
import { PLATFORM_LABEL, PLATFORMS, profileUrl } from "@/lib/clipador/platforms";
import { fmtDateTime, fmtInt, plural } from "@/lib/clipador/format";
import { IconExternal, IconEye, IconSearch, IconUsers, PlatformIcon } from "./icons";
import { Avatar } from "./bits";

const PAGE = 20;

interface Props {
  community: CommunityClipper[];
  meId: string;
  /** clipador aberto (os clipes dele aparecem dentro do nome) */
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  meAvatar?: string;
}

/**
 * Aba "Clipadores": cada clipador é um bloco com o nome dele.
 * Ao clicar no nome, os links dos clipes daquela pessoa abrem ali dentro, com as views.
 */
export function CommunityTab({ community, meId, selectedId, onSelect, meAvatar }: Props) {
  const [q, setQ] = useState("");

  const people = useMemo(() => {
    const term = q.trim().toLowerCase();
    return community
      .map((c, i) => ({ ...c, position: i + 1, views: c.clips.reduce((s, k) => s + k.views, 0) }))
      .filter((c) => !term || c.name.toLowerCase().includes(term) || c.clips.some((k) => k.handle?.includes(term)));
  }, [community, q]);

  return (
    <div>
      <div className="panel-head">
        <div className="panel-title">
          <span className="panel-icon">
            <IconUsers />
          </span>
          <h2>Clipadores</h2>
        </div>
        <label className="search search-head">
          <IconSearch size={16} />
          <span className="sr-only">Buscar clipador</span>
          <input type="search" placeholder="Buscar clipador ou @" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>
      <p className="panel-desc">Clique no nome de um clipador pra ver os links de todos os clipes que ele enviou este mês, com as views de cada um.</p>

      {people.length === 0 ? (
        <div className="empty">
          <p>Ninguém com esse nome ou @.</p>
        </div>
      ) : (
        <ul className="people-acc">
          {people.map((p) => (
            <PersonBlock
              key={p.clipperId}
              person={p}
              isMe={p.clipperId === meId}
              avatar={p.clipperId === meId ? meAvatar : undefined}
              open={p.clipperId === selectedId}
              onToggle={() => onSelect(p.clipperId === selectedId ? null : p.clipperId)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function PersonBlock({
  person,
  isMe,
  open,
  onToggle,
  avatar,
}: {
  person: CommunityClipper & { position: number; views: number };
  isMe: boolean;
  avatar?: string;
  open: boolean;
  onToggle: () => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const bodyId = `clipes-${person.clipperId}`;

  // quando abre (inclusive vindo do ranking), rola até o nome
  useEffect(() => {
    if (open) ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [open]);

  return (
    <li ref={ref} className={`person-block ${open ? "is-open" : ""} ${isMe ? "is-me" : ""}`}>
      <button type="button" className="person-head" aria-expanded={open} aria-controls={bodyId} onClick={onToggle}>
        <span className={`community-pos pos-${person.position <= 3 ? person.position : "n"}`}>{person.position}º</span>
        <Avatar name={person.name} src={avatar} size={40} />
        <span className="person-head-text">
          <span className="community-name">
            {person.name}
            {isMe && <span className="you">você</span>}
          </span>
          <span className="clip-meta">
            {plural(person.clips.length, "clipe", "clipes")} · {fmtInt(person.views)} views
          </span>
        </span>
        <span className="person-cta">{open ? "Fechar" : "Ver clipes"}</span>
        <svg className="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="person-body" id={bodyId}>
          <PersonClips clips={person.clips} />
        </div>
      )}
    </li>
  );
}

function PersonClips({ clips: all }: { clips: PublicClip[] }) {
  const [platform, setPlatform] = useState<"todas" | Platform>("todas");
  const [sort, setSort] = useState<"views" | "recentes">("views");
  const [limit, setLimit] = useState(PAGE);

  const handles = useMemo(() => {
    const seen = new Map<string, { platform: Platform; handle: string }>();
    for (const c of all) if (c.handle) seen.set(`${c.platform}:${c.handle}`, { platform: c.platform, handle: c.handle });
    return [...seen.values()];
  }, [all]);

  const clips = useMemo(
    () =>
      all
        .filter((c) => platform === "todas" || c.platform === platform)
        .sort((a, b) => (sort === "views" ? b.views - a.views : b.submittedAt.localeCompare(a.submittedAt))),
    [all, platform, sort],
  );

  if (all.length === 0) return <p className="muted person-empty">Nenhum clipe enviado este mês.</p>;

  return (
    <>
      {handles.length > 0 && (
        <ul className="handles">
          {handles.map((h) => (
            <li key={`${h.platform}:${h.handle}`}>
              <a href={profileUrl(h.platform, h.handle)} target="_blank" rel="noopener noreferrer">
                <PlatformIcon platform={h.platform} size={14} />@{h.handle}
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className="filters">
        <div className="chips" role="group" aria-label="Filtrar por rede">
          {(["todas", ...PLATFORMS] as const).map((pl) => {
            const n = pl === "todas" ? all.length : all.filter((c) => c.platform === pl).length;
            return (
              <button
                key={pl}
                type="button"
                className={`chip chip-sm ${platform === pl ? "is-active" : ""}`}
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
        <p className="muted person-empty">Nenhum clipe nessa rede.</p>
      ) : (
        <ol className="link-list">
          {clips.slice(0, limit).map((c) => (
            <li key={c.id}>
              <span className={`plat plat-${c.platform}`}>
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
  );
}
