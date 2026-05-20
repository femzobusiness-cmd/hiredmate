'use client';

import { getAchievementMeta } from '@/lib/community';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRef, useState } from 'react';

type ShareAchievementModalProps = {
  open: boolean;
  onClose: () => void;
  achievementKey: string;
  earnedAt: string;
  userName: string;
};

export function ShareAchievementModal({
  open,
  onClose,
  achievementKey,
  earnedAt,
  userName,
}: ShareAchievementModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const meta = getAchievementMeta(achievementKey);

  const shareText = `I just earned ${meta.title} on HiredMate! Practice nursing interviews at hiredmate.app 🩺`;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `${meta.key}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-[20px] bg-white p-6 shadow-[0_30px_80px_rgba(124,92,191,0.25)]"
          >
            <motion.div
              id="share-card"
              ref={cardRef}
              className="min-w-[320px] rounded-[20px] bg-gradient-to-br from-[#7C5CBF] to-[#4C3A8F] p-8"
            >
              <motion.div className="flex items-center gap-2">
                <Image
                  src="/hiredmate-logo.png"
                  alt="HiredMate"
                  width={32}
                  height={32}
                  className="rounded-xl"
                />
                <span
                  className="text-lg font-semibold text-white"
                  style={{ fontFamily: "'Fredoka One', cursive" }}
                >
                  HiredMate
                </span>
              </motion.div>
              <p className="mt-8 text-center text-6xl">{meta.emoji}</p>
              <p className="mt-4 text-center text-2xl font-bold text-white">
                {meta.title}
              </p>
              <p className="mt-2 text-center text-white/80">{userName}</p>
              <p className="mt-6 text-center text-sm italic text-white/70">
                I just earned this on HiredMate 🩺
              </p>
              <p className="mt-8 text-right text-xs text-white/50">
                hiredmate.app
              </p>
            </motion.div>

            <motion.div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="rounded-pill bg-gradient-to-r from-[#7C5CBF] to-[#9B7FD4] px-6 py-3 text-sm font-bold text-white shadow-md disabled:opacity-60"
              >
                {downloading ? 'Saving...' : '⬇ Download Image'}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-pill border border-[#7C5CBF]/30 bg-[#F8F7FF] px-6 py-3 text-sm font-bold text-[#7C5CBF]"
              >
                {copied ? 'Copied ✓' : '📋 Copy Text'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-sm font-semibold text-gray-500"
              >
                ✕ Close
              </button>
            </motion.div>
            <p className="mt-2 text-center text-[10px] text-gray-400">
              Earned {new Date(earnedAt).toLocaleDateString()}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
