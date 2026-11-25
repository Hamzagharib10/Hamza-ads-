import "dotenv/config";
import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

// ---------------------------------------------------------------------------
// Gemini — used ONLY for script writing (/api/script/generate, /api/script/chat).
// Voice generation moved to ElevenLabs (see below). The app stays usable
// without GEMINI_API_KEY: script buttons fail gracefully in Arabic and the
// user can type the script manually.
// ---------------------------------------------------------------------------
function getAiClient(apiVersion?: string): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please configure it in the Secrets panel.");
  }
  return new GoogleGenAI({
    apiKey,
    ...(apiVersion ? { apiVersion } : {}),
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function formatFriendlyGeminiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes("GEMINI_API_KEY is missing")) {
    return {
      status: 500,
      message:
        "مفتاح Gemini (GEMINI_API_KEY) غير مفعّل على الخادم — توليد السكريبت غير متاح، ويمكنك كتابة السكريبت يدوياً.",
    };
  }
  if (raw.includes("429") || raw.includes("RESOURCE_EXHAUSTED") || raw.toLowerCase().includes("quota")) {
    return { status: 429, message: "تم بلوغ حد طلبات Gemini. جرب لاحقاً." };
  }
  if (raw.includes("403") || raw.includes("PERMISSION_DENIED") || raw.includes("API_KEY_INVALID")) {
    return { status: 403, message: "مفتاح Gemini API غير صالح أو لا يملك صلاحية التشغيل." };
  }
  return { status: 500, message: raw || "تعذر توليد السكريبت حالياً." };
}

// ---------------------------------------------------------------------------
// ElevenLabs TTS — the only voice engine now.
// Voice names shown in the UI (Charon, Fenrir, ...) are kept as-is; the
// server maps each name to its ElevenLabs voice_id. Verified 2026-11-25:
// voices list + TTS call work with these IDs (model eleven_multilingual_v2).
// ---------------------------------------------------------------------------
const ELEVENLABS_MODEL = "eleven_multilingual_v2";
const ELEVENLABS_OUTPUT_FORMAT = "mp3_44100_128";

const ELEVEN_VOICE_IDS: Record<string, string> = {
  Charon: "nPczCjzI2devNBz1zQrb", // Brian — deep dramatic male
  Fenrir: "cjVigY5qzO86Huf0OWal", // Eric — mature trustworthy male
  Puck: "TX3LPaxmHKxFdv7VOQHJ", // Liam — energetic young male
  Kore: "EXAVITQu4vr4xnSDxMaL", // Sarah — warm female
  Zephyr: "Xb7hH8MSUJpSbSDYk0k2", // Alice — smooth friendly female
};
const ELEVEN_FALLBACK_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"; // George

const VALID_VOICES = new Set(Object.keys(ELEVEN_VOICE_IDS));

function getElevenLabsKey(): string {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is missing");
  }
  return apiKey;
}

function elevenVoiceId(voiceName: string): string {
  return ELEVEN_VOICE_IDS[voiceName] ?? ELEVEN_FALLBACK_VOICE_ID;
}

function formatFriendlyTtsError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes("ELEVENLABS_API_KEY is missing")) {
    return { status: 500, message: "مفتاح ElevenLabs غير مفعّل على الخادم." };
  }
  if (raw.includes("429") || raw.toLowerCase().includes("quota") || raw.includes("quota_exceeded")) {
    return {
      status: 429,
      message:
        "تم بلوغ حد ElevenLabs (الكوتا أو الحد اليومي). تحقق من رصيد حساب ElevenLabs وجرب لاحقاً.",
    };
  }
  if (
    raw.includes("401") ||
    raw.includes("403") ||
    raw.includes("missing_permissions") ||
    raw.includes("text_to_speech")
  ) {
    return {
      status: 403,
      message: "مفتاح ElevenLabs غير صالح أو بلا صلاحية Text to Speech.",
    };
  }
  return { status: 500, message: raw || "حدث خطأ غير متوقع أثناء توليد الصوت." };
}

