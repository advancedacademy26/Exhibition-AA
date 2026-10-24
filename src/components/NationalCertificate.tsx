"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Visitor, AppCustomMediaSettings } from "@/lib/types";
import { Download, Printer, Share2, Award, CheckCircle2, Calendar } from "lucide-react";
import html2canvas from "html2canvas";

interface NationalCertificateProps {
  visitor: Visitor;
  mediaSettings: AppCustomMediaSettings;
}

export default function NationalCertificate({ visitor, mediaSettings }: NationalCertificateProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyNotification, setCopyNotification] = useState("");
  const certificateId = visitor.certificateId || `SPECTRA-2026-${visitor.passportCode.replace(/[^a-z0-9]/gi, "")}`;
  const completionDate = visitor.completedAt ? new Date(visitor.completedAt) : new Date();
  const displayDate = Number.isNaN(completionDate.getTime())
    ? "Spectra Annual Exhibition 2026-27"
    : completionDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const handleDownload = async () => {
    const certificate = document.getElementById("national-digital-certificate");
    if (!certificate) return;
    try {
      setIsGenerating(true);
      const canvas = await html2canvas(certificate, { scale: 2.5, useCORS: true, backgroundColor: "#fffaf0", logging: false });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `Spectra_Certificate_${visitor.name.replace(/[^a-z0-9]+/gi, "_")}.png`;
      link.click();
    } catch (error) {
      console.error("Certificate download failed", error);
      window.alert("Could not export the image. Please use Print / PDF instead.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "Spectra National Digital Certificate",
      text: `${visitor.name} completed all six Spectra Citizen missions at Advanced Academy Indore. Certificate ID: ${certificateId}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* The share sheet was closed. */ }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      setCopyNotification("Certificate details copied to clipboard.");
      setTimeout(() => setCopyNotification(""), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-emerald-500/15 border border-amber-400/40 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl"><Award className="w-8 h-8" /></div>
          <div>
            <div className="flex items-center gap-2"><span className="text-xs uppercase tracking-wider font-extrabold text-amber-300">Route complete • 6/6 stamps</span><span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Verified</span></div>
            <h2 className="text-xl sm:text-2xl font-black text-white">National Digital Certificate</h2>
            <p className="text-xs text-slate-300">Spectra Certificate of Participation • awarded to {visitor.name}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button onClick={() => void handleDownload()} disabled={isGenerating} className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 disabled:opacity-50"><Download className="w-4 h-4" /><span>{isGenerating ? "Creating PNG…" : "Download certificate (PNG)"}</span></button>
          <button onClick={() => window.print()} className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5"><Printer className="w-4 h-4" /><span>Print / PDF</span></button>
          <button onClick={() => void handleShare()} className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5"><Share2 className="w-4 h-4 text-indigo-400" /><span>Share</span></button>
        </div>
      </div>

      {copyNotification && <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center rounded-xl">{copyNotification}</div>}

      {mediaSettings.completionImage && (
        <div className="rounded-2xl overflow-hidden bg-[#f7f1e3] border border-amber-300/30">
          <div className="relative mx-auto w-full max-w-[900px] aspect-[2/1]">
            <Image src={mediaSettings.completionImage} alt="Spectra route complete celebration artwork" fill unoptimized sizes="(max-width: 900px) 100vw, 900px" className="object-fill" />
            <div className="absolute left-[31%] right-[5%] top-[8%] bottom-[7%] flex flex-col items-center justify-center text-center text-[#102d50] px-[3%]">
              <p className="text-[clamp(6px,1vw,9px)] font-bold tracking-[0.12em] uppercase">{mediaSettings.schoolName}</p>
              <p className="mt-[1%] text-[clamp(7px,1.2vw,11px)] font-black tracking-[0.1em] uppercase">SPECTRA • ANNUAL EXHIBITION 2026-27</p>
              <p className="text-[clamp(6px,1vw,9px)] font-extrabold tracking-[0.11em] uppercase">THEME: FUTURE INDIA 2047</p>
              <div className="mt-[3%] text-[clamp(9px,1.8vw,16px)] font-black tracking-[0.14em]">ROUTE COMPLETED!</div>
              <p className="mt-[2%] text-[clamp(7px,1.2vw,11px)] font-semibold">You have completed all six Spectra Citizen missions</p>
              <div className="mt-[3%] rounded-full bg-[#123b68] text-white px-[5%] py-[1.5%] text-[clamp(7px,1.2vw,11px)] font-bold shadow">NATIONAL DIGITAL CERTIFICATE UNLOCKED</div>
              <p className="mt-[3%] text-[clamp(7px,1.2vw,11px)] font-serif italic font-bold">Congratulations, {visitor.name}!</p>
              <p className="mt-[1%] text-[clamp(6px,0.9vw,9px)]">Explore • Engage • Be Inspired</p>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto pb-4">
        <div id="national-digital-certificate" className="relative mx-auto w-full max-w-[1000px] bg-[#fffaf0] border-[6px] sm:border-[10px] border-[#c49a43] p-2 sm:p-3 shadow-2xl">
          <div className="relative w-full aspect-[2/1] bg-[#f7f1e3] overflow-hidden">
            {mediaSettings.certificateImage ? (
              <Image src={mediaSettings.certificateImage} alt="Spectra certificate paper artwork" fill unoptimized sizes="(max-width: 1000px) 100vw, 1000px" className="object-fill" priority />
            ) : (
              <div className="absolute inset-0 border border-[#c49a43] bg-[#fffaf0]" />
            )}

            <div className="absolute left-[8%] right-[8%] top-[4%] text-center text-[#12345a]">
              <p className="text-[clamp(7px,1.3vw,13px)] font-black tracking-[0.13em] uppercase">{mediaSettings.schoolName}</p>
              <p className="mt-[0.5%] text-[clamp(6px,1vw,10px)] font-extrabold tracking-[0.16em] uppercase">SPECTRA • ANNUAL EXHIBITION 2026-27</p>
              <p className="text-[clamp(5px,0.8vw,8px)] font-bold tracking-[0.14em] uppercase">Theme: Future India 2047</p>
            </div>

            <div className="absolute left-[9%] right-[23%] top-[24%] text-center text-[#12345a]">
              <h1 className="font-serif font-semibold italic text-[clamp(13px,3vw,32px)] leading-tight">Certificate of Participation</h1>
              <p className="mt-[1%] text-[clamp(6px,1vw,11px)] font-medium">This is proudly presented to</p>
            </div>

            <div className="absolute left-[11%] right-[25%] top-[44%] h-[10%] flex items-end justify-center border-b border-[#12345a]/70 px-2 text-center text-[#12345a]">
              <span className="max-w-full truncate pb-[0.5%] font-serif font-bold text-[clamp(11px,2.6vw,25px)]">{visitor.name}</span>
            </div>

            <div className="absolute left-[12%] right-[25%] top-[56%] text-center text-[#173556]">
              <p className="text-[clamp(6px,1.1vw,12px)] leading-[1.45]">
                has successfully completed the Spectra exhibition route and collected all six Citizen stamps at Advanced Academy Indore.
              </p>
              <p className="mt-[2%] text-[clamp(6px,1vw,11px)] leading-[1.4]">Your presence, curiosity and support made this event special.</p>
            </div>

            <div className="absolute left-[10%] right-[24%] top-[77%] text-center text-[#12345a]">
              <p className="font-serif italic font-semibold text-[clamp(9px,1.8vw,18px)]">Congratulations!</p>
              <p className="mt-[0.5%] text-[clamp(5px,0.8vw,8px)] font-bold tracking-[0.12em]">EXPLORE • ENGAGE • BE INSPIRED</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 px-2 sm:px-4 py-2 text-[9px] sm:text-[11px] font-medium text-slate-600">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#8b6508]" />Completed {displayDate}</span>
            <span className="font-mono font-bold text-[#12345a]">Verification ID: {certificateId}</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" />6/6 Citizen missions</span>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400">{mediaSettings.schoolName} • {mediaSettings.eventName}</div>
    </div>
  );
}
