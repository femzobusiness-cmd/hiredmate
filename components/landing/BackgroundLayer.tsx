export function BackgroundLayer() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #0A0118 0%, #0D0221 50%, #120033 100%)',
      }}
      aria-hidden
    >
      <div
        className="landing-float absolute -right-32 top-0 h-[600px] w-[600px] rounded-full bg-purple-600/20 blur-[120px]"
      />
      <div
        className="landing-float-delayed absolute -left-32 bottom-0 h-[500px] w-[500px] rounded-full bg-teal-500/15 blur-[100px]"
      />
      <div
        className="landing-float-slow absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/10 blur-[80px]"
      />
    </div>
  );
}
