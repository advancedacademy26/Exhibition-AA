"use client";

import React, { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Visitor, ExhibitionZone, AppCustomMediaSettings } from "@/lib/types";
import { INITIAL_ZONES, DEFAULT_MEDIA_SETTINGS } from "@/lib/constants";
import EntryRegistration from "@/components/EntryRegistration";
import VisitorPassport from "@/components/VisitorPassport";
import WelcomeBanner from "@/components/WelcomeBanner";
import ExhibitionRoute from "@/components/ExhibitionRoute";
import StampCollection from "@/components/StampCollection";
import NationalCertificate from "@/components/NationalCertificate";
import QrScannerModal from "@/components/QrScannerModal";
import CustomMediaModal from "@/components/CustomMediaModal";
import PrintableQrCodesModal from "@/components/PrintableQrCodesModal";
import {
  playSuccessChime,
  fireStampConfetti,
  fireGrandCertificateConfetti,
} from "@/lib/effects";
import {
  Sparkles,
  QrCode,
  Award,
  Navigation,
  FileBadge,
  Settings,
  Printer,
  User,
  LogOut,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type ActiveTab = "dashboard" | "route" | "stamps" | "certificate";

function MainApp() {
  const searchParams = useSearchParams();
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [zones, setZones] = useState<ExhibitionZone[]>(INITIAL_ZONES);
  const [mediaSettings, setMediaSettings] = useState<AppCustomMediaSettings>(DEFAULT_MEDIA_SETTINGS);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isQrPostersOpen, setIsQrPostersOpen] = useState(false);

  // Toast / Feedback message
  const [stampFeedback, setStampFeedback] = useState<{
    type: "success" | "info" | "error";
    title: string;
    message: string;
  } | null>(null);
  const processedUrlStamp = useRef<string | null>(null);

  // Load Zones & Media Settings
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [zonesRes, settingsRes] = await Promise.all([
          fetch("/api/zones"),
          fetch("/api/settings"),
        ]);
        if (zonesRes.ok) {
          const zData = await zonesRes.json();
          if (zData.zones && zData.zones.length > 0) {
            setZones(zData.zones);
          }
        }
        if (settingsRes.ok) {
          const sData = await settingsRes.json();
          if (sData.settings) {
            setMediaSettings(sData.settings);
          }
        }
      } catch (err) {
        console.warn("Error fetching initial expo data:", err);
      }
    }
    loadInitialData();
  }, []);

  // Restore visitor session from localStorage
  useEffect(() => {
    async function checkSavedVisitor() {
      try {
        const savedCode = localStorage.getItem("spectra_passport_code");
        if (savedCode) {
          const res = await fetch(`/api/visitors/${savedCode}`);
          if (res.ok) {
            const data = await res.json();
            if (data.visitor) {
              setVisitor(data.visitor);
            }
          }
        }
      } catch (e) {
        console.warn("Could not retrieve saved visitor session:", e);
      } finally {
        setIsLoading(false);
      }
    }
    checkSavedVisitor();
  }, []);

  // Handle stamping action
  const handleProcessStamp = useCallback(async (codeToProcess: string) => {
    if (!visitor) {
      setStampFeedback({
        type: "error",
        title: "Registration Required",
        message: "Please register your visitor details at the entry gate first!",
      });
      return;
    }

    try {
      const res = await fetch(`/api/visitors/${visitor.passportCode}/stamp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: codeToProcess }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process stamp");
      }

      // Update visitor state
      const updatedVisitor: Visitor = {
        ...visitor,
        stampsCollected: data.stampsCollected || visitor.stampsCollected,
        certificateId: data.certificateId ?? visitor.certificateId,
        completedAt: data.completedAt ?? visitor.completedAt,
      };
      setVisitor(updatedVisitor);

      // Effects
      playSuccessChime();

      if (data.certificateUnlocked) {
        fireGrandCertificateConfetti();
        setStampFeedback({
          type: "success",
          title: "🏆 QUEST COMPLETED! CERTIFICATE UNLOCKED",
          message: `Incredible! You collected all ${zones.length} exhibition stamps! Your official National Digital Certificate is now ready.`,
        });
        setActiveTab("certificate");
      } else if (data.alreadyStamped) {
        setStampFeedback({
          type: "info",
          title: "Already Collected!",
          message: data.message || "You have already collected this stamp.",
        });
      } else {
        fireStampConfetti();
        setStampFeedback({
          type: "success",
          title: "🎉 Mission Completed!",
          message: `Stamp unlocked for ${data.zone?.badgeTitle || "this station"}! (${updatedVisitor.stampsCollected.length} of ${zones.length} stamps collected)`,
        });
      }
    } catch (err: unknown) {
      setStampFeedback({
        type: "error",
        title: "Scan Error",
        message: err instanceof Error ? err.message : "Invalid QR Code scanned.",
      });
    }
  }, [visitor, zones.length]);

  // A station QR can open this page with ?stamp=...; process that URL once per visitor.
  useEffect(() => {
    const stampParam = searchParams.get("stamp");
    if (!stampParam || !visitor) return;
    const requestKey = `${visitor.passportCode}:${stampParam}`;
    if (processedUrlStamp.current === requestKey) return;
    processedUrlStamp.current = requestKey;
    void handleProcessStamp(stampParam);
  }, [searchParams, visitor, handleProcessStamp]);

  const handleLogout = () => {
    if (confirm("Are you sure you want to exit or register as a new visitor?")) {
      localStorage.removeItem("spectra_passport_code");
      setVisitor(null);
      setActiveTab("dashboard");
    }
  };

  const handleSaveMediaSettings = async (newSettings: AppCustomMediaSettings) => {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSettings),
    });
    const data = await res.json();
    if (res.ok && data.settings) {
      setMediaSettings(data.settings as AppCustomMediaSettings);
    } else {
      throw new Error(data.error || "Failed to save media settings");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 border-4 border-indigo-500 border-t-amber-400 rounded-full animate-spin mb-4" />
        <h3 className="text-xl font-bold text-white">Loading Spectra Annual Exhibition...</h3>
        <p className="text-xs text-slate-400 mt-1">Preparing your digital passport &amp; quest album</p>
      </div>
    );
  }

  // If visitor is not yet registered, show entry gate registration screen
  if (!visitor) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        {/* Simple top header */}
        <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-sm">
              SP
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wide">
                {mediaSettings.schoolName}
              </div>
              <div className="text-[10px] text-amber-400 font-semibold">
                Spectra Annual Exhibition 2026-27 • Future India 2047
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMediaModalOpen(true)}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              title="Custom Pictures"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Custom Pictures</span>
            </button>
            <button
              onClick={() => setIsQrPostersOpen(true)}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              title="Get & print the entry gate and all six station QR codes"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] sm:text-xs">QR Codes</span>
            </button>
          </div>
        </header>

        <main className="flex-1">
          <EntryRegistration
            onRegistered={(newVisitor) => {
              setVisitor(newVisitor);
              setActiveTab("dashboard");
            }}
            mediaSettings={mediaSettings}
          />
        </main>

        <footer className="py-4 border-t border-slate-800/60 text-center text-xs text-slate-500">
          Advanced Academy Indore &bull; Spectra Annual Exhibition 2026-27 &bull; Future India 2047
        </footer>

        {/* Media Customizer Modal */}
        <CustomMediaModal
          isOpen={isMediaModalOpen}
          onClose={() => setIsMediaModalOpen(false)}
          currentSettings={mediaSettings}
          onSave={handleSaveMediaSettings}
        />

        {/* Printable QR Posters Modal */}
        <PrintableQrCodesModal
          isOpen={isQrPostersOpen}
          onClose={() => setIsQrPostersOpen(false)}
          zones={zones}
        />
      </div>
    );
  }

  // Visitor is registered -> Display Full Progressive App with Dashboard, Route, Stamps & Certificate
  const stampsCollected = visitor.stampsCollected || [];
  const stampsCount = stampsCollected.length;
  const isCompleted = stampsCount >= zones.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & School Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              CD
            </div>
            <div>
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <span>{mediaSettings.schoolName}</span>
                <span className="bg-amber-400/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-amber-400/30">
                  Nov 14
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-[210px] sm:max-w-none">
                Student: <strong className="text-amber-300">{visitor.name}</strong> •{" "}
                {visitor.classGrade} - {visitor.section}
              </div>
            </div>
          </div>

          {/* Quick Scanner & Utility Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Scan QR Code</span>
              <span className="sm:hidden">Scan</span>
            </button>

            <button
              onClick={() => setIsMediaModalOpen(true)}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-xl border border-slate-700 transition cursor-pointer"
              title="Custom Pictures"
            >
              <Settings className="w-4 h-4 text-amber-400" />
            </button>

            <button
              onClick={() => setIsQrPostersOpen(true)}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-xl border border-slate-700 transition cursor-pointer"
              title="Printable QR Posters"
            >
              <Printer className="w-4 h-4 text-indigo-400" />
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800/80 rounded-xl border border-slate-700 transition cursor-pointer"
              title="Switch Visitor"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Navigation Bar */}
      <nav className="bg-slate-900 border-b border-slate-800 px-4 py-2 sticky top-[57px] z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-center sm:justify-start gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer flex-shrink-0 ${
              activeTab === "dashboard"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Passport &amp; Welcome</span>
          </button>

          <button
            onClick={() => setActiveTab("route")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer flex-shrink-0 ${
              activeTab === "route"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-indigo-400" />
            <span>Exhibition Route</span>
          </button>

          <button
            onClick={() => setActiveTab("stamps")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer flex-shrink-0 ${
              activeTab === "stamps"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Stamp Quest</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                isCompleted
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-slate-800 text-amber-400"
              }`}
            >
              {stampsCount}/6
            </span>
          </button>

          <button
            onClick={() => setActiveTab("certificate")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer flex-shrink-0 ${
              activeTab === "certificate"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-black"
                : isCompleted
                ? "text-amber-400 bg-amber-500/10 border border-amber-400/30 animate-pulse"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>National Certificate</span>
            {isCompleted && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>
        </div>
      </nav>

      {/* Stamp Feedback Toast Banner */}
      {stampFeedback && (
        <div className="max-w-6xl mx-auto w-full px-4 pt-4">
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-xl animate-in slide-in-from-top-2 duration-300 ${
              stampFeedback.type === "success"
                ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-200"
                : stampFeedback.type === "info"
                ? "bg-indigo-950/80 border-indigo-500/60 text-indigo-200"
                : "bg-rose-950/80 border-rose-500/60 text-rose-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {stampFeedback.type === "success" ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              ) : stampFeedback.type === "info" ? (
                <Sparkles className="w-6 h-6 text-amber-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0" />
              )}
              <div>
                <div className="font-bold text-sm text-white">{stampFeedback.title}</div>
                <div className="text-xs">{stampFeedback.message}</div>
              </div>
            </div>
            <button
              onClick={() => setStampFeedback(null)}
              className="text-xs px-2.5 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-8">
        {/* TAB 1: DASHBOARD (Visitor Passport + Welcome Message Banner) */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Welcome Banner in visitor's name with custom welcome image */}
            <WelcomeBanner
              visitor={visitor}
              mediaSettings={mediaSettings}
              onExploreRoute={() => setActiveTab("route")}
              onOpenScanner={() => setIsScannerOpen(true)}
            />

            {/* Official Visitor's Passport with custom passport image */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileBadge className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-black text-white">
                    Your Personalized Visitor Passport
                  </h2>
                </div>
                <span className="text-xs text-slate-400">
                  Issued under School Authority
                </span>
              </div>
              <VisitorPassport
                visitor={visitor}
                mediaSettings={mediaSettings}
                totalZonesCount={zones.length}
              />
            </div>

            {/* Quick Route Preview Teaser */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-indigo-400" />
                  Ready to explore the 6 Exhibition Pavilions?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visit Green Citizen, Healthy Citizen, Digital Citizen, Sustainable Citizen, Innovation Citizen, and Young Entrepreneur stations to collect every stamp.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("route")}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer flex-shrink-0"
              >
                Open Exhibition Route &rarr;
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: EXHIBITION ROUTE & MAP */}
        {activeTab === "route" && (
          <div className="animate-in fade-in duration-300">
            <ExhibitionRoute
              zones={zones}
              collectedZoneIds={stampsCollected}
              mediaSettings={mediaSettings}
              onScanZone={(_zoneId) => setIsScannerOpen(true)}
            />
          </div>
        )}

        {/* TAB 3: STAMP COLLECTION PAGE */}
        {activeTab === "stamps" && (
          <div className="animate-in fade-in duration-300">
            <StampCollection
              zones={zones}
              collectedZoneIds={stampsCollected}
              mediaSettings={mediaSettings}
              onOpenScanner={() => setIsScannerOpen(true)}
              onViewCertificate={() => setActiveTab("certificate")}
              onSimulateStamp={(code) => handleProcessStamp(code)}
            />
          </div>
        )}

        {/* TAB 4: NATIONAL DIGITAL CERTIFICATE */}
        {activeTab === "certificate" && (
          <div className="animate-in fade-in duration-300">
            {isCompleted ? (
              <NationalCertificate visitor={visitor} mediaSettings={mediaSettings} />
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white">
                  National Digital Certificate Locked
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You have collected{" "}
                  <strong className="text-amber-300 font-bold">
                    {stampsCount} of {zones.length}
                  </strong>{" "}
                  stamps. Visit all six Citizen stations and scan their QR codes to generate the National Digital Certificate for {visitor.name}.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setActiveTab("stamps")}
                    className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    View Stamp Quest Album
                  </button>
                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Scan Next QR Code
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            &copy; 2026 {mediaSettings.schoolName} &bull; Spectra Citizen Mission Passport
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsMediaModalOpen(true)}
              className="hover:text-amber-400 cursor-pointer"
            >
              Custom Pictures &amp; Branding
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setIsQrPostersOpen(true)}
              className="hover:text-indigo-400 cursor-pointer"
            >
              School QR Station
            </button>
          </div>
        </div>
      </footer>

      {/* QR Code Camera Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(scannedText) => {
          setIsScannerOpen(false);
          handleProcessStamp(scannedText);
        }}
        zones={zones}
      />

      {/* Custom Media & Branding Modal */}
      <CustomMediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        currentSettings={mediaSettings}
        onSave={handleSaveMediaSettings}
      />

      {/* Printable Exhibition Posters Modal */}
      <PrintableQrCodesModal
        isOpen={isQrPostersOpen}
        onClose={() => setIsQrPostersOpen(false)}
        zones={zones}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-amber-400 rounded-full animate-spin" />
        </div>
      }
    >
      <MainApp />
    </Suspense>
  );
}
