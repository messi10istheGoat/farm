"use client";

import React, { useState } from "react";
import type { AndroidDevice } from "@/db/schema";
import {
  AndroidIcon,
  GmailIcon,
  FacebookIcon,
  YouTubeIcon,
  CountryFlag,
} from "@/components/BrandBadges";
import {
  Wifi,
  BatteryCharging,
  ShieldCheck,
  RefreshCw,
  Fingerprint,
  Camera,
  Volume2,
  VolumeX,
  Power,
  Home,
  ArrowLeft,
  Square,
  Search,
  Star,
  ThumbsUp,
  MessageSquare,
  Share2,
  Play,
  Pause,
  CheckCircle2,
  Lock,
  Globe,
  Cpu,
  Radio,
  Sparkles,
  Send,
  Layers,
  Smartphone,
  Terminal,
} from "lucide-react";

interface AndroidPhoneStageProps {
  device: AndroidDevice;
  syncDevices: AndroidDevice[];
  onSwitchApp: (app: string, targetIds?: number[]) => Promise<void>;
  onRotateProxy: (deviceId: number, countryCode?: string) => Promise<void>;
  onSpoofFingerprint: (deviceId: number) => Promise<void>;
  onUpdateAccounts: (
    deviceId: number,
    payload: Record<string, unknown>
  ) => Promise<void>;
  onSelectDevice: (device: AndroidDevice) => void;
  isBusy: boolean;
}

