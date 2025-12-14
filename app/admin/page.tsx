import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default async function AdminPage() {
  const session = await auth();

  if (!session) {
    redirect('/admin/login');
  }

  if (session.user?.role !== 'ADMIN') {
    redirect('/');
  }

  // Fetch real statistics
  const [appointments, payments, users, blogPosts] = await Promise.all([
    prisma.appointment.count(),
    prisma.payment.findMany({
      where: {
        appointment: {
          status: 'CONFIRMED'
        }
      }
    }),
    prisma.user.count(),
    prisma.blogPost.count().catch(() => 0), // Blog posts might not exist yet
  ]);

  // Calculate total revenue from confirmed payments
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

  const stats = {
    totalAppointments: appointments,
    totalRevenue: totalRevenue,
    totalUsers: users,
    totalPosts: blogPosts,
  };

  return <AdminDashboard user={session?.user} stats={stats} />;
}
