import React, { useEffect, useRef, useState } from "react";
import { Music, Pause, Play, Upload, X } from "lucide-react";
import { BACKGROUND_MUSIC_PRESETS } from "../data/presets";
import { BackgroundMusicId } from "../types/studio";
import { renderMusicPreview } from "../utils/audioMastering";

interface BackgroundMusicPanelProps {
  musicId: BackgroundMusicId;
  onChangeMusicId: (id: BackgroundMusicId) => void;
  musicVolume: number;
  onChangeMusicVolume: (vol: number) => void;
  customMusicUrl: string | null;
  customMusicName: string | null;
  onUploadCustomMusic: (file: File) => void;
  onClearCustomMusic: () => void;
}

export const BackgroundMusicPanel: React.FC<BackgroundMusicPanelProps> = ({
  musicId,
  onChangeMusicId,
  musicVolume,
  onChangeMusicVolume,
  customMusicUrl,
  customMusicName,
  onUploadCustomMusic,
  onClearCustomMusic,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      previewAudioRef.current?.pause();
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  // Stop preview when switching music track
  useEffect(() => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPreviewing(false);
    }
  }, [musicId, customMusicUrl]);

  const handleToggleMusicPreview = async () => {
    if (musicId === "none") return;

    if (isPreviewing && previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPreviewing(false);
      return;
    }

    setIsLoadingPreview(true);
    try {
      const { url } = await renderMusicPreview({
        musicId,
        musicVolume,
        customMusicUrl,
      });
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      previewUrlRef.current = url;
      const audio = new Audio(url);
      previewAudioRef.current = audio;
      audio.onended = () => setIsPreviewing(false);
      await audio.play();
      setIsPreviewing(true);
    } catch {
      setIsPreviewing(false);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadCustomMusic(file);
    }
    e.target.value = "";
  };

  const activePresetDetail =
    musicId === "custom"
      ? `ملف خاص: ${customMusicName || "موسيقى مرفوعة"}`
      : BACKGROUND_MUSIC_PRESETS.find((m) => m.id === musicId)?.detail ?? "";

  return (
    <div className="pt-4 border-t border-white/8 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200">
          <Music className="h-3.5 w-3.5 text-amber-400" />
          <span>موسيقى خلفية للإعلان (Auto-Ducking)</span>
        </span>
        <span className="text-[11px] text-slate-400 truncate max-w-[260px]">
          {activePresetDetail}
        </span>
      </div>

      {/* Music Presets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-1 rounded-lg bg-[#0B0E14] border border-white/8">
        {BACKGROUND_MUSIC_PRESETS.map((preset) => {
          const active = musicId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChangeMusicId(preset.id)}
              className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors truncate cursor-pointer ${
                active
                  ? "bg-[#1B202E] text-amber-400 font-semibold border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {preset.label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors truncate cursor-pointer ${
            musicId === "custom"
              ? "bg-[#1B202E] text-emerald-300 font-semibold border border-emerald-500/30"
              : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <Upload className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {musicId === "custom" && customMusicName ? customMusicName : "رفع موسيقى"}
          </span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label="رفع ملف موسيقى خلفية"
        />
      </div>

      {/* Volume Slider & Preview Button when Music is active */}
      {musicId !== "none" && (
        <div className="rounded-lg border border-white/8 bg-[#0B0E14] px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-[170px]">
            <label
              htmlFor="music-volume-slider"
              className="text-xs text-slate-300 whitespace-nowrap shrink-0"
            >
              مستوى الموسيقى
            </label>
            <input
              id="music-volume-slider"
              type="range"
              min={5}
              max={60}
              step={1}
              value={Math.round(musicVolume * 100)}
              onChange={(e) => onChangeMusicVolume(Number(e.target.value) / 100)}
              className="flex-1 accent-amber-500 cursor-pointer"
            />
            <span className="font-mono text-xs tabular-nums text-amber-300 w-9 text-left shrink-0">
              {Math.round(musicVolume * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleToggleMusicPreview}
              disabled={isLoadingPreview}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-[#1B202E] px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {isPreviewing ? (
                <>
                  <Pause className="h-3 w-3 text-amber-400 fill-current" />
                  <span>إيقاف المعاينة</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 text-amber-400 fill-current" />
                  <span>{isLoadingPreview ? "تحضير..." : "سماع الموسيقى"}</span>
                </>
              )}
            </button>

            {musicId === "custom" && (
              <button
                type="button"
                onClick={onClearCustomMusic}
                title="إزالة الملف المرفوع"
                aria-label="إزالة الملف المرفوع"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-slate-400 hover:text-red-400 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