export function AndroidPhoneStage({
  device,
  syncDevices,
  onSwitchApp,
  onRotateProxy,
  onSpoofFingerprint,
  onUpdateAccounts,
  onSelectDevice,
  isBusy,
}: AndroidPhoneStageProps) {
  const [stageMode, setStageMode] = useState<"SINGLE" | "MULTI_WALL">("SINGLE");
  const [selectedEmailIdx, setSelectedEmailIdx] = useState<number | null>(null);
  const [starredEmails, setStarredEmails] = useState<Record<number, boolean>>({
    0: true,
    2: true,
  });
  const [fbLikedPosts, setFbLikedPosts] = useState<Record<number, boolean>>({
    0: true,
  });
  const [fbPostInput, setFbPostInput] = useState("");
  const [fbCustomPosts, setFbCustomPosts] = useState<string[]>([]);
  const [ytPlaying, setYtPlaying] = useState(true);
  const [ytLiked, setYtLiked] = useState(false);
  const [ytSubscribed, setYtSubscribed] = useState(true);
  const [ytCommentInput, setYtCommentInput] = useState("");
  const [ytComments, setYtComments] = useState<
    Array<{ author: string; text: string; time: string }>
  >([
    {
      author: "@cloud_arm64_ops",
      text: "Zero frame drops on Snapdragon 8 Gen 3 residential proxy node!",
      time: "2m ago",
    },
    {
      author: "@dev_sec_matrix",
      text: "Clean ASN handshake and hardware fingerprint verified.",
      time: "9m ago",
    },
  ]);
  const [screenFlash, setScreenFlash] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [touchRipple, setTouchRipple] = useState<{ x: number; y: number } | null>(
    null
  );

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  const handleScreenTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTouchRipple({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setTimeout(() => setTouchRipple(null), 450);
  };

  const handleScreenshot = () => {
    setScreenFlash(true);
    setTimeout(() => setScreenFlash(false), 250);
    triggerToast(`Captured ${device.nodeCode} framebuffer (1440x3120 PNG)`);
  };

  const emails = [
    {
      sender: "Google Security",
      subject: `2-Step Verification active on ${device.deviceName}`,
      snippet: `Sign-in verified from ${device.proxyCity}, ${device.proxyCountry} (${device.proxyIp})`,
      time: "10:42 AM",
      body: `Hi ${device.fbName.split(" ")[0]},\n\nYour Google Account (${device.gmailAddress}) is actively protected with 2-Step Verification on your ${device.deviceName} (${device.modelCode}).\n\nAuthenticated Network:\n• Exit IP: ${device.proxyIp}:${device.proxyPort}\n• Carrier ISP: ${device.proxyIsp} (${device.proxyAsn})\n• Location: ${device.proxyCity}, ${device.proxyCountry}\n• Hardware IMEI: ${device.imei}\n\nNo further action is required.`,
      tag: "SECURITY",
    },
    {
      sender: "YouTube Creators",
      subject: `${device.ytChannelName}: Channel analytics & monetization status`,
      snippet: `${device.ytHandle} reached ${device.ytSubscribers.toLocaleString()} subscribers and ${device.ytWatchHours} watch hours`,
      time: "09:15 AM",
      body: `Creator Update for ${device.ytChannelName} (${device.ytHandle}):\n\n• Channel Status: ${device.ytStatus}\n• Subscribers: ${device.ytSubscribers.toLocaleString()}\n• Valid Public Watch Hours: ${device.ytWatchHours.toLocaleString()} hrs\n• Device Session: ${device.deviceName} (${device.androidVersion})\n\nKeep uploading and engaging with your community!`,
      tag: "YOUTUBE",
    },
    {
      sender: "Meta Business Suite",
      subject: `Facebook Profile & Ad Account Verified (${device.fbName})`,
      snippet: `UID ${device.fbUid} passed residential proxy trust check with 0 flags`,
      time: "Yesterday",
      body: `Hello ${device.fbName},\n\nYour Facebook account (UID: ${device.fbUid}) associated with ${device.fbEmail} has been verified for Business Manager & Marketplace operations.\n\n• Account Status: ${device.fbStatus}\n• Active 2FA Seed: ${device.fb2faSecret}\n• Connected Friends: ${device.fbFriendsCount}\n• Dedicated Proxy IP: ${device.proxyIp} (${device.proxyIsp})`,
      tag: "FACEBOOK",
    },
    {
      sender: "DroidMatrix Trust Audit",
      subject: `Anti-Detect Fingerprint Score: 100/100 on ${device.nodeCode}`,
      snippet: `Android ID ${device.androidId} • WebRTC Leak: 0% • DNS Leak: 0%`,
      time: "Yesterday",
      body: `Automated Hardware & Tunnel Verification Report:\n\n• Node ID: ${device.nodeCode}\n• SoC: ${device.socChipset} (${device.ramGb}GB RAM)\n• Build Fingerprint: ${device.buildFingerprint}\n• MAC Address: ${device.macAddress}\n• Proxy Protocol: ${device.proxyProtocol} -> ${device.proxyIp}:${device.proxyPort}\n• Result: PASS (100% Native Physical Device Signature)`,
      tag: "SYSTEM",
    },
  ];

  const activeApp = device.activeApp || "HOME";

  return (
    <div className="flex flex-col h-full bg-[#090C10] bg-tactical-grid border-x border-[#242E42] select-none overflow-hidden">
      {/* Stage Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#11161F]/95 border-b border-[#242E42]">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#3DDC84]/15 border border-[#3DDC84]/40 text-[#3DDC84] font-mono text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#3DDC84] animate-pulse" />
            {device.nodeCode}
          </span>
          <span className="text-xs font-semibold text-[#F0F6FC] truncate max-w-[160px]">
            {device.deviceName}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] font-mono text-[11px]">
            <CountryFlag code={device.proxyCountryCode} />
            <span>{device.proxyIp}</span>
          </span>
        </div>

        {/* Single vs Multi-Screen Sync Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#090C10] p-0.5 rounded border border-[#242E42]">
          <button
            type="button"
            onClick={() => setStageMode("SINGLE")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
              stageMode === "SINGLE"
                ? "bg-[#3DDC84] text-[#090C10] font-semibold"
                : "text-[#8B949E] hover:text-[#F0F6FC]"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Live Emulator</span>
          </button>
          <button
            type="button"
            onClick={() => setStageMode("MULTI_WALL")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
              stageMode === "MULTI_WALL"
                ? "bg-[#00E5FF] text-[#090C10] font-semibold"
                : "text-[#8B949E] hover:text-[#F0F6FC]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sync Wall ({syncDevices.length}x)</span>
          </button>
        </div>
      </div>

      {/* Toast Notification Overlay */}
      {toastMsg && (
        <div className="mx-3 mt-2 px-3 py-1.5 rounded bg-[#171E2B] border border-[#3DDC84] text-[#3DDC84] text-xs font-mono flex items-center justify-between shadow-lg">
          <span>✓ {toastMsg}</span>
          <span className="text-[10px] text-[#8B949E]">ADB OK</span>
        </div>
      )}

      {/* MULTI-SCREEN SYNCHRONIZED WALL MODE */}
      {stageMode === "MULTI_WALL" ? (
        <div className="flex-1 flex flex-col p-3 overflow-y-auto gap-3">
          {/* Master Broadcast Bar */}
          <div className="p-2.5 rounded-lg bg-[#11161F] border border-[#00E5FF]/40 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#00E5FF] animate-pulse" />
              <div>
                <div className="text-xs font-semibold text-[#F0F6FC]">
                  Multi-Node Synchronized ADB Broadcast ({syncDevices.length} Devices)
                </div>
                <div className="text-[11px] text-[#8B949E]">
                  Every phone below runs on an isolated proxy IP with independent Gmail, FB & YT sessions
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                disabled={isBusy}
                onClick={() =>
                  onSwitchApp(
                    "GMAIL",
                    syncDevices.map((d) => d.id)
                  )
                }
                className="px-2 py-1 rounded bg-[#EA4335]/20 hover:bg-[#EA4335]/30 border border-[#EA4335]/50 text-[#F0F6FC] text-xs flex items-center gap-1 cursor-pointer"
              >
                <GmailIcon className="w-3.5 h-3.5" />
                <span>Sync Open Gmail</span>
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() =>
                  onSwitchApp(
                    "FACEBOOK",
                    syncDevices.map((d) => d.id)
                  )
                }
                className="px-2 py-1 rounded bg-[#1877F2]/20 hover:bg-[#1877F2]/30 border border-[#1877F2]/50 text-[#F0F6FC] text-xs flex items-center gap-1 cursor-pointer"
              >
                <FacebookIcon className="w-3.5 h-3.5" />
                <span>Sync Open FB</span>
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() =>
                  onSwitchApp(
                    "YOUTUBE",
                    syncDevices.map((d) => d.id)
                  )
                }
                className="px-2 py-1 rounded bg-[#FF0033]/20 hover:bg-[#FF0033]/30 border border-[#FF0033]/50 text-[#F0F6FC] text-xs flex items-center gap-1 cursor-pointer"
              >
                <YouTubeIcon className="w-3.5 h-3.5" />
                <span>Sync Open YT</span>
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() =>
                  onSwitchApp(
                    "CHROME_IP",
                    syncDevices.map((d) => d.id)
                  )
                }
                className="px-2 py-1 rounded bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border border-[#00E5FF]/50 text-[#00E5FF] text-xs flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Sync IP Check</span>
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() =>
                  onSwitchApp(
                    "HOME",
                    syncDevices.map((d) => d.id)
                  )
                }
                className="px-2 py-1 rounded bg-[#171E2B] hover:bg-[#242E42] border border-[#242E42] text-[#F0F6FC] text-xs flex items-center gap-1 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>All Home</span>
              </button>
            </div>
          </div>

          {/* Grid of 6 Synchronized Live Mini-Emulators */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {syncDevices.map((node) => {
              const isSelected = node.id === device.id;
              return (
                <div
                  key={node.id}
                  onClick={() => onSelectDevice(node)}
                  className={`rounded-xl p-2 bg-[#11161F] border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-[#3DDC84] ring-1 ring-[#3DDC84]/40"
                      : "border-[#242E42] hover:border-[#00E5FF]/60"
                  }`}
                >
                  {/* Mini Phone Top Bar */}
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1.5 pb-1 border-b border-[#242E42]">
                    <span className="font-bold text-[#3DDC84]">
                      {node.nodeCode}
                    </span>
                    <CountryFlag code={node.proxyCountryCode} />
                    <span className="text-[#00E5FF]">{node.proxyIp}</span>
                  </div>

                  {/* Mini Phone Live Screen Preview */}
                  <div className="rounded-lg bg-[#090C10] border border-[#242E42] p-2.5 min-h-[155px] flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center justify-between text-[10px] text-[#8B949E]">
                      <span className="truncate max-w-[110px]">
                        {node.proxyIsp}
                      </span>
                      <span>{node.batteryLevel}% 🔋</span>
                    </div>

                    {node.activeApp === "GMAIL" && (
                      <div className="my-2 p-2 rounded bg-[#EA4335]/10 border border-[#EA4335]/30">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F0F6FC]">
                          <GmailIcon className="w-3.5 h-3.5" />
                          <span>Gmail Inbox ({node.gmailUnreadCount})</span>
                        </div>
                        <div className="text-[10px] font-mono text-[#8B949E] truncate mt-1">
                          {node.gmailAddress}
                        </div>
                        <div className="text-[10px] text-[#3DDC84] mt-1">
                          ● {node.gmailStatus}
                        </div>
                      </div>
                    )}

                    {node.activeApp === "FACEBOOK" && (
                      <div className="my-2 p-2 rounded bg-[#1877F2]/10 border border-[#1877F2]/30">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F0F6FC]">
                          <FacebookIcon className="w-3.5 h-3.5" />
                          <span className="truncate">{node.fbName}</span>
                        </div>
                        <div className="text-[10px] font-mono text-[#8B949E] truncate mt-1">
                          UID: {node.fbUid}
                        </div>
                        <div className="text-[10px] text-[#00E5FF] mt-1">
                          ● {node.fbFriendsCount} Friends • {node.fbStatus}
                        </div>
                      </div>
                    )}

                    {node.activeApp === "YOUTUBE" && (
                      <div className="my-2 p-2 rounded bg-[#FF0033]/10 border border-[#FF0033]/30">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F0F6FC]">
                          <YouTubeIcon className="w-3.5 h-3.5" />
                          <span className="truncate">{node.ytChannelName}</span>
                        </div>
                        <div className="text-[10px] font-mono text-[#8B949E] truncate mt-1">
                          {node.ytHandle}
                        </div>
                        <div className="text-[10px] text-[#3DDC84] mt-1">
                          ▶ {node.ytSubscribers.toLocaleString()} subs • 60fps
                        </div>
                      </div>
                    )}

                    {node.activeApp === "CHROME_IP" && (
                      <div className="my-2 p-2 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#00E5FF]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Tunnel Verified</span>
                        </div>
                        <div className="text-[10px] font-mono text-[#F0F6FC] mt-1">
                          {node.proxyIp}:{node.proxyPort}
                        </div>
                        <div className="text-[10px] text-[#3DDC84] mt-0.5">
                          WebRTC Leak: 0% • {node.proxyLatencyMs}ms
                        </div>
                      </div>
                    )}

                    {(node.activeApp === "HOME" ||
                      node.activeApp === "SETTINGS") && (
                      <div className="my-2 flex flex-col gap-1.5">
                        <div className="text-[11px] font-semibold text-[#F0F6FC] truncate">
                          {node.deviceName}
                        </div>
                        <div className="text-[10px] font-mono text-[#8B949E] truncate">
                          IMEI: {node.imei}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <GmailIcon className="w-3.5 h-3.5" />
                          <FacebookIcon className="w-3.5 h-3.5" />
                          <YouTubeIcon className="w-3.5 h-3.5" />
                          <span className="text-[10px] text-[#3DDC84] font-mono">
                            3/3 Ready
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-[#242E42]/60 text-[10px] font-mono text-[#8B949E]">
                      <span>{node.modelCode}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDevice(node);
                          setStageMode("SINGLE");
                        }}
                        className="text-[#3DDC84] hover:underline font-semibold"
                      >
                        Control →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* SINGLE DEVICE HIGH-PRECISION LIVE ANDROID EMULATOR STAGE */
        <div className="flex-1 flex items-center justify-center p-3 overflow-y-auto">
          <div className="flex items-center gap-3">
            {/* THE ANDROID PHONE CHASSIS (9:19.5 Aspect Ratio) */}
            <div className="relative w-[320px] sm:w-[346px] h-[660px] rounded-[36px] p-2.5 bg-emulator-chassis border-2 border-[#2D3A54] shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col">
              {/* Top Speaker Grille & Punch-Hole Camera */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#05070A] border border-[#242E42] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]/60" />
                </div>
              </div>

              {/* Screenshot Flash Effect */}
              {screenFlash && (
                <div className="absolute inset-0 bg-white z-40 rounded-[32px] pointer-events-none opacity-80" />
              )}

              {/* INNER ANDROID AMOLED DISPLAY */}
              <div
                onClick={handleScreenTap}
                className="relative flex-1 rounded-[28px] bg-[#0B0F17] border border-[#1E2638] overflow-hidden flex flex-col justify-between"
              >
                {/* Touch Coordinate Ripple */}
                {touchRipple && (
                  <span
                    style={{
                      left: touchRipple.x - 14,
                      top: touchRipple.y - 14,
                    }}
                    className="absolute w-7 h-7 rounded-full border-2 border-[#3DDC84] bg-[#3DDC84]/25 pointer-events-none z-30 animate-ping"
                  />
                )}

                {/* ANDROID 14 STATUS BAR */}
                <div className="px-4 pt-2 pb-1.5 bg-[#090C10]/90 border-b border-[#1E2638] flex items-center justify-between text-[11px] font-mono text-[#F0F6FC] z-20">
                  <div className="flex items-center gap-1.5 truncate max-w-[135px]">
                    <span className="font-semibold">14:28</span>
                    <span className="text-[10px] text-[#00E5FF] truncate">
                      • {device.proxyIsp.split(" ")[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      title="Dedicated Proxy Tunnel Active"
                      className="px-1 py-0.2 rounded bg-[#00E5FF]/20 text-[#00E5FF] text-[9px] font-bold"
                    >
                      VPN
                    </span>
                    <span className="text-[10px] text-[#3DDC84] font-bold">
                      5G
                    </span>
                    <Wifi className="w-3 h-3 text-[#3DDC84]" />
                    <div className="flex items-center gap-0.5 text-[10px]">
                      <span>{device.batteryLevel}%</span>
                      <BatteryCharging className="w-3.5 h-3.5 text-[#3DDC84]" />
                    </div>
                  </div>
                </div>

                {/* DYNAMIC APP VIEWPORT */}
                <div className="flex-1 overflow-y-auto flex flex-col">
                  {/* ==================== 1. ANDROID HOME SCREEN ==================== */}
                  {activeApp === "HOME" && (
                    <div className="flex-1 p-3.5 flex flex-col justify-between bg-gradient-to-b from-[#0F1726] via-[#0B101B] to-[#090C10]">
                      {/* Top Widget: Clock + Dedicated Proxy Geolocation */}
                      <div className="mt-2">
                        <div className="flex items-baseline justify-between">
                          <div className="text-3xl font-display font-bold tracking-tight text-[#F0F6FC]">
                            14:28
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-semibold text-[#3DDC84] flex items-center justify-end gap-1">
                              <CountryFlag code={device.proxyCountryCode} />
                              <span>{device.proxyCity}</span>
                            </div>
                            <div className="text-[10px] font-mono text-[#8B949E]">
                              {device.deviceName}
                            </div>
                          </div>
                        </div>

                        {/* Dedicated Proxy Live Telemetry Widget on Home Screen */}
                        <div className="mt-3 p-2.5 rounded-xl bg-[#11161F]/90 border border-[#00E5FF]/35 backdrop-blur-md">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00E5FF] flex items-center gap-1 font-semibold">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Dedicated Proxy Tunnel
                            </span>
                            <span className="text-[10px] font-mono text-[#3DDC84] font-semibold">
                              {device.proxyLatencyMs}ms • 0% Leak
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between font-mono text-xs text-[#F0F6FC]">
                            <span>
                              {device.proxyIp}:{device.proxyPort}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00E5FF]/15 text-[#00E5FF]">
                              {device.proxyProtocol}
                            </span>
                          </div>
                          <div className="mt-1 text-[10px] font-mono text-[#8B949E] flex items-center justify-between">
                            <span className="truncate max-w-[180px]">
                              ISP: {device.proxyIsp} ({device.proxyAsn})
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRotateProxy(device.id);
                                triggerToast(
                                  `Rotated proxy IP for ${device.nodeCode}`
                                );
                              }}
                              className="text-[#00E5FF] hover:underline font-semibold cursor-pointer"
                            >
                              Rotate IP ↻
                            </button>
                          </div>
                        </div>

                        {/* Pre-Warming Account Status Widget */}
                        <div className="mt-2.5 p-2.5 rounded-xl bg-[#11161F]/90 border border-[#242E42] space-y-1.5">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-[#8B949E] flex items-center justify-between">
                            <span>Logged-In Real Accounts</span>
                            <span className="text-[#3DDC84]">3/3 ACTIVE</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1.5 text-[#F0F6FC] truncate max-w-[190px]">
                              <GmailIcon className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-mono truncate">
                                {device.gmailAddress}
                              </span>
                            </span>
                            <span className="text-[10px] font-mono text-[#3DDC84]">
                              2FA OK
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1.5 text-[#F0F6FC] truncate max-w-[190px]">
                              <FacebookIcon className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{device.fbName}</span>
                            </span>
                            <span className="text-[10px] font-mono text-[#00E5FF]">
                              {device.fbFriendsCount} frd
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1.5 text-[#F0F6FC] truncate max-w-[190px]">
                              <YouTubeIcon className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">
                                {device.ytChannelName}
                              </span>
                            </span>
                            <span className="text-[10px] font-mono text-[#3DDC84]">
                              {(device.ytSubscribers / 1000).toFixed(1)}K
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Google Search Bar */}
                      <div
                        onClick={() => onSwitchApp("CHROME_IP")}
                        className="my-2 px-3 py-2 rounded-full bg-[#171E2B] border border-[#242E42] hover:border-[#00E5FF]/50 flex items-center justify-between cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2 text-xs text-[#8B949E]">
                          <Search className="w-3.5 h-3.5 text-[#00E5FF]" />
                          <span>whoer.net / check proxy & fingerprint</span>
                        </div>
                        <Globe className="w-3.5 h-3.5 text-[#3DDC84]" />
                      </div>

                      {/* App Icons Grid */}
                      <div className="grid grid-cols-3 gap-3 pt-1 pb-2">
                        {/* Gmail App Icon */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEmailIdx(null);
                            onSwitchApp("GMAIL");
                          }}
                          className="group flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-[#171E2B] transition relative cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-[#EA4335]/15 border border-[#EA4335]/40 flex items-center justify-center shadow-md group-hover:scale-105 transition">
                            <GmailIcon className="w-6 h-6" />
                          </div>
                          <span className="text-[11px] font-medium text-[#F0F6FC]">
                            Gmail
                          </span>
                          {device.gmailUnreadCount > 0 && (
                            <span className="absolute top-1 right-3 px-1.5 py-0.2 rounded-full bg-[#EA4335] text-white text-[9px] font-bold">
                              {device.gmailUnreadCount}
                            </span>
                          )}
                        </button>

                        {/* Facebook App Icon */}
                        <button
                          type="button"
                          onClick={() => onSwitchApp("FACEBOOK")}
                          className="group flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-[#171E2B] transition relative cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-[#1877F2]/15 border border-[#1877F2]/40 flex items-center justify-center shadow-md group-hover:scale-105 transition">
                            <FacebookIcon className="w-6 h-6" />
                          </div>
                          <span className="text-[11px] font-medium text-[#F0F6FC]">
                            Facebook
                          </span>
                          <span className="absolute top-1 right-3 px-1.5 py-0.2 rounded-full bg-[#1877F2] text-white text-[9px] font-bold">
                            9+
                          </span>
                        </button>

                        {/* YouTube App Icon */}
                        <button
                          type="button"
                          onClick={() => onSwitchApp("YOUTUBE")}
                          className="group flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-[#171E2B] transition relative cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-[#FF0033]/15 border border-[#FF0033]/40 flex items-center justify-center shadow-md group-hover:scale-105 transition">
                            <YouTubeIcon className="w-6 h-6" />
                          </div>
                          <span className="text-[11px] font-medium text-[#F0F6FC]">
                            YouTube
                          </span>
                          <span className="absolute top-1 right-2.5 px-1 py-0.2 rounded-full bg-[#3DDC84] text-[#090C10] text-[8px] font-bold">
                            LIVE
                          </span>
                        </button>

                        {/* Proxy & IP Checker App */}
                        <button
                          type="button"
                          onClick={() => onSwitchApp("CHROME_IP")}
                          className="group flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-[#171E2B] transition cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 flex items-center justify-center shadow-md group-hover:scale-105 transition">
                            <ShieldCheck className="w-6 h-6 text-[#00E5FF]" />
                          </div>
                          <span className="text-[11px] font-medium text-[#F0F6FC]">
                            IP Shield
                          </span>
                        </button>

                        {/* Hardware Anti-Detect Spoofer App */}
                        <button
                          type="button"
                          onClick={() => onSwitchApp("SETTINGS")}
                          className="group flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-[#171E2B] transition cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-[#3DDC84]/15 border border-[#3DDC84]/40 flex items-center justify-center shadow-md group-hover:scale-105 transition">
                            <Fingerprint className="w-6 h-6 text-[#3DDC84]" />
                          </div>
                          <span className="text-[11px] font-medium text-[#F0F6FC]">
                            Anti-Detect
                          </span>
                        </button>

                        {/* Rotate Proxy Quick App */}
                        <button
                          type="button"
                          onClick={() => {
                            onRotateProxy(device.id);
                            triggerToast(
                              `New proxy tunnel assigned to ${device.nodeCode}`
                            );
                          }}
                          className="group flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-[#171E2B] transition cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-[#D29922]/15 border border-[#D29922]/40 flex items-center justify-center shadow-md group-hover:scale-105 transition">
                            <RefreshCw className="w-6 h-6 text-[#D29922]" />
                          </div>
                          <span className="text-[11px] font-medium text-[#F0F6FC]">
                            Rotate IP
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ==================== 2. INTERACTIVE GMAIL APP ==================== */}
                  {activeApp === "GMAIL" && (
                    <div className="flex-1 flex flex-col bg-[#0D1117]">
                      {/* Gmail Top Header */}
                      <div className="p-3 bg-[#161B22] border-b border-[#242E42] flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <GmailIcon className="w-5 h-5 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#F0F6FC] truncate">
                              {device.gmailAddress}
                            </div>
                            <div className="text-[10px] font-mono text-[#3DDC84] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{device.gmailStatus} • Synced</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateAccounts(device.id, {
                              gmailUnreadCount: 0,
                              appTarget: "GMAIL",
                            });
                            triggerToast(
                              `Marked all inbox messages read on ${device.gmailAddress}`
                            );
                          }}
                          className="px-2 py-1 rounded bg-[#EA4335]/20 border border-[#EA4335]/40 text-[#F0F6FC] text-[10px] font-mono hover:bg-[#EA4335]/30 cursor-pointer shrink-0"
                        >
                          Warmup Read
                        </button>
                      </div>

                      {selectedEmailIdx !== null ? (
                        /* Single Email Reader View */
                        <div className="flex-1 p-3 flex flex-col justify-between overflow-y-auto">
                          <div>
                            <button
                              type="button"
                              onClick={() => setSelectedEmailIdx(null)}
                              className="inline-flex items-center gap-1 text-xs text-[#00E5FF] hover:underline mb-2 cursor-pointer"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                              <span>Back to Inbox</span>
                            </button>
                            <div className="text-xs font-bold text-[#F0F6FC]">
                              {emails[selectedEmailIdx].subject}
                            </div>
                            <div className="mt-1 flex items-center justify-between text-[10px] text-[#8B949E] pb-2 border-b border-[#242E42]">
                              <span>From: {emails[selectedEmailIdx].sender}</span>
                              <span>{emails[selectedEmailIdx].time}</span>
                            </div>
                            <pre className="mt-3 text-[11px] font-sans whitespace-pre-wrap text-[#F0F6FC]/90 leading-relaxed">
                              {emails[selectedEmailIdx].body}
                            </pre>
                          </div>
                          <div className="pt-3 border-t border-[#242E42] flex items-center justify-between">
                            <span className="text-[10px] font-mono text-[#3DDC84]">
                              ✓ DKIM / SPF Verified via {device.proxyIp}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                triggerToast(
                                  `Sent warmup reply from ${device.gmailAddress}`
                                );
                                setSelectedEmailIdx(null);
                              }}
                              className="px-2.5 py-1 rounded bg-[#3DDC84] text-[#090C10] text-xs font-semibold cursor-pointer"
                            >
                              Quick Reply
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Inbox List View */
                        <div className="flex-1 divide-y divide-[#242E42]/60 overflow-y-auto">
                          {emails.map((mail, idx) => (
                            <div
                              key={idx}
                              onClick={() => setSelectedEmailIdx(idx)}
                              className="p-3 hover:bg-[#161B22] transition cursor-pointer flex items-start justify-between gap-2"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-[#F0F6FC]">
                                    {mail.sender}
                                  </span>
                                  <span className="px-1 py-0.2 rounded bg-[#242E42] text-[9px] font-mono text-[#00E5FF]">
                                    {mail.tag}
                                  </span>
                                </div>
                                <div className="text-[11px] font-medium text-[#F0F6FC]/90 truncate mt-0.5">
                                  {mail.subject}
                                </div>
                                <div className="text-[10px] text-[#8B949E] truncate mt-0.5">
                                  {mail.snippet}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <span className="text-[9px] font-mono text-[#8B949E]">
                                  {mail.time}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setStarredEmails((prev) => ({
                                      ...prev,
                                      [idx]: !prev[idx],
                                    }));
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Star
                                    className={`w-3.5 h-3.5 ${
                                      starredEmails[idx]
                                        ? "text-[#D29922] fill-[#D29922]"
                                        : "text-[#8B949E]"
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Gmail Account Footer */}
                      <div className="px-3 py-2 bg-[#161B22] border-t border-[#242E42] text-[10px] font-mono text-[#8B949E] flex items-center justify-between">
                        <span>Recovery: {device.gmailRecovery}</span>
                        <span className="text-[#3DDC84]">POP3/IMAP ON</span>
                      </div>
                    </div>
                  )}

                  {/* ==================== 3. INTERACTIVE FACEBOOK APP ==================== */}
                  {activeApp === "FACEBOOK" && (
                    <div className="flex-1 flex flex-col bg-[#0E131F]">
                      {/* FB Top App Bar */}
                      <div className="p-3 bg-[#1877F2]/15 border-b border-[#1877F2]/30 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <FacebookIcon className="w-5 h-5 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#F0F6FC] truncate">
                              {device.fbName}
                            </div>
                            <div className="text-[10px] font-mono text-[#00E5FF]">
                              UID: {device.fbUid} • {device.fbStatus}
                            </div>
                          </div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-[#3DDC84]/20 text-[#3DDC84] font-mono text-[10px]">
                          {device.fbFriendsCount} Friends
                        </span>
                      </div>

                      {/* FB Post Composer & Feed */}
                      <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto">
                        {/* Create Warmup Status Box */}
                        <div className="p-2.5 rounded-xl bg-[#161D2B] border border-[#242E42]">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={fbPostInput}
                              onChange={(e) => setFbPostInput(e.target.value)}
                              placeholder={`Post status as ${device.fbName}...`}
                              className="flex-1 bg-[#090C10] border border-[#242E42] rounded-lg px-2.5 py-1 text-xs text-[#F0F6FC] placeholder-[#8B949E] focus:outline-none focus:border-[#1877F2]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const text =
                                  fbPostInput.trim() ||
                                  `Checking in from ${device.proxyCity}, ${device.proxyCountry}! 🚀`;
                                setFbCustomPosts((prev) => [text, ...prev]);
                                setFbPostInput("");
                                onUpdateAccounts(device.id, {
                                  fbFriendsCount: device.fbFriendsCount + 1,
                                  appTarget: "FACEBOOK",
                                });
                                triggerToast(
                                  `Published Facebook warmup post on ${device.nodeCode}`
                                );
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#1877F2] text-white text-xs font-semibold cursor-pointer"
                            >
                              Post
                            </button>
                          </div>
                        </div>

                        {/* Custom Newly Posted Statuses */}
                        {fbCustomPosts.map((postText, idx) => (
                          <div
                            key={`custom-${idx}`}
                            className="p-2.5 rounded-xl bg-[#161D2B] border border-[#1877F2]/40 space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-[#F0F6FC]">
                                {device.fbName}
                              </span>
                              <span className="text-[10px] font-mono text-[#3DDC84]">
                                Just now • {device.proxyCity}
                              </span>
                            </div>
                            <p className="text-xs text-[#F0F6FC]/90">{postText}</p>
                          </div>
                        ))}

                        {/* Feed Post 1 */}
                        <div className="p-2.5 rounded-xl bg-[#161D2B] border border-[#242E42] space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-semibold text-[#F0F6FC]">
                                {device.fbName} • Meta Business Manager
                              </div>
                              <div className="text-[10px] text-[#8B949E]">
                                Sponsored • Logged in via {device.deviceName}
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-[#3DDC84]">
                              TRUSTED
                            </span>
                          </div>
                          <p className="text-[11px] text-[#F0F6FC]/90 leading-relaxed">
                            Ad account & Marketplace profile warmed up on dedicated{" "}
                            {device.proxyCountry} residential IP ({device.proxyIp}
                            ). 2FA TOTP authenticator active.
                          </p>
                          <div className="pt-1.5 border-t border-[#242E42] flex items-center justify-between text-xs">
                            <button
                              type="button"
                              onClick={() =>
                                setFbLikedPosts((p) => ({ ...p, 0: !p[0] }))
                              }
                              className={`flex items-center gap-1 cursor-pointer ${
                                fbLikedPosts[0]
                                  ? "text-[#1877F2] font-semibold"
                                  : "text-[#8B949E]"
                              }`}
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>{fbLikedPosts[0] ? "Liked (48)" : "Like (47)"}</span>
                            </button>
                            <span className="flex items-center gap-1 text-[#8B949E]">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>14 Comments</span>
                            </span>
                            <span className="flex items-center gap-1 text-[#8B949E]">
                              <Share2 className="w-3.5 h-3.5" />
                              <span>Share</span>
                            </span>
                          </div>
                        </div>

                        {/* 2FA & Cookie Session Card inside FB */}
                        <div className="p-2.5 rounded-xl bg-[#11161F] border border-[#242E42] font-mono text-[10px] space-y-1">
                          <div className="text-[#8B949E] flex items-center justify-between">
                            <span>2FA TOTP SEED:</span>
                            <span className="text-[#F0F6FC]">
                              {device.fb2faSecret}
                            </span>
                          </div>
                          <div className="text-[#8B949E] flex items-center justify-between">
                            <span>SESSION COOKIE:</span>
                            <span className="text-[#3DDC84] truncate max-w-[160px]">
                              c_user={device.fbUid}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ==================== 4. INTERACTIVE YOUTUBE APP ==================== */}
                  {activeApp === "YOUTUBE" && (
                    <div className="flex-1 flex flex-col bg-[#0B0E14]">
                      {/* YouTube Channel Top Header */}
                      <div className="p-2.5 bg-[#161B22] border-b border-[#242E42] flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <YouTubeIcon className="w-5 h-5 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#F0F6FC] truncate">
                              {device.ytChannelName}
                            </div>
                            <div className="text-[10px] font-mono text-[#8B949E] truncate">
                              {device.ytHandle} •{" "}
                              {device.ytSubscribers.toLocaleString()} subs
                            </div>
                          </div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-[#FF0033]/20 border border-[#FF0033]/40 text-[#FF0033] font-mono text-[10px] font-semibold">
                          {device.ytStatus}
                        </span>
                      </div>

                      {/* Simulated Live Video Stream Player */}
                      <div className="relative h-40 bg-gradient-to-br from-[#1A1025] via-[#0F172A] to-[#090C10] border-b border-[#242E42] flex flex-col justify-between p-3 overflow-hidden">
                        <div className="flex items-center justify-between z-10">
                          <span className="px-1.5 py-0.5 rounded bg-[#FF0033] text-white font-mono text-[9px] font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            WARMUP STREAM • 1080p60
                          </span>
                          <span className="font-mono text-[10px] text-[#00E5FF] bg-[#090C10]/80 px-1.5 py-0.5 rounded">
                            {device.proxyIp} ({device.proxyCountryCode})
                          </span>
                        </div>

                        {/* Center Play/Pause Visualizer */}
                        <div className="my-auto flex flex-col items-center justify-center z-10">
                          <button
                            type="button"
                            onClick={() => setYtPlaying(!ytPlaying)}
                            className="w-10 h-10 rounded-full bg-[#FF0033]/90 hover:bg-[#FF0033] text-white flex items-center justify-center shadow-lg cursor-pointer transition"
                          >
                            {ytPlaying ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4 ml-0.5" />
                            )}
                          </button>
                          <span className="mt-1 text-[10px] font-mono text-[#F0F6FC]/90">
                            {ytPlaying
                              ? `Streaming on ${device.socChipset} (${device.fps} FPS)`
                              : "Paused"}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-[#242E42] h-1 rounded-full overflow-hidden z-10">
                          <div className="bg-[#FF0033] h-full w-2/3 animate-pulse" />
                        </div>
                      </div>

                      {/* Video Actions & Comments */}
                      <div className="flex-1 p-2.5 flex flex-col justify-between overflow-y-auto space-y-2">
                        <div className="flex items-center justify-between gap-1 pb-2 border-b border-[#242E42]">
                          <button
                            type="button"
                            onClick={() => setYtLiked(!ytLiked)}
                            className={`px-2.5 py-1 rounded-full text-xs flex items-center gap-1 cursor-pointer border ${
                              ytLiked
                                ? "bg-[#3DDC84]/20 border-[#3DDC84] text-[#3DDC84]"
                                : "bg-[#161B22] border-[#242E42] text-[#F0F6FC]"
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{ytLiked ? "Liked" : "Like"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onUpdateAccounts(device.id, {
                                ytWatchHours: device.ytWatchHours + 10,
                                ytSubscribers: device.ytSubscribers + 5,
                                appTarget: "YOUTUBE",
                              });
                              triggerToast(
                                `+10 Watch Hours synced to ${device.ytHandle}`
                              );
                            }}
                            className="px-2.5 py-1 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-mono cursor-pointer"
                          >
                            +10h Watch Warmup
                          </button>

                          <button
                            type="button"
                            onClick={() => setYtSubscribed(!ytSubscribed)}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                              ytSubscribed
                                ? "bg-[#242E42] text-[#F0F6FC]"
                                : "bg-[#FF0033] text-white"
                            }`}
                          >
                            {ytSubscribed ? "Subscribed ✓" : "Subscribe"}
                          </button>
                        </div>

                        {/* Comments Feed */}
                        <div className="space-y-1.5 flex-1 overflow-y-auto">
                          {ytComments.map((c, i) => (
                            <div
                              key={i}
                              className="p-2 rounded-lg bg-[#161B22] border border-[#242E42]/80 text-[11px]"
                            >
                              <div className="flex items-center justify-between text-[10px] font-mono text-[#00E5FF]">
                                <span>{c.author}</span>
                                <span className="text-[#8B949E]">{c.time}</span>
                              </div>
                              <div className="text-[#F0F6FC] mt-0.5">
                                {c.text}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Comment Input as Logged-In Channel */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <input
                            type="text"
                            value={ytCommentInput}
                            onChange={(e) => setYtCommentInput(e.target.value)}
                            placeholder={`Comment as ${device.ytHandle}...`}
                            className="flex-1 bg-[#161B22] border border-[#242E42] rounded-lg px-2 py-1 text-xs text-[#F0F6FC] placeholder-[#8B949E] focus:outline-none focus:border-[#FF0033]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!ytCommentInput.trim()) return;
                              setYtComments((prev) => [
                                {
                                  author: device.ytHandle,
                                  text: ytCommentInput.trim(),
                                  time: "Just now",
                                },
                                ...prev,
                              ]);
                              setYtCommentInput("");
                              triggerToast(
                                `Comment posted from ${device.ytHandle}`
                              );
                            }}
                            className="p-1.5 rounded-lg bg-[#FF0033] text-white cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ==================== 5. PROXY IP & ANTI-DETECT CHECKER APP ==================== */}
                  {activeApp === "CHROME_IP" && (
                    <div className="flex-1 flex flex-col bg-[#0B0F17] p-3 justify-between overflow-y-auto">
                      <div className="space-y-2.5">
                        {/* URL Bar */}
                        <div className="px-2.5 py-1.5 rounded-lg bg-[#161B22] border border-[#242E42] flex items-center justify-between font-mono text-[11px]">
                          <span className="flex items-center gap-1.5 text-[#3DDC84]">
                            <Lock className="w-3 h-3" />
                            <span>https://whoer.droidmatrix.internal</span>
                          </span>
                          <span className="text-[#8B949E]">200 OK</span>
                        </div>

                        {/* Trust Score Banner */}
                        <div className="p-3 rounded-xl bg-[#3DDC84]/10 border border-[#3DDC84]/40 text-center">
                          <div className="text-[10px] font-mono uppercase text-[#3DDC84]">
                            Anonymity & Anti-Detect Score
                          </div>
                          <div className="text-2xl font-display font-bold text-[#F0F6FC] mt-0.5">
                            100% NATIVE
                          </div>
                          <div className="text-[11px] font-mono text-[#00E5FF] mt-0.5">
                            {device.proxyIp}:{device.proxyPort}
                          </div>
                        </div>

                        {/* Detailed Network & Hardware Matrix */}
                        <div className="rounded-xl bg-[#11161F] border border-[#242E42] divide-y divide-[#242E42] font-mono text-[11px]">
                          <div className="p-2 flex justify-between">
                            <span className="text-[#8B949E]">Country/City:</span>
                            <span className="text-[#F0F6FC] flex items-center gap-1">
                              <CountryFlag code={device.proxyCountryCode} />
                              <span>{device.proxyCity}</span>
                            </span>
                          </div>
                          <div className="p-2 flex justify-between">
                            <span className="text-[#8B949E]">ISP / Carrier:</span>
                            <span className="text-[#00E5FF] truncate max-w-[160px]">
                              {device.proxyIsp}
                            </span>
                          </div>
                          <div className="p-2 flex justify-between">
                            <span className="text-[#8B949E]">ASN / Protocol:</span>
                            <span className="text-[#F0F6FC]">
                              {device.proxyAsn} • {device.proxyProtocol}
                            </span>
                          </div>
                          <div className="p-2 flex justify-between">
                            <span className="text-[#8B949E]">WebRTC / DNS:</span>
                            <span className="text-[#3DDC84] font-semibold">
                              0% LEAK (SHIELDED)
                            </span>
                          </div>
                          <div className="p-2 flex justify-between">
                            <span className="text-[#8B949E]">IMEI (Luhn):</span>
                            <span className="text-[#F0F6FC]">{device.imei}</span>
                          </div>
                          <div className="p-2 flex justify-between">
                            <span className="text-[#8B949E]">Android ID:</span>
                            <span className="text-[#F0F6FC]">
                              {device.androidId}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          onRotateProxy(device.id);
                          triggerToast(
                            `Assigned fresh dedicated proxy IP to ${device.nodeCode}`
                          );
                        }}
                        className="w-full py-2 rounded-xl bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#090C10] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Rotate Dedicated Proxy IP Now</span>
                      </button>
                    </div>
                  )}

                  {/* ==================== 6. HARDWARE ANTI-DETECT SETTINGS APP ==================== */}
                  {activeApp === "SETTINGS" && (
                    <div className="flex-1 flex flex-col bg-[#0B0F17] p-3 justify-between overflow-y-auto">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 pb-2 border-b border-[#242E42]">
                          <Cpu className="w-4 h-4 text-[#3DDC84]" />
                          <div>
                            <div className="text-xs font-bold text-[#F0F6FC]">
                              Hardware Fingerprint Spoofer
                            </div>
                            <div className="text-[10px] text-[#8B949E]">
                              Kernel-level Build.prop & Sensor Masking
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#11161F] border border-[#242E42] space-y-2 font-mono text-[11px]">
                          <div>
                            <div className="text-[10px] text-[#8B949E]">
                              DEVICE MODEL & SOC
                            </div>
                            <div className="text-[#F0F6FC] font-semibold">
                              {device.deviceName} ({device.modelCode})
                            </div>
                            <div className="text-[#3DDC84] text-[10px]">
                              {device.socChipset} • {device.ramGb}GB RAM
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-[#8B949E]">
                              HARDWARE IMEI
                            </div>
                            <div className="text-[#00E5FF]">{device.imei}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-[#8B949E]">
                              ANDROID_ID & WIFI MAC
                            </div>
                            <div className="text-[#F0F6FC]">
                              {device.androidId} • {device.macAddress}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-[#8B949E]">
                              RO.BUILD.FINGERPRINT
                            </div>
                            <div className="text-[10px] text-[#8B949E] break-all">
                              {device.buildFingerprint}
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          onSpoofFingerprint(device.id);
                          triggerToast(
                            `Generated new IMEI & Android ID for ${device.nodeCode}`
                          );
                        }}
                        className="w-full py-2 rounded-xl bg-[#3DDC84] hover:bg-[#3DDC84]/90 text-[#090C10] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Randomize Hardware Fingerprint</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* ANDROID SYSTEM BOTTOM NAVIGATION BAR */}
                <div className="h-10 bg-[#090C10] border-t border-[#1E2638] flex items-center justify-around px-6 z-20">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedEmailIdx !== null) {
                        setSelectedEmailIdx(null);
                      } else {
                        onSwitchApp("HOME");
                      }
                    }}
                    title="Android Back"
                    className="p-1.5 text-[#8B949E] hover:text-[#F0F6FC] cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEmailIdx(null);
                      onSwitchApp("HOME");
                    }}
                    title="Android Home"
                    className="p-1.5 text-[#8B949E] hover:text-[#3DDC84] cursor-pointer"
                  >
                    <Home className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const order = [
                        "HOME",
                        "GMAIL",
                        "FACEBOOK",
                        "YOUTUBE",
                        "CHROME_IP",
                        "SETTINGS",
                      ];
                      const nextApp =
                        order[(order.indexOf(activeApp) + 1) % order.length];
                      onSwitchApp(nextApp);
                    }}
                    title="Cycle Recent Apps"
                    className="p-1.5 text-[#8B949E] hover:text-[#00E5FF] cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* TACTILE HARDWARE SIDE CONTROL STRIP */}
            <div className="flex flex-col gap-2 bg-[#11161F] p-2 rounded-2xl border border-[#242E42] shadow-xl">
              <button
                type="button"
                onClick={() => onSwitchApp("HOME")}
                title="Home Screen"
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  activeApp === "HOME"
                    ? "bg-[#3DDC84]/20 border-[#3DDC84] text-[#3DDC84]"
                    : "bg-[#171E2B] border-[#242E42] text-[#8B949E] hover:text-[#F0F6FC]"
                }`}
              >
                <Power className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onSwitchApp("GMAIL")}
                title="Launch Gmail App"
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  activeApp === "GMAIL"
                    ? "bg-[#EA4335]/20 border-[#EA4335] text-[#F0F6FC]"
                    : "bg-[#171E2B] border-[#242E42] text-[#8B949E] hover:text-[#F0F6FC]"
                }`}
              >
                <GmailIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onSwitchApp("FACEBOOK")}
                title="Launch Facebook App"
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  activeApp === "FACEBOOK"
                    ? "bg-[#1877F2]/20 border-[#1877F2] text-[#F0F6FC]"
                    : "bg-[#171E2B] border-[#242E42] text-[#8B949E] hover:text-[#F0F6FC]"
                }`}
              >
                <FacebookIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onSwitchApp("YOUTUBE")}
                title="Launch YouTube App"
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  activeApp === "YOUTUBE"
                    ? "bg-[#FF0033]/20 border-[#FF0033] text-[#F0F6FC]"
                    : "bg-[#171E2B] border-[#242E42] text-[#8B949E] hover:text-[#F0F6FC]"
                }`}
              >
                <YouTubeIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onSwitchApp("CHROME_IP")}
                title="Check Proxy IP & Anti-Detect Shield"
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  activeApp === "CHROME_IP"
                    ? "bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]"
                    : "bg-[#171E2B] border-[#242E42] text-[#8B949E] hover:text-[#F0F6FC]"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
              </button>

              <div className="h-px bg-[#242E42] my-0.5" />

              <button
                type="button"
                onClick={() => {
                  onRotateProxy(device.id);
                  triggerToast(`Rotated Proxy IP on ${device.nodeCode}`);
                }}
                title="Rotate Dedicated Proxy IP"
                className="p-2 rounded-xl bg-[#171E2B] border border-[#242E42] text-[#00E5FF] hover:border-[#00E5FF] transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onSpoofFingerprint(device.id);
                  triggerToast(`Spoofed IMEI/Android ID on ${device.nodeCode}`);
                }}
                title="Spoof Hardware Fingerprint"
                className="p-2 rounded-xl bg-[#171E2B] border border-[#242E42] text-[#3DDC84] hover:border-[#3DDC84] transition cursor-pointer"
              >
                <Fingerprint className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleScreenshot}
                title="Capture Framebuffer Screenshot"
                className="p-2 rounded-xl bg-[#171E2B] border border-[#242E42] text-[#8B949E] hover:text-[#F0F6FC] transition cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => triggerToast("Audio stream gain +3dB")}
                title="Volume Up"
                className="p-2 rounded-xl bg-[#171E2B] border border-[#242E42] text-[#8B949E] hover:text-[#F0F6FC] transition cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage Bottom ADB Telemetry Footer */}
      <div className="px-3 py-1.5 bg-[#11161F] border-t border-[#242E42] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#8B949E]">
        <div className="flex items-center gap-2 truncate">
          <Terminal className="w-3.5 h-3.5 text-[#3DDC84] shrink-0" />
          <span className="text-[#F0F6FC] truncate">
            adb -s {device.nodeCode.toLowerCase()}:5555 shell [{activeApp}]
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>
            CPU: <strong className="text-[#3DDC84]">{device.cpuUsage}%</strong>
          </span>
          <span>
            RAM:{" "}
            <strong className="text-[#F0F6FC]">
              {(device.ramUsageMb / 1024).toFixed(1)}/{device.ramGb}GB
            </strong>
          </span>
          <span>
            PING:{" "}
            <strong className="text-[#00E5FF]">
              {device.proxyLatencyMs}ms
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
