import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminLoginForm from '@/components/admin/AdminLoginForm';

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  // If already logged in, redirect to admin dashboard
  if (session && ['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role as string)) {
    redirect(`/${locale}/admin`);
  }

  return <AdminLoginForm locale={locale} />;
}
