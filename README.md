# DROIDMATRIX // Cloud ARM64 Android Fleet & Anti-Detect Proxy Orchestrator

Enterprise Cloud Android Device Farm management dashboard orchestrating thousands of simulated Android mobile devices (`NODE-0001` to `NODE-1200+`), each configured with **1-to-1 dedicated residential/4G proxies**, authentic **hardware anti-detect profiles**, and pre-authenticated **Google/Gmail, Facebook, and YouTube personas**.

---

## ⚡ Features

- **Massive-Scale Device Farm (1,200+ Nodes)**:
  - Sharded cluster topology (`SHARD-01 [0001-0300]`, `SHARD-02 [0301-0600]`, etc.).
  - Realistic multi-brand mobile catalog: Samsung Galaxy S24 Ultra, Google Pixel 9 Pro XL, OnePlus 12 5G, Xiaomi 14 Ultra, ASUS ROG Phone 8, Nothing Phone (2), Sony Xperia 1 VI, Vivo, Oppo, and Motorola.
  - Authentic hardware telemetry: SoC Chipset (Snapdragon 8 Gen 3, Tensor G4, Dimensity 9300), RAM allocation, screen resolutions (up to 1440x3120 @ 480dpi), and release build fingerprints.
- **Dedicated Anti-Detect Proxy Tunnels**:
  - 100% unique exit IP per mobile node across global geolocations (US, DE, GB, JP, SG, NL, CA, FR, CH, KR, AU).
  - Multi-protocol tunnel support: `4G_LTE_MOBILE` (Carrier NAT), `RESIDENTIAL_STICKY` (ISP Fibre), `SOCKS5`, and `HTTP/S`.
  - Zero-leak protection matrix: WebRTC Shield, isolated DNS tunnel, ASN matching, and live latency ping telemetry.
  - On-demand proxy IP rotation with conflict-free IP generation.
- **Real-Profile Social & Engagement Personas**:
  - **Google / Gmail**: Aged accounts, 2FA Trust verification, unread counter synchronization, and automated inbox warmup.
  - **Facebook**: Aged profiles with Business Manager / Ads Ready status, realistic friend networks, and feed scrolling/posting actions.
  - **YouTube**: Monetized & Verified creator channels, live subscriber counts, watch-hour accumulators, and video stream playback.
  - Persistent session cookie digests (Google SID/HSID, Facebook c_user/xs).
- **Interactive Three-Pane Command Console**:
  - **Pane 1 (Left)**: Multi-facet search and filter by country, device brand, active app, and cluster shard with pagination.
  - **Pane 2 (Center)**: Interactive mobile screen emulator stage with app foreground switcher, touch simulation, screenshot framebuffer capture, audio gain controls, and synchronized multi-device wall.
  - **Pane 3 (Right)**: Deep-dive node inspector drawer with credential reveal/copy, hardware identifier regenerator (Luhn-compliant IMEI, Android ID, MAC), and live ADB stream log.
  - **Provisioning Modal**: Custom single device provisioner or bulk generator (+100 to +500 phones at once).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Repository Structure

