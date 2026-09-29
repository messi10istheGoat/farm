import { db, getDatabaseUrl } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    const isEmbedded = !getDatabaseUrl();
    return Response.json({
      ok: true,
      mode: isEmbedded ? "embedded_pglite" : "external_postgresql",
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Database connection failed";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
