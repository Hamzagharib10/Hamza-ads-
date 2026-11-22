export type VoiceId = "Charon" | "Fenrir" | "Puck" | "Kore" | "Zephyr";

export type DeliveryStyleId = "suspense" | "reels" | "authority";

export type AdAngleId = "suspense" | "reels" | "story" | "direct";

export type ScriptMode = "solo" | "dialogue";

export type PlatformTarget = "reels" | "feed" | "story";

export type MasteringPresetId = "raw" | "broadcast" | "punchy";

export type BackgroundMusicId =
  | "none"
  | "cinematic"
  | "upbeat"
  | "corporate"
  | "luxury"
  | "custom";

export type AdCategoryId =
  | "ecommerce"
  | "services"
  | "food"
  | "realestate"
  | "clinic"
  | "courses";

export type RegionGroupId =
  | "egypt_nile"
  | "gulf"
  | "levant_iraq"
  | "maghreb"
  | "global";

export type DialectId =
  | "ar-EG"
  | "ar-SD"
  | "ar-MSA"
  | "ar-SO"
  | "ar-DJ"
  | "ar-KM"
  | "ar-SA"
  | "ar-AE"
  | "ar-KW"
  | "ar-QA"
  | "ar-BH"
  | "ar-OM"
  | "ar-YE"
  | "ar-LB"
  | "ar-SY"
  | "ar-JO"
  | "ar-PS"
  | "ar-IQ"
  | "ar-MA"
  | "ar-DZ"
  | "ar-TN"
  | "ar-LY"
  | "ar-MR"
  | "en-US"
  | "en-GB"
  | "fr-FR"
  | "it-IT";

export interface DialectOption {
  id: DialectId;
  region: RegionGroupId;
  flag: string;
  countryLabel: string;
  dialectLabel: string;
  dir: "rtl" | "ltr";
  langFamily: "ar" | "en" | "fr" | "it";
}

export interface VoicePersona {
  id: VoiceId;
  name: string;
  genderLabel: string;
  toneLabel: string;
  description: string;
}

export interface AdCategoryPreset {
  id: AdCategoryId;
  label: string;
  defaultTopic: string;
  defaultCtaTarget: string;
  hook: string;
  body: string;
  cta: string;
  dialogueHookA: string;
  dialogueHookB: string;
  dialogueBodyA: string;
  dialogueBodyB: string;
  dialogueCtaB: string;
}

export type StudioTab = "chat" | "preview" | "artifacts";

export type QuickCategoryId =
  | "egypt_nile"
  | "gulf"
  | "levant_iraq"
  | "maghreb"
  | "english"
  | "french"
  | "italian";

export interface ScriptProposal {
  scriptMode: ScriptMode;
  hook?: string;
  body?: string;
  cta?: string;
  dialogueHookA?: string;
  dialogueHookB?: string;
  dialogueBodyA?: string;
  dialogueBodyB?: string;
  dialogueCtaB?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  dialectLabel?: string;
  proposal?: ScriptProposal;
}

export interface GeneratedTake {
  id: string;
  createdAt: number;
  scriptMode: ScriptMode;
  voiceId: VoiceId;
  voiceName: string;
  secondVoiceId?: VoiceId;
  secondVoiceName?: string;
  dialectId: DialectId;
  dialectLabel: string;
  deliveryStyle: DeliveryStyleId;
  deliveryLabel: string;
  script: string;
  hookText: string;
  bodyText: string;
  ctaText: string;
  audioUrl: string;
  mimeType: string;
  durationSec: number;
}