```
farm/
├── data/                               # Reference data and CSV exports
│   ├── public.android_devices.csv      # Exported device records sample
│   └── public.automation_tasks.csv     # Exported automation task logs
├── drizzle/                            # Generated SQL database migrations
│   ├── 0000_medical_wrecker.sql        # Initial PostgreSQL fleet schema
│   └── meta/                           # Drizzle migration journal & snapshots
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── devices/
│   │   │   │   ├── action/route.ts     # Device mutations (rotate, spoof, app switch, warmup)
│   │   │   │   └── route.ts            # Fleet retrieval, telemetry & provisioning API
│   │   │   └── health/route.ts         # Service health & DB connectivity check
│   │   ├── globals.css                 # Dark tactical theme & custom styling
│   │   ├── layout.tsx                  # Root layout & typography
│   │   └── page.tsx                    # Three-pane command dashboard
│   ├── components/
│   │   ├── AndroidPhoneStage.tsx       # Interactive mobile emulator stage
│   │   ├── BrandBadges.tsx             # SVG brand icons & country flags
│   │   ├── DeviceInspectorDrawer.tsx   # Detailed credentials & ADB task log
│   │   └── ProvisionModal.tsx          # Single & bulk provisioning dialog
│   ├── db/
│   │   ├── index.ts                    # PostgreSQL connection pool & Drizzle instance
│   │   └── schema.ts                   # Drizzle schema (android_devices, automation_tasks)
│   └── lib/
│       ├── device-generator.ts         # Deterministic IMEI, IP & hardware generator
│       └── seed.ts                     # Automatic 1,200-device fleet seeder
├── .env.example                        # Template environment variables
├── .gitignore                          # Standard git ignore definitions
├── drizzle.config.ts                   # Drizzle Kit configuration
├── eslint.config.mjs                   # ESLint 9 configuration
├── next.config.ts                      # Next.js configuration
├── package.json                        # Scripts and dependencies
├── postcss.config.mjs                  # PostCSS plugins
└── tsconfig.json                       # TypeScript compiler options
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `20.x` or later (tested on v22)
- npm or pnpm or yarn
- PostgreSQL instance (local or hosted on Neon, Supabase, AWS RDS, etc.)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/messi10istheGoat/farm.git
cd farm
npm install
```

### 3. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
Configure your PostgreSQL connection in `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/droidmatrix"
PORT=3000
```

### 4. Database Setup & Migrations
Push the database schema directly or apply migrations:
```bash
# Push schema directly to PostgreSQL
npm run db:push

# Or generate new migration files if schema changes
npm run db:generate

# Open Drizzle Studio web GUI
npm run db:studio
```

*Note: When the application starts, `ensureFleetSeeded()` will automatically create the tables if they do not exist and seed the initial 1,200 distinct Android nodes.*

### 5. Running the Application
```bash
# Start development server
npm run dev

# Or build and start for production
npm run build
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Reference

### 1. `GET /api/devices`
Fetches paginated device nodes and live fleet telemetry.
- **Query Parameters**:
  - `shard`: Filter by cluster shard (`ALL` or `SHARD-01 [0001-0300]`)
  - `country`: Filter by proxy country code (`US`, `DE`, `GB`, etc.)
  - `manufacturer`: Filter by brand (`Samsung`, `Google`, `OnePlus`, etc.)
  - `status`: Filter by status (`ONLINE`, `AUTOMATING`, `OFFLINE`)
  - `app`: Filter by active foreground app (`HOME`, `GMAIL`, `FACEBOOK`, `YOUTUBE`, `CHROME_IP`)
  - `search`: Search query (Node code, phone model, IP, Gmail, FB name, handle)
  - `page`: Page number (default: `1`)
  - `limit`: Number of items per page (default: `60`)

### 2. `POST /api/devices`
Provisions new Android nodes into the fleet.
- **Single Mode**:
  ```json
  {
    "mode": "single",
    "deviceName": "Samsung Galaxy S24 Ultra",
    "proxyCountryCode": "US",
    "proxyProtocol": "4G_LTE_MOBILE"
  }
  ```
- **Bulk Mode**:
  ```json
  {
    "mode": "bulk",
    "count": 300
  }
  ```

### 3. `POST /api/devices/action`
Executes anti-detect actions and fleet automation commands:
- **`SWITCH_APP`**: Switch foreground active application on single or multiple nodes.
- **`ROTATE_PROXY`**: Assign a fresh, unique dedicated proxy IP from a specified geolocation.
- **`SPOOF_FINGERPRINT`**: Regenerate IMEI (Luhn verified), Android ID, MAC, and hardware build fingerprint.
- **`UPDATE_ACCOUNTS`**: Update credential vault (Gmail, Facebook profile, YouTube channel).
- **`FLEET_BATCH_COMMAND`**: Broadcast batch automation scripts across shards (`WARMUP_GMAIL`, `WARMUP_FB`, `WARMUP_YT`, `VERIFY_PROXIES`, `HOME_ALL`).

### 4. `GET /api/health`
Health check endpoint returning service and database connectivity status.

---

## 🧪 Quality & Verification Commands

```bash
# Typecheck TypeScript codebase
npm run typecheck

# Run ESLint analysis
npm run lint

# Compile production build
npm run build
```

---

## 📄 License
Private & Proprietary. All rights reserved.
