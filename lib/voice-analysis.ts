export const FILLER_WORDS_LIST = [
  'um',
  'uh',
  'like',
  'you know',
  'so',
  'basically',
  'literally',
  'right',
  'kind of',
  'sort of',
  'i mean',
  'actually',
  'honestly',
] as const;

export type VoiceAnalysisResult = {
  overallScore: number;
  confidenceScore: number;
  strengths: string[];
  improvements: string[];
  clinicalAccuracyNote: string;
  paceFeedback: string;
  fillerFeedback?: string;
  fillerWordCount: number;
  fillerWordsFound: Record<string, number>;
  wordCount: number;
  wordsPerMinute: number;
  paceRating: 'Too Slow' | 'Just Right' | 'Too Fast';
};

export type VoiceSpecialtyKey =
  | 'General'
  | 'ICU'
  | 'ED'
  | 'Med-Surg'
  | 'L&D'
  | 'OR';

export const VOICE_SPECIALTY_OPTIONS: {
  key: VoiceSpecialtyKey;
  label: string;
  apiValue: string;
}[] = [
  { key: 'General', label: 'General', apiValue: 'General Nursing' },
  { key: 'ICU', label: 'ICU', apiValue: 'ICU / Critical Care' },
  { key: 'ED', label: 'ED', apiValue: 'Emergency' },
  { key: 'Med-Surg', label: 'Med-Surg', apiValue: 'Med-Surg' },
  { key: 'L&D', label: 'L&D', apiValue: 'Labor & Delivery' },
  { key: 'OR', label: 'OR', apiValue: 'OR / Surgical' },
];

export function detectFillerWords(transcript: string): {
  fillerWordCount: number;
  fillerWordsFound: Record<string, number>;
} {
  const fillerWordsFound: Record<string, number> = {};
  let fillerWordCount = 0;
  const lower = transcript.toLowerCase();

  for (const filler of FILLER_WORDS_LIST) {
    const escaped = filler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = lower.match(regex);
    const count = matches?.length || 0;
    if (count > 0) {
      fillerWordsFound[filler] = count;
      fillerWordCount += count;
    }
  }

  return { fillerWordCount, fillerWordsFound };
}

export function calculateSpeechMetrics(
  transcript: string,
  durationSeconds: number
): {
  wordCount: number;
  wordsPerMinute: number;
  paceRating: VoiceAnalysisResult['paceRating'];
} {
  const wordCount = transcript.split(/\s+/).filter(Boolean).length;
  const safeDuration = Math.max(durationSeconds, 1);
  const wordsPerMinute = Math.round((wordCount / safeDuration) * 60);
  const paceRating: VoiceAnalysisResult['paceRating'] =
    wordsPerMinute < 100
      ? 'Too Slow'
      : wordsPerMinute > 160
        ? 'Too Fast'
        : 'Just Right';

  return { wordCount, wordsPerMinute, paceRating };
}

export function fillerCountColor(count: number): string {
  if (count <= 2) return '#00C6B2';
  if (count <= 5) return '#F59E0B';
  return '#EF4444';
}

export function scoreColor(score: number): string {
  if (score >= 80) return '#00C6B2';
  if (score >= 60) return '#7C5CBF';
  return '#EF4444';
}

export function confidenceStars(score: number): number {
  if (score >= 90) return 3;
  if (score >= 75) return 2;
  return 1;
}

export type TranscriptSegment = {
  text: string;
  isFiller: boolean;
};

export function buildTranscriptSegments(
  transcript: string,
  fillerWordsFound: Record<string, number>
): TranscriptSegment[] {
  if (!transcript.trim()) return [];

  const fillers = Object.keys(fillerWordsFound).sort(
    (a, b) => b.length - a.length
  );
  if (fillers.length === 0) {
    return [{ text: transcript, isFiller: false }];
  }

  const pattern = fillers
    .map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const regex = new RegExp(`(\\b(?:${pattern})\\b)`, 'gi');
  const parts = transcript.split(regex).filter((p) => p.length > 0);

  return parts.map((part) => {
    const lower = part.toLowerCase();
    const isFiller = fillers.some((f) => f.toLowerCase() === lower);
    return { text: part, isFiller };
  });
}

export function formatFillerList(fillerWordsFound: Record<string, number>): string {
  return Object.entries(fillerWordsFound)
    .map(([word, count]) => `${word} (${count}×)`)
    .join(', ');
}
