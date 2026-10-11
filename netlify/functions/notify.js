// netlify/functions/notify.js
// ترسل رسالة واتساب لصاحب الصالون عند كل حجز جديد (عبر Twilio)

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: "Bad JSON" };
  }

  // قص النصوص حتى لا يرسل أحد رسائل طويلة
  const clean = (v) => String(v || "").slice(0, 80);
  const name = clean(data.name);
  const phone = clean(data.phone);
  const service = clean(data.service);
  const date = clean(data.date);
  const time = clean(data.time);

  if (!name || !phone || !service || !date || !time) {
    return { statusCode: 400, body: "Missing fields" };
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = process.env.SALON_WHATSAPP;

  if (!sid || !token || !from || !to) {
    return { statusCode: 500, body: "Server not configured" };
  }

  const body =
    "🔔 حجز جديد - الحلاقة للرجال\n" +
    "الاسم: " + name + "\n" +
    "الجوال: " + phone + "\n" +
    "الخدمة: " + service + "\n" +
    "التاريخ: " + date + "\n" +
    "الوقت: " + time;

  const params = new URLSearchParams({ From: from, To: to, Body: body });

  try {
    const res = await fetch(
      "https://api.twilio.com/2010-04-01/Accounts/" + sid + "/Messages.json",
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + Buffer.from(sid + ":" + token).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("Twilio error:", res.status, text);
      return { statusCode: 502, body: "Twilio error" };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Send failed" };
  }
};
