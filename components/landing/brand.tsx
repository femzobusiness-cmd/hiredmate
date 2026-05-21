import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/utils/cn';

export function HiredMateBrand({
  logoSize = 32,
  className,
  href = '/',
}: {
  logoSize?: number;
  className?: string;
  href?: string;
}) {
  const content = (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Image
        src="/hiredmate-logo.png"
        alt="HiredMate"
        width={logoSize}
        height={logoSize}
        className="rounded-xl"
        priority
      />
      <span
        className="text-xl tracking-tight"
        style={{ fontFamily: "'Fredoka One', cursive" }}
      >
        <span className="text-gray-900">Hired</span>
        <span className="ml-0.5 rounded-lg bg-[#7C5CBF] px-1.5 py-0.5 text-white">
          Mate
        </span>
      </span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export const fredoka = { fontFamily: "'Fredoka One', cursive" } as const;
