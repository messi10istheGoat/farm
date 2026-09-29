"use client";

import React, { useState } from "react";
import type { AndroidDevice, AutomationTask } from "@/db/schema";
import {
  GmailIcon,
  FacebookIcon,
  YouTubeIcon,
  CountryFlag,
} from "@/components/BrandBadges";
import {
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Cpu,
  Fingerprint,
  Terminal,
  ExternalLink,
  Save,
  Sparkles,
  Lock,
  Wifi,
  KeyRound,
} from "lucide-react";

interface DeviceInspectorDrawerProps {
  device: AndroidDevice;
  recentTasks: AutomationTask[];
  onRotateProxy: (deviceId: number, countryCode?: string) => Promise<void>;
  onSpoofFingerprint: (deviceId: number, deviceName?: string) => Promise<void>;
  onUpdateAccounts: (
    deviceId: number,
    payload: Record<string, unknown>
  ) => Promise<void>;
  onSwitchApp: (app: string) => Promise<void>;
  isBusy: boolean;
}

const TARGET_COUNTRIES = [
  { code: "US", label: "United States (AT&T / T-Mobile 5G)" },
  { code: "DE", label: "Germany (Vodafone / Telekom)" },
  { code: "GB", label: "United Kingdom (EE 5G / BT)" },
  { code: "JP", label: "Japan (NTT Docomo 5G)" },
  { code: "SG", label: "Singapore (Singtel Mobile)" },
  { code: "NL", label: "Netherlands (KPN Residential)" },
  { code: "CA", label: "Canada (Rogers Wireless)" },
  { code: "FR", label: "France (Orange S.A. 5G)" },
  { code: "CH", label: "Switzerland (Swisscom Fibre)" },
  { code: "KR", label: "South Korea (SK Telecom 5G)" },
  { code: "AU", label: "Australia (Telstra 5G)" },
];

