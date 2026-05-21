'use client';

import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const MAX_BYTES = 2 * 1024 * 1024;

type Props = {
  headshotBase64: string | null;
  onChange: (base64: string | null) => void;
};

export function ResumeHeadshotUpload({ headshotBase64, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!headshotBase64) {
      setPreviewUrl(null);
      return;
    }
    setPreviewUrl(headshotBase64);
  }, [headshotBase64]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const openPicker = () => inputRef.current?.click();

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToast('Please choose an image file.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setToast('Photo must be 2MB or smaller.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        onChange(result);
      }
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(typeof result === 'string' ? result : null);
    };
    reader.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(headshotBase64);
      setToast('Could not read that image. Try another file.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col items-center">
      <p className="mb-3 w-full text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
        Profile Photo (optional)
      </p>

      <button
        type="button"
        onClick={openPicker}
        className={cn(
          'relative h-24 w-24 overflow-hidden rounded-full border-2 border-dashed transition',
          previewUrl
            ? 'border-[#7C5CBF]/40'
            : 'border-gray-200 bg-gray-100 hover:border-[#7C5CBF]/50'
        )}
        aria-label="Upload profile photo"
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Profile preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-gray-400">
            <Camera className="h-8 w-8" />
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      <button
        type="button"
        onClick={openPicker}
        className="mt-3 rounded-pill border-2 border-[#7C5CBF] px-4 py-1.5 text-xs font-bold text-[#7C5CBF] transition hover:bg-[#7C5CBF]/10"
      >
        Upload Photo
      </button>

      {headshotBase64 && (
        <button
          type="button"
          onClick={handleRemove}
          className="mt-2 text-xs font-semibold text-red-500 hover:underline"
        >
          Remove
        </button>
      )}

      <AnimatePresence>
        {toast && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-6 left-1/2 z-[80] max-w-sm -translate-x-1/2 rounded-pill bg-red-500 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg"
          >
            {toast}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
