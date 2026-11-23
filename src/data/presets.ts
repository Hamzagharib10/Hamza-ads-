import {
  AdAngleId,
  AdCategoryPreset,
  BackgroundMusicId,
  DeliveryStyleId,
  DialectId,
  DialectOption,
  MasteringPresetId,
  PlatformTarget,
  QuickCategoryId,
  RegionGroupId,
  VoicePersona,
} from "../types/studio";

export const QUICK_DIALECT_CATEGORIES: Array<{
  id: QuickCategoryId;
  label: string;
  region: RegionGroupId;
  defaultDialectId: DialectId;
}> = [
  { id: "maghreb", label: "المغرب العربي", region: "maghreb", defaultDialectId: "ar-MA" },
  { id: "egypt_nile", label: "مصر", region: "egypt_nile", defaultDialectId: "ar-EG" },
  { id: "gulf", label: "الخليج واليمن", region: "gulf", defaultDialectId: "ar-SA" },
  { id: "levant_iraq", label: "الشام والعراق", region: "levant_iraq", defaultDialectId: "ar-LB" },
  { id: "french", label: "فرنسي", region: "global", defaultDialectId: "fr-FR" },
  { id: "spanish", label: "إسبانيا", region: "global", defaultDialectId: "es-ES" },
  { id: "english", label: "إنجليزي", region: "global", defaultDialectId: "en-US" },
  { id: "italian", label: "إيطالي", region: "global", defaultDialectId: "it-IT" },
];

export const REGION_GROUPS: Array<{ id: RegionGroupId; label: string }> = [
  { id: "maghreb", label: "المغرب العربي" },
  { id: "egypt_nile", label: "مصر" },
  { id: "gulf", label: "الخليج واليمن" },
  { id: "levant_iraq", label: "الشام والعراق" },
  { id: "global", label: "فرنسي · إسبانيا · إنجليزي · إيطالي" },
];

