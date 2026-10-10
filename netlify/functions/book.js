const { istNow, addDays, SLOTS, SERVICES, headers } = require("./_lib");
const out = (code, o) => ({ statusCode: code, headers: { "content-type": "application/json" }, body: JSON.stringify(o) });

async function notify(text) {
  const { TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM, OWNER_WHATSAPP } = process.env;
  if (!TWILIO_SID) return;
  try {
    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(TWILIO_SID + ":" + TWILIO_TOKEN).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: "whatsapp:" + TWILIO_FROM, To: "whatsapp:" + OWNER_WHATSAPP, Body: text }),
    });
  } catch (e) { /* الحجز نجح حتى لو فشل التنبيه */ }
}

exports.handler = async (e) => {
  if (e.httpMethod !== "POST") return out(405, { error: "method" });
  let b; try { b = JSON.parse(e.body); } catch { return out(400, { error: "bad" }); }
  const name = String(b.name || "").trim().slice(0, 60), phone = String(b.phone || "").trim().slice(0, 30);
  const svc = SERVICES[b.service], i = SLOTS.indexOf(b.slot), day = String(b.day || "");
  const now = istNow(), today = now.slice(0, 10);
  if (!name || !phone || !svc || i < 0 || i + svc.n > SLOTS.length) return out(400, { error: "bad" });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || day < today || day > addDays(today, 6)) return out(400, { error: "bad day" });
  if (day + " " + b.slot + ":00" <= now) return out(400, { error: "past" });

  const rows = SLOTS.slice(i, i + svc.n).map((s) => ({ name, phone, service: svc.ar, day, slot: s }));
  const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/bookings`, {
    method: "POST", headers: { ...headers(), Prefer: "return=minimal" }, body: JSON.stringify(rows),
  });
  if (r.status === 409) return out(409, { error: "taken" });
  if (!r.ok) return out(500, { error: "db" });

  await notify(`حجز جديد - الحلاقة للرجال\nالاسم: ${name}\nالهاتف: ${phone}\nالخدمة: ${svc.ar}\nالموعد: ${day} الساعة ${b.slot}`);
  return out(200, { ok: true });
};
