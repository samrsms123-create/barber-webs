const { headers } = require("./_lib");
exports.handler = async (e) => {
  const day = (e.queryStringParameters || {}).day || "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return { statusCode: 400, body: "bad day" };
  const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/bookings?day=eq.${day}&select=slot`, { headers: headers() });
  if (!r.ok) return { statusCode: 500, body: "db error" };
  const rows = await r.json();
  return {
    statusCode: 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
    body: JSON.stringify(rows.map((x) => x.slot.slice(0, 5))),
  };
};
