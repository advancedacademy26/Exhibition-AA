"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera, RefreshCw, Zap, AlertCircle, Sparkles } from "lucide-react";
import { ExhibitionZone } from "@/lib/types";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
  zones: ExhibitionZone[];
}

export default function QrScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  zones,
}: QrScannerModalProps) {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrRegionId = "expo-qr-reader-region";

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn("Error stopping scanner", err);
      }
      scannerRef.current = null;
      setIsScanning(false);
    }
  }, []);

  const handleScanSuccess = useCallback((text: string) => {
    stopScanner();
    onScanSuccess(text);
  }, [stopScanner, onScanSuccess]);

  const startScanner = useCallback(async () => {
    setScannerError(null);
    try {
      if (scannerRef.current) {
        await stopScanner();
      }

      const html5QrCode = new Html5Qrcode(qrRegionId);
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // parse error / scanning in progress
        }
      );
      setIsScanning(true);
    } catch (err: unknown) {
      console.warn("Camera start failed, falling back to simulated mode:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setScannerError(
        `Camera unavailable or permission not granted (${errMsg}). You can use the Quick Scan buttons or enter code below.`
      );
      setIsScanning(false);
    }
  }, [handleScanSuccess, stopScanner]);

  useEffect(() => {
    if (isOpen) {
      // delay slightly so element is mounted in DOM
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, startScanner, stopScanner]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScanSuccess(manualCode.trim());
      setManualCode("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Scan Exhibition QR Code</h3>
              <p className="text-xs text-slate-400">Aim camera at the QR code placed at any of the 6 zones</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport & Overlays */}
        <div className="relative bg-black flex-shrink-0 min-h-[290px] flex items-center justify-center overflow-hidden">
          <div id={qrRegionId} className="w-full max-w-[340px] aspect-square overflow-hidden" />

          {/* Scanning Reticle Frame */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-56 h-56 border-2 border-indigo-400/80 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.5)] flex items-center justify-center">
                {/* Laser scan line animation */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-bounce" />
                <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
              </div>
            </div>
          )}

          {scannerError && (
            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
              <p className="text-sm text-slate-300 mb-4 max-w-xs">{scannerError}</p>
              <button
                onClick={startScanner}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4" /> Retry Camera Access
              </button>
            </div>
          )}
        </div>

        {/* Content Body: Quick Simulator & Manual Entry */}
        <div className="p-5 overflow-y-auto space-y-4 bg-slate-900">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Instant Test Stations (Tap to Simulate Scan)
              </span>
              <span className="text-[11px] text-slate-400">Works without physical camera</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => handleScanSuccess(zone.secretCode)}
                  className="px-3 py-2.5 text-left bg-slate-800/80 hover:bg-indigo-600/30 hover:border-indigo-500 border border-slate-700 rounded-xl text-xs text-slate-200 transition group flex items-center justify-between"
                >
                  <div className="truncate mr-1">
                    <span className="font-bold text-indigo-400 mr-1.5">Z{zone.zoneNumber}</span>
                    <span>{zone.badgeTitle}</span>
                  </div>
                  <Zap className="w-3.5 h-3.5 text-amber-400 opacity-60 group-hover:opacity-100 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Or enter a station QR code (e.g. SPECTRA-26-27-Z1-GREEN)"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
            >
              Verify Code
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
