"use client";

import React, { useState } from "react";
import Image from "next/image";
import { QrCode, Sparkles, GraduationCap, School, ArrowRight, ShieldCheck } from "lucide-react";
import { Visitor, AppCustomMediaSettings } from "@/lib/types";

interface EntryRegistrationProps {
  onRegistered: (visitor: Visitor) => void;
  mediaSettings: AppCustomMediaSettings;
}

const classOptions = Array.from({ length: 7 }, (_, index) => `Class ${index + 6}`);
const sectionOptions = ["A", "B", "C", "D", "E", "F"];

export default function EntryRegistration({ onRegistered, mediaSettings }: EntryRegistrationProps) {
  const [name, setName] = useState("");
  const [classGrade, setClassGrade] = useState("Class 6");
  const [section, setSection] = useState("A");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    if (!name.trim()) {
      setErrorMessage("Please enter your name as the visitor.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/visitors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), classGrade, section }),
      });
      const data = await response.json();
      if (!response.ok || !data.visitor) throw new Error(data.error || "Registration failed. Please try again.");
      localStorage.setItem("spectra_passport_code", data.visitor.passportCode);
      onRegistered(data.visitor as Visitor);
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemo = () => {
    setName("Meera Sharma (Parent)");
    setClassGrade("Class 6");
    setSection("A");
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center max-w-xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
          <QrCode className="w-4 h-4 text-amber-400" />
          <span>Advanced Academy Indore • Spectra 2026-27</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400">Spectra Annual Exhibition</span>
        </h1>
        <p className="mt-2 text-sm text-slate-300">{mediaSettings.schoolName}</p>
        <p className="text-xs text-slate-400 mt-1">Theme: Future India 2047 • Register as a visitor to create your personalized passport and Citizen stamp quest.</p>
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl mb-6 bg-[#f7f1e3] p-3 sm:p-5">
        <div className="relative mx-auto w-full max-w-[330px] aspect-[0.74/1] shadow-xl">
          {mediaSettings.welcomeImage && <Image src={mediaSettings.welcomeImage} alt="Spectra portrait welcome poster background" fill unoptimized sizes="330px" className="object-fill" priority />}
          <div className="absolute inset-0 flex flex-col items-center text-center text-[#0b2b50] px-[10%] pt-[7%] pb-[8%]">
            <p className="text-[clamp(9px,2.8vw,13px)] font-black tracking-[0.13em]">{mediaSettings.schoolName}</p>
            <p className="mt-[7%] text-[clamp(23px,7vw,35px)] leading-none font-serif italic font-semibold">Welcome</p>
            <p className="mt-[1%] text-[clamp(8px,2vw,11px)] font-bold tracking-[0.25em]">TO THE</p>
            <p className="mt-[1%] text-[clamp(27px,8vw,42px)] leading-none font-black tracking-[0.03em] bg-gradient-to-r from-orange-600 via-indigo-800 to-emerald-700 text-transparent bg-clip-text">SPECTRA</p>
            <p className="mt-[3%] text-[clamp(8px,2vw,11px)] font-extrabold tracking-[0.08em]">ANNUAL EXHIBITION 2026-27</p>
            <p className="mt-[1%] text-[clamp(7px,1.7vw,9px)] font-bold tracking-[0.1em]">THEME: FUTURE INDIA 2047</p>
            <div className="mt-[10%] border-t border-[#173c70]/35 pt-[7%] w-full">
              <p className="text-[clamp(10px,2.5vw,13px)] font-serif italic">Dear Parents &amp; Visitors,</p>
              <p className="mt-[4%] text-[clamp(8px,2vw,10px)] leading-relaxed">We are delighted to welcome you to Spectra. Explore, engage and be inspired by our students.</p>
              <p className="mt-[6%] text-[clamp(9px,2.2vw,12px)] font-serif italic font-semibold">Together, let us build a stronger tomorrow.</p>
            </div>
            <p className="mt-auto text-[clamp(8px,1.8vw,10px)] font-bold tracking-[0.1em]">ADVANCED ACADEMY INDORE</p>
          </div>
        </div>
        <div className="mt-3 px-3 py-2.5 bg-slate-900 rounded-xl flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-amber-200">Spectra • Six Citizen Missions</span>
          <span className="text-emerald-300 font-semibold">Entry Open</span>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><School className="w-5 h-5 text-indigo-400" />Visitor Entry Registration</h2>
            <p className="text-xs text-slate-400">Enter your name, the student&apos;s class and section to receive your passport.</p>
          </div>
          <button type="button" onClick={fillDemo} className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">Auto-fill test</button>
        </div>

        {errorMessage && <div role="alert" className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">{errorMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-xs font-semibold text-slate-300">
            Your full name (visitor / parent) <span className="text-rose-400">*</span>
            <input type="text" required maxLength={120} autoComplete="name" placeholder="e.g. Meera Sharma" value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 mb-1.5"><GraduationCap className="w-3.5 h-3.5 text-indigo-400" />Class</span>
              <select value={classGrade} onChange={(event) => setClassGrade(event.target.value)} className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {classOptions.map((className) => <option key={className} value={className}>{className}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 mb-1.5"><Sparkles className="w-3.5 h-3.5 text-amber-400" />Section</span>
              <select value={section} onChange={(event) => setSection(event.target.value)} className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {sectionOptions.map((sectionName) => <option key={sectionName} value={sectionName}>{sectionName}</option>)}
              </select>
            </label>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:via-rose-400 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 active:scale-[0.99] transition disabled:opacity-60">
            {isSubmitting ? <span>Creating visitor passport…</span> : <><span>Register and show dashboard</span><ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-400"><ShieldCheck className="w-4 h-4 text-emerald-400" /><span>Advanced Academy Indore • Spectra Entry Checkpoint</span></div>
      </div>
    </div>
  );
}
