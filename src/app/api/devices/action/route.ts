import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { androidDevices, automationTasks } from "@/db/schema";
import {
  PROXY_LOCATIONS,
  HARDWARE_CATALOG,
  generateImei,
  generateAndroidId,
  generateMacAddress,
} from "@/lib/device-generator";
import { count, eq, inArray, or, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, deviceId, deviceIds, payload } = body;

    // 1. Switch Active App on Single or Multi-Sync Devices
    if (action === "SWITCH_APP") {
      const targetApp = payload?.app || "HOME";
      const ids: number[] =
        Array.isArray(deviceIds) && deviceIds.length > 0
          ? deviceIds
          : deviceId
          ? [Number(deviceId)]
          : [];

      if (ids.length === 0) {
        return NextResponse.json(
          { error: "No target device IDs provided" },
          { status: 400 }
        );
      }

      const updated = await db
        .update(androidDevices)
        .set({
          activeApp: targetApp,
          status: "ONLINE",
          lastSyncedAt: new Date(),
        })
        .where(inArray(androidDevices.id, ids))
        .returning();

      const scopeName =
        ids.length === 1
          ? updated[0]?.nodeCode || `NODE #${ids[0]}`
          : `${ids.length} SYNC NODES`;

      await db.insert(automationTasks).values({
        taskName: `Foreground App Switched to [${targetApp}]`,
        targetScope: scopeName,
        appTarget: targetApp,
        devicesAffected: ids.length,
        status: "COMPLETED",
        commandScript: `am start -n com.droidmatrix.${targetApp.toLowerCase()}/.MainActivity`,
      });

      return NextResponse.json({
        success: true,
        devices: updated,
      });
    }

    // 2. Rotate Dedicated Proxy IP on a Device
    if (action === "ROTATE_PROXY") {
      const id = Number(deviceId);
      const [existing] = await db
        .select()
        .from(androidDevices)
        .where(eq(androidDevices.id, id));

      if (!existing) {
        return NextResponse.json({ error: "Device not found" }, { status: 404 });
      }

      const targetCountryCode =
        payload?.countryCode || existing.proxyCountryCode;
      const locCandidates = PROXY_LOCATIONS.filter(
        (l) => l.countryCode === targetCountryCode
      );
      const loc =
        locCandidates.length > 0
          ? locCandidates[Math.floor(Math.random() * locCandidates.length)]
          : PROXY_LOCATIONS[Math.floor(Math.random() * PROXY_LOCATIONS.length)];

      // Generate a collision-free unique proxy IP
      let newProxyIp = "";
      for (let attempt = 0; attempt < 10; attempt++) {
        const randOctetA =
          ((loc.subnetA + Math.floor(Math.random() * 40)) % 220) + 12;
        const randOctetC = Math.floor(Math.random() * 240) + 10;
        const randOctetD = Math.floor(Math.random() * 240) + 5;
        const candidateIp = `${randOctetA}.${loc.subnetB}.${randOctetC}.${randOctetD}`;

        const [ipConflict] = await db
          .select({ id: androidDevices.id })
          .from(androidDevices)
          .where(eq(androidDevices.proxyIp, candidateIp));

        if (!ipConflict || ipConflict.id === id) {
          newProxyIp = candidateIp;
          break;
        }
      }

      if (!newProxyIp) {
        const fallbackOctetD = (id % 240) + 10;
        newProxyIp = `${loc.subnetA + 3}.${loc.subnetB}.${(id % 200) + 20}.${fallbackOctetD}`;
      }

      const newPort = 10000 + Math.floor(Math.random() * 45000);
      const newLatency = loc.baseLatency + Math.floor(Math.random() * 22);

      const [updated] = await db
        .update(androidDevices)
        .set({
          proxyIp: newProxyIp,
          proxyPort: newPort,
          proxyCountry: loc.country,
          proxyCountryCode: loc.countryCode,
          proxyCity: loc.city,
          proxyIsp: loc.isp,
          proxyAsn: loc.asn,
          proxyProtocol: payload?.protocol || loc.protocol,
          proxyLatencyMs: newLatency,
          status: "ONLINE",
          lastSyncedAt: new Date(),
        })
        .where(eq(androidDevices.id, id))
        .returning();

      await db.insert(automationTasks).values({
        taskName: `Rotated Dedicated Proxy Tunnel for ${updated.nodeCode} -> ${newProxyIp}`,
        targetScope: updated.nodeCode,
        appTarget: "PROXY",
        devicesAffected: 1,
        status: "COMPLETED",
        commandScript: `iptables -t nat -F && redsocks -c /etc/redsocks_${updated.nodeCode}.conf # ${newProxyIp}:${newPort} (${loc.isp})`,
      });

      return NextResponse.json({
        success: true,
        device: updated,
      });
    }

    // 3. Spoof / Regenerate Hardware Fingerprint (IMEI, Android ID, MAC, Model)
    if (action === "SPOOF_FINGERPRINT") {
      const id = Number(deviceId);
      const [existing] = await db
        .select()
        .from(androidDevices)
        .where(eq(androidDevices.id, id));

      if (!existing) {
        return NextResponse.json({ error: "Device not found" }, { status: 404 });
      }

      const hw = payload?.deviceName
        ? HARDWARE_CATALOG.find((h) => h.deviceName === payload.deviceName) ||
          HARDWARE_CATALOG[0]
        : HARDWARE_CATALOG[Math.floor(Math.random() * HARDWARE_CATALOG.length)];

      let newImei = "";
      let newAndroidId = "";
      for (let attempt = 0; attempt < 5; attempt++) {
        const entropySeed =
          id * 10000 + Math.floor(Math.random() * 899999) + 100000;
        const candidateImei = generateImei(hw.tacPrefix, entropySeed);
        const candidateAndroidId = generateAndroidId(entropySeed);

        const [conflict] = await db
          .select({ id: androidDevices.id })
          .from(androidDevices)
          .where(
            or(
              eq(androidDevices.imei, candidateImei),
              eq(androidDevices.androidId, candidateAndroidId)
            )
          );

        if (!conflict || conflict.id === id) {
          newImei = candidateImei;
          newAndroidId = candidateAndroidId;
          break;
        }
      }

      if (!newImei) {
        newImei = generateImei(hw.tacPrefix, id * 7919 + 54321);
        newAndroidId = generateAndroidId(id * 7919 + 54321);
      }

      const newMac = generateMacAddress(id * 17 + Math.floor(Math.random() * 500));

      const [updated] = await db
        .update(androidDevices)
        .set({
          deviceName: hw.deviceName,
          manufacturer: hw.manufacturer,
          modelCode: hw.modelCode,
          androidVersion: hw.androidVersion,
          socChipset: hw.socChipset,
          ramGb: hw.ramGb,
          resolution: hw.resolution,
          imei: newImei,
          androidId: newAndroidId,
          macAddress: newMac,
          buildFingerprint: `${hw.fingerprintPrefix}:user/release-keys`,
          lastSyncedAt: new Date(),
        })
        .where(eq(androidDevices.id, id))
        .returning();

      await db.insert(automationTasks).values({
        taskName: `Hardware Anti-Detect Fingerprint Spoofed on ${updated.nodeCode}`,
        targetScope: updated.nodeCode,
        appTarget: "SYSTEM",
        devicesAffected: 1,
        status: "COMPLETED",
        commandScript: `setprop ro.product.model "${hw.modelCode}" && setprop persist.radio.imei "${newImei}" && settings put secure android_id ${newAndroidId}`,
      });

      return NextResponse.json({
        success: true,
        device: updated,
      });
    }

    // 4. Update Account Credentials or Trigger In-App Engagement (Gmail, FB, YT)
    if (action === "UPDATE_ACCOUNTS") {
      const id = Number(deviceId);
      const [existing] = await db
        .select()
        .from(androidDevices)
        .where(eq(androidDevices.id, id));

      if (!existing) {
        return NextResponse.json({ error: "Device not found" }, { status: 404 });
      }

      const [updated] = await db
        .update(androidDevices)
        .set({
          gmailAddress: payload?.gmailAddress ?? existing.gmailAddress,
          gmailPassword: payload?.gmailPassword ?? existing.gmailPassword,
          gmailRecovery: payload?.gmailRecovery ?? existing.gmailRecovery,
          gmailStatus: payload?.gmailStatus ?? existing.gmailStatus,
          gmailUnreadCount:
            payload?.gmailUnreadCount !== undefined
              ? Number(payload.gmailUnreadCount)
              : existing.gmailUnreadCount,
          fbName: payload?.fbName ?? existing.fbName,
          fbEmail: payload?.fbEmail ?? existing.fbEmail,
          fbUid: payload?.fbUid ?? existing.fbUid,
          fbPassword: payload?.fbPassword ?? existing.fbPassword,
          fb2faSecret: payload?.fb2faSecret ?? existing.fb2faSecret,
          fbStatus: payload?.fbStatus ?? existing.fbStatus,
          fbFriendsCount:
            payload?.fbFriendsCount !== undefined
              ? Number(payload.fbFriendsCount)
              : existing.fbFriendsCount,
          ytChannelName: payload?.ytChannelName ?? existing.ytChannelName,
          ytHandle: payload?.ytHandle ?? existing.ytHandle,
          ytSubscribers:
            payload?.ytSubscribers !== undefined
              ? Number(payload.ytSubscribers)
              : existing.ytSubscribers,
          ytWatchHours:
            payload?.ytWatchHours !== undefined
              ? Number(payload.ytWatchHours)
              : existing.ytWatchHours,
          ytStatus: payload?.ytStatus ?? existing.ytStatus,
          lastSyncedAt: new Date(),
        })
        .where(eq(androidDevices.id, id))
        .returning();

      const safeEmail = updated.gmailAddress.replace(/['"\\]/g, "");

      await db.insert(automationTasks).values({
        taskName: `Synced Account Vault (Gmail/FB/YT) on ${updated.nodeCode}`,
        targetScope: updated.nodeCode,
        appTarget: payload?.appTarget || "GMAIL",
        devicesAffected: 1,
        status: "COMPLETED",
        commandScript: `sqlite3 /data/system_ce/0/accounts_ce.db "UPDATE accounts SET name='${safeEmail}';"`,
      });

      return NextResponse.json({
        success: true,
        device: updated,
      });
    }

    // 5. Fleet-Wide Batch Automation Command
    if (action === "FLEET_BATCH_COMMAND") {
      const commandType = payload?.commandType || "WARMUP_YT";
      const shardScope = payload?.shard || "ALL";

      const whereCond =
        shardScope !== "ALL"
          ? eq(androidDevices.clusterShard, shardScope)
          : undefined;

      const [{ count: matchingCount }] = await db
        .select({ count: count() })
        .from(androidDevices)
        .where(whereCond);

      const affected = Number(matchingCount) || 1;

      let targetApp = "YOUTUBE";
      let taskTitle = "Fleet YouTube Auto-Watch & Subscription Warmup";
      let script =
        "for node in $(fleet-nodes); do adb -s $node shell am start -n com.google.android.youtube/.HomeActivity; done";

      if (commandType === "WARMUP_GMAIL") {
        targetApp = "GMAIL";
        taskTitle = "Fleet Gmail Inbox Read, Star & 2FA Trust Refresh";
        script =
          "for node in $(fleet-nodes); do adb -s $node shell am start -n com.google.android.gm/.ConversationListActivityGmail; done";
      } else if (commandType === "WARMUP_FB") {
        targetApp = "FACEBOOK";
        taskTitle = "Fleet Facebook News Feed Scroll, Like & Reels Warmup";
        script =
          "for node in $(fleet-nodes); do adb -s $node shell am start -n com.facebook.katana/.LoginActivity; done";
      } else if (commandType === "VERIFY_PROXIES") {
        targetApp = "CHROME_IP";
        taskTitle = "Fleet Multi-Hop Proxy Exit IP & WebRTC Zero-Leak Audit";
        script =
          "fleet-proxy-verifier --check-webrtc --check-asn --strict-isolation";
      } else if (commandType === "HOME_ALL") {
        targetApp = "HOME";
        taskTitle = "Broadcast Android KEYCODE_HOME to Active Shard Nodes";
        script = "fleet-adb broadcast 'input keyevent KEYCODE_HOME'";
      }

      await db
        .update(androidDevices)
        .set({
          activeApp: targetApp,
          status: commandType === "HOME_ALL" ? "ONLINE" : "AUTOMATING",
          gmailUnreadCount:
            commandType === "WARMUP_GMAIL"
              ? sql`GREATEST(0, ${androidDevices.gmailUnreadCount} - 1)`
              : androidDevices.gmailUnreadCount,
          ytWatchHours:
            commandType === "WARMUP_YT"
              ? sql`${androidDevices.ytWatchHours} + 5`
              : androidDevices.ytWatchHours,
          fbFriendsCount:
            commandType === "WARMUP_FB"
              ? sql`${androidDevices.fbFriendsCount} + 2`
              : androidDevices.fbFriendsCount,
          lastSyncedAt: new Date(),
        })
        .where(whereCond);

      const [newTask] = await db
        .insert(automationTasks)
        .values({
          taskName: taskTitle,
          targetScope:
            shardScope === "ALL" ? "ALL_SHARDS [ENTIRE FLEET]" : shardScope,
          appTarget: targetApp,
          devicesAffected: affected,
          status: "COMPLETED",
          commandScript: script,
        })
        .returning();

      return NextResponse.json({
        success: true,
        task: newTask,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/devices/action error:", error);
    return NextResponse.json(
      { error: "Failed to execute device action" },
      { status: 500 }
    );
  }
}
