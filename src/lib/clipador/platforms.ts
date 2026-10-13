import type { Platform } from "./types";

export const PLATFORM_LABEL: Record<Platform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
};

export const PLATFORMS: Platform[] = ["tiktok", "instagram", "youtube"];

export function profileUrl(platform: Platform, handle: string): string {
  const h = normalizeHandle(handle);
  switch (platform) {
    case "tiktok":
      return `https://www.tiktok.com/@${h}`;
    case "instagram":
      return `https://www.instagram.com/${h}/`;
    case "youtube":
      return `https://www.youtube.com/@${h}`;
  }
}

/** "@Fulano " → "fulano" */
export function normalizeHandle(raw: string): string {
  return raw.trim().replace(/^@+/, "").toLowerCase();
}

export function isValidHandle(raw: string): boolean {
  return /^[a-z0-9._-]{2,30}$/.test(normalizeHandle(raw));
}

export type ParsedClipUrl =
  | {
      ok: true;
      platform: Platform;
      /** id do vídeo na plataforma (quando o link permite saber) */
      videoId?: string;
      /** @ da conta (só links completos do TikTok trazem) */
      handle?: string;
      /** link curto (vm.tiktok.com etc.): o id só é descoberto na sincronização */
      isShortLink: boolean;
      /** link limpo, sem parâmetros de rastreio */
      canonicalUrl: string;
    }
  | { ok: false; error: string };

/**
 * Reconhece links públicos de clipes do TikTok, Instagram e YouTube.
 * Não faz nenhuma chamada de rede: é usado na hora do envio e pode rodar no navegador.
 */
export function parseClipUrl(input: string): ParsedClipUrl {
  const raw = input.trim();
  if (!raw) return { ok: false, error: "Cole o link do clipe." };

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return { ok: false, error: "Isso não parece um link válido." };
  }

  const host = url.hostname.toLowerCase().replace(/^(www\.|m\.)/, "");
  const parts = url.pathname.split("/").filter(Boolean);

  // ---------- TikTok ----------
  if (host === "tiktok.com") {
    // /@usuario/video/123  ou  /@usuario/photo/123
    if (parts[0]?.startsWith("@") && (parts[1] === "video" || parts[1] === "photo") && /^\d+$/.test(parts[2] ?? "")) {
      const handle = normalizeHandle(parts[0]);
      return {
        ok: true,
        platform: "tiktok",
        handle,
        videoId: parts[2],
        isShortLink: false,
        canonicalUrl: `https://www.tiktok.com/@${handle}/${parts[1]}/${parts[2]}`,
      };
    }
    // /t/ZSxxxx (link curto)
    if (parts[0] === "t" && parts[1]) {
      return { ok: true, platform: "tiktok", isShortLink: true, canonicalUrl: `https://www.tiktok.com/t/${parts[1]}/` };
    }
    return { ok: false, error: "Esse link do TikTok não é de um vídeo. Abra o vídeo e copie o link dele." };
  }
  if (host === "vm.tiktok.com" || host === "vt.tiktok.com") {
    if (!parts[0]) return { ok: false, error: "Link curto do TikTok incompleto." };
    return { ok: true, platform: "tiktok", isShortLink: true, canonicalUrl: `https://${host}/${parts[0]}/` };
  }

  // ---------- Instagram ----------
  if (host === "instagram.com") {
    // /reel/CODE, /reels/CODE, /p/CODE, /usuario/reel/CODE
    const idx = parts.findIndex((p) => p === "reel" || p === "reels" || p === "p");
    const code = idx >= 0 ? parts[idx + 1] : undefined;
    if (code && /^[A-Za-z0-9_-]{5,}$/.test(code)) {
      const kind = parts[idx] === "p" ? "p" : "reel";
      return {
        ok: true,
        platform: "instagram",
        videoId: code,
        isShortLink: false,
        canonicalUrl: `https://www.instagram.com/${kind}/${code}/`,
      };
    }
    return { ok: false, error: "Esse link do Instagram não é de um reel ou post." };
  }

  // ---------- YouTube ----------
  if (host === "youtu.be") {
    const id = parts[0];
    if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) {
      return { ok: true, platform: "youtube", videoId: id, isShortLink: false, canonicalUrl: `https://www.youtube.com/watch?v=${id}` };
    }
    return { ok: false, error: "Link do YouTube incompleto." };
  }
  if (host === "youtube.com" || host === "music.youtube.com") {
    let id: string | null = null;
    if (parts[0] === "shorts" || parts[0] === "live" || parts[0] === "embed") id = parts[1] ?? null;
    else if (parts[0] === "watch") id = url.searchParams.get("v");
    if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) {
      const canonicalUrl = parts[0] === "shorts" ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`;
      return { ok: true, platform: "youtube", videoId: id, isShortLink: false, canonicalUrl };
    }
    return { ok: false, error: "Esse link do YouTube não é de um vídeo ou Short." };
  }

  return { ok: false, error: "Aceitamos só links do TikTok, Instagram e YouTube." };
}
