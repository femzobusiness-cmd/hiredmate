export function AuroraBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#04000F]"
      aria-hidden
    >
      <div
        className="aurora-orb-1 absolute -right-[10%] -top-[20%] h-[900px] w-[900px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(109,40,217,0.4) 0%, rgba(109,40,217,0.1) 40%, transparent 70%)',
        }}
      />
      <div
        className="aurora-orb-2 absolute -bottom-[20%] -left-[10%] h-[700px] w-[700px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(0,198,178,0.25) 0%, transparent 70%)',
        }}
      />
      <div
        className="aurora-orb-3 absolute left-[30%] top-[40%] h-[500px] w-[500px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(244,114,182,0.15) 0%, transparent 70%)',
        }}
      />
      <div className="immersive-grid absolute inset-0" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.03]" aria-hidden>
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
}