async function elevenLabsTts(
  voiceId: string,
  text: string,
  signal: AbortSignal
): Promise<Buffer> {
  const apiKey = getElevenLabsKey();
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${ELEVENLABS_OUTPUT_FORMAT}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({ text, model_id: ELEVENLABS_MODEL }),
    signal,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ElevenLabs ${res.status}: ${body.slice(0, 500)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

const DELIVERY_STYLE_DIRECTIONS: Record<string, string> = {
  suspense:
    "Start the opening hook with intense dramatic suspense, intrigue, and deliberate pacing to stop the listener scrolling. Transition smoothly into a confident, persuasive middle offer, and finish with an urgent, warm, high-converting call-to-action.",
  reels:
    "Punchy, high-energy social media ad pacing. Hit the opening hook fast with strong curiosity and urgency, keep momentum brisk and crisp through the middle offer, and land the final call-to-action with exciting momentum.",
  authority:
    "Measured, calm, expert authority. Open with a serious, relatable hook that grabs attention without shouting, explain the offer with reassuring certainty, and close firmly and warmly.",
};

const DIALECT_TTS_DIRECTIONS: Record<
  string,
  { ttsStyle: string; scriptTarget: string }
> = {
  "ar-EG": {
    ttsStyle:
      "Authentic Egyptian colloquial Arabic (Masri / Cairo dialect — اللهجة العامية المصرية الأصيلة). Use natural Cairo pronunciation (hard Egyptian 'g' for ج, authentic Egyptian vowel rhythm and conversational cadence). Never sound like stiff MSA.",
    scriptTarget: "اللهجة العامية المصرية القاهرية الأصيلة الطبيعية 100%",
  },
  "ar-SD": {
    ttsStyle:
      "Authentic Sudanese Arabic dialect (اللهجة السودانية الأصيلة). Warm, natural Khartoum pronunciation and authentic Sudanese rhythm.",
    scriptTarget: "اللهجة السودانية الدارجة الأصيلة المفهومة والطبيعية",
  },
  "ar-MSA": {
    ttsStyle:
      "Clear, modern, broadcast-grade Modern Standard Arabic (العربية الفصحى الإعلانية المعاصرة). Crisp commercial articulation across the entire Arab world.",
    scriptTarget: "العربية الفصحى الإعلانية الحديثة السلسة والمؤثرة",
  },
  "ar-SO": {
    ttsStyle:
      "Clear, warm Modern Standard Arabic commercial voice tailored for Somali Arab audience, natural broadcast cadence.",
    scriptTarget: "العربية الفصحى الإعلانية الميسرة والمناسبة للجمهور الصومالي",
  },
  "ar-DJ": {
    ttsStyle:
      "Clear, warm Modern Standard Arabic commercial voice tailored for Djibouti audience, crisp broadcast cadence.",
    scriptTarget: "العربية الفصحى الإعلانية الميسرة والمناسبة لجمهور جيبوتي",
  },
  "ar-KM": {
    ttsStyle:
      "Clear, warm Modern Standard Arabic commercial voice tailored for Comoros audience, crisp broadcast cadence.",
    scriptTarget: "العربية الفصحى الإعلانية الميسرة والمناسبة لجمهور جزر القمر",
  },
  "ar-SA": {
    ttsStyle:
      "Authentic Saudi Arabian colloquial Arabic dialect (اللهجة السعودية النجدية والحجازية البيضاء). Genuine Riyadh/Jeddah commercial pronunciation, confident Gulf cadence.",
    scriptTarget: "اللهجة السعودية العامية الأصيلة القريبة والمقنعة",
  },
  "ar-AE": {
    ttsStyle:
      "Authentic Emirati Arabic dialect (اللهجة الإماراتية الخليجية). Polished, warm Dubai/Abu Dhabi commercial pronunciation and Gulf intonation.",
    scriptTarget: "اللهجة الإماراتية الأصيلة بأسلوب إعلاني راقٍ وجذاب",
  },
  "ar-KW": {
    ttsStyle:
      "Authentic Kuwaiti Arabic dialect (اللهجة الكويتية). Natural Kuwaiti Gulf pronunciation, warm conversational rhythm.",
    scriptTarget: "اللهجة الكويتية العامية الأصيلة والطبيعية",
  },
  "ar-QA": {
    ttsStyle:
      "Authentic Qatari Arabic dialect (اللهجة القطرية). Polished Qatari Gulf pronunciation and confident commercial delivery.",
    scriptTarget: "اللهجة القطرية الخليجية الأصيلة",
  },
  "ar-BH": {
    ttsStyle:
      "Authentic Bahraini Arabic dialect (اللهجة البحرينية). Warm Bahraini Gulf cadence and natural pronunciation.",
    scriptTarget: "اللهجة البحرينية الخليجية الأصيلة",
  },
  "ar-OM": {
    ttsStyle:
      "Authentic Omani Arabic dialect (اللهجة العُمانية). Respectful, warm Muscat Omani cadence and clear pronunciation.",
    scriptTarget: "اللهجة العُمانية الأصيلة بأسلوب دافئ ومقنع",
  },
  "ar-YE": {
    ttsStyle:
      "Authentic Yemeni Arabic dialect (اللهجة اليمنية البيضاء). Warm, expressive Yemeni pronunciation and natural commercial cadence.",
    scriptTarget: "اللهجة اليمنية الأصيلة الواضحة والجذابة",
  },
  "ar-LB": {
    ttsStyle:
      "Authentic Lebanese Arabic dialect (اللهجة اللبنانية). Natural Beirut Levantine pronunciation, melodic, stylish commercial warmth.",
    scriptTarget: "اللهجة اللبنانية العامية الأصيلة والجذابة",
  },
  "ar-SY": {
    ttsStyle:
      "Authentic Syrian Arabic dialect (اللهجة السورية الشامية). Natural Damascus Levantine pronunciation, warm persuasive storytelling tone.",
    scriptTarget: "اللهجة السورية الشامية الأصيلة القريبة من القلب",
  },
  "ar-JO": {
    ttsStyle:
      "Authentic Jordanian Arabic dialect (اللهجة الأردنية). Crisp Amman pronunciation, confident and friendly commercial delivery.",
    scriptTarget: "اللهجة الأردنية العامية الأصيلة والواضحة",
  },
  "ar-PS": {
    ttsStyle:
      "Authentic Palestinian Arabic dialect (اللهجة الفلسطينية). Warm, sincere Levantine Palestinian pronunciation and natural cadence.",
    scriptTarget: "اللهجة الفلسطينية الأصيلة الدافئة والمقنعة",
  },
  "ar-IQ": {
    ttsStyle:
      "Authentic Iraqi Arabic dialect (اللهجة العراقية البغدادية). Genuine Baghdad pronunciation, expressive warmth and persuasive Iraqi cadence.",
    scriptTarget: "اللهجة العراقية البغدادية الأصيلة والجذابة",
  },
  "ar-MA": {
    ttsStyle:
      "Authentic Moroccan Darija Arabic dialect (الدارجة المغربية الأصيلة). Natural Casablanca/Rabat Moroccan pronunciation and lively commercial rhythm.",
    scriptTarget: "الدارجة المغربية الأصيلة المفهومة والمؤثرة",
  },
  "ar-DZ": {
    ttsStyle:
      "Authentic Algerian Arabic dialect (اللهجة الجزائرية). Natural Algiers pronunciation and energetic Maghrebi commercial cadence.",
    scriptTarget: "اللهجة الجزائرية العامية الأصيلة والواضحة",
  },
  "ar-TN": {
    ttsStyle:
      "Authentic Tunisian Arabic dialect (اللهجة التونسية). Natural Tunis pronunciation, friendly and engaging commercial tone.",
    scriptTarget: "اللهجة التونسية العامية الأصيلة والجذابة",
  },
  "ar-LY": {
    ttsStyle:
      "Authentic Libyan Arabic dialect (اللهجة الليبية). Natural Tripoli Libyan pronunciation and confident commercial delivery.",
    scriptTarget: "اللهجة الليبية الأصيلة القريبة والمقنعة",
  },
  "ar-MR": {
    ttsStyle:
      "Authentic Mauritanian Hassaniya-flavored clear Arabic commercial voice (الحسانية الموريتانية الميسرة).",
    scriptTarget: "العربية الموريتانية الأصيلة الميسرة",
  },
  "en-US": {
    ttsStyle:
      "Native American English commercial voiceover artist. Crisp, high-converting US broadcast pronunciation, zero foreign accent, natural conversational pacing.",
    scriptTarget: "Native American English (punchy, high-converting commercial copy)",
  },
  "en-GB": {
    ttsStyle:
      "Native British English commercial voiceover artist (modern RP / London). Polished, articulate, trustworthy UK broadcast delivery.",
    scriptTarget: "Native British English (refined, persuasive commercial copy)",
  },
  "fr-FR": {
    ttsStyle:
      "Native Parisian French commercial voiceover artist (Français métropolitain). Smooth, expressive, persuasive French advertising cadence, authentic pronunciation.",
    scriptTarget: "Native French (Français publicitaire naturel et percutant)",
  },
  "it-IT": {
    ttsStyle:
      "Native Italian commercial voiceover artist (Italiano standard). Warm, expressive, energetic Italian advertising intonation and crisp pronunciation.",
    scriptTarget: "Native Italian (Italiano pubblicitario naturale e coinvolgente)",
  },
  "es-ES": {
    ttsStyle:
      "Native European Spanish commercial voiceover artist (Español de España). Crisp, energetic, persuasive Spanish advertising cadence and authentic Madrid pronunciation.",
    scriptTarget: "Native Spanish / Spain (Español publicitario natural y persuasivo)",
  },
};

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasElevenLabsKey: Boolean(process.env.ELEVENLABS_API_KEY),
  });
});

