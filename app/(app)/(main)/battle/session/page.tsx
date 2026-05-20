'use client';

import { BattleSessionClient } from '@/components/battle/BattleSessionClient';
import { Suspense } from 'react';

export default function BattleSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-b from-[#1A0533] to-[#2D1B69] text-white">
          Loading battle...
        </div>
      }
    >
      <BattleSessionClient />
    </Suspense>
  );
}
