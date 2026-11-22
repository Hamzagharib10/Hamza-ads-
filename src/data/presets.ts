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
  { id: "egypt_nile", label: "مصر", region: "egypt_nile", defaultDialectId: "ar-EG" },
  { id: "gulf", label: "الخليج واليمن", region: "gulf", defaultDialectId: "ar-SA" },
  { id: "maghreb", label: "المغرب العربي", region: "maghreb", defaultDialectId: "ar-MA" },
  { id: "levant_iraq", label: "الشام والعراق", region: "levant_iraq", defaultDialectId: "ar-LB" },
  { id: "english", label: "إنجليزي", region: "global", defaultDialectId: "en-US" },
  { id: "french", label: "فرنسي", region: "global", defaultDialectId: "fr-FR" },
  { id: "italian", label: "إيطالي", region: "global", defaultDialectId: "it-IT" },
];

export const REGION_GROUPS: Array<{ id: RegionGroupId; label: string }> = [
  { id: "egypt_nile", label: "مصر" },
  { id: "gulf", label: "الخليج واليمن" },
  { id: "levant_iraq", label: "الشام والعراق" },
  { id: "maghreb", label: "المغرب العربي" },
  { id: "global", label: "إنجليزي · فرنسي · إيطالي" },
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
    id: "fr-FR",
    region: "global",
    flag: "🇫🇷",
    countryLabel: "Français",
    dialectLabel: "الفرنسية الإعلانية",
    dir: "ltr",
    langFamily: "fr",
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
    hint: "إيقاع مشدود وسريع يخطف المشاهد قبل ما يعمل سكرول.",
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
    defaultTopic: "سماعة بلوتوث أصلية بعزل صوت كامل وبطارية تدوم أسبوع، خصم 30% وشحن مجاني لباب البيت",
    defaultCtaTarget: "ابعتلنا رسالة على الواتساب اللي قدامك ده أو اطلب من اللينك",
    hook: "استنى لحظة!... بتدور على منتج يعيش معاك ويديك أعلى جودة من غير ما تدفع أرقام خيالية؟ اسمع العرض ده قبل ما يخلص!",
    body: "جمعنالك أقوى خامة وتقفيل ممتاز، مع ضمان استبدال حقيقي وشحن سريع لحد باب بيتك، والنهارده بس ليك خصم خاص بمناسبة إطلاق الكولكشن الجديد.",
    cta: "الكمية الموجودة محدودة جداً... مستني إيه؟ كلمنا حالاً على الواتساب اللي قدامك ده واحجز أوردرك دلوقتي!",
    dialogueHookA: "يا عم إنت لسه بتدفع فلوس قد كده في منتجات بتبوظ بعد أسبوعين؟!",
    dialogueHookB: "لا استنى... انت ما سمعتش عن العرض الجديد ولا إيه؟",
    dialogueBodyA: "عرض إيه؟ إحنا جربنا كتير وكله كلام إعلانات وخلاص!",
    dialogueBodyB: "المرة دي بضمان استبدال فعلي، خامة تعيش سنين، وكمان خصم ثلاثين في المية النهارده بس وشحن لباب بيتك.",
    dialogueCtaB: "مستني إيه؟ ابعت رسالة على الواتساب اللي قدامك ده والحق العرض قبل ما الكمية تخلص!",
  },
  {
    id: "services",
    label: "خدمات وأعمال",
    defaultTopic: "خدمات تقنية وتسويق رقمي احترافية تساعد أصحاب المشاريع يزودوا مبيعاتهم ويحموا حساباتهم",
    defaultCtaTarget: "كلمني على الواتساب اللي قدامك ده",
    hook: "تخيل تقدر تحل المشكلة اللي معطّلة شغلك بقى لها شهور... في وقت قياسي وبأعلى احترافية وأمان؟",
    body: "معاك فريق متخصص بخبرة حقيقية في تقديم الحلول العملية والنتائج المضمونة. بنمسك شغلك خطوة بخطوة لحد ما توصل للنتيجة اللي بتتمناها بأقل مجهود منك.",
    cta: "وقتك غالي وما يتعوضش... مستني إيه؟ كلمني دلوقتي على الواتساب اللي قدامك ده، وخلينا نبدأ النهارده!",
    dialogueHookA: "المشكلة دي معطلالي شغلي بقى لها أيام ومش لاقي حد يحلها صح!",
    dialogueHookB: "هدي نفسك خالص... الحل أسهل وأسرع مما تتخيل.",
    dialogueBodyA: "بجد؟ بس أنا مش عايز أضيع وقت وتكاليف على الفاضي.",
    dialogueBodyB: "إحنا بنشتغل بخبرة سنين، بنمسكلك الشغل من أوله لآخره بأعلى نسبة أمان ونتائج مضمونة قدام عينك.",
    dialogueCtaB: "مستني إيه؟ كلمنا دلوقتي على الواتساب اللي قدامك ده، وخلينا نخلصلك الموضوع النهارده!",
  },
  {
    id: "food",
    label: "مطاعم وكافيهات",
    defaultTopic: "بوكس مشويات على الفحم يكفي 4 أفراد ومعاه مقبلات وعيش سخن طازة",
    defaultCtaTarget: "اطلب دلوقتي على رقم الواتساب أو شرفنا في الفرع",
    hook: "جعان ومحتار تاكل إيه النهارده؟!... تخيل ريحة الفحم والطعم الأصلي اللي يظبط مزاجك من أول لقمة!",
    body: "حضرنا لك عرض اللمة الكبير بأجود لحمة طازة وتتبيلة سرية تخليك تطلب تاني من نفس اللحظة، ومع البوكس هدية مشروبات ومقبلات تكمل السهرة مع صحابك أو عيلتك.",
    cta: "الأكل بيوصل سخن لحد بابك... مستني إيه؟ اطلب دلوقتي على الواتساب اللي قدامك ده، وبالف هنا!",
    dialogueHookA: "شميت الريحة دي؟!... الجوع خلاص مش سايبنا النهارده!",
    dialogueHookB: "طب سيبك من الأكل التقليدي، وجرب بوكس المشويات اللي لسه نازل من على الفحم!",
    dialogueBodyA: "يكفي اللمة كلها ولا هييجي قليل؟",
    dialogueBodyB: "يكفي أربعة مستريح ومعاه مقبلات وعيش سخن طازة وتتبيلة خطيرة تخليك تطلب تاني.",
    dialogueCtaB: "مستني إيه؟ اطلب حالاً على الواتساب اللي قدامك ده، والأكل يوصلك سخن لباب بيتك!",
  },
  {
    id: "realestate",
    label: "عقارات ومشاريع",
    defaultTopic: "شقق سكنية بتصميم مودرن ومقدم 10% وتقسيط مريح حتى 8 سنين في موقع مميز",
    defaultCtaTarget: "سجل رقمك أو كلمنا على الواتساب لتحديد معاد المعاينة",
    hook: "بتدور على سكن راقي يجمع بين الهدوء والموقع الذهبي... وكمان استثمار مضمون قيمته بتزيد كل يوم؟",
    body: "دلوقتي تقدر تمتلك وحدتك بمقدم يبدأ من 10% بس، وأنظمة سداد مرنة لحد 8 سنين من غير فوايد، في مجتمع متكامل الخدمات وقريب من كل المحاور الرئيسية.",
    cta: "الفرص المميزة ما بتستناش... مستني إيه؟ كلمنا دلوقتي على الواتساب اللي قدامك ده واحجز معاينتك المجانية!",
    dialogueHookA: "نفسك تنقل في مكان راقي وقريب من كل حاجة، بس خايف من المقدم والأقساط؟",
    dialogueHookB: "الموضوع بقى أسهل بكتير دلوقتي... بمقدم عشرة في المية بس!",
    dialogueBodyA: "معقول؟ وكمان التقسيط مريح؟",
    dialogueBodyB: "تقسيط لحد تمن سنين بدون فوايد، في كمبوند متكامل الخدمات واستثمار قيمته بتزيد كل يوم.",
    dialogueCtaB: "الفرصة دي مش هتتكرر... كلمنا على الواتساب اللي قدامك ده واحجز معاينتك المجانية!",
  },
  {
    id: "clinic",
    label: "عيادات وتجميل",
    defaultTopic: "جلسات نضارة وعناية متكاملة بأحدث الأجهزة الطبية واستشارة مجانية لأول 20 حجز",
    defaultCtaTarget: "احجز معادك دلوقتي عبر الواتساب",
    hook: "نفسك في إشراقة طبيعية وتغيير حقيقي يبان على بشرتك من أول جلسة... من غير أي ألم ولا فترة نقاهة؟",
    body: "في مركزنا بنشتغل بأحدث الأجهزة العالمية وتحت إشراف دكاترة متخصصين عشان نضمنلك أعلى درجات الأمان وأفضل نتيجة طبيعية تناسبك.",
    cta: "لأول عشرين حجز النهارده كشف واستشارة مجانية... مستني إيه؟ ابعتلنا على الواتساب اللي قدامك ده واحجز معادك!",
    dialogueHookA: "جربت كريمات كتير ومفيش حاجة بتدي نضارة حقيقية لبشرتي!",
    dialogueHookB: "عشان النضارة الصح محتاجة جلسة طبية متخصصة مش مجرد كريم سطحي.",
    dialogueBodyA: "بس أنا بخاف من الأجهزة ووقت التعافي الطويل!",
    dialogueBodyB: "أحدث أجهزة عالمية من غير أي ألم، تحت إشراف أطباء متخصصين ونتيجة طبيعية من أول جلسة.",
    dialogueCtaB: "لأول عشرين حجز استشارة مجانية... ابعتلنا على الواتساب اللي قدامك ده واحجز معادك دلوقتي!",
  },
  {
    id: "courses",
    label: "كورسات وتطبيقات",
    defaultTopic: "كورس عملي متكامل يأهلك لسوق العمل بمشاريع حقيقية وشهادة معتمدة",
    defaultCtaTarget: "ابعت كلمة تفاصيل على الواتساب اللي قدامك ده",
    hook: "لسه بتتفرج على فيديوهات عشوائية ومش عارف تبدأ مجالك منين؟... جه الوقت تاخد الخطوة الصح اللي تغيّر مستقبلك!",
    body: "صممنالك تدريب عملي 100% من الصفر للاحتراف، تطبيق على مشاريع حقيقية من سوق العمل، ومتابعة مستمرة مع مدربين خبرة عشان تطلع جاهز للشغل فوراً.",
    cta: "الأماكن في الدفعة الجديدة محدودة... مستني إيه؟ كلمنا على الواتساب اللي قدامك ده واحجز مكانك!",
    dialogueHookA: "بقالي شهور بذاكر لوحدي ومش عارف أعمل أول مشروع حقيقي ولا أشتغل!",
    dialogueHookB: "لأنك محتاج خطة عملية وتطبيق مع مدرب يصححلك خطوة بخطوة.",
    dialogueBodyA: "يعني هطلع من التدريب معايا شغل فعلي؟",
    dialogueBodyB: "مشاريع حقيقية من سوق العمل، متابعة يومية، وشهادة معتمدة تأهلك لأول فرصة شغل بسرعة.",
    dialogueCtaB: "الأماكن محدودة جداً... ابعت كلمة تفاصيل على الواتساب اللي قدامك ده واحجز مكانك!",
  },
];
