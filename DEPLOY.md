# النشر على Render (خطة مجانية) — Nabra Ads Studio

## شنو فهاد النسخة
- **كلشي بـ Gemini**: توليد السكريبت والشات والصوت (TTS) كلهم بمفتاح
  `GEMINI_API_KEY` واحد — ما كاين حتى مفتاح آخر.
- الصوت: موديلات `gemini-3.8-flash-lite-tts` و `gemini-3.8-flash-tts`
  (مع fallback لـ `gemini-3.8-live`)، والملفات **WAV 24kHz** (`audio/wav`).
- اختيار اللهجة (بحال الدارجة المغربية) كيوصل للصوت عبر توجيه الأسلوب
  (style prompt) — الصوت كيقرا النص كيفما مكتوب.
- `npm start` خدام على Node 24 (`tsx server.ts`).
- (ملاحظة تاريخية: نسخة سابقة قصيرة جربات ElevenLabs للصوت، ولكن الصوت
  كان كيقرا الدارجة بنطق فصحى، فرجعنا لـ Gemini كيفما كان فالمشروع الأصلي.)

## 1. دفع الكود لـ GitHub
من مجلد المشروع:
```bash
git add -A
git commit -m "Restore Gemini TTS — everything Gemini, like the original"
git push origin main
```

## 2. إنشاء الخدمة فـ Render
1. دخل لـ [dashboard.render.com](https://dashboard.render.com) وصاوب حساب مجاني (قدر تدخل بـ GitHub).
2. **New → Web Service → Build and deploy from a Git repository** وختار `Hamzagharib10/Hamza-ads-`.
3. Render غيقرا `render.yaml` بوحدو: الخطة `free`، أمر البناء `npm install && npm run build`، وأمر التشغيل `npm start`.
4. إلا ما تقراش `render.yaml`، دخلهم يدوياً فالإعدادات بنفس القيم.

## 3. المفتاح (أهم خطوة)
فصفحة الخدمة: **Environment → Add Environment Variable**
- `GEMINI_API_KEY` = المفتاح ديالك من Google AI Studio (لصقو هنا، ما يتحطش فالكود).
  هو المفتاح الوحيد اللي خاص التطبيق — للسكريبت وللصوت بجوج.
- `NODE_ENV` = `production` (كاينة أصلاً فـ `render.yaml`).
- إلا كان باقي عندك متغير قديم `ELEVENLABS_API_KEY` فالخدمة، حذفو — ما بقاش مستعمل.

من بعد ورك **Save Changes** — Render غيعاود الديبلوي بوحدو.

## 4. التجربة
- فتح الرابط ديال الخدمة (بحال `https://nabra-ads-studio.onrender.com`).
- جرب `/api/health`: خاص يرجع `hasGeminiKey: true`.
- كتب سكريبت بالدارجة وورك **توليد الصوت** — أول مرة غتاخد شوية الوقت.

## ملاحظات
- الخطة المجانية ديال Render **كتطفا ملي ما كيستعملها حد** (sleep): أول تحميل
  من بعد فترة خمول كيتعطل ~50 ثانية، ومن بعد كيولي عادي.
- المفتاح ما يتنشرش أبداً فـ GitHub ولا فالشات — غير فلوحة Render.
