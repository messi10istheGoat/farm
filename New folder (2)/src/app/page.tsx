"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { AndroidDevice, AutomationTask } from "@/db/schema";
import {
  AndroidIcon,
  GmailIcon,
  FacebookIcon,
  YouTubeIcon,
  CountryFlag,
} from "@/components/BrandBadges";
import { AndroidPhoneStage } from "@/components/AndroidPhoneStage";
import { DeviceInspectorDrawer } from "@/components/DeviceInspectorDrawer";
import { ProvisionModal } from "@/components/ProvisionModal";
import {
  Search,
  Plus,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Zap,
  Globe,
  Layers,
  Filter,
  CheckCircle2,
  Activity,
} from "lucide-react";

interface TelemetryData {
  totalDevices: number;
  onlineDevices: number;
  uniqueProxiesCount: number;
  totalAccountsCount: number;
  avgLatencyMs: number;
  shards: Array<{ shard: string; count: number }>;
  countries: Array<{ countryCode: string; country: string; count: number }>;
}

interface PaginationData {
  page: number;
  limit: number;
  filteredCount: number;
  totalPages: number;
}

export default function DroidMatrixCommandPage() {
  const [devices, setDevices] = useState<AndroidDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<AndroidDevice | null>(
    null
  );
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    totalDevices: 1200,
    onlineDevices: 1200,
    uniqueProxiesCount: 1200,
    totalAccountsCount: 3600,
    avgLatencyMs: 32,
    shards: [],
    countries: [],
  });
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 60,
    filteredCount: 1200,
    totalPages: 20,
  });
  const [recentTasks, setRecentTasks] = useState<AutomationTask[]>([]);

  // Filters
  const [selectedShard, setSelectedShard] = useState<string>("ALL");
  const [selectedCountry, setSelectedCountry] = useState<string>("ALL");
  const [selectedManufacturer, setSelectedManufacturer] =
    useState<string>("ALL");
  const [selectedAppFilter, setSelectedAppFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [isProvisionOpen, setIsProvisionOpen] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const showBanner = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => setStatusBanner(null), 3500);
  };

  const fetchFleet = useCallback(
    async (keepSelectionId?: number) => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          shard: selectedShard,
          country: selectedCountry,
          manufacturer: selectedManufacturer,
          app: selectedAppFilter,
          search: searchQuery,
          page: String(page),
          limit: "60",
        });

        const res = await fetch(`/api/devices?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch fleet");
        const data = await res.json();

        setDevices(data.devices || []);
        setPagination(data.pagination);
        setTelemetry(data.telemetry);
        setRecentTasks(data.recentTasks || []);

        if (data.devices && data.devices.length > 0) {
          setSelectedDevice((prev) => {
            const targetId = keepSelectionId ?? prev?.id;
            if (targetId) {
              const found = data.devices.find(
                (d: AndroidDevice) => d.id === targetId
              );
              if (found) return found;
            }
            return prev ?? data.devices[0];
          });
        }
      } catch (err) {
        console.error("Error loading Android fleet:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [
      selectedShard,
      selectedCountry,
      selectedManufacturer,
      selectedAppFilter,
      searchQuery,
      page,
    ]
  );

  useEffect(() => {
    fetchFleet();
  }, [fetchFleet]);

  // Action 1: Switch active app on 1 or multiple synced devices
  const handleSwitchApp = async (app: string, targetIds?: number[]) => {
    if (!selectedDevice && (!targetIds || targetIds.length === 0)) return;
    try {
      setIsBusy(true);
      const ids =
        targetIds && targetIds.length > 0 ? targetIds : [selectedDevice!.id];

      const res = await fetch("/api/devices/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SWITCH_APP",
          deviceIds: ids,
          payload: { app },
        }),
      });
      const data = await res.json();
      if (data.devices && data.devices.length > 0) {
        const updatedMap = new Map<number, AndroidDevice>(
          data.devices.map((d: AndroidDevice) => [d.id, d])
        );
        setDevices((prev) =>
          prev.map((item) => updatedMap.get(item.id) || item)
        );
        if (selectedDevice && updatedMap.has(selectedDevice.id)) {
          setSelectedDevice(updatedMap.get(selectedDevice.id)!);
        }
      }
    } finally {
      setIsBusy(false);
    }
  };

  // Action 2: Rotate Dedicated Proxy IP
  const handleRotateProxy = async (deviceId: number, countryCode?: string) => {
    try {
      setIsBusy(true);
      const res = await fetch("/api/devices/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ROTATE_PROXY",
          deviceId,
          payload: { countryCode },
        }),
      });
      const data = await res.json();
      if (data.device) {
        setDevices((prev) =>
          prev.map((d) => (d.id === data.device.id ? data.device : d))
        );
        if (selectedDevice?.id === data.device.id) {
          setSelectedDevice(data.device);
        }
        showBanner(
          `Rotated Dedicated Proxy on ${data.device.nodeCode} → ${data.device.proxyIp}:${data.device.proxyPort} (${data.device.proxyCountry})`
        );
      }
    } finally {
      setIsBusy(false);
    }
  };

  // Action 3: Spoof Hardware Fingerprint
  const handleSpoofFingerprint = async (
    deviceId: number,
    deviceName?: string
  ) => {
    try {
      setIsBusy(true);
      const res = await fetch("/api/devices/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SPOOF_FINGERPRINT",
          deviceId,
          payload: { deviceName },
        }),
      });
      const data = await res.json();
      if (data.device) {
        setDevices((prev) =>
          prev.map((d) => (d.id === data.device.id ? data.device : d))
        );
        if (selectedDevice?.id === data.device.id) {
          setSelectedDevice(data.device);
        }
        showBanner(
          `Spoofed IMEI (${data.device.imei}) & Android ID (${data.device.androidId}) on ${data.device.nodeCode}`
        );
      }
    } finally {
      setIsBusy(false);
    }
  };

  // Action 4: Update Account Credentials / Warmup Counters
  const handleUpdateAccounts = async (
    deviceId: number,
    payload: Record<string, unknown>
  ) => {
    try {
      setIsBusy(true);
      const res = await fetch("/api/devices/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_ACCOUNTS",
          deviceId,
          payload,
        }),
      });
      const data = await res.json();
      if (data.device) {
        setDevices((prev) =>
          prev.map((d) => (d.id === data.device.id ? data.device : d))
        );
        if (selectedDevice?.id === data.device.id) {
          setSelectedDevice(data.device);
        }
      }
    } finally {
      setIsBusy(false);
    }
  };

  // Action 5: Fleet Batch Warmup Command
  const handleFleetBatchCommand = async (commandType: string) => {
    try {
      setIsBusy(true);
      const res = await fetch("/api/devices/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "FLEET_BATCH_COMMAND",
          payload: {
            commandType,
            shard: selectedShard,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchFleet(selectedDevice?.id);
        showBanner(`Executed Fleet Batch Command: ${data.task?.taskName}`);
      }
    } finally {
      setIsBusy(false);
    }
  };

  // Action 6: Provision Single Custom Phone
  const handleProvisionSingle = async (payload: Record<string, unknown>) => {
    try {
      setIsBusy(true);
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "single",
          ...payload,
        }),
      });
      const data = await res.json();
      if (data.device) {
        setSelectedDevice(data.device);
        await fetchFleet(data.device.id);
        showBanner(
          `Booted new Android node ${data.device.nodeCode} (${data.device.deviceName}) on proxy ${data.device.proxyIp}`
        );
      }
    } finally {
      setIsBusy(false);
    }
  };

  // Action 7: Bulk Provision Hundreds of Phones
  const handleProvisionBulk = async (countToSpawn: number) => {
    try {
      setIsBusy(true);
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "bulk",
          count: countToSpawn,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchFleet(selectedDevice?.id);
        showBanner(
          `Spawned +${data.provisionedCount} distinct Android mobile phones! Fleet now at ${data.newTotal.toLocaleString()} nodes.`
        );
      }
    } finally {
      setIsBusy(false);
    }
  };

  // Pick 6 devices for the Multi-Screen Synchronized Wall
  const syncWallDevices = React.useMemo(() => {
    if (devices.length === 0) return [];
    const base = devices.slice(0, 6);
    if (
      selectedDevice &&
      !base.some((d) => d.id === selectedDevice.id) &&
      base.length > 0
    ) {
      return [selectedDevice, ...base.slice(0, 5)];
    }
    return base;
  }, [devices, selectedDevice]);

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-[#090C10] text-[#F0F6FC] overflow-x-hidden lg:overflow-hidden">
      {/* ==================== TOP GLOBAL TELEMETRY & COMMAND RIBBON ==================== */}
      <header className="px-4 py-2.5 bg-[#11161F] border-b border-[#242E42] flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#3DDC84]/15 border border-[#3DDC84]/50 flex items-center justify-center shadow-[0_0_15px_rgba(61,220,132,0.2)]">
            <AndroidIcon className="w-5 h-5 text-[#3DDC84]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-display font-bold tracking-wider uppercase text-[#F0F6FC]">
                DROIDMATRIX
              </h1>
              <span className="px-1.5 py-0.5 rounded bg-[#3DDC84]/20 border border-[#3DDC84]/40 text-[#3DDC84] font-mono text-[10px] font-bold">
                ARM64 CLOUD FARM
              </span>
            </div>
            <p className="text-[11px] text-[#8B949E] hidden sm:block">
              Thousands of Distinct Android Mobiles • 1-to-1 Dedicated Proxies •
              Real Gmail, FB & YouTube Accounts
            </p>
          </div>
        </div>

        {/* Center: Live Telemetry Counters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-[#090C10] border border-[#242E42] flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-[#3DDC84]" />
            <div className="font-mono text-xs">
              <span className="text-[#8B949E] mr-1">PHONES:</span>
              <strong className="text-[#3DDC84]">
                {telemetry.totalDevices.toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-[#090C10] border border-[#242E42] flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
            <div className="font-mono text-xs">
              <span className="text-[#8B949E] mr-1">UNIQUE PROXIES:</span>
              <strong className="text-[#00E5FF]">
                {telemetry.uniqueProxiesCount.toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="hidden xl:flex px-2.5 py-1 rounded-lg bg-[#090C10] border border-[#242E42] items-center gap-2">
            <div className="flex items-center gap-1">
              <GmailIcon className="w-3.5 h-3.5" />
              <FacebookIcon className="w-3.5 h-3.5" />
              <YouTubeIcon className="w-3.5 h-3.5" />
            </div>
            <div className="font-mono text-xs">
              <span className="text-[#8B949E] mr-1">ACCOUNTS:</span>
              <strong className="text-[#F0F6FC]">
                {telemetry.totalAccountsCount.toLocaleString()} VERIFIED
              </strong>
            </div>
          </div>
        </div>

        {/* Right: Fleet Batch Warmup Actions & Provision Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden md:flex items-center gap-1 bg-[#090C10] p-1 rounded-lg border border-[#242E42]">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleFleetBatchCommand("WARMUP_GMAIL")}
              className="px-2 py-1 rounded hover:bg-[#171E2B] text-[11px] text-[#F0F6FC] flex items-center gap-1 cursor-pointer transition"
              title="Warmup Gmail Inboxes across active shard"
            >
              <GmailIcon className="w-3 h-3" />
              <span>Warm Gmail</span>
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleFleetBatchCommand("WARMUP_FB")}
              className="px-2 py-1 rounded hover:bg-[#171E2B] text-[11px] text-[#F0F6FC] flex items-center gap-1 cursor-pointer transition"
              title="Warmup Facebook Feeds across active shard"
            >
              <FacebookIcon className="w-3 h-3" />
              <span>Warm FB</span>
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleFleetBatchCommand("WARMUP_YT")}
              className="px-2 py-1 rounded hover:bg-[#171E2B] text-[11px] text-[#F0F6FC] flex items-center gap-1 cursor-pointer transition"
              title="Warmup YouTube Channels across active shard"
            >
              <YouTubeIcon className="w-3 h-3" />
              <span>Warm YT</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsProvisionOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#3DDC84] hover:bg-[#3DDC84]/90 text-[#090C10] font-semibold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(61,220,132,0.25)] cursor-pointer transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Provision Phones</span>
          </button>
        </div>
      </header>

      {/* Live Action Status Banner */}
      {statusBanner && (
        <div className="px-4 py-1.5 bg-[#3DDC84]/15 border-b border-[#3DDC84]/40 text-[#3DDC84] text-xs font-mono flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>{statusBanner}</span>
          </span>
          <span className="text-[10px] uppercase">PostgreSQL Synced</span>
        </div>
      )}

      {/* ==================== MAIN 3-PANE SPLIT-SCREEN WORKSPACE ==================== */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* ==================== PANE 1 (LEFT 5 COLS): VIRTUALIZED DEVICE MATRIX ==================== */}
        <section className="lg:col-span-5 flex flex-col h-full bg-[#090C10] overflow-hidden">
          {/* Cluster Shard Selector Tabs */}
          <div className="px-3 pt-2.5 pb-2 bg-[#11161F] border-b border-[#242E42] space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedShard("ALL");
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono whitespace-nowrap cursor-pointer transition ${
                  selectedShard === "ALL"
                    ? "bg-[#3DDC84] text-[#090C10] font-bold"
                    : "bg-[#171E2B] text-[#8B949E] hover:text-[#F0F6FC] border border-[#242E42]"
                }`}
              >
                ALL NODES [{telemetry.totalDevices}]
              </button>
              {telemetry.shards.map((s) => (
                <button
                  key={s.shard}
                  type="button"
                  onClick={() => {
                    setSelectedShard(s.shard);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono whitespace-nowrap cursor-pointer transition ${
                    selectedShard === s.shard
                      ? "bg-[#00E5FF] text-[#090C10] font-bold"
                      : "bg-[#171E2B] text-[#8B949E] hover:text-[#F0F6FC] border border-[#242E42]"
                  }`}
                >
                  {s.shard} ({s.count})
                </button>
              ))}
            </div>

            {/* Search & Multi-Facet Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-6 relative">
                <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search Node, Phone, Proxy IP, Gmail, FB, YT..."
                  className="w-full bg-[#090C10] border border-[#242E42] rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-[#F0F6FC] placeholder-[#8B949E] focus:outline-none focus:border-[#3DDC84]"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter by Proxy Country"
                  className="w-full bg-[#090C10] border border-[#242E42] rounded-lg px-2 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#00E5FF]"
                >
                  <option value="ALL">All Proxies (Geo)</option>
                  {telemetry.countries.map((c) => (
                    <option key={c.countryCode} value={c.countryCode}>
                      {c.countryCode} - {c.country} ({c.count})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={selectedManufacturer}
                  onChange={(e) => {
                    setSelectedManufacturer(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter by Phone Brand"
                  className="w-full bg-[#090C10] border border-[#242E42] rounded-lg px-2 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#3DDC84]"
                >
                  <option value="ALL">All Brands</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Google">Google Pixel</option>
                  <option value="OnePlus">OnePlus</option>
                  <option value="Xiaomi">Xiaomi / POCO</option>
                  <option value="ASUS">ASUS ROG</option>
                  <option value="Sony">Sony Xperia</option>
                  <option value="Nothing">Nothing</option>
                  <option value="Vivo">Vivo</option>
                  <option value="Oppo">Oppo</option>
                  <option value="Motorola">Motorola</option>
                </select>
              </div>
            </div>
          </div>

          {/* Matrix Grid Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-36 rounded-xl bg-[#11161F] border border-[#242E42] p-3 animate-pulse flex flex-col justify-between"
                  >
                    <div className="h-4 w-2/3 bg-[#171E2B] rounded" />
                    <div className="h-6 w-full bg-[#171E2B] rounded" />
                    <div className="h-4 w-3/4 bg-[#171E2B] rounded" />
                  </div>
                ))}
              </div>
            ) : devices.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6">
                <Smartphone className="w-8 h-8 text-[#8B949E] mb-2" />
                <div className="text-sm font-semibold text-[#F0F6FC]">
                  No Android Nodes Match Filter
                </div>
                <p className="text-xs text-[#8B949E] mt-1">
                  Try clearing your search query or switching cluster shards.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {devices.map((node) => {
                  const isSelected = selectedDevice?.id === node.id;
                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedDevice(node)}
                      className={`group rounded-xl p-3 bg-[#11161F] border transition cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? "border-[#3DDC84] ring-1 ring-[#3DDC84]/40 bg-[#141C28]"
                          : "border-[#242E42] hover:border-[#00E5FF]/50"
                      }`}
                    >
                      {/* Data Point 1: Node ID + Hardware Model + Active App Pill */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-[#3DDC84]">
                              {node.nodeCode}
                            </span>
                            <span className="text-[10px] font-mono text-[#8B949E]">
                              • {node.modelCode}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-[#F0F6FC] truncate mt-0.5">
                            {node.deviceName}
                          </div>
                        </div>
                        <span
                          className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold shrink-0 ${
                            node.activeApp === "GMAIL"
                              ? "bg-[#EA4335]/20 text-[#EA4335]"
                              : node.activeApp === "FACEBOOK"
                              ? "bg-[#1877F2]/20 text-[#00E5FF]"
                              : node.activeApp === "YOUTUBE"
                              ? "bg-[#FF0033]/20 text-[#FF0033]"
                              : node.activeApp === "CHROME_IP"
                              ? "bg-[#00E5FF]/20 text-[#00E5FF]"
                              : "bg-[#3DDC84]/15 text-[#3DDC84]"
                          }`}
                        >
                          {node.activeApp}
                        </span>
                      </div>

                      {/* Data Point 2: Dedicated Proxy IP + Country Flag + ISP + Ping */}
                      <div className="p-2 rounded-lg bg-[#090C10] border border-[#242E42]/90 flex items-center justify-between text-[11px] font-mono">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <CountryFlag code={node.proxyCountryCode} />
                          <span className="text-[#00E5FF] font-semibold truncate">
                            {node.proxyIp}:{node.proxyPort}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#3DDC84] shrink-0">
                          {node.proxyLatencyMs}ms
                        </span>
                      </div>

                      {/* Data Point 3: Real Gmail, FB, YT Accounts Summary */}
                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center justify-between text-[#8B949E]">
                          <span className="flex items-center gap-1.5 truncate max-w-[165px] text-[#F0F6FC]/90 font-mono text-[10px]">
                            <GmailIcon className="w-3 h-3 shrink-0" />
                            <span className="truncate">{node.gmailAddress}</span>
                          </span>
                          <span className="text-[9px] font-mono text-[#3DDC84]">
                            2FA
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[#8B949E]">
                          <span className="flex items-center gap-1.5 truncate max-w-[165px] text-[#F0F6FC]/90 text-[10px]">
                            <FacebookIcon className="w-3 h-3 shrink-0" />
                            <span className="truncate">{node.fbName}</span>
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-mono text-[#F0F6FC]/90 truncate max-w-[100px]">
                            <YouTubeIcon className="w-3 h-3 shrink-0" />
                            <span className="truncate">{node.ytHandle}</span>
                          </span>
                        </div>
                      </div>

                      {/* Data Point 4: Hardware IMEI & Quick Proxy Rotate Action */}
                      <div className="pt-1.5 border-t border-[#242E42]/70 flex items-center justify-between text-[10px] font-mono text-[#8B949E]">
                        <span className="truncate max-w-[140px]">
                          {node.proxyIsp}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRotateProxy(node.id);
                          }}
                          className="text-[#00E5FF] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>New IP</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Matrix Pagination Footer */}
          <div className="px-3 py-2 bg-[#11161F] border-t border-[#242E42] flex items-center justify-between text-xs font-mono">
            <span className="text-[#8B949E]">
              Showing{" "}
              <strong className="text-[#F0F6FC]">{devices.length}</strong> of{" "}
              <strong className="text-[#3DDC84]">
                {pagination.filteredCount.toLocaleString()}
              </strong>{" "}
              Android phones
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded bg-[#171E2B] border border-[#242E42] text-[#F0F6FC] disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-[#F0F6FC]">
                Page {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                className="p-1 rounded bg-[#171E2B] border border-[#242E42] text-[#F0F6FC] disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ==================== PANE 2 (CENTER 4 COLS): LIVE INTERACTIVE ANDROID EMULATOR STAGE ==================== */}
        <section className="lg:col-span-4 h-full overflow-hidden">
          {selectedDevice && (
            <AndroidPhoneStage
              device={selectedDevice}
              syncDevices={syncWallDevices}
              onSwitchApp={handleSwitchApp}
              onRotateProxy={handleRotateProxy}
              onSpoofFingerprint={handleSpoofFingerprint}
              onUpdateAccounts={handleUpdateAccounts}
              onSelectDevice={(d) => setSelectedDevice(d)}
              isBusy={isBusy}
            />
          )}
        </section>

        {/* ==================== PANE 3 (RIGHT 3 COLS): DEEP-DIVE NODE INSPECTOR DRAWER ==================== */}
        <section className="lg:col-span-3 h-full overflow-hidden">
          {selectedDevice && (
            <DeviceInspectorDrawer
              device={selectedDevice}
              recentTasks={recentTasks}
              onRotateProxy={handleRotateProxy}
              onSpoofFingerprint={handleSpoofFingerprint}
              onUpdateAccounts={handleUpdateAccounts}
              onSwitchApp={(app) => handleSwitchApp(app)}
              isBusy={isBusy}
            />
          )}
        </section>
      </div>

      {/* Provision Single or Bulk Android Nodes Modal */}
      <ProvisionModal
        isOpen={isProvisionOpen}
        onClose={() => setIsProvisionOpen(false)}
        onProvisionSingle={handleProvisionSingle}
        onProvisionBulk={handleProvisionBulk}
        isBusy={isBusy}
        totalDevices={telemetry.totalDevices}
      />
    </div>
  );
}
