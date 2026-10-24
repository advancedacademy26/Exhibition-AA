"use client";

import React from "react";
import Image from "next/image";
import { ExhibitionZone, AppCustomMediaSettings } from "@/lib/types";
import {
  CheckCircle2,
  Lock,
  QrCode,
  Trophy,
  Award,
  HeartPulse,
  Laptop,
  Recycle,
  Lightbulb,
  BriefcaseBusiness,
  Leaf,
  Check,
  Zap,
} from "lucide-react";

interface StampCollectionProps {
  zones: ExhibitionZone[];
  collectedZoneIds: string[];
  mediaSettings: AppCustomMediaSettings;
  onOpenScanner: () => void;
  onViewCertificate: () => void;
  onSimulateStamp: (zoneCode: string) => void;
}

export default function StampCollection({
  zones,
  collectedZoneIds,
  mediaSettings,
  onOpenScanner,
  onViewCertificate,
  onSimulateStamp,
}: StampCollectionProps) {
  const totalCount = zones.length;
  const collectedCount = collectedZoneIds.length;
  const isAllCollected = collectedCount >= totalCount;
  const progressPercent = Math.round((collectedCount / totalCount) * 100);

  const getStampIcon = (iconName: string) => {
    switch (iconName) {
      case "HeartPulse":
        return <HeartPulse className="w-7 h-7" />;
      case "Laptop":
        return <Laptop className="w-7 h-7" />;
      case "Recycle":
        return <Recycle className="w-7 h-7" />;
      case "Lightbulb":
        return <Lightbulb className="w-7 h-7" />;
      case "BriefcaseBusiness":
        return <BriefcaseBusiness className="w-7 h-7" />;
      case "Leaf":
      default:
        return <Leaf className="w-7 h-7" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Portrait Spectra stamp sheet; Citizen labels and live scan marks are typeset in the app. */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        {mediaSettings.stampImage ? (
          <div className="p-3 sm:p-5 bg-[#f5eedb]">
            <div className="relative mx-auto w-full max-w-[560px] aspect-[0.82/1] overflow-hidden rounded-xl">
              <Image src={mediaSettings.stampImage} alt="Spectra Citizen stamp collection sheet" fill unoptimized sizes="(max-width: 768px) 100vw, 560px" className="object-fill" />
              <div className="absolute top-[3%] inset-x-[9%] text-center text-[#0b3158]">
                <p className="text-[clamp(11px,2.8vw,22px)] font-black tracking-[0.18em]">STAMP COLLECTION</p>
                <p className="mt-0.5 text-[clamp(6px,1.35vw,11px)] font-bold tracking-[0.16em]">SPECTRA • COLLECT YOUR CITIZEN STAMPS</p>
              </div>
              {zones.map((zone) => {
                const isStamped = collectedZoneIds.includes(zone.id);
                const column = zone.zoneNumber % 2 === 1 ? 0 : 1;
                const row = Math.floor((zone.zoneNumber - 1) / 2);
                const left = column === 0 ? "27%" : "73%";
                const top = ["25%", "50%", "75%"][row];
                const labelTop = ["35%", "60%", "85%"][row];
                return (
                  <React.Fragment key={zone.id}>
                    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left, top }} aria-hidden="true">
                      {isStamped && <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-600 text-white border-2 border-white shadow-lg flex items-center justify-center"><Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[4]" /></span>}
                    </div>
                    <div className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left, top: labelTop }}>
                      <span className="whitespace-nowrap text-[clamp(6px,1.35vw,11px)] font-black text-[#102e4f] bg-[#fff8e7]/95 px-1.5 py-0.5 rounded-full shadow-sm">{zone.category}</span>
                      {isStamped && <span className="mt-0.5 whitespace-nowrap text-[clamp(5px,1vw,8px)] font-black text-white bg-emerald-700 px-1.5 py-0.5 rounded-full shadow">✓ MISSION COMPLETED</span>}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="min-h-40 bg-gradient-to-br from-[#f8f1df] to-[#fffdf4] p-6 text-center text-slate-900 flex flex-col items-center justify-center">
            <Award className="w-8 h-8 text-amber-700 mb-2" />
            <p className="text-sm font-black tracking-widest">SPECTRA • COLLECT YOUR STAMPS</p>
            <p className="text-xs text-slate-600 mt-1">Upload a stamp-sheet design in Custom Pictures &amp; Branding.</p>
          </div>
        )}
        <div className="p-5 sm:p-6 bg-slate-900/95 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold mb-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Spectra • Citizen Mission Quest</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">Stamp Collection</h2>
            <p className="text-xs text-slate-300 mt-0.5">Scan a different QR code at each of the six Citizen stations to complete your passport and unlock your certificate.</p>
          </div>
          <button onClick={onOpenScanner} className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 flex-shrink-0">
            <QrCode className="w-4 h-4" />
            <span>Scan Station QR Code</span>
          </button>
        </div>

        {/* Progress Bar & Counter Banner */}
        <div className="p-4 sm:p-5 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-white">
                  {collectedCount} of {totalCount} Stamps Collected
                </span>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                  {progressPercent}% Complete
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAllCollected
                  ? "Congratulations! You have completed the entire exhibition quest."
                  : `${totalCount - collectedCount} more stamp${totalCount - collectedCount > 1 ? "s" : ""} needed to unlock National Digital Certificate`}
              </p>
            </div>
          </div>

          {/* Quick Certificate CTA if complete */}
          {isAllCollected ? (
            <button
              onClick={onViewCertificate}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 animate-pulse transition cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-200" />
              <span>View &amp; Download National Certificate</span>
            </button>
          ) : (
            <div className="w-full sm:w-64 bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700/80">
              <div
                className="bg-gradient-to-r from-amber-400 via-rose-500 to-emerald-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 6 Stamps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {zones.map((zone) => {
          const isStamped = collectedZoneIds.includes(zone.id);

          return (
            <div
              key={zone.id}
              className={`relative rounded-3xl p-6 transition-all duration-300 border-2 flex flex-col justify-between overflow-hidden shadow-xl ${
                isStamped
                  ? "bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-500/60 shadow-emerald-950/20"
                  : "bg-slate-900/80 border-slate-800 border-dashed hover:border-slate-700"
              }`}
            >
              {/* Postal Stamp Scallop Design Accents */}
              <div className="absolute top-0 inset-x-8 h-2 flex justify-between pointer-events-none opacity-40">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full bg-slate-950 -translate-y-1.5" />
                ))}
              </div>
              <div className="absolute bottom-0 inset-x-8 h-2 flex justify-between pointer-events-none opacity-40">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full bg-slate-950 translate-y-1.5" />
                ))}
              </div>

              {/* Stamp Content Top */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                        isStamped
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      ZONE {zone.zoneNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {zone.category}
                    </span>
                  </div>

                  {/* Green Tick or Mission Completed Badge */}
                  {isStamped ? (
                    <div className="flex items-center gap-1.5 bg-emerald-500 text-slate-950 font-black text-[11px] px-2.5 py-1 rounded-full shadow-md shadow-emerald-500/20">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>MISSION COMPLETED</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </div>
                  )}
                </div>

                {/* Stamp Artwork Center */}
                <div className="my-3 flex flex-col items-center text-center">
                  <div
                    className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-transform duration-300 ${
                      isStamped
                        ? "bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-300 text-slate-950 shadow-xl shadow-emerald-500/30 ring-4 ring-emerald-400/30 scale-105"
                        : "bg-slate-800/80 text-slate-600 border border-slate-700"
                    }`}
                  >
                    {getStampIcon(zone.badgeIcon)}

                    {isStamped && (
                      <div className="absolute -bottom-2 bg-emerald-600 text-white p-1 rounded-full ring-2 ring-slate-900 shadow-md">
                        <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-white" />
                      </div>
                    )}
                  </div>

                  <h3 className="mt-4 text-base font-bold text-white tracking-tight">
                    {zone.badgeTitle}
                  </h3>
                  <p className="text-xs font-medium text-amber-400/90 mt-0.5">
                    {zone.title}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 px-2">
                    {zone.location}
                  </p>
                </div>
              </div>

              {/* Stamp Footer Action */}
              <div className="pt-4 mt-3 border-t border-slate-800/80">
                {isStamped ? (
                  <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                    <span className="font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Official Seal Verified
                    </span>
                    <span className="text-[10px] text-slate-400">Spectra 2026-27</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={onOpenScanner}
                      className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-indigo-600/20"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scan to Collect Stamp</span>
                    </button>
                    {/* Quick simulator helper */}
                    <button
                      onClick={() => onSimulateStamp(zone.secretCode)}
                      className="w-full py-1.5 text-[11px] text-slate-400 hover:text-amber-300 font-medium flex items-center justify-center gap-1 cursor-pointer transition hover:bg-slate-800/60 rounded-lg"
                    >
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>Simulate QR Scan (Test)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
