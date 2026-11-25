import React, { useEffect, useRef, useState } from "react";
import {
  Captions,
  Download,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Volume2,
} from "lucide-react";
import { MASTERING_PRESETS } from "../data/presets";
import {
  BackgroundMusicId,
  GeneratedTake,
  MasteringPresetId,
} from "../types/studio";
import {
  generateSrtFromSegments,
  renderMasteredVoiceover,
} from "../utils/audioMastering";
import { BackgroundMusicPanel } from "./BackgroundMusicPanel";

interface WaveformPlayerProps {
  take: GeneratedTake | null;
  isGenerating: boolean;
  onGenerateClick: () => void;
  mastering: MasteringPresetId;
  onChangeMastering: (id: MasteringPresetId) => void;
  musicId: BackgroundMusicId;
  onChangeMusicId: (id: BackgroundMusicId) => void;
  musicVolume: number;
  onChangeMusicVolume: (vol: number) => void;
  customMusicUrl: string | null;
  customMusicName: string | null;
  onUploadCustomMusic: (file: File) => void;
  onClearCustomMusic: () => void;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  take,
  isGenerating,
  onGenerateClick,
  mastering,
  onChangeMastering,
  musicId,
  onChangeMusicId,
  musicVolume,
  onChangeMusicVolume,
  customMusicUrl,
  customMusicName,
  onUploadCustomMusic,
  onClearCustomMusic,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<0.9 | 1 | 1.1>(1);
  const [peaks, setPeaks] = useState<number[]>([]);

  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const activeAudioUrl = processedUrl ?? take?.audioUrl ?? "";

