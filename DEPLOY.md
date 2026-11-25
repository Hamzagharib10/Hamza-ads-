# النشر على Render (خطة مجانية) — Nabra Ads Studio

## شنو تبدل فهاد النسخة
- الصوت ولى بـ **ElevenLabs** بدل Gemini: الموديل `eleven_multilingual_v2`،
  والملفات MP3 (`audio/mpeg`) بدل WAV.
- السكريبت والشات مازالو بـ Gemini (اختياري): إلا ما كانش `GEMINI_API_KEY`،
  التطبيق خدام عادي والسكريبت كيتكتب يدوياً.
- `npm start` ولى خدام على Node 24 (`tsx server.ts`).

## 1. دفع الكود لـ GitHub
من مجلد المشروع:
```bash
git add -A
git commit -m "Switch TTS to ElevenLabs + Render free deploy"
git push origin main
```

## 2. إنشاء الخدمة فـ Render
1. دخل لـ [dashboard.render.com](https://dashboard.render.com) وصاوب حساب مجاني (قدر تدخل بـ GitHub).
2. **New → Web Service → Build and deploy from a Git repository** وختار `Hamzagharib10/Hamza-ads-`.
3. Render غيقرا `render.yaml` بوحدو: الخطة `free`، أمر البناء `npm install && npm run build`، وأمر التشغيل `npm start`.
4. إلا ما تقراش `render.yaml`، دخلهم يدوياً فالإعدادات بنفس القيم.

## 3. المفاتيح (أهم خطوة)
فصفحة الخدمة: **Environment → Add Environment Variable**
- `ELEVENLABS_API_KEY` = المفتاح ديالك من ElevenLabs (لصقو هنا، ما يتحطش فالكود).
  خاصو يكون فيه: **Text to Speech = Access** و **Voices = Read**.
- `GEMINI_API_KEY` = اختياري، غير إلا بغيتي توليد السكريبت بالذكاء الاصطناعي.
- `NODE_ENV` = `production` (كاينة أصلاً فـ `render.yaml`).

من بعد ورك **Save Changes** — Render غيعاود الديبلوي بوحدو.

## 4. التجربة
- فتح الرابط ديال الخدمة (بحال `https://nabra-ads-studio.onrender.com`).
- جرب `/api/health`: خاص يرجع `hasElevenLabsKey: true`.
- كتب سكريبت وورك **توليد الصوت** — أول مرة غتاخد شوية الوقت.

## ملاحظات
- الخطة المجانية ديال Render **كتطفا ملي ما كيستعملها حد** (sleep): أول تحميل
  من بعد فترة خمول كيتعطل ~50 ثانية، ومن بعد كيولي عادي.
- الخطة المجانية ديال ElevenLabs **ما كتسمحش بالاستعمال التجاري** للصوت.
- المفتاح ما يتنشرش أبداً فـ GitHub ولا فالشات — غير فلوحة Render.
