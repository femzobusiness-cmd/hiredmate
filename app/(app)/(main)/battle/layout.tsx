export default function BattleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-mx-4 -mt-16 sm:-mx-6 lg:-mx-8 lg:-mt-8">{children}</div>
  );
}
