"use client";

import React from "react";
import Image from "next/image";
import { Visitor, AppCustomMediaSettings } from "@/lib/types";
import { Sparkles, Heart, Compass, MapPin } from "lucide-react";

interface WelcomeBannerProps {
  visitor: Visitor;
  mediaSettings: AppCustomMediaSettings;
  onExploreRoute: () => void;
  onOpenScanner: () => void;
}

const spectraColors = ["#e05c42", "#d99c2b", "#158a77", "#326ba3", "#7653a3", "#d65368", "#208877"];

export default function WelcomeBanner({ visitor, mediaSettings, onExploreRoute, onOpenScanner }: WelcomeBannerProps) {
  return (
    <div className="overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_0.82fr]">
        <div className="relative min-h-[310px] sm:min-h-[360px] flex flex-col justify-center p-6 sm:p-9 text-white bg-gradient-to-br from-[#071d36] via-[#12345a] to-[#101a36]">
          <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full border border-amber-300/15" />
          <div className="absolute -right-4 -top-4 w-40 h-40 rounded-full border border-amber-300/10" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-amber-300/30 text-amber-200 text-xs font-bold mb-5">
              <Sparkles className="w-4 h-4" /> SPECTRA • ANNUAL EXHIBITION 2026-27
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{mediaSettings.schoolName}</p>
            <p className="mt-1 text-xs text-amber-200">Theme: Future India 2047</p>
            <div className="mt-6 flex items-center gap-2 text-rose-200 text-xs font-semibold">
              <Heart className="w-4 h-4 fill-rose-300 text-rose-300" /> A warm welcome to our special visitor
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Welcome, <span className="text-amber-300">{visitor.name}</span>!
            </h2>
            <p className="mt-3 max-w-lg text-sm text-slate-200 leading-relaxed">
              We are delighted to welcome you to Spectra. Celebrating your ward{visitor.studentName ? `, ${visitor.studentName},` : ""} from <strong className="text-amber-200">{visitor.classGrade} • Section {visitor.section}</strong>. Explore the six Citizen missions and collect every stamp.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-amber-300" /> Six missions • One exhibition route • One certificate
            </div>
          </div>
        </div>

        <div className="bg-[#f7f1e3] flex items-center justify-center p-4 sm:p-6">
          <div className="relative w-full max-w-[380px] aspect-[0.74/1] shadow-xl">
            {mediaSettings.welcomeImage && (
              <Image src={mediaSettings.welcomeImage} alt="Spectra portrait welcome poster background" fill unoptimized sizes="(max-width: 768px) 90vw, 380px" className="object-fill" priority />
            )}
            <div className="absolute inset-0 flex flex-col items-center text-center text-[#0b2b50] px-[10%] pt-[6%] pb-[8%]">
              <p className="text-[clamp(9px,1.5vw,13px)] font-black tracking-[0.13em] leading-tight uppercase">{mediaSettings.schoolName}</p>
              <div className="mt-[4%] text-[clamp(24px,6vw,38px)] leading-none font-serif italic font-semibold text-[#173c70]">Welcome</div>
              <div className="mt-[1%] text-[clamp(8px,1.2vw,11px)] font-bold tracking-[0.25em]">TO THE</div>
              <div className="mt-[1%] flex items-center justify-center font-black leading-none tracking-[0.03em] text-[clamp(25px,6vw,40px)]" aria-label="Spectra">
                {"SPECTRA".split("").map((letter, index) => <span key={index} style={{ color: spectraColors[index] }}>{letter}</span>)}
              </div>
              <div className="mt-[2%] text-[clamp(8px,1.35vw,12px)] font-extrabold tracking-[0.08em] uppercase">Annual Exhibition 2026-27</div>
              <div className="mt-[1%] text-[clamp(7px,1.15vw,10px)] font-bold tracking-[0.12em] uppercase">Theme: Future India 2047</div>
              <div className="mt-[7%] w-full border-t border-[#173c70]/35 pt-[5%]">
                <p className="text-[clamp(9px,1.4vw,12px)] font-serif italic">Dear {visitor.name},</p>
                <p className="mt-[3%] text-[clamp(8px,1.2vw,11px)] leading-[1.45]">
                  It is our pleasure to welcome you to Spectra. Your presence, curiosity and support inspire our students to imagine a brighter, innovative and sustainable future.
                </p>
                <p className="mt-[5%] text-[clamp(9px,1.4vw,12px)] font-serif italic font-semibold">Together, let us build a stronger tomorrow.</p>
              </div>
              <div className="mt-auto pt-[5%] text-[clamp(8px,1.15vw,10px)] font-bold tracking-[0.1em] uppercase">Advanced Academy Indore</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 bg-slate-900 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
        <div className="flex items-center gap-2 text-xs text-slate-400"><MapPin className="w-4 h-4 text-indigo-400" /><span>Follow the exhibition route, scan all six stations and unlock your participation certificate.</span></div>
        <div className="flex items-center gap-2">
          <button onClick={onExploreRoute} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"><Compass className="w-3.5 h-3.5 text-indigo-400" /><span>View Route Guide</span></button>
          <button onClick={onOpenScanner} className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 transition"><Sparkles className="w-3.5 h-3.5 text-amber-300" /><span>Scan Zone QR</span></button>
        </div>
      </div>
    </div>
  );
}
