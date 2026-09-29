"use client";

import React, { useState } from "react";
import { HARDWARE_CATALOG, PROXY_LOCATIONS } from "@/lib/device-generator";
import {
  X,
  PlusCircle,
  Layers,
  Cpu,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  GmailIcon,
  FacebookIcon,
  YouTubeIcon,
} from "@/components/BrandBadges";

interface ProvisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProvisionSingle: (payload: Record<string, unknown>) => Promise<void>;
  onProvisionBulk: (count: number) => Promise<void>;
  isBusy: boolean;
  totalDevices: number;
}

export function ProvisionModal({
  isOpen,
  onClose,
  onProvisionSingle,
  onProvisionBulk,
  isBusy,
  totalDevices,
}: ProvisionModalProps) {
  const [tab, setTab] = useState<"SINGLE" | "BULK">("SINGLE");
  const [deviceName, setDeviceName] = useState(HARDWARE_CATALOG[0].deviceName);
  const [proxyCountryCode, setProxyCountryCode] = useState("US");
  const [proxyProtocol, setProxyProtocol] = useState("4G_LTE_MOBILE");
  const [customProxyIp, setCustomProxyIp] = useState("");
  const [gmailAddress, setGmailAddress] = useState("");
  const [fbName, setFbName] = useState("");
  const [ytChannelName, setYtChannelName] = useState("");
  const [ytHandle, setYtHandle] = useState("");
  const [bulkCount, setBulkCount] = useState(300);

  if (!isOpen) return null;

  const autoFillSamplePersona = () => {
    const num = Math.floor(Math.random() * 899) + 100;
    setGmailAddress(`alex.mercer.cloud${num}@gmail.com`);
    setFbName(`Alex Mercer`);
    setYtChannelName(`Mercer Cloud Tech ${num}`);
    setYtHandle(`@mercercloudtech${num}`);
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onProvisionSingle({
      deviceName,
      proxyCountryCode,
      proxyProtocol,
      proxyIp: customProxyIp.trim() || undefined,
      gmailAddress: gmailAddress.trim() || undefined,
      fbName: fbName.trim() || undefined,
      ytChannelName: ytChannelName.trim() || undefined,
      ytHandle: ytHandle.trim() || undefined,
    });
    onClose();
  };

  const handleBulkSubmit = async () => {
    await onProvisionBulk(bulkCount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl bg-[#11161F] border border-[#242E42] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#171E2B] border-b border-[#242E42] flex items-center justify-between">
          <div>
            <h2 className="text-base font-display font-bold text-[#F0F6FC] flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#3DDC84]" />
              <span>Provision Cloud ARM64 Android Nodes</span>
            </h2>
            <p className="text-xs text-[#8B949E] mt-0.5">
              Current Fleet Size: {totalDevices.toLocaleString()} Distinct
              Mobiles • 100% Dedicated Proxies
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#090C10] text-[#8B949E] hover:text-[#F0F6FC] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 p-2 bg-[#090C10] border-b border-[#242E42] gap-2">
          <button
            type="button"
            onClick={() => setTab("SINGLE")}
            className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition ${
              tab === "SINGLE"
                ? "bg-[#3DDC84] text-[#090C10]"
                : "bg-[#171E2B] text-[#8B949E] hover:text-[#F0F6FC]"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Custom Single Phone Node</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("BULK")}
            className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition ${
              tab === "BULK"
                ? "bg-[#00E5FF] text-[#090C10]"
                : "bg-[#171E2B] text-[#8B949E] hover:text-[#F0F6FC]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bulk Fleet Generator (+100 to +500)</span>
          </button>
        </div>

        {tab === "SINGLE" ? (
          <form onSubmit={handleSingleSubmit} className="p-5 space-y-4">
            {/* Hardware Model Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-[#8B949E] mb-1">
                  ANDROID HARDWARE MODEL
                </label>
                <select
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full bg-[#090C10] border border-[#242E42] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#3DDC84]"
                >
                  {HARDWARE_CATALOG.map((hw) => (
                    <option key={hw.deviceName} value={hw.deviceName}>
                      {hw.deviceName} ({hw.socChipset})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8B949E] mb-1">
                  DEDICATED PROXY PROTOCOL
                </label>
                <select
                  value={proxyProtocol}
                  onChange={(e) => setProxyProtocol(e.target.value)}
                  className="w-full bg-[#090C10] border border-[#242E42] rounded-lg px-3 py-2 text-xs text-[#00E5FF] font-mono focus:outline-none focus:border-[#00E5FF]"
                >
                  <option value="4G_LTE_MOBILE">4G_LTE_MOBILE (Carrier NAT)</option>
                  <option value="RESIDENTIAL_STICKY">
                    RESIDENTIAL_STICKY (ISP Fibre)
                  </option>
                  <option value="SOCKS5">SOCKS5 (UDP/TCP Tunnel)</option>
                  <option value="HTTP/S">HTTP/S (TLS Connect)</option>
                </select>
              </div>
            </div>

            {/* Proxy Country & Custom Exit IP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-[#8B949E] mb-1">
                  PROXY COUNTRY & CARRIER
                </label>
                <select
                  value={proxyCountryCode}
                  onChange={(e) => setProxyCountryCode(e.target.value)}
                  className="w-full bg-[#090C10] border border-[#242E42] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#00E5FF]"
                >
                  {Array.from(
                    new Map(
                      PROXY_LOCATIONS.map((l) => [l.countryCode, l])
                    ).values()
                  ).map((loc) => (
                    <option key={loc.countryCode} value={loc.countryCode}>
                      {loc.country} ({loc.isp})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8B949E] mb-1">
                  CUSTOM PROXY IP (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={customProxyIp}
                  onChange={(e) => setCustomProxyIp(e.target.value)}
                  placeholder="Auto-assign unique subnet IP"
                  className="w-full bg-[#090C10] border border-[#242E42] rounded-lg px-3 py-2 text-xs font-mono text-[#F0F6FC] placeholder-[#8B949E]"
                />
              </div>
            </div>

            {/* Pre-Injected Accounts (Gmail, FB, YT) */}
            <div className="p-3.5 rounded-xl bg-[#090C10] border border-[#242E42] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#F0F6FC]">
                  Inject Real-Profile Account Credentials (Optional)
                </span>
                <button
                  type="button"
                  onClick={autoFillSamplePersona}
                  className="text-[11px] font-mono text-[#3DDC84] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-Fill Persona</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="flex items-center gap-1 text-[10px] font-mono text-[#8B949E] mb-1">
                    <GmailIcon className="w-3 h-3" />
                    <span>GMAIL ADDRESS</span>
                  </label>
                  <input
                    type="email"
                    value={gmailAddress}
                    onChange={(e) => setGmailAddress(e.target.value)}
                    placeholder="Auto-generate verified Gmail"
                    className="w-full bg-[#11161F] border border-[#242E42] rounded px-2.5 py-1.5 text-xs font-mono text-[#F0F6FC]"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1 text-[10px] font-mono text-[#8B949E] mb-1">
                    <FacebookIcon className="w-3 h-3" />
                    <span>FACEBOOK PROFILE NAME</span>
                  </label>
                  <input
                    type="text"
                    value={fbName}
                    onChange={(e) => setFbName(e.target.value)}
                    placeholder="Auto-generate aged FB profile"
                    className="w-full bg-[#11161F] border border-[#242E42] rounded px-2.5 py-1.5 text-xs text-[#F0F6FC]"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1 text-[10px] font-mono text-[#8B949E] mb-1">
                    <YouTubeIcon className="w-3 h-3" />
                    <span>YOUTUBE CHANNEL NAME</span>
                  </label>
                  <input
                    type="text"
                    value={ytChannelName}
                    onChange={(e) => setYtChannelName(e.target.value)}
                    placeholder="Auto-generate YT channel"
                    className="w-full bg-[#11161F] border border-[#242E42] rounded px-2.5 py-1.5 text-xs text-[#F0F6FC]"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1 text-[10px] font-mono text-[#8B949E] mb-1">
                    <YouTubeIcon className="w-3 h-3" />
                    <span>YOUTUBE @HANDLE</span>
                  </label>
                  <input
                    type="text"
                    value={ytHandle}
                    onChange={(e) => setYtHandle(e.target.value)}
                    placeholder="@auto_creator_handle"
                    className="w-full bg-[#11161F] border border-[#242E42] rounded px-2.5 py-1.5 text-xs font-mono text-[#00E5FF]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#171E2B] text-xs text-[#8B949E] hover:text-[#F0F6FC] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBusy}
                className="px-5 py-2 rounded-lg bg-[#3DDC84] hover:bg-[#3DDC84]/90 text-[#090C10] font-semibold text-xs cursor-pointer"
              >
                {isBusy ? "Provisioning..." : "Boot New Android Node"}
              </button>
            </div>
          </form>
        ) : (
          /* BULK FLEET PROVISIONING TAB */
          <div className="p-5 space-y-4">
            <div className="p-4 rounded-xl bg-[#090C10] border border-[#00E5FF]/40 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#00E5FF]">
                <ShieldCheck className="w-5 h-5" />
                <span>Massive Scale Multi-Proxy Android Fleet Spawner</span>
              </div>
              <p className="text-xs text-[#8B949E] leading-relaxed">
                Instantly provision hundreds of additional distinct Android
                mobile phones into PostgreSQL. Every generated phone receives a{" "}
                <strong className="text-[#F0F6FC]">
                  unique Luhn IMEI, unique Android ID, unique dedicated
                  residential/4G Proxy IP
                </strong>
                , and pre-logged{" "}
                <strong className="text-[#3DDC84]">
                  Gmail, Facebook, and YouTube
                </strong>{" "}
                accounts.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8B949E] mb-2">
                SELECT BATCH SIZE TO ADD TO FLEET:
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[100, 300, 500].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setBulkCount(size)}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition ${
                      bulkCount === size
                        ? "bg-[#00E5FF]/15 border-[#00E5FF] text-[#00E5FF]"
                        : "bg-[#171E2B] border-[#242E42] text-[#8B949E] hover:text-[#F0F6FC]"
                    }`}
                  >
                    <div className="text-lg font-display font-bold">
                      +{size} Phones
                    </div>
                    <div className="text-[10px] font-mono mt-0.5">
                      +{size} Proxies • +{size * 3} Accounts
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#171E2B] text-xs text-[#8B949E] hover:text-[#F0F6FC] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={handleBulkSubmit}
                className="px-5 py-2 rounded-lg bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#090C10] font-semibold text-xs cursor-pointer"
              >
                {isBusy
                  ? "Spawning Fleet..."
                  : `Bulk Provision +${bulkCount} Android Phones`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
