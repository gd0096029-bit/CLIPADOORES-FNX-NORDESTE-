import { ProviderError, type VideoStats } from "./shared";

/** Confira a versão atual em https://developers.facebook.com/docs/instagram-platform */
const GRAPH = "https://graph.instagram.com/v23.0";

/**
 * Instagram API com login do Instagram.
 * 1) Lista as mídias da conta do clipador (/me/media) pra achar o id de cada reel pelo shortcode do link.
 * 2) Busca as views de cada uma em /{media-id}/insights?metric=views.
 * Precisa de conta Profissional (Business ou Creator) e das permissões
 * instagram_business_basic e instagram_business_manage_insights.
 *
 * @param shortcodes códigos dos links (instagram.com/reel/<código>)
 */
export async function fetchInstagramStats(shortcodes: string[], accessToken: string): Promise<Map<string, VideoStats>> {
  const wanted = new Set(shortcodes);
  const found = new Map<string, { id: string; timestamp?: string; like_count?: number; comments_count?: number }>();

  // 1) varre as mídias recentes (paginado) até achar todos os códigos ou acabar
  let next: string | null =
    `${GRAPH}/me/media?fields=id,shortcode,timestamp,like_count,comments_count&limit=100&access_token=${encodeURIComponent(accessToken)}`;
  let pages = 0;
  while (next && found.size < wanted.size && pages < 10) {
    const res: Response = await fetch(next, { cache: "no-store" });
    const json = (await res.json()) as {
      data?: Array<{ id: string; shortcode?: string; timestamp?: string; like_count?: number; comments_count?: number }>;
      paging?: { next?: string };
      error?: { message?: string };
    };
    if (!res.ok) throw new ProviderError("instagram", json.error?.message ?? `HTTP ${res.status}`, res.status);
    for (const m of json.data ?? []) if (m.shortcode && wanted.has(m.shortcode)) found.set(m.shortcode, m);
    next = json.paging?.next ?? null;
    pages++;
  }

  // 2) views de cada mídia encontrada
  const out = new Map<string, VideoStats>();
  for (const [code, m] of found) {
    const res = await fetch(`${GRAPH}/${m.id}/insights?metric=views&access_token=${encodeURIComponent(accessToken)}`, { cache: "no-store" });
    const json = (await res.json()) as {
      data?: Array<{ name: string; values?: Array<{ value: number }>; total_value?: { value: number } }>;
      error?: { message?: string };
    };
    if (!res.ok) throw new ProviderError("instagram", json.error?.message ?? `HTTP ${res.status}`, res.status);
    const metric = json.data?.find((d) => d.name === "views");
    const views = metric?.total_value?.value ?? metric?.values?.[0]?.value ?? 0;
    out.set(code, { videoId: code, views, likes: m.like_count, comments: m.comments_count, publishedAt: m.timestamp });
  }
  return out;
}
