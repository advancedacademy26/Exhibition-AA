"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Visitor, AppCustomMediaSettings } from "@/lib/types";
import { Award, Shield, CheckCircle2, Star, Calendar, Download } from "lucide-react";
import html2canvas from "html2canvas";

interface VisitorPassportProps {
  visitor: Visitor;
  mediaSettings: AppCustomMediaSettings;
  totalZonesCount?: number;
}

export default function VisitorPassport({ visitor, mediaSettings, totalZonesCount = 6 }: VisitorPassportProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const stampsCount = visitor.stampsCollected?.length ?? 0;
  const isCompleted = stampsCount >= totalZonesCount;

  const handleDownloadPassport = async () => {
    const element = document.getElementById("visitor-passport-card");
    if (!element) return;
    try {
      setIsDownloading(true);
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#071d36" });
      const anchor = document.createElement("a");
      anchor.href = canvas.toDataURL("image/png");
      anchor.download = `Spectra_Visitor_Passport_${visitor.name.replace(/[^a-z0-9]+/gi, "_")}.png`;
      anchor.click();
    } catch (error) {
      console.error("Passport download error", error);
      window.alert("Could not export the passport image. Please try again or take a screenshot.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div id="visitor-passport-card" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071d36] via-[#102b4d] to-[#08172e] border-2 border-amber-500/40 shadow-2xl p-5 sm:p-8 text-white">
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-400/60 rounded-tl-xl pointer-events-none" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-400/60 rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-400/60 rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-400/60 rounded-br-xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/30 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400/10 border border-amber-300/30 text-amber-300 rounded-xl"><Award className="w-6 h-6" /></div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-amber-300">{mediaSettings.eventName}</div>
              <h3 className="text-xl font-extrabold tracking-wide text-white">Official Visitor Passport</h3>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-amber-500/15 border border-amber-400/40 rounded-full flex items-center gap-1.5 text-xs text-amber-200 font-semibold self-start sm:self-auto">
            <Shield className="w-3.5 h-3.5" /><span>Pass ID: {visitor.passportCode}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 flex flex-col items-center text-center">
            <div className="relative w-full max-w-[190px] aspect-[0.67/1] rounded-xl overflow-hidden shadow-xl bg-[#071d36] border border-amber-300/30">
              {mediaSettings.passportImage && <Image src={mediaSettings.passportImage} alt="Spectra visitor passport cover artwork" fill unoptimized sizes="190px" className="object-fill" />}
              <div className="absolute inset-0 flex flex-col items-center text-center text-[#f3d77f] px-[9%] pt-[12%] pb-[8%] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                <p className="text-[clamp(7px,1vw,9px)] leading-tight font-bold tracking-[0.12em] uppercase">{mediaSettings.schoolName}</p>
                <div className="mt-[13%] text-[clamp(15px,2.6vw,21px)] leading-none font-serif font-bold tracking-[0.1em]">SPECTRA</div>
                <p className="mt-[3%] text-[clamp(6px,0.9vw,8px)] font-semibold tracking-[0.08em] uppercase">Annual Exhibition 2026-27</p>
                <p className="mt-[2%] text-[clamp(6px,0.85vw,7px)] font-semibold tracking-[0.07em] uppercase">Future India 2047</p>
                <div className="mt-auto mb-[13%]">
                  <div className="text-[clamp(14px,2.5vw,19px)] leading-none font-serif font-bold tracking-[0.11em]">VISITOR</div>
                  <div className="mt-1 text-[clamp(14px,2.5vw,19px)] leading-none font-serif font-bold tracking-[0.11em]">PASSPORT</div>
                </div>
                <p className="text-[clamp(5px,0.8vw,7px)] font-bold tracking-[0.12em] uppercase">Explore • Engage • Be Inspired</p>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3 text-amber-400" /><span>Spectra Annual Exhibition 2026-27</span></div>
          </div>

          <div className="md:col-span-8 space-y-4">
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/80">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Visitor / Parent Name</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wide mt-0.5 break-words">{visitor.name}</div>
              <div className="text-xs text-slate-300 mt-1">{visitor.relation || "Parent / Visitor"} • {mediaSettings.schoolName}{visitor.studentName ? ` • Student: ${visitor.studentName}` : ""}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/80"><div className="text-[11px] uppercase tracking-wider text-slate-400">Class</div><div className="text-lg font-bold text-white mt-0.5">{visitor.classGrade}</div></div>
              <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/80"><div className="text-[11px] uppercase tracking-wider text-slate-400">Section</div><div className="text-lg font-bold text-white mt-0.5">Section {visitor.section}</div></div>
            </div>

            <div className="bg-indigo-950/40 rounded-2xl p-3.5 border border-indigo-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl"><Award className="w-4 h-4" /></div>
                <div><div className="text-xs font-bold text-white">Citizen mission stamps: {stampsCount} / {totalZonesCount}</div><div className="text-[11px] text-slate-400">{isCompleted ? "All six complete • certificate unlocked" : `${totalZonesCount - stampsCount} more to unlock your certificate`}</div></div>
              </div>
              {isCompleted ? <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/30"><CheckCircle2 className="w-4 h-4" /><span>Complete</span></div> : <div className="text-xs font-bold text-amber-400">{Math.round((stampsCount / totalZonesCount) * 100)}%</div>}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /><span>Explore • Engage • Be Inspired</span></div>
          <div className="font-mono text-[11px] tracking-wider text-amber-300/80">SPECTRA &lt;{visitor.passportCode}&lt;&lt;{visitor.name.replace(/\s+/g, "<").toUpperCase()}</div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button onClick={handleDownloadPassport} disabled={isDownloading} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition disabled:opacity-50">
          <Download className="w-4 h-4 text-amber-400" /><span>{isDownloading ? "Generating image…" : "Download visitor passport (PNG)"}</span>
        </button>
      </div>
    </div>
  );
}