const ttsCache = new Map<
  string,
  { audioBase64: string; mimeType: string; model: string }
>();
const MAX_TTS_CACHE = 50;

app.post("/api/tts/generate", async (req, res) => {
  try {
    const {
      script,
      scriptMode,
      dialogueTurns,
      voiceName,
      secondVoiceName,
      deliveryStyle,
      dialectId,
    } = req.body ?? {};

    const isDialogue = scriptMode === "dialogue" && Array.isArray(dialogueTurns);

    if (!isDialogue && (typeof script !== "string" || script.trim().length < 5)) {
      res.status(400).json({ error: "يرجى كتابة نص الإعلان أولاً (5 أحرف على الأقل)." });
      return;
    }

    if (typeof script === "string" && script.trim().length > 2500) {
      res.status(400).json({ error: "النص طويل جداً، يرجى اختصاره لأقل من 2500 حرف." });
      return;
    }

    const selectedVoice =
      typeof voiceName === "string" && VALID_VOICES.has(voiceName) ? voiceName : "Charon";
    const selectedSecondVoice =
      typeof secondVoiceName === "string" && VALID_VOICES.has(secondVoiceName)
        ? secondVoiceName
        : selectedVoice === "Kore"
          ? "Charon"
          : "Kore";

    const selectedDelivery =
      typeof deliveryStyle === "string" && DELIVERY_STYLE_DIRECTIONS[deliveryStyle]
        ? deliveryStyle
        : "suspense";
    const selectedDialectKey =
      typeof dialectId === "string" && DIALECT_TTS_DIRECTIONS[dialectId]
        ? dialectId
        : "ar-MA";

    const cacheKey = JSON.stringify({
      isDialogue,
      selectedVoice,
      selectedSecondVoice,
      selectedDelivery,
      selectedDialectKey,
      text: isDialogue ? dialogueTurns : script?.trim(),
    });
    const cached = ttsCache.get(cacheKey);
    if (cached) {
      res.json({
        audioBase64: cached.audioBase64,
        mimeType: cached.mimeType,
        voiceName: selectedVoice,
        dialectId: selectedDialectKey,
        model: `${cached.model} (cached)`,
      });
      return;
    }

    // 45s total timeout for the whole TTS request (solo or all dialogue turns).
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    let audioBuffer: Buffer;
    try {
      if (isDialogue) {
        const cleanTurns = (dialogueTurns as Array<{ speaker?: string; text?: string }>)
          .filter((t) => typeof t?.text === "string" && t.text.trim().length > 0)
          .slice(0, 8);

        if (cleanTurns.length < 2) {
          clearTimeout(timeoutId);
          res.status(400).json({ error: "وضع الحوار الثنائي يتطلب سطرين على الأقل." });
          return;
        }

        const parts: Buffer[] = [];
        for (const turn of cleanTurns) {
          const isB = turn.speaker === "SpeakerB";
          const voiceId = elevenVoiceId(isB ? selectedSecondVoice : selectedVoice);
          parts.push(await elevenLabsTts(voiceId, turn.text!.trim(), controller.signal));
        }
        // MP3 frames concatenate cleanly; players play the parts in order.
        audioBuffer = Buffer.concat(parts);
      } else {
        audioBuffer = await elevenLabsTts(
          elevenVoiceId(selectedVoice),
          script.trim(),
          controller.signal
        );
      }
    } finally {
      clearTimeout(timeoutId);
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      res.status(502).json({
        error: "لم يُرجع نموذج الصوت بيانات صوتية. حاول تعديل النص والمحاولة مرة أخرى.",
      });
      return;
    }

    const mimeType = "audio/mpeg";
    const audioBase64 = audioBuffer.toString("base64");
    if (ttsCache.size >= MAX_TTS_CACHE) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, { audioBase64, mimeType, model: ELEVENLABS_MODEL });

    res.json({
      audioBase64,
      mimeType,
      voiceName: selectedVoice,
      dialectId: selectedDialectKey,
      model: ELEVENLABS_MODEL,
    });
  } catch (err: unknown) {
    console.error("TTS generation error:", err instanceof Error ? err.message : err);
    if (err instanceof DOMException && err.name === "AbortError") {
      res.status(504).json({ error: "استغرق توليد الصوت وقتاً طويلاً. حاول مرة أخرى." });
      return;
    }
    const { status, message } = formatFriendlyTtsError(err);
    res.status(status).json({ error: message });
  }
});

