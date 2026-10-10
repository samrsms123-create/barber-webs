exports.istNow = () => new Date().toLocaleString("sv-SE", { timeZone: "Europe/Istanbul" });
exports.addDays = (d, n) => { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
exports.SLOTS = ["19:00","19:15","19:30","19:45","20:00","20:15","20:30","20:45"];
exports.SERVICES = {
  hair:  { n: 1, ar: "قص شعر" },
  beard: { n: 1, ar: "حلاقة ذقن" },
  both:  { n: 2, ar: "قص شعر + حلاقة ذقن" },
};
exports.headers = () => ({
  apikey: process.env.SUPABASE_SERVICE_KEY,
  Authorization: "Bearer " + process.env.SUPABASE_SERVICE_KEY,
  "Content-Type": "application/json",
});
