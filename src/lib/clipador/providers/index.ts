/**
 * Leitura de views pelas APIs OFICIAIS de cada rede.
 *
 * - YouTube: YouTube Data API v3 com chave de API (dados públicos, não precisa do login do clipador).
 * - TikTok: Display API, com o token do login oficial (OAuth) do clipador. Escopo `video.list`.
 * - Instagram: Instagram API com login do Instagram, com o token do clipador. Conta Profissional (Business/Creator).
 *
 * As APIs mudam de versão com frequência: confira os links no README antes de pôr no ar.
 */
export * from "./shared";
export { fetchYouTubeStats } from "./youtube";
export { fetchTikTokStats, refreshTikTokToken } from "./tiktok";
export { fetchInstagramStats } from "./instagram";
