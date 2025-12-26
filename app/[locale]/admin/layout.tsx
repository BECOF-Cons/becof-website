export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth check moved to individual pages to avoid redirect loop on login page
  // Admin layout doesn't render Navbar/Footer - just the children
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
