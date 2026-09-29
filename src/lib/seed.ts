import { db } from "@/db";
import { androidDevices, automationTasks } from "@/db/schema";
import { generateDeviceRecord } from "@/lib/device-generator";
import { count, sql } from "drizzle-orm";

let seedPromise: Promise<void> | null = null;

async function ensureTablesCreated(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "android_devices" (
      "id" serial PRIMARY KEY NOT NULL,
      "node_code" text NOT NULL UNIQUE,
      "device_name" text NOT NULL,
      "manufacturer" text NOT NULL,
      "model_code" text NOT NULL,
      "android_version" text NOT NULL,
      "soc_chipset" text NOT NULL,
      "ram_gb" integer DEFAULT 12 NOT NULL,
      "resolution" text DEFAULT '1440x3120 @ 480dpi' NOT NULL,
      "imei" text NOT NULL UNIQUE,
      "android_id" text NOT NULL UNIQUE,
      "mac_address" text NOT NULL,
      "build_fingerprint" text NOT NULL,
      "status" text DEFAULT 'ONLINE' NOT NULL,
      "active_app" text DEFAULT 'HOME' NOT NULL,
      "cpu_usage" integer DEFAULT 24 NOT NULL,
      "ram_usage_mb" integer DEFAULT 3200 NOT NULL,
      "battery_level" integer DEFAULT 88 NOT NULL,
      "fps" integer DEFAULT 60 NOT NULL,
      "cluster_shard" text DEFAULT 'SHARD-01' NOT NULL,
      "proxy_protocol" text DEFAULT 'SOCKS5' NOT NULL,
      "proxy_ip" text NOT NULL UNIQUE,
      "proxy_port" integer DEFAULT 1080 NOT NULL,
      "proxy_username" text NOT NULL,
      "proxy_password" text NOT NULL,
      "proxy_country" text NOT NULL,
      "proxy_country_code" text NOT NULL,
      "proxy_city" text NOT NULL,
      "proxy_isp" text NOT NULL,
      "proxy_asn" text NOT NULL,
      "proxy_latency_ms" integer DEFAULT 28 NOT NULL,
      "webrtc_shield" boolean DEFAULT true NOT NULL,
      "dns_leak_protection" boolean DEFAULT true NOT NULL,
      "gmail_address" text NOT NULL,
      "gmail_password" text NOT NULL,
      "gmail_recovery" text NOT NULL,
      "gmail_status" text DEFAULT 'VERIFIED_2FA' NOT NULL,
      "gmail_unread_count" integer DEFAULT 3 NOT NULL,
      "fb_name" text NOT NULL,
      "fb_email" text NOT NULL,
      "fb_uid" text NOT NULL,
      "fb_password" text NOT NULL,
      "fb_2fa_secret" text NOT NULL,
      "fb_status" text DEFAULT 'ADS_READY' NOT NULL,
      "fb_friends_count" integer DEFAULT 640 NOT NULL,
      "yt_channel_name" text NOT NULL,
      "yt_handle" text NOT NULL,
      "yt_subscribers" integer DEFAULT 1250 NOT NULL,
      "yt_watch_hours" integer DEFAULT 340 NOT NULL,
      "yt_status" text DEFAULT 'VERIFIED_CHANNEL' NOT NULL,
      "cookie_token_digest" text NOT NULL,
      "last_synced_at" timestamp DEFAULT now() NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "automation_tasks" (
      "id" serial PRIMARY KEY NOT NULL,
      "task_name" text NOT NULL,
      "target_scope" text NOT NULL,
      "app_target" text NOT NULL,
      "devices_affected" integer DEFAULT 1 NOT NULL,
      "status" text DEFAULT 'COMPLETED' NOT NULL,
      "command_script" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    )
  `);

  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "idx_node_code" ON "android_devices" ("node_code")`
  );
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "idx_cluster_shard" ON "android_devices" ("cluster_shard")`
  );
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "idx_status" ON "android_devices" ("status")`
  );
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "idx_proxy_country" ON "android_devices" ("proxy_country_code")`
  );
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "idx_manufacturer" ON "android_devices" ("manufacturer")`
  );
}

export async function ensureFleetSeeded(): Promise<void> {
  if (seedPromise) {
    return seedPromise;
  }

  seedPromise = (async () => {
    try {
      await ensureTablesCreated();

      const [{ value: rawCount }] = await db
        .select({ value: count() })
        .from(androidDevices);

      const existingCount = Number(rawCount) || 0;

      if (existingCount < 1200) {
        const startSeq = existingCount + 1;
        const targetTotal = 1200;
        const batchSize = 100;

        for (let i = startSeq; i <= targetTotal; i += batchSize) {
          const batch = [];
          const end = Math.min(i + batchSize - 1, targetTotal);
          for (let seq = i; seq <= end; seq++) {
            batch.push(generateDeviceRecord(seq));
          }
          await db.insert(androidDevices).values(batch).onConflictDoNothing();
        }
      }

      const [{ value: rawTasksCount }] = await db
        .select({ value: count() })
        .from(automationTasks);

      const tasksCount = Number(rawTasksCount) || 0;

      if (tasksCount === 0) {
        await db
          .insert(automationTasks)
          .values([
            {
              taskName: "Fleet SOCKS5 & 4G LTE Tunnel Handshake Verification",
              targetScope: "ALL_SHARDS [1,200 NODES]",
              appTarget: "PROXY",
              devicesAffected: 1200,
              status: "COMPLETED",
              commandScript:
                "adb shell settings put global http_proxy <node_unique_ip>:<port> && curl -s https://api.ipify.org",
            },
            {
              taskName: "Google Play Services & Gmail 2FA Session Token Refresh",
              targetScope: "SHARD-01 [0001-0300]",
              appTarget: "GMAIL",
              devicesAffected: 300,
              status: "COMPLETED",
              commandScript:
                "am start -n com.google.android.gm/.ConversationListActivityGmail && input swipe 540 1600 540 400 350",
            },
            {
              taskName: "Facebook App Warmup: Reels Scroll & Ads Manager Check",
              targetScope: "SHARD-02 [0301-0600]",
              appTarget: "FACEBOOK",
              devicesAffected: 300,
              status: "COMPLETED",
              commandScript:
                "am start -n com.facebook.katana/.LoginActivity && uiautomator runtest fb_feed_warmup.jar",
            },
            {
              taskName: "YouTube Creator Feed Watch & Organic Subscription Sync",
              targetScope: "SHARD-03 [0601-0900]",
              appTarget: "YOUTUBE",
              devicesAffected: 300,
              status: "COMPLETED",
              commandScript:
                "am start -a android.intent.action.VIEW -d 'https://m.youtube.com' com.google.android.youtube",
            },
          ])
          .onConflictDoNothing();
      }
    } catch (err) {
      console.error("Error seeding Android device fleet:", err);
      seedPromise = null;
      throw err;
    }
  })();

  return seedPromise;
}
