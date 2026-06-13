-- supabase/schema.sql
-- 本專案的 Supabase 資料表。已透過 MCP migration 套用到
-- 「evelynytliu's Project」(oyqsqtscblflfnutqayj)。
-- 以 mathconcept_ 前綴與同一資料庫的其他專案（kiddolens_、錯題本…）明確分開。
-- 對應 CLAUDE.md 的資料結構。本專案單純自用，用寬鬆的存取政策。

-- 單元學習進度（每個單元一列）
create table if not exists public.mathconcept_progress (
  id uuid primary key default gen_random_uuid(),
  unit_id text not null unique,
  section_reached int not null default 1,            -- 走到第幾段（1-5）
  completed_at timestamptz,                            -- 完成第 5 段才填
  variant_results jsonb not null default '{}'::jsonb, -- 第 4 段三題對錯
  updated_at timestamptz not null default now()
);

-- 孩子寫的解釋（第 3 段，可多筆）
create table if not exists public.mathconcept_explanations (
  id uuid primary key default gen_random_uuid(),
  unit_id text not null,
  student_text text not null,
  self_assessment text,                               -- 'got_it' | 'partial' | 'cant_explain'
  ai_feedback jsonb,                                  -- AI 模式的回饋 JSON，可為 null
  created_at timestamptz not null default now()
);

create index if not exists mathconcept_explanations_unit_idx
  on public.mathconcept_explanations (unit_id, created_at desc);

-- 自用專案：開 RLS 但允許完整存取（資料只在自己機器上用）
alter table public.mathconcept_progress enable row level security;
alter table public.mathconcept_explanations enable row level security;

drop policy if exists "mathconcept allow all progress" on public.mathconcept_progress;
create policy "mathconcept allow all progress" on public.mathconcept_progress
  for all using (true) with check (true);

drop policy if exists "mathconcept allow all explanations" on public.mathconcept_explanations;
create policy "mathconcept allow all explanations" on public.mathconcept_explanations
  for all using (true) with check (true);
