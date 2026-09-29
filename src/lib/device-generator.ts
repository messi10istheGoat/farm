import type { NewAndroidDevice } from "@/db/schema";

export interface HardwareSpec {
  deviceName: string;
  manufacturer: string;
  modelCode: string;
  androidVersion: string;
  socChipset: string;
  ramGb: number;
  resolution: string;
  tacPrefix: string; // 8-digit TAC for authentic IMEI generation
  fingerprintPrefix: string;
}

export const HARDWARE_CATALOG: HardwareSpec[] = [
  {
    deviceName: "Samsung Galaxy S24 Ultra",
    manufacturer: "Samsung",
    modelCode: "SM-S928B",
    androidVersion: "Android 14 (API 34)",
    socChipset: "Snapdragon 8 Gen 3",
    ramGb: 12,
    resolution: "1440x3120 @ 480dpi",
    tacPrefix: "35892110",
    fingerprintPrefix: "samsung/e3qxxx/e3q:14/UP1A.231005.007/S928BXXU1AWM9",
  },
  {
    deviceName: "Google Pixel 9 Pro XL",
    manufacturer: "Google",
    modelCode: "GGX8B",
    androidVersion: "Android 15 (API 35)",
    socChipset: "Google Tensor G4",
    ramGb: 16,
    resolution: "1344x2992 @ 480dpi",
    tacPrefix: "35418811",
    fingerprintPrefix: "google/komodo/komodo:15/AD1A.240530.047/12196213",
  },
  {
    deviceName: "Google Pixel 8 Pro",
    manufacturer: "Google",
    modelCode: "GC3VE",
    androidVersion: "Android 14 (API 34)",
    socChipset: "Google Tensor G3",
    ramGb: 12,
    resolution: "1344x2992 @ 480dpi",
    tacPrefix: "35672910",
    fingerprintPrefix: "google/husky/husky:14/UQ1A.240205.004/11269751",
  },
  {
    deviceName: "OnePlus 12 5G",
    manufacturer: "OnePlus",
    modelCode: "CPH2581",
    androidVersion: "Android 14 (API 34)",
    socChipset: "Snapdragon 8 Gen 3",
    ramGb: 16,
    resolution: "1440x3168 @ 510dpi",
    tacPrefix: "86941206",
    fingerprintPrefix: "OnePlus/CPH2581/OP5929L1:14/UKQ1.230924.001/U.1489b77",
  },
  {
    deviceName: "Xiaomi 14 Ultra",
    manufacturer: "Xiaomi",
    modelCode: "24030PN60G",
    androidVersion: "Android 14 (API 34)",
    socChipset: "Snapdragon 8 Gen 3",
    ramGb: 16,
    resolution: "1440x3200 @ 522dpi",
    tacPrefix: "86319507",
    fingerprintPrefix: "Xiaomi/aurora_global/aurora:14/UKQ1.231003.002/V816.0.4.0",
  },
  {
    deviceName: "Samsung Galaxy Z Fold 6",
    manufacturer: "Samsung",
    modelCode: "SM-F956B",
    androidVersion: "Android 14 (API 34)",
    socChipset: "Snapdragon 8 Gen 3",
    ramGb: 12,
    resolution: "1856x2160 @ 420dpi",
    tacPrefix: "35190412",
    fingerprintPrefix: "samsung/q6qxxx/q6q:14/UP1A.231005.007/F956BXXU1AXF7",
  },
  {
    deviceName: "ASUS ROG Phone 8 Pro",
    manufacturer: "ASUS",
    modelCode: "AI2401_D",
    androidVersion: "Android 14 (API 34)",
    socChipset: "Snapdragon 8 Gen 3",
    ramGb: 16,
    resolution: "1080x2400 @ 440dpi",
    tacPrefix: "35901109",
    fingerprintPrefix: "asus/WW_AI2401/AI2401:14/UKQ1.230917.001/34.1420.1420.218",
  },
  {
    deviceName: "Nothing Phone (2)",
    manufacturer: "Nothing",
    modelCode: "A065",
    androidVersion: "Android 14 (API 34)",
    socChipset: "Snapdragon 8+ Gen 1",
    ramGb: 12,
    resolution: "1080x2412 @ 420dpi",
    tacPrefix: "35098441",
    fingerprintPrefix: "Nothing/Pong/Pong:14/UP1A.231005.007/2404181912",
  },
  {
    deviceName: "Sony Xperia 1 VI",
    manufacturer: "Sony",
    modelCode: "XQ-EC54",
    androidVersion: "Android 14 (API 34)",
    socChipset: "Snapdragon 8 Gen 3",
    ramGb: 12,
    resolution: "1080x2340 @ 420dpi",
    tacPrefix: "35481920",
    fingerprintPrefix: "Sony/XQ-EC54/XQ-EC54:14/69.0.A.2.26/069000A002002600",
  },
  {
    deviceName: "Vivo X100 Pro",
    manufacturer: "Vivo",
    modelCode: "V2309",
    androidVersion: "Android 14 (API 34)",
    socChipset: "Dimensity 9300",
    ramGb: 16,
    resolution: "1260x2800 @ 452dpi",
    tacPrefix: "86770406",
    fingerprintPrefix: "vivo/PD2324F_EX/PD2324:14/UP1A.231005.007/compiler0118",
  },
  {
    deviceName: "Oppo Find X7 Ultra",
    manufacturer: "Oppo",
    modelCode: "PHY110",
    androidVersion: "Android 14 (API 34)",
    socChipset: "Snapdragon 8 Gen 3",
    ramGb: 16,
    resolution: "1440x3168 @ 510dpi",
    tacPrefix: "86521908",
    fingerprintPrefix: "OPPO/PHY110/OP5CF9L1:14/UKQ1.230924.001/T.183e2a1",
  },
  {
    deviceName: "Motorola Edge 50 Ultra",
    manufacturer: "Motorola",
    modelCode: "XT2401-1",
    androidVersion: "Android 14 (API 34)",
    socChipset: "Snapdragon 8s Gen 3",
    ramGb: 12,
    resolution: "1220x2712 @ 446dpi",
    tacPrefix: "35790114",
    fingerprintPrefix: "motorola/rtwo_g/rtwo:14/U2UIS34.40-41/7a3d9",
  },
  {
    deviceName: "Samsung Galaxy S23 FE",
    manufacturer: "Samsung",
    modelCode: "SM-S711B",
    androidVersion: "Android 14 (API 34)",
    socChipset: "Exynos 2200",
    ramGb: 8,
    resolution: "1080x2340 @ 420dpi",
    tacPrefix: "35284119",
    fingerprintPrefix: "samsung/r11sxxx/r11s:14/UP1A.231005.007/S711BXXS2BXB1",
  },
  {
    deviceName: "Redmi Note 13 Pro+ 5G",
    manufacturer: "Xiaomi",
    modelCode: "23090RA98G",
    androidVersion: "Android 14 (API 34)",
    socChipset: "Dimensity 7200-Ultra",
    ramGb: 12,
    resolution: "1220x2712 @ 446dpi",
    tacPrefix: "86401922",
    fingerprintPrefix: "Redmi/zircon_global/zircon:14/UP1A.230905.011/V816.0.2.0",
  },
  {
    deviceName: "POCO F6 Pro",
    manufacturer: "Xiaomi",
    modelCode: "23113RKC6G",
    androidVersion: "Android 14 (API 34)",
    socChipset: "Snapdragon 8 Gen 2",
    ramGb: 12,
    resolution: "1440x3200 @ 526dpi",
    tacPrefix: "86910443",
    fingerprintPrefix: "POCO/vermeer_global/vermeer:14/UKQ1.230804.001/V816.0.3.0",
  },
  {
    deviceName: "Honor Magic6 Pro",
    manufacturer: "Honor",
    modelCode: "BVL-N49",
    androidVersion: "Android 14 (API 34)",
    socChipset: "Snapdragon 8 Gen 3",
    ramGb: 12,
    resolution: "1280x2800 @ 453dpi",
    tacPrefix: "86194208",
    fingerprintPrefix: "HONOR/BVL-N49/HNBVL-Q:14/HONORBVL-N49/8.0.0.152",
  },
  {
    deviceName: "Realme GT 6",
    manufacturer: "Realme",
    modelCode: "RMX3851",
    androidVersion: "Android 14 (API 34)",
    socChipset: "Snapdragon 8s Gen 3",
    ramGb: 12,
    resolution: "1264x2780 @ 450dpi",
    tacPrefix: "86702815",
    fingerprintPrefix: "realme/RMX3851/RE5C9B:14/UKQ1.230924.001/R.1a9c2",
  },
  {
    deviceName: "Google Pixel 7a",
    manufacturer: "Google",
    modelCode: "GWKK3",
    androidVersion: "Android 14 (API 34)",
    socChipset: "Google Tensor G2",
    ramGb: 8,
    resolution: "1080x2400 @ 420dpi",
    tacPrefix: "35910244",
    fingerprintPrefix: "google/lynx/lynx:14/UQ1A.240205.002/11224170",
  },
  {
    deviceName: "Samsung Galaxy A55 5G",
    manufacturer: "Samsung",
    modelCode: "SM-A556E",
    androidVersion: "Android 14 (API 34)",
    socChipset: "Exynos 1480",
    ramGb: 8,
    resolution: "1080x2340 @ 420dpi",
    tacPrefix: "35601988",
    fingerprintPrefix: "samsung/a55xnsxx/a55x:14/UP1A.231005.007/A556EXXU1AXC4",
  },
  {
    deviceName: "OnePlus Nord 4",
    manufacturer: "OnePlus",
    modelCode: "CPH2663",
    androidVersion: "Android 14 (API 34)",
    socChipset: "Snapdragon 7+ Gen 3",
    ramGb: 12,
    resolution: "1240x2772 @ 450dpi",
    tacPrefix: "86291045",
    fingerprintPrefix: "OnePlus/CPH2663/OP5D0BL1:14/UP1A.231005.007/U.16a29c",
  },
];

