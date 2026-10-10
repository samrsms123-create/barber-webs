-- شغّل هذا الملف مرة واحدة في Supabase > SQL Editor
create table bookings (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  service text not null,
  day date not null,
  slot time not null,
  unique (day, slot)   -- يمنع حجز نفس الوقت مرتين
);
-- RLS مفعّل بدون سياسات = لا أحد يصل للجدول من المتصفح، فقط الدوال على الخادم
alter table bookings enable row level security;
