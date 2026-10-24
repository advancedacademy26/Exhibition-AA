"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { ExhibitionZone } from "@/lib/types";
import { X, QrCode, Printer, Sparkles, School } from "lucide-react";

interface PrintableQrCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  zones: ExhibitionZone[];
}

export default function PrintableQrCodesModal({
  isOpen,
  onClose,
  zones,
}: PrintableQrCodesModalProps) {
  const [entryQrDataUrl, setEntryQrDataUrl] = useState("");
  const [zoneQrDataUrls, setZoneQrDataUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    // Generate entry gate QR code
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "https://school-expo.edu";
    QRCode.toDataURL(currentOrigin, { width: 300, margin: 2, color: { dark: "#0f172a", light: "#ffffff" } })
      .then(setEntryQrDataUrl)
      .catch(console.error);

    // Generate QR codes for each zone
    const qrMap: Record<string, string> = {};
    const promises = zones.map(async (zone) => {
      // payload can be scanned by camera: either full url with stamp query or the zone secretCode
      const payload = `${currentOrigin}?stamp=${zone.secretCode}`;
      const url = await QRCode.toDataURL(payload, {
        width: 280,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
      qrMap[zone.id] = url;
    });

    Promise.all(promises).then(() => {
      setZoneQrDataUrls({ ...qrMap });
    });
  }, [isOpen, zones]);

  if (!isOpen) return null;

  const handlePrintPosters = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Printable Exhibition QR Code Posters
              </h3>
              <p className="text-xs text-slate-400">
                Print and display at Entry Gate and each of the 6 exhibition pavilions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPosters}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Posters</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 printable-zone">
          <div className="no-print rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-xs text-indigo-100">
            <strong className="text-white">Quick test:</strong> register a demo visitor, open Stamp Quest, then tap “Simulate QR Scan (Test)” on each of the six Citizen cards. The last stamp unlocks the certificate. To test physical scanning, print these posters or scan a station QR from another screen.
          </div>
          {/* 1. Main Entry Gate Poster */}
          <div className="p-6 rounded-3xl bg-white text-slate-900 border-4 border-indigo-600 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
                <School className="w-3.5 h-3.5" />
                <span>ENTRY GATE CHECKPOINT</span>
              </div>
              <h4 className="text-2xl font-black text-slate-900">
                Advanced Academy Indore • Spectra 2026-27
              </h4>
              <p className="text-xs text-slate-600 max-w-md">
                Please scan this entry QR code to register the student&apos;s name, class (6–12), and section (A–F), then open the student&apos;s Spectra passport.
              </p>
              <div className="text-[11px] font-mono text-indigo-600 font-bold pt-1">
                Step 1: Scan &bull; Step 2: Register &bull; Step 3: Collect 6 Stamps &bull; Step 4: Digital Certificate
              </div>
            </div>

            <div className="flex flex-col items-center flex-shrink-0 bg-slate-50 p-3 rounded-2xl border-2 border-slate-200">
              {entryQrDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={entryQrDataUrl}
                  alt="Entry Gate QR Code"
                  className="w-44 h-44 object-contain rounded-lg"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">
                  Generating QR...
                </div>
              )}
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mt-2">
                Scan with Phone Camera
              </span>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-2">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-1.5 mb-4">
              <Sparkles className="w-4 h-4" />
              The 6 Pavilion QR Code Posters (Hang at each zone)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className="p-5 rounded-2xl bg-white text-slate-900 border-2 border-slate-300 shadow-lg flex items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
                      Station #{zone.zoneNumber} • {zone.category}
                    </span>
                    <h5 className="text-base font-bold text-slate-900 leading-tight">
                      {zone.title}
                    </h5>
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {zone.location}
                    </p>
                    <div className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                      <span>Collect Stamp:</span>
                      <strong className="underline">{zone.badgeTitle}</strong>
                    </div>
                    <div className="text-[9px] font-mono text-slate-400">
                      Code: {zone.secretCode}
                    </div>
                  </div>

                  <div className="flex flex-col items-center flex-shrink-0 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    {zoneQrDataUrls[zone.id] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={zoneQrDataUrls[zone.id]}
                        alt={zone.badgeTitle}
                        className="w-28 h-28 object-contain"
                      />
                    ) : (
                      <div className="w-28 h-28 flex items-center justify-center text-xs text-slate-400">
                        ...
                      </div>
                    )}
                    <span className="text-[9px] font-bold text-indigo-600 mt-1">
                      SCAN FOR STAMP #{zone.zoneNumber}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