export interface ProxyLocationSpec {
  country: string;
  countryCode: string;
  city: string;
  isp: string;
  asn: string;
  protocol: string;
  subnetA: number;
  subnetB: number;
  baseLatency: number;
}

export const PROXY_LOCATIONS: ProxyLocationSpec[] = [
  {
    country: "United States",
    countryCode: "US",
    city: "Ashburn, VA",
    isp: "AT&T Mobility 5G",
    asn: "AS7018",
    protocol: "4G_LTE_MOBILE",
    subnetA: 172,
    subnetB: 56,
    baseLatency: 18,
  },
  {
    country: "United States",
    countryCode: "US",
    city: "Dallas, TX",
    isp: "T-Mobile USA 5G",
    asn: "AS21928",
    protocol: "4G_LTE_MOBILE",
    subnetA: 104,
    subnetB: 28,
    baseLatency: 24,
  },
  {
    country: "United States",
    countryCode: "US",
    city: "New York, NY",
    isp: "Verizon Fios Residential",
    asn: "AS701",
    protocol: "RESIDENTIAL_STICKY",
    subnetA: 71,
    subnetB: 183,
    baseLatency: 14,
  },
  {
    country: "United States",
    countryCode: "US",
    city: "Los Angeles, CA",
    isp: "Comcast Xfinity Residential",
    asn: "AS7922",
    protocol: "SOCKS5",
    subnetA: 98,
    subnetB: 210,
    baseLatency: 31,
  },
  {
    country: "Germany",
    countryCode: "DE",
    city: "Frankfurt",
    isp: "Vodafone GmbH Mobile",
    asn: "AS3209",
    protocol: "4G_LTE_MOBILE",
    subnetA: 188,
    subnetB: 96,
    baseLatency: 38,
  },
  {
    country: "Germany",
    countryCode: "DE",
    city: "Berlin",
    isp: "Deutsche Telekom AG",
    asn: "AS3320",
    protocol: "SOCKS5",
    subnetA: 84,
    subnetB: 142,
    baseLatency: 42,
  },
  {
    country: "United Kingdom",
    countryCode: "GB",
    city: "London",
    isp: "EE Limited 5G",
    asn: "AS12576",
    protocol: "4G_LTE_MOBILE",
    subnetA: 81,
    subnetB: 134,
    baseLatency: 29,
  },
  {
    country: "United Kingdom",
    countryCode: "GB",
    city: "Manchester",
    isp: "BT Broadband Residential",
    asn: "AS2856",
    protocol: "RESIDENTIAL_STICKY",
    subnetA: 86,
    subnetB: 152,
    baseLatency: 33,
  },
  {
    country: "Japan",
    countryCode: "JP",
    city: "Tokyo",
    isp: "NTT Docomo 5G",
    asn: "AS9605",
    protocol: "4G_LTE_MOBILE",
    subnetA: 126,
    subnetB: 158,
    baseLatency: 76,
  },
  {
    country: "Singapore",
    countryCode: "SG",
    city: "Singapore",
    isp: "Singtel Mobile 5G",
    asn: "AS7473",
    protocol: "SOCKS5",
    subnetA: 119,
    subnetB: 74,
    baseLatency: 84,
  },
  {
    country: "Netherlands",
    countryCode: "NL",
    city: "Amsterdam",
    isp: "KPN B.V. Residential",
    asn: "AS1136",
    protocol: "RESIDENTIAL_STICKY",
    subnetA: 145,
    subnetB: 53,
    baseLatency: 35,
  },
  {
    country: "Canada",
    countryCode: "CA",
    city: "Toronto, ON",
    isp: "Rogers Communications",
    asn: "AS812",
    protocol: "SOCKS5",
    subnetA: 99,
    subnetB: 224,
    baseLatency: 22,
  },
  {
    country: "France",
    countryCode: "FR",
    city: "Paris",
    isp: "Orange S.A. Mobile",
    asn: "AS3215",
    protocol: "4G_LTE_MOBILE",
    subnetA: 90,
    subnetB: 63,
    baseLatency: 36,
  },
  {
    country: "Switzerland",
    countryCode: "CH",
    city: "Zurich",
    isp: "Swisscom AG Fibre",
    asn: "AS3303",
    protocol: "SOCKS5",
    subnetA: 178,
    subnetB: 192,
    baseLatency: 41,
  },
  {
    country: "South Korea",
    countryCode: "KR",
    city: "Seoul",
    isp: "SK Telecom 5G",
    asn: "AS9644",
    protocol: "4G_LTE_MOBILE",
    subnetA: 211,
    subnetB: 234,
    baseLatency: 89,
  },
  {
    country: "Australia",
    countryCode: "AU",
    city: "Sydney",
    isp: "Telstra 5G Mobile",
    asn: "AS1221",
    protocol: "HTTP/S",
    subnetA: 101,
    subnetB: 164,
    baseLatency: 112,
  },
];