app.post("/api/script/generate", async (req, res) => {
  try {
    const {
      mode,
      scriptMode,
      platformTarget,
      category,
      angle,
      dialectId,
      topic,
      ctaTarget,
      brandName,
      currentHook,
      currentBody,
      currentCta,
      dialogueHookA,
      dialogueHookB,
      dialogueBodyA,
      dialogueBodyB,
      dialogueCtaB,
    } = req.body ?? {};
    const t0 = Date.now();
    const ai = getAiClient("v1beta");

    const cleanBrand = typeof brandName === "string" ? brandName.trim().slice(0, 60) : "";
    const cleanTopic = typeof topic === "string" ? topic.trim().slice(0, 400) : "";
    const cleanCta = typeof ctaTarget === "string" ? ctaTarget.trim().slice(0, 140) : "";
    const selectedDialectKey =
      typeof dialectId === "string" && DIALECT_TTS_DIRECTIONS[dialectId]
        ? dialectId
        : "ar-MA";
    const dialectSpec = DIALECT_TTS_DIRECTIONS[selectedDialectKey];
    const isDialogue = scriptMode === "dialogue";

    const platformHints: Record<string, string> = {
      reels: "Reels / TikTok vertical ad (15-25 seconds total, punchy short sentences)",
      feed: "Facebook / Instagram Feed ad (25-35 seconds total, clear value breakdown)",
      story: "Stories / WhatsApp status ad (12-18 seconds total, ultra-concise and urgent)",
    };
    const platformDesc =
      typeof platformTarget === "string" && platformHints[platformTarget]
        ? platformHints[platformTarget]
        : platformHints.reels;

    const soloSchema = {
      type: Type.OBJECT,
      properties: {
        hook: { type: Type.STRING, description: "Opening suspenseful ad hook" },
        body: { type: Type.STRING, description: "Core ad offer and benefits" },
        cta: { type: Type.STRING, description: "Closing call-to-action" },
      },
      required: ["hook", "body", "cta"],
    };

    const dialogueSchema = {
      type: Type.OBJECT,
      properties: {
        dialogueHookA: { type: Type.STRING, description: "Speaker A opening problem/hook" },
        dialogueHookB: { type: Type.STRING, description: "Speaker B surprising hook response" },
        dialogueBodyA: { type: Type.STRING, description: "Speaker A follow-up skepticism or question" },
        dialogueBodyB: { type: Type.STRING, description: "Speaker B persuasive offer & proof" },
        dialogueCtaB: { type: Type.STRING, description: "Speaker B energetic closing CTA" },
      },
      required: [
        "dialogueHookA",
        "dialogueHookB",
        "dialogueBodyA",
        "dialogueBodyB",
        "dialogueCtaB",
      ],
    };

    if (mode === "polish") {
      const prompt = isDialogue
        ? `Refine punctuation and dramatic pauses ("...", "!", "?") for this 2-speaker ad dialogue in ${dialectSpec.scriptTarget} without changing its meaning.
A1: ${String(dialogueHookA || "")}
B1: ${String(dialogueHookB || "")}
A2: ${String(dialogueBodyA || "")}
B2: ${String(dialogueBodyB || "")}
B3: ${String(dialogueCtaB || "")}`
        : `Refine punctuation and natural dramatic pauses ("...", "!", "?") for this ad script in ${dialectSpec.scriptTarget} without changing its meaning.
Hook: ${String(currentHook || "")}
Body: ${String(currentBody || "")}
CTA: ${String(currentCta || "")}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          responseMimeType: "application/json",
          responseSchema: isDialogue ? dialogueSchema : soloSchema,
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      console.log("Script polish ms:", Date.now() - t0);
      res.json(parsed);
      return;
    }

    if (mode === "adapt") {
      const prompt = isDialogue
        ? `Transcreate this 2-speaker commercial dialogue into native ${dialectSpec.scriptTarget} with natural local idioms and dramatic pauses ("..."):
A1: ${String(dialogueHookA || "")}
B1: ${String(dialogueHookB || "")}
A2: ${String(dialogueBodyA || "")}
B2: ${String(dialogueBodyB || "")}
B3: ${String(dialogueCtaB || "")}`
        : `Transcreate this commercial ad script into native ${dialectSpec.scriptTarget} with natural local idioms and dramatic pauses ("..."):
Hook: ${String(currentHook || "")}
Body: ${String(currentBody || "")}
CTA: ${String(currentCta || "")}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          responseMimeType: "application/json",
          responseSchema: isDialogue ? dialogueSchema : soloSchema,
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      console.log("Script adapt ms:", Date.now() - t0);
      res.json(parsed);
      return;
    }

    const categoryContexts: Record<string, string> = {
      ecommerce: "E-commerce product or online store promotion with strong offer",
      services: "Professional business service, agency, or skilled solution",
      food: "Restaurant, cafe, or food brand promotion",
      realestate: "Real estate, residential project, or property investment offer",
      clinic: "Medical clinic, dental, skincare, or wellness center",
      courses: "Training course, academy, or digital app promotion",
    };

    const angleInstructions: Record<string, string> = {
      suspense: "Dramatic suspenseful opening hook that grabs attention in the first 3 seconds.",
      reels: "Fast-paced punchy social media Reels/TikTok rhythm with short energetic sentences.",
      story: "Relatable storytelling angle connecting with the customer's daily need.",
      direct: "Confident, direct value-first offer with immediate clarity.",
    };

    const selectedCategory =
      typeof category === "string" && categoryContexts[category]
        ? categoryContexts[category]
        : categoryContexts.ecommerce;

    const selectedAngle =
      typeof angle === "string" && angleInstructions[angle]
        ? angleInstructions[angle]
        : angleInstructions.suspense;

    const prompt = isDialogue
      ? `Write a snappy, high-converting 2-speaker commercial dialogue strictly in native ${dialectSpec.scriptTarget}.
Platform Format: ${platformDesc}
Category: ${selectedCategory}
Offer / Product: ${cleanTopic || "A compelling product or service offer in this category"}
Brand: ${cleanBrand || "Do not invent a brand name"}
CTA Destination: ${cleanCta || "Message us on WhatsApp shown on screen"}
Angle: ${selectedAngle}
Speaker A is the curious/skeptical customer; Speaker B is the confident brand expert. Keep turns natural, fast, and persuasive with "..." pauses.`
      : `Write a complete commercial voiceover script strictly in native ${dialectSpec.scriptTarget}.
Platform Format: ${platformDesc}
Category: ${selectedCategory}
Offer / Product: ${cleanTopic || "A compelling product or service offer in this category"}
Brand: ${cleanBrand || "Do not invent a brand name; speak directly as the advertiser"}
CTA Destination: ${cleanCta || "Contact us now on the WhatsApp shown on screen"}
Angle: ${selectedAngle}
1. "hook": Strong, suspenseful opening line.
2. "body": Persuasive value proposition & offer.
3. "cta": Urgent closing call-to-action.
Use "..." for natural dramatic voiceover pauses.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        responseMimeType: "application/json",
        responseSchema: isDialogue ? dialogueSchema : soloSchema,
      },
    });

    const parsed = JSON.parse((response.text ?? "{}").trim());
    console.log("Script fresh ms:", Date.now() - t0);
    res.json(parsed);
  } catch (err: unknown) {
    console.error("Script generation error:", err);
    const rawMsg = err instanceof Error ? err.message : "";
    const message = rawMsg.includes("GEMINI_API_KEY is missing")
      ? "مفتاح Gemini (GEMINI_API_KEY) غير مفعّل على الخادم — توليد السكريبت غير متاح، ويمكنك كتابة السكريبت يدوياً."
      : rawMsg || "تعذر توليد السكريبت حالياً.";
    res.status(500).json({ error: message });
  }
});

app.post("/api/script/chat", async (req, res) => {
  try {
    const {
      messages,
      dialectId,
      scriptMode,
      platformTarget,
      brandName,
      ctaTarget,
    } = req.body ?? {};

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "يرجى كتابة فكرة الإعلان أو رسالتك أولاً." });
      return;
    }

    const ai = getAiClient("v1beta");
    const selectedDialectKey =
      typeof dialectId === "string" && DIALECT_TTS_DIRECTIONS[dialectId]
        ? dialectId
        : "ar-MA";
    const dialectSpec = DIALECT_TTS_DIRECTIONS[selectedDialectKey];
    const mode = scriptMode === "dialogue" ? "dialogue" : "solo";
    const cleanBrand = typeof brandName === "string" ? brandName.trim().slice(0, 60) : "";
    const cleanCta = typeof ctaTarget === "string" ? ctaTarget.trim().slice(0, 140) : "";

    const historyText = messages
      .slice(-8)
      .map((m: { role?: string; content?: string }) => {
        const label = m.role === "assistant" ? "المساعد" : "المستخدم";
        return `${label}: ${String(m.content || "").trim()}`;
      })
      .join("\n");

    const chatSchema = {
      type: Type.OBJECT,
      properties: {
        reply: {
          type: Type.STRING,
          description:
            "Friendly, concise Arabic response explaining the ad concept, hook strategy, and creative tips.",
        },
        hasScript: {
          type: Type.BOOLEAN,
          description: "True when providing a concrete ready-to-record ad script proposal.",
        },
        scriptMode: {
          type: Type.STRING,
          description: "Either 'solo' or 'dialogue'",
        },
        hook: { type: Type.STRING, description: "Solo mode opening hook (if solo)" },
        body: { type: Type.STRING, description: "Solo mode core offer body (if solo)" },
        cta: { type: Type.STRING, description: "Solo mode closing CTA (if solo)" },
        dialogueHookA: { type: Type.STRING, description: "Speaker A opening hook (if dialogue)" },
        dialogueHookB: { type: Type.STRING, description: "Speaker B hook reply (if dialogue)" },
        dialogueBodyA: { type: Type.STRING, description: "Speaker A question/doubt (if dialogue)" },
        dialogueBodyB: { type: Type.STRING, description: "Speaker B persuasive solution (if dialogue)" },
        dialogueCtaB: { type: Type.STRING, description: "Speaker B closing CTA (if dialogue)" },
      },
      required: ["reply", "hasScript", "scriptMode"],
    };

    const systemInstruction = `أنت كاتب إعلانات صوتية محترف ومخرج إبداعي في استوديو Nabra Ads.
مهمتك مساعدة المستخدم في صياغة أفكاره إلى سكربت إعلاني جاهز للتسجيل الصوتي والمونتاج.
- اللغة واللهجة المستهدفة للسكربت: ${dialectSpec.scriptTarget}
- نمط الإعلان الافتراضي المطلوب حالياً: ${mode === "dialogue" ? "حوار ثنائي (Speaker A + Speaker B)" : "معلّق منفرد (هوك + عرض + ختام)"}
- المنصة: ${typeof platformTarget === "string" ? platformTarget : "reels"}
- البراند: ${cleanBrand || "غير محدد (لا تخترع اسماً غير موجود إلا إذا طلب المستخدم)"}
- وسيلة التواصل في الختام: ${cleanCta || "الواتساب أو الرابط"}

قواعد مهمة:
1. تحدث مع المستخدم باللغة العربية الواضحة وبأسلوب عملي مختصر ومباشر.
2. إذا ذكر المستخدم فكرة منتج أو خدمة أو طلب تعديل سكربت، اجعل hasScript = true واملأ حقول السكربت باللهجة المستهدفة بدقة مع استخدام علامات الوقف الدرامية ("..." و"!" و"؟").
3. إذا اختار المستخدم أو طلب حواراً ثنائياً فاجعل scriptMode = "dialogue" واملأ dialogueHookA..dialogueCtaB؛ وإلا اجعل scriptMode = "solo" واملأ hook, body, cta.`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: historyText,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: "application/json",
        responseSchema: chatSchema,
      },
    });

    const parsed = JSON.parse((response.text ?? "{}").trim());
    res.json(parsed);
  } catch (err: unknown) {
    console.error("Script chat error:", err);
    const { status, message } = formatFriendlyGeminiError(err);
    res.status(status).json({ error: message });
  }
});


async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const hmrDisabled = process.env.DISABLE_HMR === "true";
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: hmrDisabled ? false : { server: httpServer },
        ws: hmrDisabled ? false : { server: httpServer },
      },
      appType: "spa",
    });
    if (hmrDisabled) {
      app.get("/@vite/client", async (_req, res, next) => {
        try {
          const result = await vite.transformRequest("/@vite/client");
          if (!result) return next();
          const patched = result.code.replace(
            "transport.connect(createHMRHandler(handleMessage));",
            "/* HMR disabled */"
          );
          res.type("application/javascript").send(patched);
        } catch (err) {
          next(err);
        }
      });
    }
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("/{*path}", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Nabra Ads Studio running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
