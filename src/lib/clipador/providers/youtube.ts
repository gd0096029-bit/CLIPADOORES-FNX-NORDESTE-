import { chunk, ProviderError, type VideoStats } from "./shared";

/**
 * YouTube Data API v3 · videos.list
 * https://developers.google.com/youtube/v3/docs/videos/list
 * Custo: 1 unidade por chamada (até 50 vídeos). Cota padrão: 10.000 unidades/dia.
 */
export async function fetchYouTubeStats(videoIds: string[], apiKey: string): Promise<Map<string, VideoStats>> {
  const out = new Map<string, VideoStats>();
  for (const ids of chunk([...new Set(videoIds)], 50)) {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "statistics,snippet");
    url.searchParams.set("id", ids.join(","));
    url.searchParams.set("key", apiKey);
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new ProviderError("youtube", `HTTP ${res.status}: ${await res.text()}`, res.status);
    const json = (await res.json()) as {
      items?: Array<{
        id: string;
        snippet?: { publishedAt?: string; channelId?: string };
        statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
      }>;
    };
    for (const it of json.items ?? []) {
      out.set(it.id, {
        videoId: it.id,
        views: Number(it.statistics?.viewCount ?? 0),
        likes: it.statistics?.likeCount ? Number(it.statistics.likeCount) : undefined,
        comments: it.statistics?.commentCount ? Number(it.statistics.commentCount) : undefined,
        publishedAt: it.snippet?.publishedAt,
        ownerId: it.snippet?.channelId,
      });
    }
  }
  return out;
}
