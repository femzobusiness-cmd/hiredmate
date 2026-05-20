'use client';

import Logo from '@/components/ui/Logo';
import {
  getPersonalityConfig,
  INTERVIEW_HOSPITAL_OPTIONS,
  type PersonalityMode,
} from '@/lib/mock-interview';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export function MockInterviewSession() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const personality = (searchParams.get('personality') || 'neutral') as PersonalityMode;
  const specialty = searchParams.get('specialty') || 'General Nursing';
  const hospitalId = searchParams.get('hospital') || '';
  const minQuestions = Number(searchParams.get('questions') || '5');
  const config = getPersonalityConfig(personality);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [avatarState, setAvatarState] = useState<'idle' | 'thinking' | 'speaking'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentTopicCount, setCurrentTopicCount] = useState(0);
  const [weakAnswerStreak, setWeakAnswerStreak] = useState(0);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [showDebriefModal, setShowDebriefModal] = useState(false);
  const [sessionStartTime] = useState(() => new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hospitalLabel =
    INTERVIEW_HOSPITAL_OPTIONS.find((h) => h.value === hospitalId)?.label || null;

  const userAnswerCount = messages.filter((m) => m.role === 'user').length;

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(
        Math.floor((Date.now() - sessionStartTime.getTime()) / 1000)
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStartTime]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isLoading]);

  const applyTurnState = useCallback(
    (turnType: 'opening' | 'follow_up' | 'new_topic' | 'closing') => {
      if (turnType === 'follow_up') {
        setWeakAnswerStreak((s) => s + 1);
      } else if (turnType === 'new_topic' || turnType === 'opening') {
        setCurrentTopicCount((c) => c + 1);
        setWeakAnswerStreak(0);
      }
    },
    []
  );

  const callInterviewApi = useCallback(
    async (
      history: ChatMessage[],
      topicCount: number,
      weakStreak: number
    ) => {
      const res = await fetch('/api/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          personality,
          specialty,
          hospital_id: hospitalId || null,
          minQuestions,
          currentTopicCount: topicCount,
          weakAnswerStreak: weakStreak,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Interview API failed');
      return data as {
        message: string;
        interviewComplete: boolean;
        turnType: 'opening' | 'follow_up' | 'new_topic' | 'closing';
      };
    },
    [personality, specialty, hospitalId, minQuestions]
  );

  const startInterview = useCallback(async () => {
    setIsLoading(true);
    setAvatarState('thinking');
    try {
      const data = await callInterviewApi([], 0, 0);
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };
      setMessages([aiMessage]);
      applyTurnState(data.turnType || 'opening');
      setInterviewStarted(true);
      setAvatarState('speaking');
      if (data.interviewComplete) setInterviewEnded(true);
      setTimeout(() => setAvatarState('idle'), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [callInterviewApi, applyTurnState]);

  useEffect(() => {
    if (!interviewStarted && messages.length === 0) {
      startInterview();
    }
  }, [interviewStarted, messages.length, startInterview]);

  const sendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };
    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInputValue('');
    setIsLoading(true);
    setAvatarState('thinking');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const data = await callInterviewApi(
        nextHistory,
        currentTopicCount,
        weakAnswerStreak
      );
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      applyTurnState(data.turnType || 'new_topic');
      setAvatarState('speaking');
      if (data.interviewComplete) setInterviewEnded(true);
      setTimeout(() => setAvatarState('idle'), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const saveAndGoToDebrief = async () => {
    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const conversation = messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
      }));

      const { data, error } = await supabase
        .from('mock_interviews')
        .insert({
          user_id: user.id,
          personality_mode: personality,
          specialty,
          hospital_id: hospitalId || null,
          conversation,
          duration_seconds: elapsedSeconds,
        })
        .select('id')
        .single();

      if (error) throw error;
      router.push(`/mock-interview/debrief?id=${data.id}`);
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  const timerDisplay = `${Math.floor(elapsedSeconds / 60)
    .toString()
    .padStart(2, '0')}:${(elapsedSeconds % 60).toString().padStart(2, '0')}`;

  return (
    <motion.div className="flex h-[calc(100vh-4rem)] min-h-[600px] bg-[#F8F7FF] lg:h-screen">
      <aside className="hidden w-72 flex-col border-r border-[#7C5CBF]/10 bg-white p-5 shadow-sm lg:flex">
        <Logo size="sm" showText />
        <div className="mt-6 rounded-[20px] bg-[#F8F7FF] p-4">
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-bold text-white"
            style={{ backgroundColor: config.color }}
          >
            {config.name} Mode
          </span>
          <p className="mt-3 text-sm text-gray-600">
            <span className="font-semibold text-[#1a1a2e]">Specialty:</span> {specialty}
          </p>
          {hospitalLabel && hospitalLabel !== 'None' && (
            <p className="mt-1 text-sm text-gray-600">
              <span className="font-semibold text-[#1a1a2e]">Hospital:</span>{' '}
              {hospitalLabel}
            </p>
          )}
          <p className="mt-4 text-xs font-semibold text-[#7C5CBF]">
            Topics covered: {currentTopicCount}
          </p>
          <p className="mt-1 text-[10px] text-gray-500">
            Minimum {minQuestions} · interviewer decides when you&apos;re ready
          </p>
        </div>

        <button
          type="button"
          onClick={() => setTipsOpen(!tipsOpen)}
          className="mt-4 w-full rounded-[12px] bg-[#F8F7FF] px-4 py-3 text-left text-sm font-semibold text-[#7C5CBF]"
        >
          💡 Interview Tips {tipsOpen ? '▲' : '▼'}
        </button>
        <AnimatePresence>
          {tipsOpen && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 space-y-2 overflow-hidden text-xs text-gray-600"
            >
              <li>• Listen carefully before answering</li>
              <li>• Use STAR format for behavioral questions</li>
              <li>• It&apos;s okay to ask for a moment to think</li>
              <li>• Be specific — avoid vague answers</li>
            </motion.ul>
          )}
        </AnimatePresence>

        {userAnswerCount >= 3 && (
          <button
            type="button"
            onClick={() => setShowDebriefModal(true)}
            className="mt-auto rounded-full border border-red-300 px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50"
          >
            End Interview Early
          </button>
        )}
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-[#7C5CBF]/10 bg-white px-4 py-3 shadow-sm">
          <span
            className="rounded-full px-3 py-1 text-xs font-bold text-white lg:hidden"
            style={{ backgroundColor: config.color }}
          >
            {config.name}
          </span>
          <span className="text-sm font-semibold text-gray-600 lg:hidden">
            Topics: {currentTopicCount}
          </span>
          <span className="font-mono text-sm font-bold text-[#7C5CBF]">
            {timerDisplay}
          </span>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-col items-center border-b border-[#7C5CBF]/5 bg-white/50 py-6">
            <div className="relative">
              {avatarState === 'speaking' && (
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-[#7C5CBF]"
                  animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}
              <motion.div
                animate={
                  avatarState === 'idle'
                    ? { scale: [1, 1.03, 1] }
                    : { scale: 1 }
                }
                transition={
                  avatarState === 'idle'
                    ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                    : {}
                }
                className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#7C5CBF] to-[#9B7FD4] text-4xl shadow-lg"
              >
                {config.avatarEmoji}
              </motion.div>
            </div>
            <p className="mt-3 font-bold text-[#1a1a2e]">{config.interviewerName}</p>
            <p className="text-sm text-gray-500">Hiring Manager, Nursing</p>
            {avatarState === 'thinking' && (
              <div className="mt-3 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-2 w-2 rounded-full bg-[#7C5CBF]"
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto max-w-2xl space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={`${msg.timestamp.toISOString()}-${i}`}
                  initial={{
                    opacity: 0,
                    x: msg.role === 'assistant' ? -20 : 20,
                  }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    'flex gap-2',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7C5CBF] to-[#9B7FD4] text-sm">
                      {config.avatarEmoji}
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%] rounded-[16px] px-4 py-3',
                      msg.role === 'assistant'
                        ? 'bg-white shadow-[0_4px_20px_rgba(124,92,191,0.1)]'
                        : 'bg-gradient-to-r from-[#7C5CBF] to-[#9B7FD4] text-white'
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <p className="mb-1 text-xs font-bold text-[#7C5CBF]">
                        {config.interviewerName}
                      </p>
                    )}
                    <p
                      className={cn(
                        'text-sm leading-relaxed',
                        msg.role === 'assistant' ? 'text-gray-700' : 'text-white'
                      )}
                    >
                      {msg.content}
                    </p>
                    <p
                      className={cn(
                        'mt-1 text-[10px]',
                        msg.role === 'assistant' ? 'text-gray-400' : 'text-white/70'
                      )}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2"
                >
                  <motion.div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#7C5CBF] to-[#9B7FD4] text-sm">
                    {config.avatarEmoji}
                  </motion.div>
                  <div className="rounded-[16px] bg-white px-4 py-3 shadow-md">
                    <motion.div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-2 w-2 rounded-full bg-[#7C5CBF]"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {interviewEnded && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-[#7C5CBF]/10 bg-[#F8F7FF] px-4 py-3 text-center"
            >
              <p className="mb-2 text-sm text-gray-600">
                The interviewer has concluded this session.
              </p>
              <button
                type="button"
                onClick={() => setShowDebriefModal(true)}
                className="rounded-full bg-gradient-to-r from-[#7C5CBF] to-[#9B7FD4] px-8 py-3 text-sm font-bold text-white shadow-lg"
              >
                View Your Debrief →
              </button>
            </motion.div>
          )}

          <div className="border-t border-[#7C5CBF]/10 bg-white px-4 py-4 shadow-[0_-4px_20px_rgba(124,92,191,0.06)]">
            <div className="mx-auto flex max-w-2xl items-end gap-3">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                disabled={isLoading || interviewEnded}
                rows={1}
                placeholder="Type your answer... (Press Enter to send, Shift+Enter for new line)"
                className="max-h-[120px] min-h-[44px] flex-1 resize-none rounded-[12px] border border-[#7C5CBF]/20 bg-[#F8F7FF] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#7C5CBF] disabled:opacity-50"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="shrink-0 rounded-full bg-[#7C5CBF] px-5 py-3 text-sm font-bold text-white disabled:opacity-40"
              >
                Send
              </button>
            </div>
            <p className="mx-auto mt-1 max-w-2xl text-right text-[10px] text-gray-400">
              {inputValue.length} characters
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDebriefModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-[20px] bg-white p-8 text-center shadow-xl"
            >
              <p className="text-xl font-black text-[#1a1a2e]">
                Ready for your debrief?
              </p>
              <p className="mt-2 text-sm text-gray-600">
                We&apos;ll analyze your answers and give you personalized feedback.
              </p>
              <button
                type="button"
                disabled={saving}
                onClick={saveAndGoToDebrief}
                className="mt-6 w-full rounded-full bg-gradient-to-r from-[#7C5CBF] to-[#9B7FD4] py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Yes, show my results →'}
              </button>
              <button
                type="button"
                onClick={() => setShowDebriefModal(false)}
                className="mt-3 w-full text-sm font-medium text-gray-500 hover:text-[#7C5CBF]"
              >
                Keep going
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
