// netlify/functions/book.js
// يستقبل الحجز من صفحة الموقع ويرسل تنبيه واتساب لصاحب الصالون (عبر Twilio)
// ملاحظة: النسخة الحالية لا تحفظ الحجوزات في قاعدة بيانات، فلا تمنع تكرار الحجز لنفس الوقت.

const SLOTS = ["19:00", "19:15", "19:30", "19:45", "20:00", "20:15", "20:30", "20:45"];
const SERVICES = {
  hair: { name: "قص شعر", slots: 1 },
  beard: { name: "حلاقة ذقن", slots: 1 },
  both: { name: "قص شعر + حلاقة ذقن", slots: 2 },
};

const json = (statusCode, obj) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(obj),
});

const clean = (v, n) => String(v || "").replace(/[\r\n]+/g, " ").trim().slice(0, n);

const arTime = (t) => {
  const [h, m] = t.split(":");
  return Number(h) - 12 + ":" + m + " م";
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "method" });

  let d;
  try {
    d = JSON.parse(event.body || "{}");
  } catch (e) {
    return json(400, { error: "json" });
  }

  const name = clean(d.name, 60);
  const phone = clean(d.phone, 25);
  const svc = SERVICES[d.service];
  const day = String(d.day || "");
  const slot = String(d.slot || "");
  const idx = SLOTS.indexOf(slot);

  if (!name || phone.length < 7 || !svc || idx === -1 || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return json(400, { error: "invalid" });
  }
  // الخدمة المزدوجة تحتاج وقتين متتاليين
  if (idx + svc.slots > SLOTS.length) return json(409, { error: "taken" });

  // لا حجز في وقت مضى (بتوقيت إسطنبول)
  const now = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Istanbul" });
  if (day + " " + slot + ":00" <= now) return json(409, { error: "past" });

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = process.env.SALON_WHATSAPP;
  if (!sid || !token || !from || !to) return json(500, { error: "config" });

  let dayText = day;
  try {
    dayText = new Date(day + "T12:00:00Z").toLocaleDateString("ar", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "UTC",
    });
  } catch (e) {}

  const body =
    "🔔 حجز جديد - الحلاقة للرجال\n" +
    "الاسم: " + name + "\n" +
    "الجوال: " + phone + "\n" +
    "الخدمة: " + svc.name + "\n" +
    "اليوم: " + dayText + " (" + day + ")\n" +
    "الوقت: " + arTime(slot);

  try {
    const res = await fetch(
      "https://api.twilio.com/2010-04-01/Accounts/" + sid + "/Messages.json",
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + Buffer.from(sid + ":" + token).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ From: from, To: to, Body: body }).toString(),
      }
    );
    if (!res.ok) {
      console.error("Twilio error:", res.status, await res.text());
      return json(502, { error: "twilio" });
    }
    return json(200, { ok: true });
  } catch (err) {
    console.error(err);
    return json(500, { error: "send" });
  }
};
