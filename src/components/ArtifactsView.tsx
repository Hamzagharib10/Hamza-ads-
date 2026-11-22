import React, { useEffect, useMemo, useState } from "react";
import {
  Captions,
  Check,
  Copy,
  Download,
  FileAudio,
  Mic,
  Pause,
  Play,
  Sliders,
  Trash2,
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

interface ArtifactsViewProps {
  takes: GeneratedTake[];
  activeTake: GeneratedTake | null;
  onSelectTake: (id: string) => void;
  onDeleteTake: (id: string) => void;
  onGoToPreview: () => void;
  onGenerateAudio: () => void;
  isGeneratingAudio: boolean;
  currentScriptSegments: string[];
  currentEstimatedSeconds: number;
  currentDialectId: string;
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

export const ArtifactsView: React.FC<ArtifactsViewProps> = ({
  takes,
  activeTake,
  onSelectTake,
  onDeleteTake,
  onGoToPreview,
  onGenerateAudio,
  isGeneratingAudio,
  currentScriptSegments,
  currentEstimatedSeconds,
  currentDialectId,
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
  const [masteredUrl, setMasteredUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedSrt, setCopiedSrt] = useState(false);
  const [srtDraft, setSrtDraft] = useState("");
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const computedSrt = useMemo(() => {
    if (activeTake) {
      const segs = [
        activeTake.hookText,
        activeTake.bodyText,
        activeTake.ctaText,
      ].filter(Boolean);
      return generateSrtFromSegments(
        segs.length > 0 ? segs : [activeTake.script],
        activeTake.durationSec || currentEstimatedSeconds || 15
      );
    }
    return generateSrtFromSegments(
      currentScriptSegments,
      currentEstimatedSeconds || 15
    );
  }, [activeTake, currentScriptSegments, currentEstimatedSeconds]);

  useEffect(() => {
    setSrtDraft(computedSrt);
  }, [computedSrt]);

  useEffect(() => {
    if (!activeTake?.audioUrl) {
      setMasteredUrl(null);
      return;
    }
    const needsProcessing =
      mastering !== "raw" ||
      (musicId !== "none" && (musicId !== "custom" || Boolean(customMusicUrl)));

    if (!needsProcessing) {
      setMasteredUrl(null);
      return;
    }

    let cancelled = false;
    let createdUrl: string | null = null;
    setIsProcessing(true);
    renderMasteredVoiceover({
      voiceUrl: activeTake.audioUrl,
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
        setMasteredUrl(res.url);
      })
      .catch(() => {
        if (!cancelled) setMasteredUrl(null);
      })
      .finally(() => {
        if (!cancelled) setIsProcessing(false);
      });
    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [activeTake?.id, activeTake?.audioUrl, mastering, musicId, musicVolume, customMusicUrl]);

  const exportAudioUrl = masteredUrl ?? activeTake?.audioUrl ?? "";

  const handleTogglePlay = async () => {
    const el = audioRef.current;
    if (!el || !exportAudioUrl || isProcessing) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      try {
        await el.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }
  };

  const handleDownloadSrt = () => {
    if (!srtDraft.trim()) return;
    const blob = new Blob([srtDraft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hamza-ads-${activeTake?.dialectId ?? currentDialectId}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopySrt = async () => {
    if (!srtDraft.trim()) return;
    try {
      await navigator.clipboard.writeText(srtDraft);
      setCopiedSrt(true);
      window.setTimeout(() => setCopiedSrt(false), 2000);
    } catch {
      // ignore clipboard restriction
    }
  };

  return (
    <section
      aria-label="ملفات الصوت والمونتاج والترجمة"
      className="mx-auto max-w-[1280px] space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#131722] p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 shrink-0">
            <FileAudio className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-slate-100">
              ملفات التصدير والمونتاج (Artifacts)
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              مزج الموسيقى الخلفية، تطبيق البث الإذاعي (Broadcast Mastering)، معاينة الصوت النهائي WAV، وتعديل وتصدير ملف الترجمة SRT الجاهز للمونتاج.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onGenerateAudio}
          disabled={isGeneratingAudio}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Mic className="h-4 w-4" />
          <span>{isGeneratingAudio ? "جاري التسجيل..." : "توليد الصوت"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Broadcast Mastered WAV + Background Music Export & Takes */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-xl border border-white/10 bg-[#131722] p-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-base font-bold text-slate-100">
                معالجة البث والموسيقى وتصدير WAV
              </h3>
              {activeTake && (
                <span className="text-xs font-mono tabular-nums text-amber-300">
                  {activeTake.dialectLabel} · ~{Math.round(activeTake.durationSec)}ث
                </span>
              )}
            </div>

            {activeTake ? (
              <>
                <audio
                  ref={audioRef}
                  src={exportAudioUrl}
                  onEnded={() => setIsPlaying(false)}
                />

                <div className="rounded-lg border border-white/8 bg-[#0B0E14] p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-100 truncate">
                      {activeTake.scriptMode === "dialogue" && activeTake.secondVoiceName
                        ? `${activeTake.voiceName.split("—")[0].trim()} × ${activeTake.secondVoiceName
                            .split("—")[0]
                            .trim()}`
                        : activeTake.voiceName}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400 truncate">
                      {activeTake.deliveryLabel} · WAV 24kHz
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-3.5 w-3.5 fill-current" />
                        <span>إيقاف</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>{isProcessing ? "جاري المزج..." : "معاينة"}</span>
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                      <Sliders className="h-3.5 w-3.5 text-amber-400" />
                      <span>مستوى معالجة البث الإذاعي (Mastering)</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {MASTERING_PRESETS.find((m) => m.id === mastering)?.detail}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-[#0B0E14] border border-white/8">
                    {MASTERING_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => onChangeMastering(preset.id)}
                        className={`rounded-md px-2 py-2 text-xs font-medium transition-colors truncate cursor-pointer ${
                          mastering === preset.id
                            ? "bg-[#1B202E] text-amber-400 font-semibold"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
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

                <a
                  href={exportAudioUrl}
                  download={`hamza-ads-${activeTake.dialectId}-${mastering}.wav`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/35 bg-emerald-500/15 px-4 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/25 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>تصدير الملف الصوتي النهائي (WAV)</span>
                </a>
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-white/15 bg-[#0B0E14]/60 p-6 text-center space-y-3">
                <p className="text-sm text-slate-400">
                  لا يوجد ملف صوتي مُولّد بعد. ولّد الصوت من الاستوديو ليظهر هنا جاهزاً للدمج مع الموسيقى والتصدير.
                </p>
                <button
                  type="button"
                  onClick={onGoToPreview}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 cursor-pointer"
                >
                  العودة إلى Preview
                </button>
              </div>
            )}
          </div>

          {/* All Saved Takes */}
          <div className="rounded-xl border border-white/10 bg-[#131722] p-6 space-y-3">
            <h3 className="font-display text-sm font-bold text-slate-100">
              أرشيف التسجيلات المحفوظة ({takes.length})
            </h3>
            {takes.length === 0 ? (
              <p className="text-xs text-slate-400">
                سيتم حفظ كل تسجيل تولده تلقائياً في هذه القائمة.
              </p>
            ) : (
              <div className="divide-y divide-white/8 rounded-lg border border-white/8 bg-[#0B0E14] overflow-hidden">
                {takes.map((take) => {
                  const selected = activeTake?.id === take.id;
                  return (
                    <div
                      key={take.id}
                      className={`flex items-center justify-between gap-3 px-4 py-3 ${
                        selected ? "bg-amber-500/[0.08]" : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectTake(take.id)}
                        className="text-right min-w-0 flex-1 cursor-pointer"
                      >
                        <div className="text-xs font-semibold text-slate-100 truncate">
                          {take.voiceName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate tabular-nums">
                          {take.dialectLabel} · ~{Math.round(take.durationSec)}ث
                        </div>
                      </button>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={take.audioUrl}
                          download={`hamza-ads-${take.dialectId}.wav`}
                          className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20"
                        >
                          WAV
                        </a>
                        <button
                          type="button"
                          onClick={() => onDeleteTake(take.id)}
                          aria-label="حذف التسجيل"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-slate-400 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Live SRT Subtitle Editor & Export */}
        <div className="lg:col-span-6 rounded-xl border border-white/10 bg-[#131722] p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Captions className="h-5 w-5 text-amber-400" />
              <div>
                <h3 className="font-display text-base font-bold text-slate-100">
                  محرر ملف الترجمة الجاهز للمونتاج (SRT)
                </h3>
                <p className="text-xs text-slate-400">
                  متوافق مع CapCut و Premiere Pro و DaVinci Resolve
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySrt}
                disabled={!srtDraft.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#1B202E] px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 disabled:opacity-50 cursor-pointer"
              >
                {copiedSrt ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-300">تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>نسخ SRT</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDownloadSrt}
                disabled={!srtDraft.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>تحميل .SRT</span>
              </button>
            </div>
          </div>

          <textarea
            dir="ltr"
            rows={16}
            value={srtDraft}
            onChange={(e) => setSrtDraft(e.target.value)}
            aria-label="محتوى ملف الترجمة SRT"
            className="w-full rounded-lg border border-white/10 bg-[#0B0E14] p-4 font-mono text-xs text-slate-200 leading-relaxed tabular-nums focus:border-amber-500/60 focus:outline-none"
          />
        </div>
      </div>
    </section>
  );
};
