export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dark-bg p-4 text-text-primary sm:p-8">{children}</div>
  );
}
