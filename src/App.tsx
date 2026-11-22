import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Download,
  Globe,
  Languages,
  Mic,
  Pause,
  Play,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  User,
  Users,
} from "lucide-react";
import {
  AD_ANGLES,
  AD_CATEGORIES,
  DELIVERY_STYLES,
  DIALECT_OPTIONS,
  PLATFORM_TARGETS,
  QUICK_DIALECT_CATEGORIES,
  VOICE_PERSONAS,
} from "./data/presets";
import {
  AdAngleId,
  AdCategoryId,
  BackgroundMusicId,
  ChatMessage,
  DeliveryStyleId,
  DialectId,
  GeneratedTake,
  MasteringPresetId,
  PlatformTarget,
  QuickCategoryId,
  RegionGroupId,
  ScriptMode,
  ScriptProposal,
  StudioTab,
  VoiceId,
} from "./types/studio";
import { WaveformPlayer } from "./components/WaveformPlayer";
import { BottomNav } from "./components/BottomNav";
import { ChatView } from "./components/ChatView";
import { ArtifactsView } from "./components/ArtifactsView";
import {
  deleteTakeFromDb,
  loadTakesFromDb,
  saveTakeToDb,
} from "./utils/takesStorage";

function base64ToWavBlob(
  base64: string,
  mimeType: string
): { blob: Blob; url: string; durationEst: number } {
  const binary = atob(base64);
  const rawBytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    rawBytes[i] = binary.charCodeAt(i);
  }

  const hasRiffHeader =
    rawBytes.length >= 12 &&
    rawBytes[0] === 0x52 &&
    rawBytes[1] === 0x49 &&
    rawBytes[2] === 0x46 &&
    rawBytes[3] === 0x46;

  let wavBytes: Uint8Array;
  if (hasRiffHeader) {
    wavBytes = rawBytes;
  } else {
    const dataLength = rawBytes.length;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);
    const writeStr = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };
    writeStr(0, "RIFF");
    view.setUint32(4, 36 + dataLength, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, 24000, true);
    view.setUint32(28, 48000, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, "data");
    view.setUint32(40, dataLength, true);
    wavBytes = new Uint8Array(buffer);
    wavBytes.set(rawBytes, 44);
  }

  const blob = new Blob([wavBytes.slice().buffer], {
    type: mimeType && mimeType.includes("wav") ? mimeType : "audio/wav",
  });
  const url = URL.createObjectURL(blob);
  const payloadBytes = Math.max(0, wavBytes.length - 44);
  const durationEst = payloadBytes / 48000;
  return { blob, url, durationEst };
}

function estimateSpeechSeconds(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 2.3));
}

