import { chunk, ProviderError, type VideoStats } from "./shared";

/**
 * TikTok Display API · Query Videos
 * https://developers.tiktok.com/doc/tiktok-api-v2-video-query
 * Precisa do token do login oficial do clipador (escopo `video.list`). Até 20 ids por chamada.
 * Só retorna vídeos da própria conta que fez o login, o que já confirma que o clipe é dele.
 */
export async function fetchTikTokStats(videoIds: string[], accessToken: string): Promise<Map<string, VideoStats>> {
  const out = new Map<string, VideoStats>();
  const fields = "id,create_time,view_count,like_count,comment_count,share_count";
  for (const ids of chunk([...new Set(videoIds)], 20)) {
    const res = await fetch(`https://open.tiktokapis.com/v2/video/query/?fields=${fields}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ filters: { video_ids: ids } }),
      cache: "no-store",
    });
    const json = (await res.json()) as {
      data?: {
        videos?: Array<{ id: string; create_time?: number; view_count?: number; like_count?: number; comment_count?: number; share_count?: number }>;
      };
      error?: { code?: string; message?: string };
    };
    if (!res.ok || (json.error?.code && json.error.code !== "ok")) {
      throw new ProviderError("tiktok", json.error?.message ?? `HTTP ${res.status}`, res.status);
    }
    for (const v of json.data?.videos ?? []) {
      out.set(v.id, {
        videoId: v.id,
        views: v.view_count ?? 0,
        likes: v.like_count,
        comments: v.comment_count,
        shares: v.share_count,
        publishedAt: v.create_time ? new Date(v.create_time * 1000).toISOString() : undefined,
      });
    }
  }
  return out;
}

/** Renova o token (o de acesso dura ~24h; o refresh token, bem mais). */
export async function refreshTikTokToken(refreshToken: string, clientKey: string, clientSecret: string) {
  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });
  const json = (await res.json()) as { access_token?: string; refresh_token?: string; expires_in?: number; error?: string; error_description?: string };
  if (!res.ok || !json.access_token) throw new ProviderError("tiktok", json.error_description ?? json.error ?? `HTTP ${res.status}`, res.status);
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? refreshToken,
    expiresAt: new Date(Date.now() + (json.expires_in ?? 86400) * 1000).toISOString(),
  };
}
