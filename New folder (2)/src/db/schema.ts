import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const androidDevices = pgTable(
  "android_devices",
  {
    id: serial("id").primaryKey(),
    nodeCode: text("node_code").notNull().unique(),
    deviceName: text("device_name").notNull(),
    manufacturer: text("manufacturer").notNull(),
    modelCode: text("model_code").notNull(),
    androidVersion: text("android_version").notNull(),
    socChipset: text("soc_chipset").notNull(),
    ramGb: integer("ram_gb").notNull().default(12),
    resolution: text("resolution").notNull().default("1440x3120 @ 480dpi"),
    imei: text("imei").notNull().unique(),
    androidId: text("android_id").notNull().unique(),
    macAddress: text("mac_address").notNull(),
    buildFingerprint: text("build_fingerprint").notNull(),
    status: text("status").notNull().default("ONLINE"), // ONLINE | BOOTING | ROTATING_IP | AUTOMATING | OFFLINE
    activeApp: text("active_app").notNull().default("HOME"), // HOME | GMAIL | FACEBOOK | YOUTUBE | CHROME_IP | SETTINGS
    cpuUsage: integer("cpu_usage").notNull().default(24),
    ramUsageMb: integer("ram_usage_mb").notNull().default(3200),
    batteryLevel: integer("battery_level").notNull().default(88),
    fps: integer("fps").notNull().default(60),
    clusterShard: text("cluster_shard").notNull().default("SHARD-01"),

    // Dedicated Proxy Configuration (Unique per Android phone)
    proxyProtocol: text("proxy_protocol").notNull().default("SOCKS5"), // SOCKS5 | HTTP/S | 4G_LTE_MOBILE | RESIDENTIAL_STICKY
    proxyIp: text("proxy_ip").notNull().unique(),
    proxyPort: integer("proxy_port").notNull().default(1080),
    proxyUsername: text("proxy_username").notNull(),
    proxyPassword: text("proxy_password").notNull(),
    proxyCountry: text("proxy_country").notNull(),
    proxyCountryCode: text("proxy_country_code").notNull(),
    proxyCity: text("proxy_city").notNull(),
    proxyIsp: text("proxy_isp").notNull(),
    proxyAsn: text("proxy_asn").notNull(),
    proxyLatencyMs: integer("proxy_latency_ms").notNull().default(28),
    webrtcShield: boolean("webrtc_shield").notNull().default(true),
    dnsLeakProtection: boolean("dns_leak_protection").notNull().default(true),

    // Real-Profile Account Matrix (Gmail, Facebook, YouTube)
    gmailAddress: text("gmail_address").notNull(),
    gmailPassword: text("gmail_password").notNull(),
    gmailRecovery: text("gmail_recovery").notNull(),
    gmailStatus: text("gmail_status").notNull().default("VERIFIED_2FA"),
    gmailUnreadCount: integer("gmail_unread_count").notNull().default(3),

    fbName: text("fb_name").notNull(),
    fbEmail: text("fb_email").notNull(),
    fbUid: text("fb_uid").notNull(),
    fbPassword: text("fb_password").notNull(),
    fb2faSecret: text("fb_2fa_secret").notNull(),
    fbStatus: text("fb_status").notNull().default("ADS_READY"),
    fbFriendsCount: integer("fb_friends_count").notNull().default(640),

    ytChannelName: text("yt_channel_name").notNull(),
    ytHandle: text("yt_handle").notNull(),
    ytSubscribers: integer("yt_subscribers").notNull().default(1250),
    ytWatchHours: integer("yt_watch_hours").notNull().default(340),
    ytStatus: text("yt_status").notNull().default("VERIFIED_CHANNEL"),

    cookieTokenDigest: text("cookie_token_digest").notNull(),
    lastSyncedAt: timestamp("last_synced_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_node_code").on(table.nodeCode),
    index("idx_cluster_shard").on(table.clusterShard),
    index("idx_status").on(table.status),
    index("idx_proxy_country").on(table.proxyCountryCode),
    index("idx_manufacturer").on(table.manufacturer),
  ]
);

export const automationTasks = pgTable("automation_tasks", {
  id: serial("id").primaryKey(),
  taskName: text("task_name").notNull(),
  targetScope: text("target_scope").notNull(),
  appTarget: text("app_target").notNull(), // GMAIL | FACEBOOK | YOUTUBE | PROXY | SYSTEM
  devicesAffected: integer("devices_affected").notNull().default(1),
  status: text("status").notNull().default("COMPLETED"),
  commandScript: text("command_script").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AndroidDevice = typeof androidDevices.$inferSelect;
export type NewAndroidDevice = typeof androidDevices.$inferInsert;
export type AutomationTask = typeof automationTasks.$inferSelect;
export type NewAutomationTask = typeof automationTasks.$inferInsert;
