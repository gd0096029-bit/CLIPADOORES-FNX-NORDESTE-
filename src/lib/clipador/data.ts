import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClipadorData, DailyViews, PixKey } from "./types";
import { buildDemoData } from "./demo-data";

/**
 * Carrega os dados da área do clipador.
 *
 * Hoje: devolve os dados de DEMONSTRAÇÃO.
 * Pra ligar no banco de verdade: na página /clipador, crie um cliente do Supabase com a
 * sessão do usuário logado (o mesmo que a dash já usa) e chame `loadFromSupabase(supabase, user.id)`.
 */
export async function loadClipadorData(): Promise<{ data: ClipadorData; mode: "demo" | "live" }> {
  return { data: buildDemoData(), mode: "demo" };
}

/** Lê tudo que a área do clipador precisa, respeitando o RLS do usuário logado. */
export async function loadFromSupabase(supabase: SupabaseClient, clipperId: string, now: Date = new Date()): Promise<ClipadorData> {
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthDate = `${month}-01`;

  const [me, clips, accounts, warnings, ranking, daily, payouts, allTime, lastRun] = await Promise.all([
    supabase.from("clippers").select("id, name, pix_type, pix_key").eq("id", clipperId).single(),
    supabase
      .from("clips")
      .select("id, platform, url, handle, title, submitted_at, views, views_yesterday, status, removal_reason, last_sync_at")
      .eq("clipper_id", clipperId)
      .eq("competition_month", monthDate)
      .order("submitted_at", { ascending: false }),
    supabase.from("clipper_accounts").select("id, platform, handle, connection, created_at").eq("clipper_id", clipperId),
    supabase.from("warnings").select("id, kind, title, detail, created_at, annulled_reason").eq("clipper_id", clipperId),
    supabase.rpc("get_ranking", { p_month: monthDate }),
    supabase.rpc("get_daily_views", { p_clipper: clipperId, p_month: monthDate }),
    supabase.from("payouts").select("amount, paid_at").eq("clipper_id", clipperId),
    supabase.from("clips").select("views, status").eq("clipper_id", clipperId),
    supabase.from("clips").select("last_sync_at").not("last_sync_at", "is", null).order("last_sync_at", { ascending: false }).limit(1),
  ]);

  const firstError = [me, clips, accounts, warnings, ranking, daily, payouts, allTime].find((r) => r.error)?.error;
  if (firstError) throw new Error(`Supabase: ${firstError.message}`);

  type Row = Record<string, unknown>;
  const rows = (r: { data: unknown }) => (r.data ?? []) as Row[];
  const s = (v: unknown) => (v == null ? undefined : String(v));
  const n = (v: unknown) => Number(v ?? 0);

  const meRow = me.data as Row;
  const pix: PixKey | undefined = meRow.pix_type && meRow.pix_key ? { type: meRow.pix_type as PixKey["type"], value: String(meRow.pix_key) } : undefined;
  const all = rows(allTime);
  const pays = rows(payouts);

  return {
    me: { id: clipperId, name: String(meRow.name) },
    month,
    clips: rows(clips).map((c) => ({
      id: String(c.id),
      platform: c.platform as ClipadorData["clips"][number]["platform"],
      url: String(c.url),
      handle: s(c.handle),
      title: s(c.title),
      submittedAt: String(c.submitted_at),
      views: n(c.views),
      viewsToday: Math.max(0, n(c.views) - n(c.views_yesterday)),
      status: c.status as ClipadorData["clips"][number]["status"],
      removalReason: s(c.removal_reason),
      lastSyncAt: s(c.last_sync_at),
    })),
    accounts: rows(accounts).map((a) => ({
      id: String(a.id),
      platform: a.platform as ClipadorData["accounts"][number]["platform"],
      handle: String(a.handle),
      connection: a.connection as "manual" | "oauth",
      addedAt: String(a.created_at),
    })),
    warnings: rows(warnings).map((w) => ({
      id: String(w.id),
      kind: w.kind as ClipadorData["warnings"][number]["kind"],
      title: String(w.title),
      detail: String(w.detail),
      createdAt: String(w.created_at),
      annulled: w.annulled_reason ? { reason: String(w.annulled_reason) } : undefined,
    })),
    ranking: rows(ranking).map((r) => ({ clipperId: String(r.clipper_id), name: String(r.name), views: n(r.views), clips: n(r.clips) })),
    dailyViews: rows(daily).map((d): DailyViews => ({ date: String(d.day), views: n(d.views) })),
    pix,
    totals: {
      clipsAllTime: all.length,
      viewsAllTime: all.filter((c) => c.status !== "removido").reduce((t, c) => t + n(c.views), 0),
      removedAllTime: all.filter((c) => c.status === "removido").length,
      paidOut: pays.filter((p) => p.paid_at).reduce((t, p) => t + n(p.amount), 0),
      pending: pays.filter((p) => !p.paid_at).reduce((t, p) => t + n(p.amount), 0),
    },
    lastCheckAt: s(rows(lastRun)[0]?.last_sync_at) ?? now.toISOString(),
  };
}
