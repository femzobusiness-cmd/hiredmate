export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-page-bg p-4 sm:p-8">{children}</div>
  );
}
