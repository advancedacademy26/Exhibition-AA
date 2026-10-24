"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ExhibitionZone, AppCustomMediaSettings } from "@/lib/types";
import {
  MapPin,
  CheckCircle2,
  Navigation,
  HeartPulse,
  Laptop,
  Recycle,
  Lightbulb,
  BriefcaseBusiness,
  Leaf,
  Maximize2,
  Minimize2,
  QrCode,
  ArrowRight,
  Circle,
} from "lucide-react";

interface ExhibitionRouteProps {
  zones: ExhibitionZone[];
  collectedZoneIds: string[];
  mediaSettings: AppCustomMediaSettings;
  onScanZone: (zoneId: string) => void;
}

export default function ExhibitionRoute({
  zones,
  collectedZoneIds,
  mediaSettings,
  onScanZone,
}: ExhibitionRouteProps) {
  const [activeTab, setActiveTab] = useState<"route" | "map">("route");
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const getZoneIcon = (iconName: string) => {
    switch (iconName) {
      case "HeartPulse":
        return <HeartPulse className="w-5 h-5 text-rose-400" />;
      case "Laptop":
        return <Laptop className="w-5 h-5 text-sky-400" />;
      case "Recycle":
        return <Recycle className="w-5 h-5 text-violet-400" />;
      case "Lightbulb":
        return <Lightbulb className="w-5 h-5 text-amber-400" />;
      case "BriefcaseBusiness":
        return <BriefcaseBusiness className="w-5 h-5 text-orange-400" />;
      case "Leaf":
      default:
        return <Leaf className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Route Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <Navigation className="w-4 h-4" />
            <span>Exhibition Visitor Guide &amp; Campus Trail</span>
          </div>
          <h2 className="text-2xl font-black text-white">Exhibition Route</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            Follow the 6 sequential exhibition pavilions across the campus. Visit each station, interact with student innovators, and scan the QR code to collect your stamps!
          </p>
        </div>

        {/* Tab switch between Walking Route and Campus Map */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-2xl border border-slate-700 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("route")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "route"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Step-by-Step Route
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "map"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Campus Route Map
          </button>
        </div>
      </div>

      {/* Map View */}
      {(activeTab === "map" || isMapExpanded) && (
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="p-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-white">Spectra Route Map &amp; Citizen Stations</span>
            </div>
            <button
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-lg cursor-pointer"
            >
              {isMapExpanded ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" /> Collapse
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" /> Full View
                </>
              )}
            </button>
          </div>

          {mediaSettings.routeImage ? (
            <div className={`relative w-full ${isMapExpanded ? "h-[500px]" : "h-80 sm:h-96"} overflow-hidden bg-[#f5eedb]`}>
              <Image src={mediaSettings.routeImage} alt="Spectra Exhibition Route Map" fill unoptimized sizes="100vw" className="object-contain" />
            </div>
          ) : (
            <div className={`min-h-80 ${isMapExpanded ? "sm:min-h-[500px]" : "sm:min-h-96"} bg-[#f8f3e7] p-6 sm:p-8 flex flex-col justify-center`}>
              <div className="text-center mb-6">
                <MapPin className="w-8 h-8 text-indigo-700 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-900">Your Spectra campus map can be added here</p>
                <p className="text-xs text-slate-600 mt-1">Until then, follow the numbered station order below.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto w-full">
                {zones.map((zone) => (
                  <div key={zone.id} className="rounded-xl border border-amber-900/15 bg-white/80 p-3 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-indigo-900 text-white text-xs font-black flex items-center justify-center">{zone.zoneNumber}</span>
                    <div className="min-w-0"><p className="text-xs font-bold text-slate-900 truncate">{zone.category}</p><p className="text-[10px] text-slate-600 truncate">{zone.location}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 bg-slate-950/80 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center">
            {zones.map((zone) => {
              const isStamped = collectedZoneIds.includes(zone.id);
              return (
                <div
                  key={zone.id}
                  className={`p-2 rounded-xl text-[11px] font-semibold border ${
                    isStamped
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    {isStamped ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Circle className="w-3 h-3 text-slate-500" />
                    )}
                    <span>Zone {zone.zoneNumber}</span>
                  </div>
                  <div className="truncate text-white font-normal">{zone.category}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step-by-Step Route Cards */}
      {activeTab === "route" && (
        <div className="space-y-4">
          {zones.map((zone, index) => {
            const isStamped = collectedZoneIds.includes(zone.id);

            return (
              <div
                key={zone.id}
                className={`relative overflow-hidden rounded-3xl border transition-all duration-300 p-5 sm:p-6 ${
                  isStamped
                    ? "bg-emerald-950/20 border-emerald-500/40 shadow-emerald-900/10"
                    : "bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-xl"
                }`}
              >
                {/* Connecting Trail Line between cards */}
                {index < zones.length - 1 && (
                  <div className="hidden sm:block absolute left-8 bottom-0 w-0.5 h-6 bg-slate-800 translate-y-full z-10" />
                )}

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                  <div className="flex items-start gap-4">
                    {/* Zone Number Circle */}
                    <div
                      className={`relative w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0 shadow-lg ${
                        isStamped
                          ? "bg-emerald-500 text-white shadow-emerald-500/30 ring-2 ring-emerald-400/50"
                          : "bg-slate-800 border border-slate-700 text-white"
                      }`}
                    >
                      {isStamped ? <CheckCircle2 className="w-6 h-6 text-white" /> : zone.zoneNumber}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
                          {zone.category}
                        </span>
                        {isStamped ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Mission Completed
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-400/90 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                            Stamp Pending
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {getZoneIcon(zone.badgeIcon)}
                        {zone.title}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                        <span>{zone.location}</span>
                      </div>

                      <p className="text-xs text-slate-300 pt-1 leading-relaxed">
                        {zone.description}
                      </p>

                      {/* Project Highlights */}
                      {zone.highlights && zone.highlights.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-1.5">
                          {zone.highlights.map((h, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700"
                            >
                              • {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Action Button */}
                  <div className="flex-shrink-0 flex items-center md:flex-col justify-end gap-2 pt-2 md:pt-0">
                    <button
                      onClick={() => onScanZone(zone.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                        isStamped
                          ? "bg-slate-800 text-emerald-400 border border-emerald-500/30 hover:bg-slate-700"
                          : "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/30"
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      <span>{isStamped ? "Scan Again" : "Scan Station QR"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