export const DIALECT_OPTIONS: DialectOption[] = [
  {
    id: "ar-EG",
    region: "egypt_nile",
    flag: "🇪🇬",
    countryLabel: "مصر",
    dialectLabel: "العامية المصرية (القاهرة)",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "ar-SD",
    region: "egypt_nile",
    flag: "🇸🇩",
    countryLabel: "السودان",
    dialectLabel: "اللهجة السودانية",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "ar-MSA",
    region: "egypt_nile",
    flag: "🌐",
    countryLabel: "عربي عام",
    dialectLabel: "العربية الفصحى الإعلانية",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "ar-SO",
    region: "egypt_nile",
    flag: "🇸🇴",
    countryLabel: "الصومال",
    dialectLabel: "عربي إعلاني (الصومال)",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "ar-DJ",
    region: "egypt_nile",
    flag: "🇩🇯",
    countryLabel: "جيبوتي",
    dialectLabel: "عربي إعلاني (جيبوتي)",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "ar-KM",
    region: "egypt_nile",
    flag: "🇰🇲",
    countryLabel: "جزر القمر",
    dialectLabel: "عربي إعلاني (جزر القمر)",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "ar-SA",
    region: "gulf",
    flag: "🇸🇦",
    countryLabel: "السعودية",
    dialectLabel: "اللهجة السعودية",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "ar-AE",
    region: "gulf",
    flag: "🇦🇪",
    countryLabel: "الإمارات",
    dialectLabel: "اللهجة الإماراتية",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "ar-KW",
    region: "gulf",
    flag: "🇰🇼",
    countryLabel: "الكويت",
    dialectLabel: "اللهجة الكويتية",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "ar-QA",
    region: "gulf",
    flag: "🇶🇦",
    countryLabel: "قطر",
    dialectLabel: "اللهجة القطرية",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "ar-BH",
    region: "gulf",
    flag: "🇧🇭",
    countryLabel: "البحرين",
    dialectLabel: "اللهجة البحرينية",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "ar-OM",
    region: "gulf",
    flag: "🇴🇲",
    countryLabel: "عُمان",
    dialectLabel: "اللهجة العُمانية",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "ar-YE",
    region: "gulf",
    flag: "🇾🇪",
    countryLabel: "اليمن",
    dialectLabel: "اللهجة اليمنية",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "ar-LB",
    region: "levant_iraq",
    flag: "🇱🇧",
    countryLabel: "لبنان",
    dialectLabel: "اللهجة اللبنانية",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "ar-SY",
    region: "levant_iraq",
    flag: "🇸🇾",
    countryLabel: "سوريا",
    dialectLabel: "اللهجة السورية (الشامية)",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "ar-JO",
    region: "levant_iraq",
    flag: "🇯🇴",
    countryLabel: "الأردن",
    dialectLabel: "اللهجة الأردنية",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "ar-PS",
    region: "levant_iraq",
    flag: "🇵🇸",
    countryLabel: "فلسطين",
    dialectLabel: "اللهجة الفلسطينية",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "ar-IQ",
    region: "levant_iraq",
    flag: "🇮🇶",
    countryLabel: "العراق",
    dialectLabel: "اللهجة العراقية",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "ar-MA",
    region: "maghreb",
    flag: "🇲🇦",
    countryLabel: "المغرب",
    dialectLabel: "الدارجة المغربية",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "ar-DZ",
    region: "maghreb",
    flag: "🇩🇿",
    countryLabel: "الجزائر",
    dialectLabel: "اللهجة الجزائرية",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "ar-TN",
    region: "maghreb",
    flag: "🇹🇳",
    countryLabel: "تونس",
    dialectLabel: "اللهجة التونسية",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "ar-LY",
    region: "maghreb",
    flag: "🇱🇾",
    countryLabel: "ليبيا",
    dialectLabel: "اللهجة الليبية",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "ar-MR",
    region: "maghreb",
    flag: "🇲🇷",
    countryLabel: "موريتانيا",
    dialectLabel: "الحسانية الموريتانية",
    dir: "rtl",
    langFamily: "ar",
  },
  {
    id: "fr-FR",
    region: "global",
    flag: "🇫🇷",
    countryLabel: "Français",
    dialectLabel: "الفرنسية الإعلانية",
    dir: "ltr",
    langFamily: "fr",
  },
  {
    id: "es-ES",
    region: "global",
    flag: "🇪🇸",
    countryLabel: "إسبانيا (Español)",
    dialectLabel: "الإسبانية الإعلانية",
    dir: "ltr",
    langFamily: "es",
  },
  {
    id: "en-US",
    region: "global",
    flag: "🇺🇸",
    countryLabel: "English (US)",
    dialectLabel: "الإنجليزية الأمريكية",
    dir: "ltr",
    langFamily: "en",
  },
  {
    id: "en-GB",
    region: "global",
    flag: "🇬🇧",
    countryLabel: "English (UK)",
    dialectLabel: "الإنجليزية البريطانية",
    dir: "ltr",
    langFamily: "en",
  },
  {
    id: "it-IT",
    region: "global",
    flag: "🇮🇹",
    countryLabel: "Italiano",
    dialectLabel: "الإيطالية الإعلانية",
    dir: "ltr",
    langFamily: "it",
  },
];

export const VOICE_PERSONAS: VoicePersona[] = [
  {
    id: "Charon",
    name: "كريم — صوت درامي تشويقي",
    genderLabel: "صوت رجالي عميق",
    toneLabel: "فخم ومؤثر",
    description: "نبرة عميقة ومشوقة، ممتازة للهوك الدرامي والإعلانات الفخمة بمختلف اللهجات واللغات.",
  },
  {
    id: "Puck",
    name: "عمر — صوت شبابي حماسي",
    genderLabel: "صوت رجالي سريع",
    toneLabel: "حماسي وعصري",
    description: "إيقاع حيوي وسريع يخطف الانتباه في أول ثانيتين على ريلز وتيك توك.",
  },
  {
    id: "Fenrir",
    name: "طارق — صوت خبير موثوق",
    genderLabel: "صوت رجالي رزين",
    toneLabel: "هادي ومقنع",
    description: "أداء واثق وهادي يبني ثقة فورية ويشرح تفاصيل العرض أو الخدمة باحترافية.",
  },
  {
    id: "Kore",
    name: "نور — صوت نسائي جذاب",
    genderLabel: "صوت نسائي",
    toneLabel: "واضح ومقنع",
    description: "صوت طبيعي ودافي بنبرة إعلانية احترافية واضحة جداً في العربية واللغات الأجنبية.",
  },
  {
    id: "Zephyr",
    name: "سلمى — صوت عصري مريح",
    genderLabel: "صوت نسائي شبابي",
    toneLabel: "سلس وودي",
    description: "أداء تلقائي قريب من الكلام اليومي مع ختام سريع ومشجع.",
  },
];

