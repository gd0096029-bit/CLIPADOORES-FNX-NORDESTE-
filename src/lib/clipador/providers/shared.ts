export interface VideoStats {
  videoId: string;
  views: number;
  likes?: number;
  comments?: number;
  shares?: number;
  /** data em que o vídeo foi publicado na rede */
  publishedAt?: string;
  /** dono do vídeo (id do canal / usuário na rede) */
  ownerId?: string;
}

export class ProviderError extends Error {
  constructor(
    public platform: string,
    message: string,
    public status?: number,
  ) {
    super(`[${platform}] ${message}`);
  }
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Links curtos (vm.tiktok.com, /t/...) redirecionam pro link completo. */
export async function resolveShortLink(url: string): Promise<string> {
  const res = await fetch(url, { method: "GET", redirect: "manual" });
  const loc = res.headers.get("location");
  return loc ? new URL(loc, url).toString() : url;
}
