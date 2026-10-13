/**
 * Sincronização de views: GET /api/cron/sync
 *
 * Roda pelo Vercel Cron (ver vercel.json) ou manualmente com
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://SEU-SITE/api/cron/sync
 *
 * Para cada clipe do mês que não foi removido:
 *  - YouTube: lê as views pela chave de API.
 *  - TikTok/Instagram: lê com o token do login oficial da conta do clipador.
 *  - Grava as views no clipe e um registro em clip_metrics (histórico).
 *  - Remove automaticamente clipe postado antes do mês da competição.
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseClipUrl } from "@/lib/clipador/platforms";
import {
  fetchInstagramStats,
  fetchTikTokStats,
  fetchYouTubeStats,
  refreshTikTokToken,
  resolveShortLink,
  type VideoStats,
} from "@/lib/clipador/providers";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type ClipRow = {
  id: string;
  platform: "tiktok" | "instagram" | "youtube";
  url: string;
  video_id: string | null;
  account_id: string | null;
  views: number;
  last_sync_at: string | null;
  competition_month: string;
};

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Supabase não configurado (modo demo)" }, { status: 501 });
  }
  const db = createClient(url, serviceKey, { auth: { persistSession: false } });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthDate = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}-01`;
  const today = now.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

  const { data: run } = await db.from("sync_runs").insert({}).select("id").single();
  let checked = 0;
  let failed = 0;
  const errors: string[] = [];

  try {
    const { data: clips, error } = await db
      .from("clips")
      .select("id, platform, url, video_id, account_id, views, last_sync_at, competition_month")
      .eq("competition_month", monthDate)
      .neq("status", "removido");
    if (error) throw error;
    const rows = (clips ?? []) as ClipRow[];

    // descobre o id do vídeo de links curtos do TikTok
    for (const c of rows) {
      if (c.video_id) continue;
      try {
        const full = c.platform === "tiktok" ? await resolveShortLink(c.url) : c.url;
        const parsed = parseClipUrl(full);
        if (parsed.ok && parsed.videoId) {
          c.video_id = parsed.videoId;
          await db.from("clips").update({ video_id: parsed.videoId, handle: parsed.handle ?? null, url: parsed.canonicalUrl }).eq("id", c.id);
        }
      } catch (e) {
        errors.push(`link ${c.id}: ${String(e)}`);
      }
    }

    const stats = new Map<string, VideoStats>(); // chave: clip.id

    // ---------- YouTube ----------
    const yt = rows.filter((c) => c.platform === "youtube" && c.video_id);
    if (yt.length && process.env.YOUTUBE_API_KEY) {
      try {
        const res = await fetchYouTubeStats(yt.map((c) => c.video_id!), process.env.YOUTUBE_API_KEY);
        for (const c of yt) {
          const s = res.get(c.video_id!);
          if (s) stats.set(c.id, s);
        }
      } catch (e) {
        errors.push(String(e));
      }
    }

    // ---------- TikTok e Instagram (por conta, com o token de cada clipador) ----------
    const byAccount = new Map<string, ClipRow[]>();
    for (const c of rows) {
      if (c.platform === "youtube" || !c.account_id || !c.video_id) continue;
      byAccount.set(c.account_id, [...(byAccount.get(c.account_id) ?? []), c]);
    }
    for (const [accountId, list] of byAccount) {
      const { data: tok } = await db
        .from("clipper_account_tokens")
        .select("access_token, refresh_token, expires_at")
        .eq("account_id", accountId)
        .maybeSingle();
      if (!tok) continue; // conta ainda não confirmada pelo login oficial
      try {
        let accessToken = tok.access_token as string;
        const platform = list[0].platform;
        if (platform === "tiktok") {
          const expired = tok.expires_at && new Date(tok.expires_at as string).getTime() < Date.now() + 60_000;
          if (expired && tok.refresh_token && process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET) {
            const fresh = await refreshTikTokToken(tok.refresh_token as string, process.env.TIKTOK_CLIENT_KEY, process.env.TIKTOK_CLIENT_SECRET);
            accessToken = fresh.accessToken;
            await db
              .from("clipper_account_tokens")
              .update({ access_token: fresh.accessToken, refresh_token: fresh.refreshToken, expires_at: fresh.expiresAt, updated_at: new Date().toISOString() })
              .eq("account_id", accountId);
          }
          const res = await fetchTikTokStats(list.map((c) => c.video_id!), accessToken);
          for (const c of list) {
            const s = res.get(c.video_id!);
            if (s) stats.set(c.id, s);
          }
        } else {
          const res = await fetchInstagramStats(list.map((c) => c.video_id!), accessToken);
          for (const c of list) {
            const s = res.get(c.video_id!);
            if (s) stats.set(c.id, s);
          }
        }
      } catch (e) {
        errors.push(`conta ${accountId}: ${String(e)}`);
      }
    }

    // ---------- grava ----------
    for (const c of rows) {
      const s = stats.get(c.id);
      if (!s) {
        failed++;
        continue;
      }
      checked++;
      const firstSyncToday = !c.last_sync_at || new Date(c.last_sync_at).toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" }) !== today;
      const postedBeforeMonth = s.publishedAt && new Date(s.publishedAt) < monthStart;
      await db
        .from("clips")
        .update({
          views: s.views,
          ...(firstSyncToday ? { views_yesterday: c.views } : {}),
          posted_at: s.publishedAt ?? null,
          last_sync_at: new Date().toISOString(),
          sync_error: null,
          status: postedBeforeMonth ? "removido" : "no_ar",
          ...(postedBeforeMonth ? { removal_reason: "Postado antes do mês da competição" } : {}),
        })
        .eq("id", c.id);
      await db.from("clip_metrics").insert({ clip_id: c.id, views: s.views, likes: s.likes ?? null, comments: s.comments ?? null, shares: s.shares ?? null });
    }
  } catch (e) {
    errors.push(String(e));
  }

  if (run) {
    await db
      .from("sync_runs")
      .update({ finished_at: new Date().toISOString(), clips_checked: checked, clips_failed: failed, error: errors.join("\n").slice(0, 4000) || null })
      .eq("id", run.id);
  }
  return NextResponse.json({ checked, failed, errors });
}