export const DELIVERY_STYLES: Array<{
  id: DeliveryStyleId;
  label: string;
  hint: string;
}> = [
  {
    id: "suspense",
    label: "تشويق وهوك قوي",
    hint: "تبدأ بنبرة غامضة ومشوقة، وتتحول لثقة في العرض، ثم حماس في الختام.",
  },
  {
    id: "reels",
    label: "سريع وحماسي (ريلز)",
    hint: "إيقاع سريع ومكثف يجذب انتباه المشاهد من اللحظة الأولى.",
  },
  {
    id: "authority",
    label: "هدوء وثقة الخبير",
    hint: "أداء رزين وواثق يركز على الجودة والمصداقية في العرض.",
  },
];

export const AD_ANGLES: Array<{ id: AdAngleId; label: string }> = [
  { id: "suspense", label: "هوك تشويقي" },
  { id: "reels", label: "ريلز سريع" },
  { id: "story", label: "حكاية قريبة" },
  { id: "direct", label: "عرض مباشر" },
];

export const PLATFORM_TARGETS: Array<{
  id: PlatformTarget;
  label: string;
  targetDuration: string;
}> = [
  { id: "reels", label: "ريلز وتيك توك", targetDuration: "15–25 ثانية" },
  { id: "feed", label: "إعلان فيسبوك وإنستغرام", targetDuration: "25–40 ثانية" },
  { id: "story", label: "ستوري وواتساب", targetDuration: "12–18 ثانية" },
];

export const MASTERING_PRESETS: Array<{
  id: MasteringPresetId;
  label: string;
  detail: string;
}> = [
  { id: "raw", label: "أصلي (Raw)", detail: "صوت الاستوديو الخام بدون معالجة" },
  { id: "broadcast", label: "بث إذاعي فخم", detail: "دفء صوتي + وضوح + ضغط متوازن" },
  { id: "punchy", label: "ريلز صاخب", detail: "حضور قوي يخترق سماعات الموبايل" },
];

export const BACKGROUND_MUSIC_PRESETS: Array<{
  id: BackgroundMusicId;
  label: string;
  detail: string;
}> = [
  { id: "none", label: "بدون موسيقى", detail: "صوت تعليق نقي بدون خلفية موسيقية" },
  { id: "cinematic", label: "تشويقي سينمائي", detail: "باد درامي ونبض عميق للهوك والإعلانات القوية" },
  { id: "upbeat", label: "حماسي (ريلز)", detail: "إيقاع عصري سريع يناسب الريلز والمنتجات" },
  { id: "corporate", label: "مؤسسي دافئ", detail: "نغمات هادئة تعزز الثقة والاحترافية" },
  { id: "luxury", label: "فخم وهادئ", detail: "أوتار ناعمة للعقارات والعطور والخدمات الراقية" },
];

