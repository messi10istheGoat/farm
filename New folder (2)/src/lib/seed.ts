import { db } from "@/db";
import { androidDevices, automationTasks } from "@/db/schema";
import { generateDeviceRecord } from "@/lib/device-generator";
import { count } from "drizzle-orm";

let seedPromise: Promise<void> | null = null;

export async function ensureFleetSeeded(): Promise<void> {
  if (seedPromise) {
    return seedPromise;
  }

  seedPromise = (async () => {
    try {
      const [{ value: existingCount }] = await db
        .select({ value: count() })
        .from(androidDevices);

      if (existingCount >= 1200) {
        return;
      }

      const startSeq = existingCount + 1;
      const targetTotal = 1200;
      const batchSize = 150;

      for (let i = startSeq; i <= targetTotal; i += batchSize) {
        const batch = [];
        const end = Math.min(i + batchSize - 1, targetTotal);
        for (let seq = i; seq <= end; seq++) {
          batch.push(generateDeviceRecord(seq));
        }
        await db.insert(androidDevices).values(batch).onConflictDoNothing();
      }

      const [{ value: tasksCount }] = await db
        .select({ value: count() })
        .from(automationTasks);

      if (tasksCount === 0) {
        await db.insert(automationTasks).values([
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
        ]);
      }
    } catch (err) {
      console.error("Error seeding Android device fleet:", err);
      seedPromise = null;
      throw err;
    }
  })();

  return seedPromise;
}
