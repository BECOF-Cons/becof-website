import { prisma } from '@/lib/prisma';
import { GraduationCap } from 'lucide-react';
import FormationsExplorer from './FormationsExplorer';

export const dynamic = 'force-dynamic';

interface FormationsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function FormationsPage({ params }: FormationsPageProps) {
  const { locale } = await params;
  const isFr = locale === 'fr';

  const universities = await prisma.university.findMany({
    where: { active: true },
    orderBy: { displayOrder: 'asc' },
    include: {
      establishments: {
        where: { active: true },
        orderBy: { displayOrder: 'asc' },
        include: {
          filieres: {
            where: { active: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
      },
    },
  }).catch(() => []);

  const totalEstabs = universities.reduce((s, u) => s + u.establishments.length, 0);
  const totalFilieres = universities.reduce((s, u) => s + u.establishments.reduce((ss, e) => ss + e.filieres.length, 0), 0);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative overflow-hidden py-24 pt-36" style={{ background: 'linear-gradient(135deg, #1a2870 0%, #233691 60%, #2d45b0 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10 bg-white" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10 bg-white" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <GraduationCap className="h-4 w-4 text-yellow-300" />
            <span className="text-sm text-white/90">
              {isFr ? 'Annuaire officiel des formations' : 'Official training directory'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {isFr ? 'Offres de Formations' : 'Training Offers'}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            {isFr
              ? 'Explorez les universités, établissements et filières disponibles en Tunisie'
              : 'Explore universities, establishments and degree programs available in Tunisia'}
          </p>
          {/* Stats */}
          <div className="flex justify-center gap-8 flex-wrap">
            {[
              { value: universities.length, label: isFr ? 'Universités' : 'Universities' },
              { value: totalEstabs, label: isFr ? 'Établissements' : 'Establishments' },
              { value: totalFilieres, label: isFr ? 'Filières' : 'Programs' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold text-yellow-300">{value}</p>
                <p className="text-sm text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explorer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <FormationsExplorer universities={universities} locale={locale} />
      </div>
    </main>
  );
}
