import Anthropic from '@anthropic-ai/sdk';

let anthropicInstance: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!anthropicInstance) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }
    anthropicInstance = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicInstance;
}

export const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
