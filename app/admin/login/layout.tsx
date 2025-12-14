export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No auth check for login page - just passes through to parent layout
  return <>{children}</>;
}
