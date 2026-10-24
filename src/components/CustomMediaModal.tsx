"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AppCustomMediaSettings } from "@/lib/types";
import { DEFAULT_MEDIA_SETTINGS } from "@/lib/constants";
import { X, Image as ImageIcon, Upload, Check, RotateCcw, Sparkles, AlertCircle } from "lucide-react";

type ImageSettingKey =
  | "passportImage"
  | "welcomeImage"
  | "routeImage"
  | "stampImage"
  | "certificateImage"
  | "completionImage";

const IMAGE_FIELDS: Array<{ key: ImageSettingKey; title: string; hint: string }> = [
  { key: "passportImage", title: "Visitor passport cover", hint: "Reference-inspired navy/gold Spectra cover with Visitor Passport lettering." },
  { key: "welcomeImage", title: "Portrait welcome poster artwork", hint: "Cream/navy Spectra poster; visitor greeting text is typeset by the app." },
  { key: "routeImage", title: "Exhibition route map", hint: "Optional: add your actual school campus route map." },
  { key: "stampImage", title: "Six Citizen stamp sheet", hint: "Six reference-inspired stamp illustrations with live labels and completion marks." },
  { key: "certificateImage", title: "Certificate background artwork", hint: "Cream/gold Spectra certificate; exact title and visitor details are typeset by the app." },
  { key: "completionImage", title: "Route-completed artwork", hint: "Reference-inspired congratulations banner with the certificate-unlocked message layered by the app." },
];

interface CustomMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: AppCustomMediaSettings;
  onSave: (newSettings: AppCustomMediaSettings) => Promise<void>;
}

async function compressImage(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new window.Image();
    image.src = objectUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not read this image file."));
    });

    const maxDimension = 1800;
    const ratio = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not process this image.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.84);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function CustomMediaModal({
  isOpen,
  onClose,
  currentSettings,
  onSave,
}: CustomMediaModalProps) {
  const [settings, setSettings] = useState<AppCustomMediaSettings>(currentSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<ImageSettingKey | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(currentSettings);
      setStatusMsg("");
      setIsError(false);
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) return null;

  const handleFileUpload = async (field: ImageSettingKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setIsError(true);
      setStatusMsg("Please choose an image file (JPG, PNG or WebP).");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setIsError(true);
      setStatusMsg("Choose an image under 12 MB; it will be resized before saving.");
      return;
    }

    try {
      setUploadingKey(field);
      setStatusMsg("");
      const dataUrl = await compressImage(file);
      setSettings((previous) => ({ ...previous, [field]: dataUrl }));
      setIsError(false);
      setStatusMsg(`${file.name} is ready. Save pictures to publish it for all visitors.`);
    } catch (error) {
      setIsError(true);
      setStatusMsg(error instanceof Error ? error.message : "Could not process that image.");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_MEDIA_SETTINGS);
    setStatusMsg("Reference-inspired Spectra artwork defaults restored.");
    setIsError(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setStatusMsg("");
      await onSave(settings);
      setIsError(false);
      setStatusMsg("Spectra branding and image settings saved for all visitors.");
      setTimeout(() => {
        setStatusMsg("");
        onClose();
      }, 1100);
    } catch (error) {
      console.error(error);
      setIsError(true);
      setStatusMsg(error instanceof Error ? error.message : "Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl"><ImageIcon className="w-5 h-5" /></div>
            <div>
              <h3 className="text-lg font-bold text-white">Spectra pictures &amp; branding</h3>
              <p className="text-xs text-slate-400">Reference-inspired Spectra artwork is preloaded. Replace any image with your own school-approved version if needed.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {statusMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${isError ? "bg-rose-500/10 border-rose-500/30 text-rose-300" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"}`}>
              {isError ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
              <span>{statusMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-xs font-semibold text-slate-300">
              School name
              <input value={settings.schoolName} onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })} className="mt-1.5 w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </label>
            <label className="block text-xs font-semibold text-slate-300">
              Exhibition / theme
              <input value={settings.eventName} onChange={(e) => setSettings({ ...settings, eventName: e.target.value })} className="mt-1.5 w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </label>
          </div>

          <div className="border-t border-slate-800 pt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Reference-inspired Spectra artwork</h4>
            <p className="text-[11px] text-slate-500 mb-4">Each upload is resized in your browser before it is saved. Route-map artwork is optional; the step-by-step route still works without it.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {IMAGE_FIELDS.map((field, index) => {
                const source = settings[field.key];
                return (
                  <div key={field.key} className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-white">{index + 1}. {field.title}</span>
                        <p className="text-[10px] text-slate-400 mt-1">{field.hint}</p>
                      </div>
                      <label className="flex-shrink-0 text-[11px] text-indigo-300 hover:text-white cursor-pointer flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1.5 rounded-lg border border-indigo-500/20">
                        <Upload className="w-3 h-3" /> {uploadingKey === field.key ? "Processing…" : "Choose image"}
                        <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={uploadingKey !== null} onChange={(event) => void handleFileUpload(field.key, event)} />
                      </label>
                    </div>
                    <div className="relative h-44 w-full rounded-xl overflow-hidden bg-[#f7f1e3] border border-slate-700 flex items-center justify-center">
                      {source ? (
                        <Image src={source} alt={`${field.title} preview`} fill unoptimized sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" />
                      ) : (
                        <div className="text-center px-6">
                          <ImageIcon className="w-7 h-7 mx-auto text-slate-400 mb-2" />
                          <span className="text-[11px] text-slate-500">No artwork selected for this slot</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Or paste an image URL" value={source} onChange={(event) => setSettings({ ...settings, [field.key]: event.target.value })} className="min-w-0 flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[11px] text-slate-200 placeholder-slate-500" />
                      {source && <button type="button" onClick={() => setSettings({ ...settings, [field.key]: "" })} className="px-3 bg-slate-700 hover:bg-rose-900/70 text-slate-300 hover:text-white rounded-lg text-[11px]">Remove</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button type="button" onClick={handleResetDefaults} className="px-3 py-2 text-xs text-slate-400 hover:text-white flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" />Restore Spectra defaults</button>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl">Cancel</button>
              <button type="submit" disabled={isSaving || uploadingKey !== null} className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50">{isSaving ? "Saving…" : "Save pictures & settings"}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