const FIRST_NAMES = [
  "Marcus", "Elena", "Devon", "Sora", "Liam", "Aria", "Kenji", "Nadia",
  "Julian", "Chloe", "Mateo", "Zara", "Lucas", "Freya", "Darius", "Maya",
  "Rafael", "Sienna", "Kieran", "Alina", "Viktor", "Talia", "Caleb", "Noemi",
  "Orion", "Lyra", "Felix", "Camila", "Ezra", "Hana", "Roman", "Iris",
  "Sebastian", "claire", "Dominic", "valerie", "Xavier", "Naomi", "Gideon", "Elise",
];

const LAST_NAMES = [
  "Vance", "Rostova", "Kowalski", "Takahashi", "Mercer", "Lindqvist", "Moreau", "Castillo",
  "Thorne", "Sterling", "Novak", "Keller", "Sato", "Delgado", "Berger", "Solis",
  "Faulkner", "Volkov", "Chen", "Alvarez", "Harrington", "Nakamura", "Bauer", "Silva",
  "Reeves", "Okafor", "Jensen", "Lombardi", "cross", "Sinclair", "Varga", "mensah",
];

const YT_NICHES = [
  "Tech Labs", "Digital Nomad", "Crypto & AI", "Mobile Gaming", "Daily Vlogs",
  "Studio Beats", "Code & Cloud", "Design Flow", "Hardware Unboxed", "Finance Pulse",
  "Street Visuals", "Auto Garage", "Cyber Security", "Synth Wave", "NextGen Reviews",
];

