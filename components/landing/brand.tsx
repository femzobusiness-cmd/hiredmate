import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/utils/cn';

export const fredoka = { fontFamily: "'Fredoka One', cursive" } as const;

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
      <span className="text-xl font-bold tracking-tight" style={fredoka}>
        <span className="text-white">Hired</span>
        <span className="ml-0.5 rounded-lg bg-[#7C5CBF] px-2 py-0.5 text-white">
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
