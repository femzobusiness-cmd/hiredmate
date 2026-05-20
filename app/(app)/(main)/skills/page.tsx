import { SkillTreeClient } from '@/components/skills/SkillTreeClient';
import { mergeSkillProgress } from '@/lib/skill-progress';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function SkillsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: skillRows } = await supabase
    .from('skill_progress')
    .select('*')
    .eq('user_id', session!.user.id);

  const { data: sessions } = await supabase
    .from('practice_sessions')
    .select('id')
    .eq('user_id', session!.user.id);

  const sessionIds = sessions?.map((item) => item.id) || [];

  const { data: answers } = sessionIds.length
    ? await supabase
        .from('session_answers')
        .select('skill_key, question, score')
        .in('session_id', sessionIds)
        .not('score', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100)
    : { data: [] };

  const skills = mergeSkillProgress(skillRows);

  return (
    <SkillTreeClient
      skills={skills}
      answerHighlights={answers || []}
    />
  );
}
