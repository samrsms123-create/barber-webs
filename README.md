# موقع الحلاقة للرجال - دليل النشر

الموقع: صفحة حجز عربي/تركي + دالتين على الخادم (عرض الأوقات المحجوزة، وتسجيل الحجز وإرسال واتساب) + قاعدة بيانات Supabase.

## الخطوة 1: قاعدة البيانات (Supabase)
1. أنشئ حساباً مجانياً على supabase.com ثم مشروعاً جديداً.
2. افتح SQL Editor، الصق محتوى `supabase.sql` واضغط Run.
3. من Project Settings > API انسخ: **Project URL** و **service_role key** (سري، لا تشاركه أبداً).

## الخطوة 2: واتساب (Twilio)
1. أنشئ حساباً على twilio.com وفعّل **WhatsApp Sandbox** (للتجربة).
2. أرسل من واتسابك رسالة "join ..." للرقم الذي يعطيك إياه Twilio، كي يسمح لك باستقبال الرسائل.
3. انسخ **Account SID** و **Auth Token** ورقم الإرسال (مثل +14155238886).
4. للاستخدام الفعلي لاحقاً: سجّل رقماً رسمياً عبر WhatsApp Business في Twilio (يحتاج تحقق ويأخذ أياماً).

## الخطوة 3: النشر (Netlify)
1. ارفع هذا المجلد كله إلى GitHub (مستودع جديد)، ثم في netlify.com اختر Add new site > Import from Git.
2. من Site settings > Environment variables أضف:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `TWILIO_SID`
   - `TWILIO_TOKEN`
   - `TWILIO_FROM` (مثال: +14155238886)
   - `OWNER_WHATSAPP` = +905511509310
3. أعد النشر (Deploys > Trigger deploy).

## الخطوة 4: الدومين
1. اشترِ الدومين من أي مسجّل (Namecheap، GoDaddy...).
2. في Netlify: Domain management > Add a domain، واتبع تعليمات إعداد DNS.

## ملاحظات
- الحجوزات تظهر لك في Supabase > Table Editor > bookings.
- قاعدة البيانات نفسها تمنع الحجز المزدوج، حتى لو حجز شخصان بنفس اللحظة.
- أوقات الصالون بتوقيت إسطنبول.
