'use client';

import { StageNode } from '@/components/learn/StageNode';
import type { WorldWithProgress } from '@/lib/learning-path';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type WorldDetailClientProps = {
  world: WorldWithProgress;
};

export function WorldDetailClient({ world }: WorldDetailClientProps) {
  return (
    <motion.div className="mx-auto max-w-2xl pb-16">
      <Link
        href="/learn"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Learning Path
      </Link>

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-[24px] bg-gradient-to-br p-8 text-white shadow-card',
          world.gradient
        )}
      >
        <span className="text-7xl">{world.icon}</span>
        <h1 className="mt-4 text-3xl font-black">{world.title}</h1>
        <p className="mt-2 text-white/85">{world.description}</p>
        <p className="mt-4 text-sm font-semibold text-white/90">
          Your progress: {world.completedStages}/{world.total_stages} stages
        </p>
      </motion.div>

      <div className="mt-10 space-y-0">
        {world.stages.map((stage, index) => (
          <StageNode
            key={stage.key}
            stage={stage}
            worldKey={world.key}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
}