  useEffect(() => {
    if (!take?.audioUrl) {
      setProcessedUrl(null);
      return;
    }

    const needsProcessing =
      mastering !== "raw" ||
      (musicId !== "none" && (musicId !== "custom" || Boolean(customMusicUrl)));

    if (!needsProcessing) {
      setProcessedUrl(null);
      return;
    }

    let cancelled = false;
    let createdUrl: string | null = null;
    setIsProcessing(true);

    renderMasteredVoiceover({
      voiceUrl: take.audioUrl,
      mastering,
      musicId,
      musicVolume,
      customMusicUrl,
    })
      .then((res) => {
        if (cancelled) {
          URL.revokeObjectURL(res.url);
          return;
        }
        createdUrl = res.url;
        setProcessedUrl(res.url);
        setDuration(res.durationSec);
        setIsPlaying(false);
        setCurrentTime(0);
      })
      .catch(() => {
        if (!cancelled) {
          setProcessedUrl(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsProcessing(false);
      });

    return () => {
      cancelled = true;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [take?.id, take?.audioUrl, mastering, musicId, musicVolume, customMusicUrl]);

  useEffect(() => {
    if (!activeAudioUrl) {
      setPeaks([]);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    let cancelled = false;
    setIsPlaying(false);
    setCurrentTime(0);

    const computePeaks = async () => {
      try {
        const res = await fetch(activeAudioUrl);
        const arrayBuffer = await res.arrayBuffer();
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new AudioCtx();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        const channelData = audioBuffer.getChannelData(0);
        const barCount = 56;
        const blockSize = Math.floor(channelData.length / barCount);
        const computed: number[] = [];

        for (let i = 0; i < barCount; i++) {
          const start = i * blockSize;
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            const val = Math.abs(channelData[start + j] || 0);
            if (val > sum) sum = val;
          }
          computed.push(Math.max(0.14, Math.min(1, sum * 1.15)));
        }

        await ctx.close();
        if (!cancelled) {
          setPeaks(computed);
          if (audioBuffer.duration > 0) {
            setDuration(audioBuffer.duration);
          }
        }
      } catch {
        if (!cancelled) {
          setPeaks(
            Array.from({ length: 56 }, (_, idx) => {
              const wave = Math.sin(idx * 0.45) * 0.35 + 0.55;
              return Math.max(0.18, Math.min(0.95, wave));
            })
          );
        }
      }
    };

    computePeaks();
    return () => {
      cancelled = true;
    };
  }, [activeAudioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = playbackRate;
  }, [playbackRate, activeAudioUrl]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !take || isProcessing) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }
  };

  const handleRestart = async () => {
    const audio = audioRef.current;
    if (!audio || !take || isProcessing) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const handleSeek = (ratio: number) => {
    const audio = audioRef.current;
    const total = duration || take?.durationSec || 0;
    if (!audio || total <= 0) return;
    const target = Math.max(0, Math.min(total, ratio * total));
    audio.currentTime = target;
    setCurrentTime(target);
  };

  const handleDownloadSrt = () => {
    if (!take) return;
    const total = duration || take.durationSec || 20;
    const segments = [take.hookText, take.bodyText, take.ctaText].filter(Boolean);
    const srtContent = generateSrtFromSegments(
      segments.length > 0 ? segments : [take.script],
      total
    );
    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nabra-ads-${take.dialectId}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const progressRatio =
    (duration || take?.durationSec || 0) > 0
      ? Math.min(1, currentTime / (duration || take?.durationSec || 1))
      : 0;

  if (isGenerating) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#131722] p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-200">
            جاري تسجيل الصوت بالاستوديو...
          </span>
          <span className="text-xs font-mono tabular-nums text-amber-400">
            MP3 · 44.1kHz
          </span>
        </div>
        <div className="h-16 flex items-center gap-1 px-2 rounded-lg bg-[#0B0E14] border border-white/5">
          {Array.from({ length: 42 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-amber-500/25 animate-pulse"
              style={{
                height: `${24 + ((i * 19) % 45)}%`,
                animationDelay: `${i * 35}ms`,
              }}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          يتم الآن ضبط النبرة والوقفات واللهجة المطلوبة...
        </p>
      </div>
    );
  }

  if (!take) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-[#131722]/70 p-6 space-y-5">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 text-amber-400">
            <Volume2 className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-100">
            جهاز المعاينة والموسيقى الخلفية جاهز
          </h3>
          <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
            اختر موسيقى خلفية واستمع لها أو ولّد الصوت النقي لدمجهما مع تحسين البث الإذاعي وتصدير WAV و SRT.
          </p>
          <button
            type="button"
            onClick={onGenerateClick}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 whitespace-nowrap shrink-0 cursor-pointer"
          >
            توليد الصوت الآن
          </button>
        </div>

        <BackgroundMusicPanel
          musicId={musicId}
          onChangeMusicId={onChangeMusicId}
          musicVolume={musicVolume}
          onChangeMusicVolume={onChangeMusicVolume}
          customMusicUrl={customMusicUrl}
          customMusicName={customMusicName}
          onUploadCustomMusic={onUploadCustomMusic}
          onClearCustomMusic={onClearCustomMusic}
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#131722] p-6 space-y-5">
      <audio
        ref={audioRef}
        src={activeAudioUrl}
        onLoadedMetadata={(e) => {
          const el = e.currentTarget;
          if (Number.isFinite(el.duration) && el.duration > 0) {
            setDuration(el.duration);
          }
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Active Track Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-100 truncate">
            {take.scriptMode === "dialogue" && take.secondVoiceName
              ? `${take.voiceName.split("—")[0].trim()} × ${take.secondVoiceName
                  .split("—")[0]
                  .trim()}`
              : take.voiceName}
          </h3>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>{take.dialectLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{take.deliveryLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {processedUrl
                ? "WAV 24kHz"
                : take.mimeType?.includes("mpeg")
                  ? "MP3 44.1kHz"
                  : "WAV 24kHz"}
            </span>
          </div>
        </div>
        <div className="font-mono text-sm tabular-nums text-slate-200 shrink-0" dir="ltr">
          {formatTime(currentTime)} / {formatTime(duration || take.durationSec)}
        </div>
      </div>

      {/* Interactive Waveform Scrubber */}
      <div
        role="slider"
        tabIndex={0}
        aria-label="شريط تقديم الصوت"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progressRatio * 100)}
        dir="ltr"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          handleSeek(ratio);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") handleSeek(progressRatio + 0.05);
          if (e.key === "ArrowLeft") handleSeek(progressRatio - 0.05);
        }}
        className={`h-20 flex items-center gap-[3px] px-3 rounded-lg bg-[#0B0E14] border border-white/8 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-amber-400 transition-opacity ${
          isProcessing ? "opacity-50" : "opacity-100"
        }`}
      >
        {(peaks.length > 0 ? peaks : Array(56).fill(0.4)).map((peak, index) => {
          const barRatio = index / 56;
          const isActive = barRatio <= progressRatio;
          return (
            <div
              key={index}
              className={`flex-1 rounded-xs transition-colors duration-100 ${
                isActive ? "bg-amber-400" : "bg-slate-700 hover:bg-slate-600"
              }`}
              style={{ height: `${Math.round(peak * 100)}%` }}
            />
          );
        })}
      </div>

      {/* Playback & Speed Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-amber-400 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 fill-current" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>{isProcessing ? "جاري المزج..." : "تشغيل الإعلان"}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleRestart}
            disabled={isProcessing}
            title="إعادة من البداية"
            aria-label="إعادة التشغيل من البداية"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#1B202E] text-slate-200 transition-colors hover:bg-white/10 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center rounded-lg border border-white/10 bg-[#0B0E14] p-0.5">
          {([0.9, 1, 1.1] as const).map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => setPlaybackRate(rate)}
              className={`px-2.5 py-1.5 text-xs font-mono tabular-nums rounded-md transition-colors cursor-pointer ${
                playbackRate === rate
                  ? "bg-[#1B202E] text-amber-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* Pure Voice Studio Mastering */}
      <div className="pt-4 border-t border-white/8">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <Sliders className="h-3.5 w-3.5 text-amber-400" />
            <span>نقاء ومعالجة الصوت (Mastering)</span>
          </span>
          <span className="text-[11px] text-slate-400">
            {MASTERING_PRESETS.find((m) => m.id === mastering)?.detail}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-[#0B0E14] border border-white/8">
          {MASTERING_PRESETS.map((preset) => {
            const active = mastering === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChangeMastering(preset.id)}
                className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors truncate cursor-pointer ${
                  active
                    ? "bg-[#1B202E] text-amber-400 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Background Music Bed & Mixing */}
      <BackgroundMusicPanel
        musicId={musicId}
        onChangeMusicId={onChangeMusicId}
        musicVolume={musicVolume}
        onChangeMusicVolume={onChangeMusicVolume}
        customMusicUrl={customMusicUrl}
        customMusicName={customMusicName}
        onUploadCustomMusic={onUploadCustomMusic}
        onClearCustomMusic={onClearCustomMusic}
      />

      {/* Export Actions: Final Mixed WAV + SRT Subtitles */}
      <div className="pt-4 border-t border-white/8 flex flex-wrap items-center gap-2.5">
        <a
          href={activeAudioUrl}
          download={`nabra-ads-${take.dialectId}-${take.voiceId.toLowerCase()}.${
            processedUrl ? "wav" : take.mimeType?.includes("mpeg") ? "mp3" : "wav"
          }`}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/35 bg-emerald-500/15 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/25 focus-visible:outline-2 focus-visible:outline-emerald-400 whitespace-nowrap"
        >
          <Download className="h-4 w-4" />
          <span>
            {processedUrl
              ? "تحميل الصوت النهائي (WAV)"
              : take.mimeType?.includes("mpeg")
                ? "تحميل الصوت النهائي (MP3)"
                : "تحميل الصوت النهائي (WAV)"}
          </span>
        </a>

        <button
          type="button"
          onClick={handleDownloadSrt}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-[#1B202E] px-3.5 py-2.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Captions className="h-4 w-4 text-amber-400" />
          <span>ملف الترجمة (SRT)</span>
        </button>
      </div>
    </div>
  );
};
