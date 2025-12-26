export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No auth check for login page - just passes through to parent layout
  // Add centering wrapper for the login page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-amber-100 px-4">
      {children}
    </div>
  );
}