export default function App() {
  const defaultCategory = AD_CATEGORIES[0];

  const [activeTab, setActiveTab] = useState<StudioTab>("preview");
  const [selectedRegion, setSelectedRegion] = useState<RegionGroupId>("egypt_nile");
  const [selectedDialectId, setSelectedDialectId] = useState<DialectId>("ar-EG");

  const [scriptMode, setScriptMode] = useState<ScriptMode>("solo");
  const [platformTarget, setPlatformTarget] = useState<PlatformTarget>("reels");

  const [selectedCategory, setSelectedCategory] = useState<AdCategoryId>(
    defaultCategory.id
  );
  const [selectedAngle, setSelectedAngle] = useState<AdAngleId>("suspense");
  const [adTopic, setAdTopic] = useState<string>(defaultCategory.defaultTopic);
  const [ctaTarget, setCtaTarget] = useState<string>(defaultCategory.defaultCtaTarget);
  const [brandName, setBrandName] = useState<string>("");

  const [hookText, setHookText] = useState<string>(defaultCategory.hook);
  const [bodyText, setBodyText] = useState<string>(defaultCategory.body);
  const [ctaText, setCtaText] = useState<string>(defaultCategory.cta);

  const [dialogueHookA, setDialogueHookA] = useState<string>(defaultCategory.dialogueHookA);
  const [dialogueHookB, setDialogueHookB] = useState<string>(defaultCategory.dialogueHookB);
  const [dialogueBodyA, setDialogueBodyA] = useState<string>(defaultCategory.dialogueBodyA);
  const [dialogueBodyB, setDialogueBodyB] = useState<string>(defaultCategory.dialogueBodyB);
  const [dialogueCtaB, setDialogueCtaB] = useState<string>(defaultCategory.dialogueCtaB);

  const [selectedVoice, setSelectedVoice] = useState<VoiceId>("Charon");
  const [secondVoice, setSecondVoice] = useState<VoiceId>("Kore");
  const [deliveryStyle, setDeliveryStyle] = useState<DeliveryStyleId>("suspense");

  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [hasUnreadProposal, setHasUnreadProposal] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  const [takes, setTakes] = useState<GeneratedTake[]>([]);
  const [activeTakeId, setActiveTakeId] = useState<string | null>(null);
  const [playingHistoryId, setPlayingHistoryId] = useState<string | null>(null);
  const historyAudioRef = React.useRef<HTMLAudioElement | null>(null);

  const [mastering, setMastering] = useState<MasteringPresetId>("broadcast");
  const [musicId, setMusicId] = useState<BackgroundMusicId>("none");
  const [musicVolume, setMusicVolume] = useState<number>(0.22);
  const [customMusicUrl, setCustomMusicUrl] = useState<string | null>(null);
  const [customMusicName, setCustomMusicName] = useState<string | null>(null);

  const handleUploadCustomMusic = (file: File) => {
    if (customMusicUrl) {
      URL.revokeObjectURL(customMusicUrl);
    }
    const url = URL.createObjectURL(file);
    setCustomMusicUrl(url);
    setCustomMusicName(file.name);
    setMusicId("custom");
  };

  const handleClearCustomMusic = () => {
    if (customMusicUrl) {
      URL.revokeObjectURL(customMusicUrl);
    }
    setCustomMusicUrl(null);
    setCustomMusicName(null);
    setMusicId("none");
  };

  useEffect(() => {
    let mounted = true;
    loadTakesFromDb().then((saved) => {
      if (mounted && saved.length > 0) {
        setTakes(saved);
        setActiveTakeId(saved[0].id);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const selectedDialect = useMemo(() => {
    return (
      DIALECT_OPTIONS.find((d) => d.id === selectedDialectId) ?? DIALECT_OPTIONS[0]
    );
  }, [selectedDialectId]);

  const activeQuickCategory = useMemo<QuickCategoryId>(() => {
    if (selectedDialect.langFamily === "en") return "english";
    if (selectedDialect.langFamily === "fr") return "french";
    if (selectedDialect.langFamily === "it") return "italian";
    return selectedRegion === "global" ? "english" : selectedRegion;
  }, [selectedDialect.langFamily, selectedRegion]);

  const regionDialects = useMemo(() => {
    return DIALECT_OPTIONS.filter((d) => d.region === selectedRegion);
  }, [selectedRegion]);

  const currentScriptSegments = useMemo(() => {
    if (scriptMode === "dialogue") {
      return [
        dialogueHookA.trim(),
        dialogueHookB.trim(),
        dialogueBodyA.trim(),
        dialogueBodyB.trim(),
        dialogueCtaB.trim(),
      ].filter(Boolean);
    }
    return [hookText.trim(), bodyText.trim(), ctaText.trim()].filter(Boolean);
  }, [
    scriptMode,
    hookText,
    bodyText,
    ctaText,
    dialogueHookA,
    dialogueHookB,
    dialogueBodyA,
    dialogueBodyB,
    dialogueCtaB,
  ]);

  const fullScript = useMemo(() => {
    return currentScriptSegments.join("\n\n");
  }, [currentScriptSegments]);

  const totalWords = useMemo(() => {
    return fullScript.trim().split(/\s+/).filter(Boolean).length;
  }, [fullScript]);

  const estimatedSeconds = useMemo(() => {
    return estimateSpeechSeconds(fullScript);
  }, [fullScript]);

  const activeTake = useMemo(() => {
    if (!activeTakeId) return takes[0] ?? null;
    return takes.find((t) => t.id === activeTakeId) ?? takes[0] ?? null;
  }, [takes, activeTakeId]);

  const handleSelectQuickCategory = (catId: QuickCategoryId) => {
    const found = QUICK_DIALECT_CATEGORIES.find((c) => c.id === catId);
    if (!found) return;
    setSelectedRegion(found.region);
    if (
      catId === "english" ||
      catId === "french" ||
      catId === "italian" ||
      selectedDialect.region !== found.region
    ) {
      setSelectedDialectId(found.defaultDialectId);
    }
  };

  const handleSelectDialectOption = (optId: DialectId) => {
    const found = DIALECT_OPTIONS.find((d) => d.id === optId);
    if (!found) return;
    setSelectedDialectId(found.id);
    setSelectedRegion(found.region);
  };

  const handleSelectCategory = (categoryId: AdCategoryId) => {
    const found = AD_CATEGORIES.find((c) => c.id === categoryId);
    if (!found) return;
    setSelectedCategory(found.id);
    setAdTopic(found.defaultTopic);
    setCtaTarget(found.defaultCtaTarget);
    setHookText(found.hook);
    setBodyText(found.body);
    setCtaText(found.cta);
    setDialogueHookA(found.dialogueHookA);
    setDialogueHookB(found.dialogueHookB);
    setDialogueBodyA(found.dialogueBodyA);
    setDialogueBodyB(found.dialogueBodyB);
    setDialogueCtaB(found.dialogueCtaB);
    setErrorMsg(null);
  };

  const handleNavSection = (sectionId: string) => {
    setActiveTab("preview");
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);
  };

  const handleGenerateScript = async (mode: "fresh" | "polish" | "adapt") => {
    setErrorMsg(null);
    setIsGeneratingScript(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 25000);
    try {
      const res = await fetch("/api/script/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          mode,
          scriptMode,
          platformTarget,
          category: selectedCategory,
          angle: selectedAngle,
          dialectId: selectedDialectId,
          topic: adTopic,
          ctaTarget,
          brandName,
          currentHook: hookText,
          currentBody: bodyText,
          currentCta: ctaText,
          dialogueHookA,
          dialogueHookB,
          dialogueBodyA,
          dialogueBodyB,
          dialogueCtaB,
        }),
      });
      const rawText = await res.text();
      let data: Record<string, string> = {};
      try {
        data = rawText ? (JSON.parse(rawText) as Record<string, string>) : {};
      } catch {
        throw new Error(
          res.ok
            ? "استجابة غير متوقعة من الخادم."
            : `تعذر الاتصال بالخادم (HTTP ${res.status}). حاول مرة أخرى.`
        );
      }
      if (!res.ok) {
        throw new Error(data.error || "تعذر تحديث السكريبت.");
      }
      if (scriptMode === "dialogue") {
        if (data.dialogueHookA) setDialogueHookA(data.dialogueHookA);
        if (data.dialogueHookB) setDialogueHookB(data.dialogueHookB);
        if (data.dialogueBodyA) setDialogueBodyA(data.dialogueBodyA);
        if (data.dialogueBodyB) setDialogueBodyB(data.dialogueBodyB);
        if (data.dialogueCtaB) setDialogueCtaB(data.dialogueCtaB);
      } else {
        if (data.hook) setHookText(data.hook);
        if (data.body) setBodyText(data.body);
        if (data.cta) setCtaText(data.cta);
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setErrorMsg("استغرق الخادم وقتاً أطول من المتوقع. حاول مرة أخرى.");
      } else {
        setErrorMsg(
          err instanceof Error
            ? err.message
            : "حدث خطأ أثناء الاتصال بخدمة كتابة السكريبت."
        );
      }
    } finally {
      window.clearTimeout(timeoutId);
      setIsGeneratingScript(false);
    }
  };

  const handleSendChatMessage = async (text: string) => {
    setErrorMsg(null);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: "user",
      content: text,
      createdAt: Date.now(),
    };
    const nextHistory = [...chatMessages, userMsg];
    setChatMessages(nextHistory);
    setIsSendingChat(true);

    try {
      const res = await fetch("/api/script/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          dialectId: selectedDialectId,
          scriptMode,
          platformTarget,
          brandName,
          ctaTarget,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        reply?: string;
        hasScript?: boolean;
        scriptMode?: string;
        hook?: string;
        body?: string;
        cta?: string;
        dialogueHookA?: string;
        dialogueHookB?: string;
        dialogueBodyA?: string;
        dialogueBodyB?: string;
        dialogueCtaB?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "تعذر الرد من المساعد الإعلاني.");
      }

      const proposalMode: ScriptMode =
        data.scriptMode === "dialogue" ? "dialogue" : "solo";
      const proposal: ScriptProposal | undefined = data.hasScript
        ? {
            scriptMode: proposalMode,
            hook: data.hook,
            body: data.body,
            cta: data.cta,
            dialogueHookA: data.dialogueHookA,
            dialogueHookB: data.dialogueHookB,
            dialogueBodyA: data.dialogueBodyA,
            dialogueBodyB: data.dialogueBodyB,
            dialogueCtaB: data.dialogueCtaB,
          }
        : undefined;

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        role: "assistant",
        content: data.reply || "تم إعداد مقترح السكريبت الإعلاني باللهجة المختارة.",
        createdAt: Date.now(),
        dialectLabel: `${selectedDialect.countryLabel} — ${selectedDialect.dialectLabel}`,
        proposal,
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
      if (proposal) {
        setHasUnreadProposal(true);
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "تعذر الاتصال بالمساعد الإعلاني."
      );
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleApplyChatProposal = (proposal: ScriptProposal) => {
    setScriptMode(proposal.scriptMode);
    if (proposal.scriptMode === "dialogue") {
      if (proposal.dialogueHookA) setDialogueHookA(proposal.dialogueHookA);
      if (proposal.dialogueHookB) setDialogueHookB(proposal.dialogueHookB);
      if (proposal.dialogueBodyA) setDialogueBodyA(proposal.dialogueBodyA);
      if (proposal.dialogueBodyB) setDialogueBodyB(proposal.dialogueBodyB);
      if (proposal.dialogueCtaB) setDialogueCtaB(proposal.dialogueCtaB);
    } else {
      if (proposal.hook) setHookText(proposal.hook);
      if (proposal.body) setBodyText(proposal.body);
      if (proposal.cta) setCtaText(proposal.cta);
    }
    setHasUnreadProposal(false);
    setActiveTab("preview");
    window.setTimeout(() => {
      document.getElementById("script-studio")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const handleGenerateAudio = async () => {
    if (fullScript.trim().length < 5) {
      setErrorMsg("يرجى كتابة نص الإعلان أولاً.");
      return;
    }

    setErrorMsg(null);
    setIsGeneratingAudio(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 45000);

    try {
      const payload =
        scriptMode === "dialogue"
          ? {
              scriptMode: "dialogue",
              voiceName: selectedVoice,
              secondVoiceName: secondVoice,
              deliveryStyle,
              dialectId: selectedDialectId,
              dialogueTurns: [
                { speaker: "SpeakerA", text: dialogueHookA },
                { speaker: "SpeakerB", text: dialogueHookB },
                { speaker: "SpeakerA", text: dialogueBodyA },
                {
                  speaker: "SpeakerB",
                  text: `${dialogueBodyB} ${dialogueCtaB}`.trim(),
                },
              ],
            }
          : {
              scriptMode: "solo",
              script: fullScript,
              voiceName: selectedVoice,
              deliveryStyle,
              dialectId: selectedDialectId,
            };

      const res = await fetch("/api/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(payload),
      });

      const rawText = await res.text();
      let data: {
        error?: string;
        audioBase64?: string;
        mimeType?: string;
      } = {};
      try {
        data = rawText ? (JSON.parse(rawText) as typeof data) : {};
      } catch {
        throw new Error(
          res.ok
            ? "استجابة صوتية غير صالحة من الخادم."
            : `تعذر الوصول لخدمة توليد الصوت (HTTP ${res.status}). يرجى المحاولة مرة أخرى.`
        );
      }

      if (!res.ok) {
        throw new Error(data.error || "حدث خطأ أثناء توليد الصوت.");
      }

      if (!data.audioBase64) {
        throw new Error("لم يتم استلام بيانات صوتية من الخادم. حاول مرة أخرى.");
      }

      const { blob, url, durationEst } = base64ToWavBlob(
        data.audioBase64,
        data.mimeType || "audio/wav"
      );
      const voiceObj = VOICE_PERSONAS.find((v) => v.id === selectedVoice);
      const secondVoiceObj = VOICE_PERSONAS.find((v) => v.id === secondVoice);
      const deliveryObj = DELIVERY_STYLES.find((d) => d.id === deliveryStyle);

      const newTake: GeneratedTake = {
        id: `take-${Date.now()}`,
        createdAt: Date.now(),
        scriptMode,
        voiceId: selectedVoice,
        voiceName: voiceObj?.name ?? selectedVoice,
        secondVoiceId: scriptMode === "dialogue" ? secondVoice : undefined,
        secondVoiceName:
          scriptMode === "dialogue"
            ? secondVoiceObj?.name ?? secondVoice
            : undefined,
        dialectId: selectedDialectId,
        dialectLabel: selectedDialect.dialectLabel,
        deliveryStyle,
        deliveryLabel: deliveryObj?.label ?? deliveryStyle,
        script: fullScript,
        hookText:
          scriptMode === "dialogue"
            ? `${dialogueHookA}\n${dialogueHookB}`.trim()
            : hookText,
        bodyText:
          scriptMode === "dialogue"
            ? `${dialogueBodyA}\n${dialogueBodyB}`.trim()
            : bodyText,
        ctaText: scriptMode === "dialogue" ? dialogueCtaB : ctaText,
        audioUrl: url,
        mimeType: data.mimeType || "audio/wav",
        durationSec: durationEst,
      };

      setTakes((prev) => [newTake, ...prev]);
      setActiveTakeId(newTake.id);
      await saveTakeToDb(newTake, blob);

      if (activeTab === "preview") {
        window.setTimeout(() => {
          document.getElementById("player-deck")?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }, 120);
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setErrorMsg("استغرق الخادم وقتاً طويلاً للرد. حاول مرة أخرى.");
      } else {
        setErrorMsg(
          err instanceof Error
            ? err.message
            : "تعذر توليد الصوت حالياً. حاول مرة أخرى."
        );
      }
    } finally {
      window.clearTimeout(timeoutId);
      setIsGeneratingAudio(false);
    }
  };

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(fullScript);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } catch {
      setErrorMsg("تعذر نسخ النص تلقائياً، يمكنك تحديده ونسخه يدوياً.");
    }
  };

  const handleToggleHistoryPlay = (take: GeneratedTake) => {
    if (playingHistoryId === take.id && historyAudioRef.current) {
      historyAudioRef.current.pause();
      setPlayingHistoryId(null);
      return;
    }

    if (historyAudioRef.current) {
      historyAudioRef.current.pause();
    }

    const audio = new Audio(take.audioUrl);
    historyAudioRef.current = audio;
    audio.onended = () => setPlayingHistoryId(null);
    audio.play().then(
      () => setPlayingHistoryId(take.id),
      () => setPlayingHistoryId(null)
    );
  };

  const handleDeleteTake = async (id: string) => {
    setTakes((prev) => {
      const target = prev.find((t) => t.id === id);
      if (target) {
        URL.revokeObjectURL(target.audioUrl);
      }
      const next = prev.filter((t) => t.id !== id);
      if (activeTakeId === id) {
        setActiveTakeId(next[0]?.id ?? null);
      }
      return next;
    });
    await deleteTakeFromDb(id);
  };

  const handleSwitchTab = (tab: StudioTab) => {
    setActiveTab(tab);
    if (tab === "chat") {
      setHasUnreadProposal(false);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#F1F5F9] pb-20">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="border-b border-white/8 bg-[#0B0E14]/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-8 px-6 py-4">
          <a
            href="#top"
            dir="ltr"
            onClick={(e) => {
              e.preventDefault();
              handleSwitchTab("preview");
            }}
            className="font-display text-lg font-extrabold tracking-tight text-slate-100 whitespace-nowrap shrink-0"
          >
            Hamza Ads
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <button
              type="button"
              onClick={() => handleNavSection("dialect-studio")}
              className="hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              اللهجات واللغات
            </button>
            <button
              type="button"
              onClick={() => handleNavSection("script-studio")}
              className="hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              تخصيص الإعلان
            </button>
            <button
              type="button"
              onClick={() => handleNavSection("voice-studio")}
              className="hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              الأصوات والماسترينج
            </button>
            <button
              type="button"
              onClick={() => handleNavSection("takes-history")}
              className="hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              سجل التسجيلات
            </button>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleGenerateAudio}
              disabled={isGeneratingAudio}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-amber-400 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Mic className="h-4 w-4" />
              <span>{isGeneratingAudio ? "جاري التسجيل..." : "توليد الصوت"}</span>
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-[1280px] px-6 py-8">
        {/* Studio Console Header + Instant Live Counter */}
        <section className="mb-8 border-b border-white/8 pb-7">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div className="max-w-3xl">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>Hamza Ads Studio</span>
                <span aria-hidden="true">·</span>
                <span>جميع اللهجات العربية</span>
                <span aria-hidden="true">·</span>
                <span>English · Français · Italiano</span>
                <span aria-hidden="true">·</span>
                <span>معلّق منفرد أو حوار ثنائي</span>
                <span aria-hidden="true">·</span>
                <span>موسيقى خلفية + ماسترينج + SRT</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-100 leading-snug text-balance">
                استوديو Hamza Ads المتكامل لإعلانات الصوت والمونتاج
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-400 leading-relaxed">
                صمّم سكريبت إعلانك بأي لهجة عربية أو لغة عالمية بصوت منفرد أو حوار ثنائي مشوق، أضف موسيقى خلفية وطبّق تحسين البث الإذاعي لنقاء الصوت، وحمّل الملف النهائي WAV مع ملف الترجمة SRT جاهزاً للمونتاج.
              </p>
            </div>

            {/* Instant Live Counter */}
            <div className="flex items-center gap-6 text-xs text-slate-400 shrink-0 tabular-nums">
              <div>
                <div className="text-slate-500">النمط</div>
                <div className="mt-0.5 font-semibold text-slate-200">
                  {scriptMode === "dialogue" ? "حوار ثنائي" : "معلّق منفرد"}
                </div>
              </div>
              <div className="h-8 w-px bg-white/10" aria-hidden="true" />
              <div>
                <div className="text-slate-500">عدد الكلمات</div>
                <div className="mt-0.5 font-mono text-base font-semibold text-slate-200">
                  {totalWords} كلمة
                </div>
              </div>
              <div className="h-8 w-px bg-white/10" aria-hidden="true" />
              <div>
                <div className="text-slate-500">المدة التقريبية</div>
                <div className="mt-0.5 font-mono text-base font-semibold text-amber-400">
                  ~{estimatedSeconds} ثانية
                </div>
              </div>
            </div>
          </div>
        </section>

        {errorMsg && (
          <div
            role="alert"
            className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-500/30 bg-red-950/30 px-5 py-3.5 text-sm text-red-200"
          >
            <span className="break-words min-w-0">{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-xs text-red-300 hover:text-white underline cursor-pointer shrink-0"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* Language & Dialect Bar across Egypt, Gulf & Yemen, Maghreb, Levant & Iraq + EN/FR/IT */}
        <section
          id="dialect-studio"
          className="mb-8 rounded-xl border border-white/10 bg-[#131722] p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <Globe className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <h2 className="font-display text-base font-bold text-slate-100">
                  اللغة والدولة واللهجة المطلوبة
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  المختار حالياً:{" "}
                  <span className="text-amber-300 font-semibold">
                    {selectedDialect.flag} {selectedDialect.countryLabel} —{" "}
                    {selectedDialect.dialectLabel}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleGenerateScript("adapt")}
              disabled={isGeneratingScript}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/20 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isGeneratingScript ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Languages className="h-3.5 w-3.5" />
              )}
              <span>
                ترجمة وصياغة النص الحالي بـ {selectedDialect.dialectLabel}
              </span>
            </button>
          </div>

          {/* 7 Quick Dialect & Language Categories */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 p-1 rounded-lg bg-[#0B0E14] border border-white/8 mb-4">
            {QUICK_DIALECT_CATEGORIES.map((cat) => {
              const active = activeQuickCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectQuickCategory(cat.id)}
                  className={`rounded-md px-3 py-2 text-xs font-medium transition-colors text-center truncate cursor-pointer ${
                    active
                      ? "bg-[#1B202E] text-amber-400 font-semibold border border-amber-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {regionDialects.map((opt) => {
              const active = selectedDialectId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectDialectOption(opt.id)}
                  className={`rounded-lg border px-3 py-2.5 text-right transition-colors cursor-pointer ${
                    active
                      ? "border-amber-500/60 bg-amber-500/12 text-amber-300"
                      : "border-white/8 bg-[#0B0E14] text-slate-300 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold truncate">
                    <span aria-hidden="true" className="text-sm leading-none shrink-0">
                      {opt.flag}
                    </span>
                    <span className="truncate">{opt.countryLabel}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-400 truncate">
                    {opt.dialectLabel}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Active View Routing: Chat | Preview | Artifacts */}
        {activeTab === "chat" && (
          <ChatView
            messages={chatMessages}
            onSendMessage={handleSendChatMessage}
            isSending={isSendingChat}
            selectedDialect={selectedDialect}
            scriptMode={scriptMode}
            onChangeScriptMode={setScriptMode}
            platformTarget={platformTarget}
            onApplyProposal={handleApplyChatProposal}
          />
        )}

        {activeTab === "artifacts" && (
          <ArtifactsView
            takes={takes}
            activeTake={activeTake}
            onSelectTake={(id) => setActiveTakeId(id)}
            onDeleteTake={handleDeleteTake}
            onGoToPreview={() => handleSwitchTab("preview")}
            onGenerateAudio={handleGenerateAudio}
            isGeneratingAudio={isGeneratingAudio}
            currentScriptSegments={currentScriptSegments}
            currentEstimatedSeconds={estimatedSeconds}
            currentDialectId={selectedDialectId}
            mastering={mastering}
            onChangeMastering={setMastering}
            musicId={musicId}
            onChangeMusicId={setMusicId}
            musicVolume={musicVolume}
            onChangeMusicVolume={setMusicVolume}
            customMusicUrl={customMusicUrl}
            customMusicName={customMusicName}
            onUploadCustomMusic={handleUploadCustomMusic}
            onClearCustomMusic={handleClearCustomMusic}
          />
        )}

        {activeTab === "preview" && (
          <>
            {/* Primary 12-Column Studio Workbench */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Script & Ad Builder (7 cols) */}
              <section
                id="script-studio"
                className="lg:col-span-7 rounded-xl border border-white/10 bg-[#131722] p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="font-display text-lg font-bold text-slate-100">
                      1. إعداد وتخصيص سكريبت الإعلان
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      اختر نمط الإعلان (معلّق منفرد أو حوار ثنائي) ثم حدد المجال والمنصة
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Solo vs Dual-Speaker Switch */}
                    <div className="flex items-center rounded-lg border border-white/10 bg-[#0B0E14] p-0.5">
                      <button
                        type="button"
                        onClick={() => setScriptMode("solo")}
                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                          scriptMode === "solo"
                            ? "bg-[#1B202E] text-amber-400 font-semibold"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <User className="h-3.5 w-3.5" />
                        <span>معلّق منفرد</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setScriptMode("dialogue")}
                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                          scriptMode === "dialogue"
                            ? "bg-[#1B202E] text-amber-400 font-semibold"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Users className="h-3.5 w-3.5" />
                        <span>حوار ثنائي</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyScript}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#1B202E] px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {copiedScript ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-300">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Category Tabs (All Ad Industries) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-1 rounded-lg bg-[#0B0E14] border border-white/8 mb-4">
                  {AD_CATEGORIES.map((category) => {
                    const active = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleSelectCategory(category.id)}
                        className={`rounded-md px-3 py-2 text-xs font-medium transition-colors text-center truncate cursor-pointer ${
                          active
                            ? "bg-[#1B202E] text-amber-400 font-semibold border border-amber-500/30"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {category.label}
                      </button>
                    );
                  })}
                </div>

                {/* Platform Target Pacing Bar */}
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-[#0B0E14] border border-white/8 mb-5">
                  {PLATFORM_TARGETS.map((plat) => {
                    const active = platformTarget === plat.id;
                    return (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => setPlatformTarget(plat.id)}
                        className={`rounded-md px-2.5 py-1.5 text-xs transition-colors text-center truncate cursor-pointer ${
                          active
                            ? "bg-[#1B202E] text-slate-100 font-semibold"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span>{plat.label}</span>
                        <span className="hidden sm:inline text-[11px] text-slate-500 mr-1.5">
                          ({plat.targetDuration})
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Ad Brief Generator Controls */}
                <div className="mb-6 pb-6 border-b border-white/8 space-y-4">
                  <div>
                    <label
                      htmlFor="ad-topic"
                      className="block text-xs font-medium text-slate-300 mb-1.5"
                    >
                      فكرة الإعلان أو تفاصيل المنتج / الخدمة
                    </label>
                    <input
                      id="ad-topic"
                      type="text"
                      value={adTopic}
                      onChange={(e) => setAdTopic(e.target.value)}
                      placeholder="مثال: براند عطور فاخرة خصم 30% بمناسبة العيد، أو مطعم مشويات..."
                      className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-amber-500/60 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="brand-name"
                        className="block text-xs font-medium text-slate-400 mb-1.5"
                      >
                        اسم البراند أو الصفحة (اختياري)
                      </label>
                      <input
                        id="brand-name"
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="مثال: Hamza Store"
                        className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-amber-500/60 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="cta-target"
                        className="block text-xs font-medium text-slate-400 mb-1.5"
                      >
                        العميل يتواصل فين في آخر الإعلان؟
                      </label>
                      <input
                        id="cta-target"
                        type="text"
                        value={ctaTarget}
                        onChange={(e) => setCtaTarget(e.target.value)}
                        placeholder="مثال: الواتساب اللي قدامك ده / اللينك في البايو"
                        className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-amber-500/60 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0B0E14] border border-white/8">
                      {AD_ANGLES.map((angle) => {
                        const active = selectedAngle === angle.id;
                        return (
                          <button
                            key={angle.id}
                            type="button"
                            onClick={() => setSelectedAngle(angle.id)}
                            className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                              active
                                ? "bg-[#1B202E] text-amber-400 font-semibold"
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            {angle.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleGenerateScript("polish")}
                        disabled={isGeneratingScript}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#1B202E] px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
                        <span>ضبط الوقفات والنطق</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenerateScript("fresh")}
                        disabled={isGeneratingScript}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/20 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {isGeneratingScript ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {scriptMode === "dialogue"
                            ? `توليد حوار ثنائي (${selectedDialect.countryLabel})`
                            : `توليد سكريبت احترافي (${selectedDialect.countryLabel})`}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Script Editor: Solo OR Dual-Speaker */}
                {scriptMode === "solo" ? (
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="hook-input"
                          className="text-sm font-semibold text-slate-200"
                        >
                          أولاً: الهوك والتشويق (بداية الإعلان)
                        </label>
                        <span className="text-xs text-amber-400/90 tabular-nums">
                          ~{estimateSpeechSeconds(hookText)} ثواني
                        </span>
                      </div>
                      <textarea
                        id="hook-input"
                        dir={selectedDialect.dir}
                        rows={3}
                        value={hookText}
                        onChange={(e) => setHookText(e.target.value)}
                        placeholder="اكتب جملة البداية المشوقة..."
                        className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-4 py-3 text-sm sm:text-base text-slate-100 leading-relaxed placeholder:text-slate-600 focus:border-amber-500/60 focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="body-input"
                          className="text-sm font-semibold text-slate-200"
                        >
                          ثانياً: العرض وتفاصيل المنتج أو الخدمة
                        </label>
                        <span className="text-xs text-slate-400 tabular-nums">
                          ~{estimateSpeechSeconds(bodyText)} ثانية
                        </span>
                      </div>
                      <textarea
                        id="body-input"
                        dir={selectedDialect.dir}
                        rows={3}
                        value={bodyText}
                        onChange={(e) => setBodyText(e.target.value)}
                        placeholder="اكتب مميزات عرضك أو خدمتك..."
                        className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-4 py-3 text-sm sm:text-base text-slate-100 leading-relaxed placeholder:text-slate-600 focus:border-amber-500/60 focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="cta-input"
                          className="text-sm font-semibold text-slate-200"
                        >
                          ثالثاً: الختام والدعوة لاتخاذ إجراء (Call to Action)
                        </label>
                        <span className="text-xs text-emerald-400/90 tabular-nums">
                          ~{estimateSpeechSeconds(ctaText)} ثواني
                        </span>
                      </div>
                      <textarea
                        id="cta-input"
                        dir={selectedDialect.dir}
                        rows={2}
                        value={ctaText}
                        onChange={(e) => setCtaText(e.target.value)}
                        placeholder="مستني إيه؟ كلمنا دلوقتي..."
                        className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-4 py-3 text-sm sm:text-base text-slate-100 leading-relaxed placeholder:text-slate-600 focus:border-amber-500/60 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="dlg-hook-a"
                          className="block text-xs font-semibold text-amber-300 mb-1.5"
                        >
                          المتحدث الأول · الهوك / المشكلة
                        </label>
                        <textarea
                          id="dlg-hook-a"
                          dir={selectedDialect.dir}
                          rows={2}
                          value={dialogueHookA}
                          onChange={(e) => setDialogueHookA(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-3.5 py-2.5 text-sm text-slate-100 leading-relaxed focus:border-amber-500/60 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="dlg-hook-b"
                          className="block text-xs font-semibold text-emerald-300 mb-1.5"
                        >
                          المتحدث الثاني · رد مشوّق
                        </label>
                        <textarea
                          id="dlg-hook-b"
                          dir={selectedDialect.dir}
                          rows={2}
                          value={dialogueHookB}
                          onChange={(e) => setDialogueHookB(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-3.5 py-2.5 text-sm text-slate-100 leading-relaxed focus:border-amber-500/60 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="dlg-body-a"
                          className="block text-xs font-semibold text-amber-300 mb-1.5"
                        >
                          المتحدث الأول · سؤال العميل
                        </label>
                        <textarea
                          id="dlg-body-a"
                          dir={selectedDialect.dir}
                          rows={3}
                          value={dialogueBodyA}
                          onChange={(e) => setDialogueBodyA(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-3.5 py-2.5 text-sm text-slate-100 leading-relaxed focus:border-amber-500/60 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="dlg-body-b"
                          className="block text-xs font-semibold text-emerald-300 mb-1.5"
                        >
                          المتحدث الثاني · الحل والعرض
                        </label>
                        <textarea
                          id="dlg-body-b"
                          dir={selectedDialect.dir}
                          rows={3}
                          value={dialogueBodyB}
                          onChange={(e) => setDialogueBodyB(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-3.5 py-2.5 text-sm text-slate-100 leading-relaxed focus:border-amber-500/60 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="dlg-cta-b"
                        className="block text-xs font-semibold text-emerald-300 mb-1.5"
                      >
                        المتحدث الثاني · الختام والدعوة للتواصل (CTA)
                      </label>
                      <textarea
                        id="dlg-cta-b"
                        dir={selectedDialect.dir}
                        rows={2}
                        value={dialogueCtaB}
                        onChange={(e) => setDialogueCtaB(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-3.5 py-2.5 text-sm text-slate-100 leading-relaxed focus:border-amber-500/60 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* Voice Persona & Audio Output Studio (5 cols) */}
              <aside className="lg:col-span-5 space-y-6">
                <section
                  id="voice-studio"
                  className="rounded-xl border border-white/10 bg-[#131722] p-6"
                >
                  <h2 className="font-display text-lg font-bold text-slate-100 mb-1">
                    2. اختيار {scriptMode === "dialogue" ? "الأصوات" : "الصوت"} وأسلوب الإلقاء
                  </h2>
                  <p className="text-xs text-slate-400 mb-5">
                    الأداء مضبوط بلكنة:{" "}
                    <span className="text-amber-300">{selectedDialect.dialectLabel}</span>
                  </p>

                  {/* Speaker A Selection */}
                  <div className="mb-4">
                    {scriptMode === "dialogue" && (
                      <div className="text-xs font-semibold text-amber-300 mb-2">
                        صوت المتحدث الأول (السائل / المشوّق)
                      </div>
                    )}
                    <div className="space-y-2">
                      {VOICE_PERSONAS.map((voice) => {
                        const isSelected = selectedVoice === voice.id;
                        return (
                          <button
                            key={voice.id}
                            type="button"
                            onClick={() => setSelectedVoice(voice.id)}
                            className={`w-full text-right rounded-lg border p-3 transition-colors cursor-pointer ${
                              isSelected
                                ? "border-amber-500/60 bg-amber-500/10"
                                : "border-white/8 bg-[#0B0E14] hover:border-white/20"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`text-sm font-semibold ${
                                  isSelected ? "text-amber-300" : "text-slate-100"
                                }`}
                              >
                                {voice.name}
                              </span>
                              <span className="text-xs text-slate-400 shrink-0">
                                {voice.genderLabel} · {voice.toneLabel}
                              </span>
                            </div>
                            {scriptMode === "solo" && (
                              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                                {voice.description}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Speaker B Selection in Dialogue Mode */}
                  {scriptMode === "dialogue" && (
                    <div className="mb-5 pt-4 border-t border-white/8">
                      <div className="text-xs font-semibold text-emerald-300 mb-2">
                        صوت المتحدث الثاني (الخبير / مقدّم العرض)
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {VOICE_PERSONAS.map((voice) => {
                          const isSelected = secondVoice === voice.id;
                          return (
                            <button
                              key={voice.id}
                              type="button"
                              onClick={() => setSecondVoice(voice.id)}
                              className={`text-right rounded-lg border px-3 py-2 transition-colors cursor-pointer ${
                                isSelected
                                  ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200"
                                  : "border-white/8 bg-[#0B0E14] text-slate-300 hover:border-white/20"
                              }`}
                            >
                              <div className="text-xs font-semibold truncate">
                                {voice.name}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Delivery Direction */}
                  <div className="mb-6">
                    <label className="block text-xs font-medium text-slate-300 mb-2">
                      إيقاع وطريقة الإلقاء
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-[#0B0E14] border border-white/8">
                      {DELIVERY_STYLES.map((style) => {
                        const active = deliveryStyle === style.id;
                        return (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => setDeliveryStyle(style.id)}
                            className={`rounded-md px-2 py-2 text-xs font-medium transition-colors text-center truncate cursor-pointer ${
                              active
                                ? "bg-[#1B202E] text-amber-400 font-semibold"
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            {style.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      {DELIVERY_STYLES.find((d) => d.id === deliveryStyle)?.hint}
                    </p>
                  </div>

                  {/* Primary Studio Render Button */}
                  <button
                    type="button"
                    onClick={handleGenerateAudio}
                    disabled={isGeneratingAudio}
                    className="w-full inline-flex items-center justify-center gap-2.5 rounded-lg bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-amber-400 cursor-pointer"
                  >
                    {isGeneratingAudio ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>جاري تسجيل الصوت ({selectedDialect.countryLabel})...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4" />
                        <span>
                          {scriptMode === "dialogue"
                            ? `توليد الصوت (حوار ثنائي · ${selectedDialect.countryLabel})`
                            : `توليد الصوت (${selectedDialect.countryLabel})`}
                        </span>
                      </>
                    )}
                  </button>
                </section>

                {/* Audio Player, Broadcast Mastering, Background Music & WAV + SRT Export Deck */}
                <section id="player-deck">
                  <WaveformPlayer
                    take={activeTake}
                    isGenerating={isGeneratingAudio}
                    onGenerateClick={handleGenerateAudio}
                    mastering={mastering}
                    onChangeMastering={setMastering}
                    musicId={musicId}
                    onChangeMusicId={setMusicId}
                    musicVolume={musicVolume}
                    onChangeMusicVolume={setMusicVolume}
                    customMusicUrl={customMusicUrl}
                    customMusicName={customMusicName}
                    onUploadCustomMusic={handleUploadCustomMusic}
                    onClearCustomMusic={handleClearCustomMusic}
                  />
                </section>
              </aside>
            </div>

            {/* Persistent Session Takes History */}
            <section
              id="takes-history"
              className="mt-10 pt-8 border-t border-white/8"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-100">
                    سجل التسجيلات الصوتية ({takes.length})
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    محفوظ تلقائياً على جهازك للمقارنة وإعادة الماسترينج وتصدير WAV و SRT في أي وقت
                  </p>
                </div>
              </div>

              {takes.length === 0 ? (
                <div className="rounded-xl border border-white/8 bg-[#131722]/50 px-6 py-8 text-center text-sm text-slate-400">
                  لم يتم توليد أي تسجيلات بعد. اختر اللهجة أو اللغة واضغط على «توليد الصوت» وسيتم حفظ كل تسجيل هنا تلقائياً.
                </div>
              ) : (
                <div className="divide-y divide-white/8 rounded-xl border border-white/10 bg-[#131722] overflow-hidden">
                  {takes.map((take) => {
                    const isActive = activeTake?.id === take.id;
                    const isRowPlaying = playingHistoryId === take.id;
                    return (
                      <div
                        key={take.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 transition-colors ${
                          isActive ? "bg-amber-500/[0.06]" : "hover:bg-white/[0.02]"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveTakeId(take.id)}
                              className="text-sm font-semibold text-slate-100 hover:text-amber-400 transition-colors cursor-pointer"
                            >
                              {take.scriptMode === "dialogue" && take.secondVoiceName
                                ? `حوار: ${take.voiceName.split("—")[0].trim()} × ${take.secondVoiceName
                                    .split("—")[0]
                                    .trim()}`
                                : take.voiceName}
                            </button>
                            <span className="text-xs text-slate-400">
                              · {take.dialectLabel} · {take.deliveryLabel} ·{" "}
                              <span className="font-mono tabular-nums">
                                ~{Math.round(take.durationSec)} ثانية
                              </span>
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-400 truncate max-w-2xl">
                            {take.script}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTakeId(take.id);
                              handleSwitchTab("artifacts");
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#0B0E14] px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-amber-300 cursor-pointer"
                          >
                            المونتاج و SRT
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleHistoryPlay(take)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#1B202E] px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 cursor-pointer"
                          >
                            {isRowPlaying ? (
                              <>
                                <Pause className="h-3.5 w-3.5 text-amber-400" />
                                <span>إيقاف</span>
                              </>
                            ) : (
                              <>
                                <Play className="h-3.5 w-3.5 text-amber-400" />
                                <span>استماع</span>
                              </>
                            )}
                          </button>

                          <a
                            href={take.audioUrl}
                            download={`hamza-ads-${take.dialectId}-${take.voiceId.toLowerCase()}.wav`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>تحميل WAV</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDeleteTake(take.id)}
                            aria-label="حذف التسجيل"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#0B0E14] text-slate-400 hover:text-red-400 hover:border-red-500/30 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Studio Footer */}
      <footer className="mt-14 border-t border-white/10 bg-[#080A0F]">
        <div className="mx-auto max-w-[1280px] px-6 py-7">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm font-bold text-slate-100">
              <span dir="ltr" className="text-amber-400">Hamza Ads</span>
              <span className="text-slate-500" aria-hidden="true">·</span>
              <span className="text-xs sm:text-sm font-normal text-slate-400">
                جميع الحقوق محفوظة © {new Date().getFullYear()} Hamza Ads Studio
              </span>
            </div>
            <div className="text-xs text-slate-400">
              استوديو إعلانات الصوت والموسيقى الخلفية والترجمة SRT
            </div>
          </div>
        </div>
      </footer>

      {/* Persistent Bottom Navigation: Chat · Preview · Artifacts */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={handleSwitchTab}
        takesCount={takes.length}
        hasUnreadProposal={hasUnreadProposal}
      />
    </div>
  );
}
