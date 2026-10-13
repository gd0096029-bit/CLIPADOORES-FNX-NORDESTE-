export type Platform = "tiktok" | "instagram" | "youtube";

/** no_ar: conta no ranking · verificando: aguardando a 1ª leitura de views · removido: tirado pela equipe */
export type ClipStatus = "no_ar" | "verificando" | "removido";

export interface Clip {
  id: string;
  platform: Platform;
  url: string;
  /** @ da conta onde o clipe foi postado (quando dá pra saber pelo link ou pela API) */
  handle?: string;
  title?: string;
  submittedAt: string; // ISO
  views: number;
  /** views ganhas desde a leitura de ontem */
  viewsToday: number;
  status: ClipStatus;
  removalReason?: string;
  lastSyncAt?: string; // ISO
}

export interface Account {
  id: string;
  platform: Platform;
  handle: string; // sem @
  /** oauth: confirmada pelo login oficial da rede · manual: só cadastrada, aguardando confirmação */
  connection: "oauth" | "manual";
  addedAt: string;
}

export type WarningKind = "remocoes" | "link_removido" | "clipe_de_terceiro";

export interface Warning {
  id: string;
  kind: WarningKind;
  title: string;
  detail: string;
  createdAt: string;
  annulled?: { reason: string };
}

export interface RankingEntry {
  clipperId: string;
  name: string;
  views: number;
  clips: number;
}

/** Clipe visível pros outros clipadores (só os que estão valendo) */
export interface PublicClip {
  id: string;
  platform: Platform;
  url: string;
  handle?: string;
  title?: string;
  submittedAt: string;
  views: number;
}

export interface CommunityClipper {
  clipperId: string;
  name: string;
  clips: PublicClip[];
}

export interface DailyViews {
  date: string; // YYYY-MM-DD
  views: number;
}

export interface PixKey {
  type: "cpf" | "email" | "telefone" | "aleatoria";
  value: string;
}

export interface ClipadorData {
  me: { id: string; name: string; email?: string; phone?: string };
  /** mês da competição, YYYY-MM */
  month: string;
  clips: Clip[];
  accounts: Account[];
  warnings: Warning[];
  ranking: RankingEntry[];
  /** clipes de todos os clipadores do mês, agrupados por clipador (aba "Clipadores") */
  community: CommunityClipper[];
  dailyViews: DailyViews[];
  pix?: PixKey;
  totals: {
    clipsAllTime: number;
    viewsAllTime: number;
    removedAllTime: number;
    paidOut: number;
    pending: number;
  };
  /** última vez que as views foram conferidas */
  lastCheckAt: string;
}