const GMAIL_STATUSES = ["VERIFIED_2FA", "AGED_2019", "WARMED_UP", "TRUST_SCORE_99"];
const FB_STATUSES = ["ADS_READY", "AGED_PROFILE", "MARKETPLACE_ACTIVE", "VERIFIED_BM"];
const YT_STATUSES = ["MONETIZED", "VERIFIED_CHANNEL", "WARMING_FEED", "CREATOR_ACTIVE"];
const ACTIVE_APPS = ["HOME", "GMAIL", "FACEBOOK", "YOUTUBE", "CHROME_IP"];
const DEVICE_STATUSES = ["ONLINE", "ONLINE", "ONLINE", "ONLINE", "AUTOMATING", "ONLINE", "ROTATING_IP"];

function computeLuhnCheckDigit(partial14: string): string {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(partial14[i], 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  const mod = sum % 10;
  return mod === 0 ? "0" : String(10 - mod);
}

export function generateImei(tacPrefix: string, seqNumber: number): string {
  const serial6 = String((seqNumber * 137 + 40291) % 1000000).padStart(6, "0");
  const partial14 = `${tacPrefix.slice(0, 8)}${serial6}`;
  return `${partial14}${computeLuhnCheckDigit(partial14)}`;
}

export function generateAndroidId(seqNumber: number): string {
  const h1 = ((seqNumber * 2654435761) >>> 0).toString(16).padStart(8, "0");
  const h2 = (((seqNumber + 99991) * 1597334677) >>> 0).toString(16).padStart(8, "0");
  return `${h1}${h2}`.slice(0, 16);
}

export function generateMacAddress(seqNumber: number): string {
  const b3 = ((seqNumber * 37) & 0xff).toString(16).padStart(2, "0");
  const b4 = ((seqNumber * 73 + 19) & 0xff).toString(16).padStart(2, "0");
  const b5 = (((seqNumber >> 4) * 53 + 101) & 0xff).toString(16).padStart(2, "0");
  const b6 = ((seqNumber * 199 + 7) & 0xff).toString(16).padStart(2, "0");
  return `02:42:${b3}:${b4}:${b5}:${b6}`.toUpperCase();
}

export function getClusterShardForIndex(seqNumber: number): string {
  const shardIdx = Math.floor((seqNumber - 1) / 300) + 1;
  const start = (shardIdx - 1) * 300 + 1;
  const end = shardIdx * 300;
  return `SHARD-${String(shardIdx).padStart(2, "0")} [${String(start).padStart(4, "0")}-${String(end).padStart(4, "0")}]`;
}

export function generateDeviceRecord(seqNumber: number): NewAndroidDevice {
  const hw = HARDWARE_CATALOG[(seqNumber - 1) % HARDWARE_CATALOG.length];
  const loc = PROXY_LOCATIONS[(seqNumber * 7 + 3) % PROXY_LOCATIONS.length];

  // Guarantee 100% unique proxy IP for every seqNumber!
  // Octet C and Octet D derived directly from seqNumber
  const octetC = (Math.floor((seqNumber - 1) / 250) + 10) % 254;
  const octetD = ((seqNumber - 1) % 250) + 2;
  const uniqueFirstOctet = ((loc.subnetA + Math.floor((seqNumber - 1) / 5000)) % 220) + 11;
  const proxyIp = `${uniqueFirstOctet}.${loc.subnetB}.${octetC}.${octetD}`;
  const proxyPort = 10000 + ((seqNumber * 17) % 45000);

  const firstRaw = FIRST_NAMES[(seqNumber * 5 + 1) % FIRST_NAMES.length];
  const lastRaw = LAST_NAMES[(seqNumber * 11 + 2) % LAST_NAMES.length];
  const firstName = firstRaw.charAt(0).toUpperCase() + firstRaw.slice(1).toLowerCase();
  const lastName = lastRaw.charAt(0).toUpperCase() + lastRaw.slice(1).toLowerCase();
  const handleNum = (seqNumber % 899) + 100;

  const emailPrefix = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${seqNumber}`;
  const gmailAddress = `${emailPrefix}@gmail.com`;
  const gmailRecovery = `${firstName.toLowerCase()}_${seqNumber}_sec@proton.me`;
  const gmailPassword = `Gm#${seqNumber}x!${firstName.slice(0, 2).toUpperCase()}9q`;

  const fbName = `${firstName} ${lastName}`;
  const fbUid = `1000${String(81000000000 + seqNumber * 49123).slice(0, 11)}`;
  const fbPassword = `Fb$${seqNumber}vK_${lastName.slice(0, 2).toUpperCase()}7`;
  const fb2faSecret = `JBSW Y3DP EHPK ${String(seqNumber + 1000).slice(-4)}`;

  const niche = YT_NICHES[seqNumber % YT_NICHES.length];
  const ytChannelName = `${firstName} ${niche}`;
  const ytHandle = `@${firstName.toLowerCase()}${niche.replace(/[^a-zA-Z]/g, "").toLowerCase()}${seqNumber}`;

  const nodeCode = `NODE-${String(seqNumber).padStart(4, "0")}`;
  const imei = generateImei(hw.tacPrefix, seqNumber);
  const androidId = generateAndroidId(seqNumber);
  const macAddress = generateMacAddress(seqNumber);

  const status = DEVICE_STATUSES[seqNumber % DEVICE_STATUSES.length];
  const activeApp = ACTIVE_APPS[seqNumber % ACTIVE_APPS.length];

  const cpuUsage = 14 + ((seqNumber * 19) % 62);
  const ramUsageMb = Math.min(
    hw.ramGb * 1024 - 1024,
    2400 + ((seqNumber * 311) % (hw.ramGb * 550))
  );
  const batteryLevel = 48 + ((seqNumber * 13) % 52);
  const proxyLatencyMs = loc.baseLatency + ((seqNumber * 7) % 34);

  return {
    nodeCode,
    deviceName: hw.deviceName,
    manufacturer: hw.manufacturer,
    modelCode: hw.modelCode,
    androidVersion: hw.androidVersion,
    socChipset: hw.socChipset,
    ramGb: hw.ramGb,
    resolution: hw.resolution,
    imei,
    androidId,
    macAddress,
    buildFingerprint: `${hw.fingerprintPrefix}:user/release-keys`,
    status,
    activeApp,
    cpuUsage,
    ramUsageMb,
    batteryLevel,
    fps: 58 + (seqNumber % 3),
    clusterShard: getClusterShardForIndex(seqNumber),

    proxyProtocol: loc.protocol,
    proxyIp,
    proxyPort,
    proxyUsername: `prx_${nodeCode.toLowerCase().replace("-", "_")}_${loc.countryCode.toLowerCase()}`,
    proxyPassword: `sk_${androidId.slice(0, 10)}`,
    proxyCountry: loc.country,
    proxyCountryCode: loc.countryCode,
    proxyCity: loc.city,
    proxyIsp: loc.isp,
    proxyAsn: loc.asn,
    proxyLatencyMs,
    webrtcShield: true,
    dnsLeakProtection: true,

    gmailAddress,
    gmailPassword,
    gmailRecovery,
    gmailStatus: GMAIL_STATUSES[seqNumber % GMAIL_STATUSES.length],
    gmailUnreadCount: 1 + (seqNumber % 14),

    fbName,
    fbEmail: gmailAddress,
    fbUid,
    fbPassword,
    fb2faSecret,
    fbStatus: FB_STATUSES[seqNumber % FB_STATUSES.length],
    fbFriendsCount: 210 + ((seqNumber * 43) % 3800),

    ytChannelName,
    ytHandle,
    ytSubscribers: 350 + ((seqNumber * 197) % 84000),
    ytWatchHours: 120 + ((seqNumber * 29) % 6400),
    ytStatus: YT_STATUSES[seqNumber % YT_STATUSES.length],

    cookieTokenDigest: `SID=g.a000jQ${androidId.slice(0, 8)}; HSID=A9x${seqNumber}; c_user=${fbUid}; xs=42%3A${androidId.slice(8, 16)}`,
  };
}
