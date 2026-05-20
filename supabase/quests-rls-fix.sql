-- Run in Supabase SQL Editor if quest cards are empty on /quests

drop policy if exists "Authenticated users can read quests" on public.quests;
drop policy if exists "Anyone can read quests" on public.quests;

create policy "Anyone can read quests"
  on public.quests for select
  to authenticated
  using (true);

grant select on public.quests to authenticated;
grant select, insert, update on public.user_quest_progress to authenticated;