export function DeviceInspectorDrawer({
  device,
  recentTasks,
  onRotateProxy,
  onSpoofFingerprint,
  onUpdateAccounts,
  onSwitchApp,
  isBusy,
}: DeviceInspectorDrawerProps) {
  const [activeTab, setActiveTab] = useState<"PROXY" | "ACCOUNTS" | "HARDWARE">(
    "ACCOUNTS"
  );
  const [showPasswords, setShowPasswords] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState(
    device.proxyCountryCode
  );
  const [editMode, setEditMode] = useState(false);

  // Editable account fields
  const [gmailInput, setGmailInput] = useState(device.gmailAddress);
  const [fbNameInput, setFbNameInput] = useState(device.fbName);
  const [ytChannelInput, setYtChannelInput] = useState(device.ytChannelName);
  const [ytHandleInput, setYtHandleInput] = useState(device.ytHandle);

  // Keep inputs synced when user selects a different device
  React.useEffect(() => {
    setGmailInput(device.gmailAddress);
    setFbNameInput(device.fbName);
    setYtChannelInput(device.ytChannelName);
    setYtHandleInput(device.ytHandle);
    setSelectedCountry(device.proxyCountryCode);
    setEditMode(false);
  }, [device]);

  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard?.writeText(value);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1600);
  };

  const handleSaveAccounts = async () => {
    await onUpdateAccounts(device.id, {
      gmailAddress: gmailInput,
      fbName: fbNameInput,
      fbEmail: gmailInput,
      ytChannelName: ytChannelInput,
      ytHandle: ytHandleInput,
    });
    setEditMode(false);
  };

  return (
    <aside className="flex flex-col h-full bg-[#11161F] overflow-hidden">
      {/* Inspector Node Header */}
      <div className="p-3 bg-[#171E2B] border-b border-[#242E42] flex items-center justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#3DDC84]">
              {device.nodeCode}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#242E42] text-[#F0F6FC]">
              {device.clusterShard.split(" ")[0]}
            </span>
          </div>
          <div className="text-sm font-display font-bold text-[#F0F6FC] truncate mt-0.5">
            {device.deviceName}
          </div>
        </div>
        <div className="text-right font-mono text-[11px]">
          <div className="text-[#00E5FF]">{device.proxyIp}</div>
          <div className="text-[#8B949E] text-[10px]">
            {device.socChipset}
          </div>
        </div>
      </div>

      {/* 3-Tab Navigation Bar */}
      <div className="grid grid-cols-3 bg-[#090C10] border-b border-[#242E42] p-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("ACCOUNTS")}
          className={`py-1.5 px-2 rounded text-xs font-medium transition cursor-pointer ${
            activeTab === "ACCOUNTS"
              ? "bg-[#171E2B] text-[#3DDC84] border border-[#3DDC84]/40 font-semibold"
              : "text-[#8B949E] hover:text-[#F0F6FC]"
          }`}
        >
          Accounts (3)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("PROXY")}
          className={`py-1.5 px-2 rounded text-xs font-medium transition cursor-pointer ${
            activeTab === "PROXY"
              ? "bg-[#171E2B] text-[#00E5FF] border border-[#00E5FF]/40 font-semibold"
              : "text-[#8B949E] hover:text-[#F0F6FC]"
          }`}
        >
          Proxy Tunnel
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("HARDWARE")}
          className={`py-1.5 px-2 rounded text-xs font-medium transition cursor-pointer ${
            activeTab === "HARDWARE"
              ? "bg-[#171E2B] text-[#F0F6FC] border border-[#242E42] font-semibold"
              : "text-[#8B949E] hover:text-[#F0F6FC]"
          }`}
        >
          HW & ADB
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* ==================== TAB 1: ACCOUNTS VAULT ==================== */}
        {activeTab === "ACCOUNTS" && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8B949E]">
                Pre-Provisioned Real Accounts
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="px-2 py-1 rounded bg-[#171E2B] border border-[#242E42] text-[11px] text-[#8B949E] hover:text-[#F0F6FC] flex items-center gap-1 cursor-pointer"
                >
                  {showPasswords ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                  <span>{showPasswords ? "Hide" : "Reveal"}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editMode ? handleSaveAccounts() : setEditMode(true)
                  }
                  className="px-2 py-1 rounded bg-[#3DDC84]/15 border border-[#3DDC84]/40 text-[11px] text-[#3DDC84] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {editMode ? (
                    <>
                      <Save className="w-3 h-3" />
                      <span>Save</span>
                    </>
                  ) : (
                    <span>Edit</span>
                  )}
                </button>
              </div>
            </div>

            {/* 1. GOOGLE / GMAIL ACCOUNT CARD */}
            <div className="p-3 rounded-xl bg-[#171E2B] border border-[#242E42] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GmailIcon className="w-4 h-4" />
                  <span className="text-xs font-bold text-[#F0F6FC]">
                    Google / Gmail Account
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-[#3DDC84]/15 text-[#3DDC84] font-mono text-[10px] font-semibold">
                  {device.gmailStatus}
                </span>
              </div>

              {editMode ? (
                <input
                  type="email"
                  value={gmailInput}
                  onChange={(e) => setGmailInput(e.target.value)}
                  className="w-full bg-[#090C10] border border-[#242E42] rounded px-2 py-1 text-xs font-mono text-[#F0F6FC]"
                />
              ) : (
                <div className="p-2 rounded bg-[#090C10] border border-[#242E42] flex items-center justify-between font-mono text-xs">
                  <span className="text-[#F0F6FC] truncate">
                    {device.gmailAddress}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(device.gmailAddress, "gmail")
                    }
                    className="text-[#8B949E] hover:text-[#3DDC84] cursor-pointer ml-2"
                  >
                    {copiedField === "gmail" ? (
                      <Check className="w-3.5 h-3.5 text-[#3DDC84]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-1.5 rounded bg-[#090C10]/70 border border-[#242E42]/60">
                  <div className="text-[9px] text-[#8B949E]">PASSWORD</div>
                  <div className="text-[#F0F6FC] truncate">
                    {showPasswords ? device.gmailPassword : "••••••••••••"}
                  </div>
                </div>
                <div className="p-1.5 rounded bg-[#090C10]/70 border border-[#242E42]/60">
                  <div className="text-[9px] text-[#8B949E]">RECOVERY</div>
                  <div className="text-[#8B949E] truncate">
                    {device.gmailRecovery}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#8B949E]">
                  Inbox:{" "}
                  <strong className="text-[#F0F6FC]">
                    {device.gmailUnreadCount} unread
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => onSwitchApp("GMAIL")}
                  className="px-2.5 py-1 rounded bg-[#EA4335]/20 hover:bg-[#EA4335]/30 border border-[#EA4335]/40 text-[#F0F6FC] text-xs flex items-center gap-1 cursor-pointer transition"
                >
                  <span>Open Gmail App</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 2. FACEBOOK ACCOUNT CARD */}
            <div className="p-3 rounded-xl bg-[#171E2B] border border-[#242E42] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FacebookIcon className="w-4 h-4" />
                  <span className="text-xs font-bold text-[#F0F6FC]">
                    Facebook Profile & Ads
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-[#1877F2]/20 text-[#00E5FF] font-mono text-[10px] font-semibold">
                  {device.fbStatus}
                </span>
              </div>

              {editMode ? (
                <input
                  type="text"
                  value={fbNameInput}
                  onChange={(e) => setFbNameInput(e.target.value)}
                  className="w-full bg-[#090C10] border border-[#242E42] rounded px-2 py-1 text-xs text-[#F0F6FC]"
                />
              ) : (
                <div className="p-2 rounded bg-[#090C10] border border-[#242E42] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#F0F6FC]">
                      {device.fbName}
                    </div>
                    <div className="font-mono text-[10px] text-[#8B949E]">
                      UID: {device.fbUid}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(device.fbUid, "fbUid")}
                    className="text-[#8B949E] hover:text-[#00E5FF] cursor-pointer"
                  >
                    {copiedField === "fbUid" ? (
                      <Check className="w-3.5 h-3.5 text-[#3DDC84]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-1.5 rounded bg-[#090C10]/70 border border-[#242E42]/60">
                  <div className="text-[9px] text-[#8B949E]">FB PASSWORD</div>
                  <div className="text-[#F0F6FC] truncate">
                    {showPasswords ? device.fbPassword : "••••••••••••"}
                  </div>
                </div>
                <div className="p-1.5 rounded bg-[#090C10]/70 border border-[#242E42]/60">
                  <div className="text-[9px] text-[#8B949E]">2FA TOTP KEY</div>
                  <div className="text-[#3DDC84] truncate">
                    {device.fb2faSecret}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#8B949E]">
                  Friends:{" "}
                  <strong className="text-[#F0F6FC]">
                    {device.fbFriendsCount.toLocaleString()}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => onSwitchApp("FACEBOOK")}
                  className="px-2.5 py-1 rounded bg-[#1877F2]/20 hover:bg-[#1877F2]/30 border border-[#1877F2]/40 text-[#F0F6FC] text-xs flex items-center gap-1 cursor-pointer transition"
                >
                  <span>Open FB App</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 3. YOUTUBE CHANNEL CARD */}
            <div className="p-3 rounded-xl bg-[#171E2B] border border-[#242E42] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <YouTubeIcon className="w-4 h-4" />
                  <span className="text-xs font-bold text-[#F0F6FC]">
                    YouTube Creator Channel
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-[#FF0033]/20 text-[#FF0033] font-mono text-[10px] font-semibold">
                  {device.ytStatus}
                </span>
              </div>

              {editMode ? (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={ytChannelInput}
                    onChange={(e) => setYtChannelInput(e.target.value)}
                    className="w-full bg-[#090C10] border border-[#242E42] rounded px-2 py-1 text-xs text-[#F0F6FC]"
                  />
                  <input
                    type="text"
                    value={ytHandleInput}
                    onChange={(e) => setYtHandleInput(e.target.value)}
                    className="w-full bg-[#090C10] border border-[#242E42] rounded px-2 py-1 text-xs font-mono text-[#00E5FF]"
                  />
                </div>
              ) : (
                <div className="p-2 rounded bg-[#090C10] border border-[#242E42] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#F0F6FC]">
                      {device.ytChannelName}
                    </div>
                    <div className="font-mono text-[11px] text-[#00E5FF]">
                      {device.ytHandle}
                    </div>
                  </div>
                  <div className="text-right font-mono text-[11px]">
                    <div className="text-[#3DDC84] font-semibold">
                      {device.ytSubscribers.toLocaleString()} subs
                    </div>
                    <div className="text-[#8B949E] text-[10px]">
                      {device.ytWatchHours.toLocaleString()}h watch
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-mono text-[#8B949E]">
                  OAuth2 Token Valid
                </span>
                <button
                  type="button"
                  onClick={() => onSwitchApp("YOUTUBE")}
                  className="px-2.5 py-1 rounded bg-[#FF0033]/20 hover:bg-[#FF0033]/30 border border-[#FF0033]/40 text-[#F0F6FC] text-xs flex items-center gap-1 cursor-pointer transition"
                >
                  <span>Open YouTube App</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Session Cookie Digest */}
            <div className="p-2.5 rounded-xl bg-[#090C10] border border-[#242E42] font-mono text-[10px] space-y-1">
              <div className="flex items-center justify-between text-[#8B949E]">
                <span className="flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-[#3DDC84]" />
                  <span>PERSISTENT COOKIE JAR</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(device.cookieTokenDigest, "cookie")
                  }
                  className="text-[#00E5FF] hover:underline cursor-pointer"
                >
                  {copiedField === "cookie" ? "Copied!" : "Copy Token"}
                </button>
              </div>
              <div className="text-[#8B949E] truncate">
                {device.cookieTokenDigest}
              </div>
            </div>
          </>
        )}

        {/* ==================== TAB 2: DEDICATED PROXY TUNNEL ==================== */}
        {activeTab === "PROXY" && (
          <>
            <div className="p-3 rounded-xl bg-[#171E2B] border border-[#00E5FF]/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#00E5FF] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Dedicated Proxy Endpoint</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-[#3DDC84]/15 text-[#3DDC84] font-mono text-[10px] font-bold">
                  UNIQUE IP • ACTIVE
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090C10] border border-[#242E42] font-mono space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8B949E]">EXIT IP:PORT</span>
                  <span className="text-[#F0F6FC] font-bold">
                    {device.proxyIp}:{device.proxyPort}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8B949E]">PROTOCOL</span>
                  <span className="text-[#00E5FF]">{device.proxyProtocol}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8B949E]">LOCATION</span>
                  <span className="text-[#F0F6FC] flex items-center gap-1">
                    <CountryFlag code={device.proxyCountryCode} />
                    <span>{device.proxyCity}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8B949E]">CARRIER / ISP</span>
                  <span className="text-[#3DDC84] truncate max-w-[170px]">
                    {device.proxyIsp}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8B949E]">ASN / PING</span>
                  <span className="text-[#F0F6FC]">
                    {device.proxyAsn} • {device.proxyLatencyMs}ms
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8B949E]">AUTH USER</span>
                  <span className="text-[#8B949E]">{device.proxyUsername}</span>
                </div>
              </div>

              {/* Leak Protection Badges */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-[#090C10] border border-[#3DDC84]/30 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#3DDC84]" />
                  <div>
                    <div className="text-[10px] font-mono text-[#8B949E]">
                      WebRTC Shield
                    </div>
                    <div className="text-xs font-semibold text-[#3DDC84]">
                      0% Leak
                    </div>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[#090C10] border border-[#3DDC84]/30 flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-[#00E5FF]" />
                  <div>
                    <div className="text-[10px] font-mono text-[#8B949E]">
                      DNS Tunnel
                    </div>
                    <div className="text-xs font-semibold text-[#00E5FF]">
                      Isolated
                    </div>
                  </div>
                </div>
              </div>

              {/* Rotate Proxy by Target Geolocation */}
              <div className="pt-2 border-t border-[#242E42] space-y-2">
                <label className="block text-[11px] font-mono text-[#8B949E]">
                  SWITCH PROXY GEOLOCATION / CARRIER:
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-[#090C10] border border-[#242E42] rounded-lg px-2.5 py-1.5 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#00E5FF]"
                >
                  {TARGET_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onRotateProxy(device.id, selectedCountry)}
                  className="w-full py-2 rounded-lg bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#090C10] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Rotate Dedicated Proxy IP</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ==================== TAB 3: HARDWARE & ADB LOGS ==================== */}
        {activeTab === "HARDWARE" && (
          <>
            <div className="p-3 rounded-xl bg-[#171E2B] border border-[#242E42] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F0F6FC] flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#3DDC84]" />
                  <span>ARM64 Hardware Identity</span>
                </span>
                <span className="text-[10px] font-mono text-[#3DDC84]">
                  SPOOFED
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090C10] border border-[#242E42] font-mono text-[11px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#8B949E]">MODEL:</span>
                  <span className="text-[#F0F6FC]">
                    {device.deviceName} ({device.modelCode})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B949E]">CHIPSET:</span>
                  <span className="text-[#3DDC84]">{device.socChipset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B949E]">OS / DISPLAY:</span>
                  <span className="text-[#F0F6FC]">
                    {device.androidVersion.split(" ")[0]}{" "}
                    {device.androidVersion.split(" ")[1]} • {device.ramGb}GB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B949E]">IMEI:</span>
                  <span className="text-[#00E5FF]">{device.imei}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B949E]">ANDROID_ID:</span>
                  <span className="text-[#F0F6FC]">{device.androidId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B949E]">WIFI MAC:</span>
                  <span className="text-[#F0F6FC]">{device.macAddress}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={isBusy}
                onClick={() => onSpoofFingerprint(device.id)}
                className="w-full py-2 rounded-lg bg-[#3DDC84]/20 hover:bg-[#3DDC84]/30 border border-[#3DDC84]/50 text-[#3DDC84] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Regenerate IMEI & Hardware ID</span>
              </button>
            </div>

            {/* Fleet Automation & ADB Execution Stream */}
            <div className="p-3 rounded-xl bg-[#171E2B] border border-[#242E42] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#F0F6FC]">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Recent Fleet ADB Tasks</span>
                </span>
                <span className="text-[10px] font-mono text-[#3DDC84]">
                  LIVE STREAM
                </span>
              </div>

              <div className="space-y-1.5 max-h-[210px] overflow-y-auto">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2 rounded bg-[#090C10] border border-[#242E42] font-mono text-[10px] space-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[#3DDC84] font-semibold truncate max-w-[180px]">
                        {task.taskName}
                      </span>
                      <span className="text-[#00E5FF]">{task.targetScope}</span>
                    </div>
                    <div className="text-[#8B949E] truncate">
                      $ {task.commandScript}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