export const AD_CATEGORIES: AdCategoryPreset[] = [
  {
    id: "ecommerce",
    label: "متاجر ومنتجات",
    defaultTopic: "سماعة بلوتوث أصلية بعزل صوت كامل وبطارية تدوم أسبوعاً، خصم 30% وشحن مجاني حتى باب المنزل",
    defaultCtaTarget: "أرسل لنا رسالة على الواتساب الظاهر أمامك أو اطلب من الرابط الآن",
    hook: "توقف لحظة!... هل تبحث عن منتج يدوم معك ويمنحك أعلى جودة دون أن تدفع أسعاراً مبالغاً فيها؟ استمع لهذا العرض قبل انتهائه!",
    body: "جمعنا لك أفضل خامة وتصنيع متقن، مع ضمان استبدال حقيقي وشحن سريع حتى باب منزلك، واليوم تحديداً لديك خصم خاص بمناسبة إطلاق المجموعة الجديدة.",
    cta: "الكمية المتوفرة محدودة جداً... ماذا تنتظر؟ تواصل معنا الآن على الواتساب الظاهر أمامك واحجز طلبك فوراً!",
    dialogueHookA: "يا صديقي، هل ما زلت تدفع أموالاً طائلة في منتجات تتلف بعد أسبوعين فقط؟!",
    dialogueHookB: "لا انتظر... ألم تسمع عن العرض الجديد بعد؟",
    dialogueBodyA: "أي عرض؟ لقد جربنا الكثير وكله مجرد وعود إعلانية!",
    dialogueBodyB: "هذه المرة بضمان استبدال فعلي، وجودة تدوم لسنوات، بالإضافة إلى خصم ثلاثين بالمئة اليوم فقط مع توصيل حتى باب المنزل.",
    dialogueCtaB: "ماذا تنتظر؟ أرسل رسالة على الواتساب الظاهر أمامك واستفد من العرض قبل نفاد الكمية!",
  },
  {
    id: "services",
    label: "خدمات وأعمال",
    defaultTopic: "خدمات تقنية وتسويق رقمي احترافية تساعد أصحاب المشاريع على مضاعفة مبيعاتهم وحماية حساباتهم",
    defaultCtaTarget: "تواصل معنا على الواتساب الظاهر أمامك الآن",
    hook: "تخيل أن تتمكن من حل المشكلة التي تعطّل عملك منذ أشهر... في وقت قياسي وبأعلى درجات الاحترافية والأمان؟",
    body: "معك فريق متخصص بخبرة عملية في تقديم الحلول الفعالة والنتائج المضمونة. نتابع عملك خطوة بخطوة حتى تصل إلى النتيجة التي تطمح إليها بأقل جهد منك.",
    cta: "وقتك ثمين ولا يُعوّض... ماذا تنتظر؟ تواصل معنا الآن على الواتساب الظاهر أمامك، ولنبدأ اليوم!",
    dialogueHookA: "هذه المشكلة تعطل عملي منذ أيام ولا أجد من يحلها بالشكل الصحيح!",
    dialogueHookB: "اطمئن تماماً... الحل أسهل وأسرع مما تتخيل.",
    dialogueBodyA: "حقاً؟ لكنني لا أريد إضاعة الوقت والتكاليف دون نتيجة.",
    dialogueBodyB: "نحن نعمل بخبرة سنوات طويلة، ونتولى عملك من البداية حتى النهاية بأعلى مستوى أمان ونتائج ملموسة أمام عينيك.",
    dialogueCtaB: "ماذا تنتظر؟ تواصل معنا الآن على الواتساب الظاهر أمامك، ودعنا ننجز لك الأمر اليوم!",
  },
  {
    id: "food",
    label: "مطاعم وكافيهات",
    defaultTopic: "صندوق مشويات على الفحم يكفي 4 أشخاص مع مقبلات وخبز طازج ساخن",
    defaultCtaTarget: "اطلب الآن عبر رقم الواتساب أو تفضل بزيارتنا في الفرع",
    hook: "هل تشعر بالجوع وتحتار ماذا تأكل اليوم؟!... تخيل رائحة الفحم والمذاق الأصيل الذي يعدّل مزاجك من أول لقمة!",
    body: "جهّزنا لك عرض العائلة الكبير بأجود اللحوم الطازجة وتتبيلة سرية تجعلك تطلب مجدداً من اللحظة نفسها، ومع الصندوق هدية مشروبات ومقبلات تكمل جلستك مع الأهل والأصدقاء.",
    cta: "الطعام يصلك ساخناً حتى بابك... ماذا تنتظر؟ اطلب الآن على الواتساب الظاهر أمامك، وبألف صحة وعافية!",
    dialogueHookA: "هل تشم هذه الرائحة الشهية؟!... الجوع لم يعد يرحمنا اليوم!",
    dialogueHookB: "دعك من الأكل التقليدي، وجرّب صندوق المشويات الطازج مباشرة من على الفحم!",
    dialogueBodyA: "هل يكفي الجميع أم أن كميته قليلة؟",
    dialogueBodyB: "يكفي أربعة أشخاص براحة تامة، ومعه مقبلات وخبز طازج ساخن وتتبيلة رائعة تجعلك تكرر الطلب.",
    dialogueCtaB: "ماذا تنتظر؟ اطلب فوراً على الواتساب الظاهر أمامك، وسيصلك الطعام ساخناً حتى باب منزلك!",
  },
  {
    id: "realestate",
    label: "عقارات ومشاريع",
    defaultTopic: "شقق سكنية بتصميم عصري ومقدم 10% وتقسيط مريح حتى 8 سنوات في موقع مميز",
    defaultCtaTarget: "سجّل رقمك أو تواصل معنا على الواتساب لتحديد موعد المعاينة",
    hook: "هل تبحث عن سكن راقٍ يجمع بين الهدوء والموقع الذهبي... واستثمار مضمون تزداد قيمته يوماً بعد يوم؟",
    body: "الآن يمكنك امتلاك وحدتك بمقدم يبدأ من 10% فقط، مع أنظمة سداد مرنة حتى 8 سنوات بدون فوائد، في مجمع سكني متكامل الخدمات وقريب من جميع المحاور الرئيسية.",
    cta: "الفرص المميزة لا تنتظر... تواصل معنا الآن على الواتساب الظاهر أمامك واحجز معاينتك المجانية!",
    dialogueHookA: "أتمنى الانتقال إلى مكان راقٍ وقريب من كل الخدمات، لكنني قلق من المقدم والأقساط!",
    dialogueHookB: "الأمر أصبح أسهل بكثير الآن... بمقدم عشرة بالمئة فقط!",
    dialogueBodyA: "حقاً؟ وهل نظام التقسيط مريح أيضاً؟",
    dialogueBodyB: "تقسيط يصل إلى ثماني سنوات بدون فوائد، في مجمع متكامل الخدمات واستثمار ترتفع قيمته باستمرار.",
    dialogueCtaB: "هذه الفرصة لن تتكرر... تواصل معنا على الواتساب الظاهر أمامك واحجز معاينتك المجانية!",
  },
  {
    id: "clinic",
    label: "عيادات وتجميل",
    defaultTopic: "جلسات نضارة وعناية متكاملة بأحدث الأجهزة الطبية واستشارة مجانية لأول 20 حجزاً",
    defaultCtaTarget: "احجز موعدك الآن عبر الواتساب",
    hook: "هل تحلمين بإشراقة طبيعية وتغيير حقيقي يظهر على بشرتك من أول جلسة... دون أي ألم أو فترة نقاهة؟",
    body: "في مركزنا نعمل بأحدث الأجهزة العالمية وتحت إشراف أطباء متخصصين لنضمن لك أعلى درجات الأمان وأفضل نتيجة طبيعية تناسبك.",
    cta: "لأول عشرين حجزاً اليوم فحص واستشارة مجانية... ماذا تنتظرين؟ راسلينا على الواتساب الظاهر أمامك واحجزي موعدك!",
    dialogueHookA: "جربت كريمات كثيرة ولا شيء يمنح بشرتي نضارة حقيقية!",
    dialogueHookB: "لأن النضارة الحقيقية تحتاج إلى جلسة طبية متخصصة وليست مجرد كريم سطحي.",
    dialogueBodyA: "لكنني أخاف من الأجهزة الطبية وفترة التعافي الطويلة!",
    dialogueBodyB: "أحدث أجهزة عالمية بدون أي ألم، تحت إشراف أطباء متخصصين وبنتيجة طبيعية من الجلسة الأولى.",
    dialogueCtaB: "لأول عشرين حجزاً استشارة مجانية... راسلينا على الواتساب الظاهر أمامك واحجزي موعدك الآن!",
  },
  {
    id: "courses",
    label: "كورسات وتطبيقات",
    defaultTopic: "دورة عملية متكاملة تؤهلك لسوق العمل بمشاريع حقيقية وشهادة معتمدة",
    defaultCtaTarget: "أرسل كلمة تفاصيل على الواتساب الظاهر أمامك",
    hook: "هل ما زلت تشاهد مقاطع عشوائية ولا تعرف من أين تبدأ مجالك؟... حان الوقت لتخطو الخطوة الصحيحة التي تغيّر مستقبلك!",
    body: "صممنا لك تدريباً عملياً بنسبة 100% من الصفر حتى الاحتراف، مع تطبيق على مشاريع حقيقية من سوق العمل، ومتابعة مستمرة مع مدربين ذوي خبرة لتكون جاهزاً للعمل فوراً.",
    cta: "المقاعد في الدفعة الجديدة محدودة... ماذا تنتظر؟ تواصل معنا على الواتساب الظاهر أمامك واحجز مقعدك!",
    dialogueHookA: "أتعلم بمفردي منذ أشهر ولا أستطيع إنجاز أول مشروع حقيقي أو الحصول على عمل!",
    dialogueHookB: "لأنك تحتاج إلى خطة عملية وتطبيق مباشر مع مدرب يوجّهك خطوة بخطوة.",
    dialogueBodyA: "يعني أنني سأخرج من التدريب بخبرة عمل فعلية؟",
    dialogueBodyB: "مشاريع حقيقية من سوق العمل، متابعة يومية، وشهادة معتمدة تؤهلك لأول فرصة عمل بسرعة.",
    dialogueCtaB: "المقاعد محدودة جداً... أرسل كلمة تفاصيل على الواتساب الظاهر أمامك واحجز مقعدك!",
  },
];
