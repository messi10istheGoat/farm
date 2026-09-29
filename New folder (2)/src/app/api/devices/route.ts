import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { androidDevices, automationTasks } from "@/db/schema";
import { ensureFleetSeeded } from "@/lib/seed";
import {
  generateDeviceRecord,
  HARDWARE_CATALOG,
  PROXY_LOCATIONS,
  generateImei,
  generateAndroidId,
  generateMacAddress,
  getClusterShardForIndex,
} from "@/lib/device-generator";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  or,
  sql,
} from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await ensureFleetSeeded();

    const { searchParams } = new URL(request.url);
    const shard = searchParams.get("shard") || "ALL";
    const search = (searchParams.get("search") || "").trim();
    const country = searchParams.get("country") || "ALL";
    const manufacturer = searchParams.get("manufacturer") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const app = searchParams.get("app") || "ALL";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      300,
      Math.max(12, parseInt(searchParams.get("limit") || "72", 10))
    );
    const offset = (page - 1) * limit;

    const conditions = [];

    if (shard !== "ALL") {
      conditions.push(eq(androidDevices.clusterShard, shard));
    }
    if (country !== "ALL") {
      conditions.push(eq(androidDevices.proxyCountryCode, country));
    }
    if (manufacturer !== "ALL") {
      conditions.push(eq(androidDevices.manufacturer, manufacturer));
    }
    if (status !== "ALL") {
      conditions.push(eq(androidDevices.status, status));
    }
    if (app !== "ALL") {
      conditions.push(eq(androidDevices.activeApp, app));
    }
    if (search.length > 0) {
      const pattern = `%${search}%`;
      conditions.push(
        or(
          ilike(androidDevices.nodeCode, pattern),
          ilike(androidDevices.deviceName, pattern),
          ilike(androidDevices.proxyIp, pattern),
          ilike(androidDevices.proxyCountry, pattern),
          ilike(androidDevices.proxyCity, pattern),
          ilike(androidDevices.proxyIsp, pattern),
          ilike(androidDevices.gmailAddress, pattern),
          ilike(androidDevices.fbName, pattern),
          ilike(androidDevices.ytChannelName, pattern),
          ilike(androidDevices.ytHandle, pattern),
          ilike(androidDevices.imei, pattern),
          ilike(androidDevices.androidId, pattern)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [
      devices,
      [{ filteredCount }],
      [{ totalFleetCount }],
      shardGroups,
      countryGroups,
      statusGroups,
      recentTasks,
    ] = await Promise.all([
      db
        .select()
        .from(androidDevices)
        .where(whereClause)
        .orderBy(asc(androidDevices.id))
        .limit(limit)
        .offset(offset),
      db
        .select({ filteredCount: count() })
        .from(androidDevices)
        .where(whereClause),
      db.select({ totalFleetCount: count() }).from(androidDevices),
      db
        .select({
          shard: androidDevices.clusterShard,
          count: count(),
        })
        .from(androidDevices)
        .groupBy(androidDevices.clusterShard)
        .orderBy(asc(androidDevices.clusterShard)),
      db
        .select({
          countryCode: androidDevices.proxyCountryCode,
          country: androidDevices.proxyCountry,
          count: count(),
        })
        .from(androidDevices)
        .groupBy(androidDevices.proxyCountryCode, androidDevices.proxyCountry)
        .orderBy(desc(count())),
      db
        .select({
          status: androidDevices.status,
          count: count(),
        })
        .from(androidDevices)
        .groupBy(androidDevices.status),
      db
        .select()
        .from(automationTasks)
        .orderBy(desc(automationTasks.id))
        .limit(10),
    ]);

    const onlineCount = statusGroups
      .filter((g) => g.status !== "OFFLINE")
      .reduce((acc, g) => acc + Number(g.count), 0);

    return NextResponse.json({
      devices,
      pagination: {
        page,
        limit,
        filteredCount: Number(filteredCount),
        totalPages: Math.max(1, Math.ceil(Number(filteredCount) / limit)),
      },
      telemetry: {
        totalDevices: Number(totalFleetCount),
        onlineDevices: onlineCount,
        uniqueProxiesCount: Number(totalFleetCount),
        totalAccountsCount: Number(totalFleetCount) * 3,
        avgLatencyMs: 34,
        shards: shardGroups.map((s) => ({
          shard: s.shard,
          count: Number(s.count),
        })),
        countries: countryGroups.map((c) => ({
          countryCode: c.countryCode,
          country: c.country,
          count: Number(c.count),
        })),
      },
      recentTasks,
    });
  } catch (error) {
    console.error("GET /api/devices error:", error);
    return NextResponse.json(
      { error: "Failed to load Android device fleet" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureFleetSeeded();
    const body = await request.json();
    const mode = body.mode || "single";

    const [{ maxIdResult }] = await db
      .select({
        maxIdResult: sql<number>`coalesce(max(${androidDevices.id}), 0)`,
      })
      .from(androidDevices);

    const currentMaxSeq = Number(maxIdResult);

    if (mode === "bulk") {
      const countToCreate = Math.min(
        500,
        Math.max(10, Number(body.count) || 300)
      );
      const startSeq = currentMaxSeq + 1;
      const endSeq = currentMaxSeq + countToCreate;
      const batchSize = 150;

      for (let i = startSeq; i <= endSeq; i += batchSize) {
        const batch = [];
        const batchEnd = Math.min(i + batchSize - 1, endSeq);
        for (let seq = i; seq <= batchEnd; seq++) {
          batch.push(generateDeviceRecord(seq));
        }
        await db.insert(androidDevices).values(batch).onConflictDoNothing();
      }

      await db.insert(automationTasks).values({
        taskName: `Bulk Provisioned +${countToCreate} Cloud ARM64 Android Nodes`,
        targetScope: `NODES [${startSeq}-${endSeq}]`,
        appTarget: "SYSTEM",
        devicesAffected: countToCreate,
        status: "COMPLETED",
        commandScript: `fleet-ctl provision --arch arm64-v8a --count ${countToCreate} --unique-proxies --inject-accounts gmail,fb,yt`,
      });

      return NextResponse.json({
        success: true,
        provisionedCount: countToCreate,
        newTotal: endSeq,
      });
    }

    // Single Custom Node Provisioning
    const nextSeq = currentMaxSeq + 1;
    const baseRecord = generateDeviceRecord(nextSeq);

    const selectedHw =
      HARDWARE_CATALOG.find((h) => h.deviceName === body.deviceName) ||
      HARDWARE_CATALOG[0];

    const selectedLoc =
      PROXY_LOCATIONS.find((l) => l.countryCode === body.proxyCountryCode) ||
      PROXY_LOCATIONS[0];

    const customNodeCode = `NODE-${String(nextSeq).padStart(4, "0")}`;
    const customImei = body.imei || generateImei(selectedHw.tacPrefix, nextSeq);
    const customAndroidId = body.androidId || generateAndroidId(nextSeq);

    const octetC = (Math.floor((nextSeq - 1) / 250) + 10) % 254;
    const octetD = ((nextSeq - 1) % 250) + 2;
    const autoProxyIp = `${selectedLoc.subnetA}.${selectedLoc.subnetB}.${octetC}.${octetD}`;

    const newDeviceValues = {
      ...baseRecord,
      nodeCode: customNodeCode,
      deviceName: selectedHw.deviceName,
      manufacturer: selectedHw.manufacturer,
      modelCode: selectedHw.modelCode,
      androidVersion: selectedHw.androidVersion,
      socChipset: selectedHw.socChipset,
      ramGb: selectedHw.ramGb,
      resolution: selectedHw.resolution,
      imei: customImei,
      androidId: customAndroidId,
      macAddress: generateMacAddress(nextSeq),
      buildFingerprint: `${selectedHw.fingerprintPrefix}:user/release-keys`,
      clusterShard: getClusterShardForIndex(nextSeq),
      status: "ONLINE",
      activeApp: "HOME",

      proxyProtocol: body.proxyProtocol || selectedLoc.protocol,
      proxyIp: body.proxyIp || autoProxyIp,
      proxyPort: Number(body.proxyPort) || baseRecord.proxyPort,
      proxyCountry: selectedLoc.country,
      proxyCountryCode: selectedLoc.countryCode,
      proxyCity: body.proxyCity || selectedLoc.city,
      proxyIsp: body.proxyIsp || selectedLoc.isp,
      proxyAsn: selectedLoc.asn,
      proxyLatencyMs: selectedLoc.baseLatency + (nextSeq % 19),

      gmailAddress: body.gmailAddress || baseRecord.gmailAddress,
      gmailPassword: body.gmailPassword || baseRecord.gmailPassword,
      gmailRecovery: body.gmailRecovery || baseRecord.gmailRecovery,
      gmailStatus: "VERIFIED_2FA",

      fbName: body.fbName || baseRecord.fbName,
      fbEmail: body.gmailAddress || baseRecord.gmailAddress,
      fbUid: body.fbUid || baseRecord.fbUid,
      fbStatus: "ADS_READY",

      ytChannelName: body.ytChannelName || baseRecord.ytChannelName,
      ytHandle: body.ytHandle || baseRecord.ytHandle,
      ytStatus: "VERIFIED_CHANNEL",
    };

    const [inserted] = await db
      .insert(androidDevices)
      .values(newDeviceValues)
      .returning();

    await db.insert(automationTasks).values({
      taskName: `Provisioned Custom Node ${inserted.nodeCode} (${inserted.deviceName})`,
      targetScope: inserted.nodeCode,
      appTarget: "SYSTEM",
      devicesAffected: 1,
      status: "COMPLETED",
      commandScript: `avdmanager create avd -n ${inserted.nodeCode} --proxy ${inserted.proxyIp}:${inserted.proxyPort}`,
    });

    return NextResponse.json({
      success: true,
      device: inserted,
    });
  } catch (error) {
    console.error("POST /api/devices error:", error);
    return NextResponse.json(
      { error: "Failed to provision Android device node" },
      { status: 500 }
    );
  }
}
