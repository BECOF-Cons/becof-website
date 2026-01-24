import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Compass, Briefcase, TrendingUp, Users, CheckCircle, ArrowRight, Lightbulb, GraduationCap, Target, Award, BookOpen, Calendar, FileText } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

async function getServices() {
  try {
    const services = await prisma.service.findMany({
      where: {
        active: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });
    return services;
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

// Icon mapping for common service types
const iconMap: { [key: string]: any } = {
  ORIENTATION_SESSION: Compass,
  CAREER_COUNSELING: Briefcase,
  CAREER_COACHING: TrendingUp,
  GROUP_WORKSHOP: Users,
  Compass,
  Briefcase,
  TrendingUp,
  Users,
  Lightbulb,
  GraduationCap,
  Target,
  Award,
  BookOpen,
  Calendar,
  FileText,
  default: Lightbulb,
};

function getIconForService(iconName?: string, serviceType?: string) {
  // First try to get icon by name
  if (iconName && iconMap[iconName]) {
    return iconMap[iconName];
  }
  // Fallback to serviceType mapping
  if (serviceType && iconMap[serviceType]) {
    return iconMap[serviceType];
  }
  return iconMap.default;
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dbServices = await getServices();

  const services = dbServices.map((service) => ({
    icon: getIconForService(service.icon || undefined, service.serviceType),
    title: locale === 'fr' ? service.nameFr : service.nameEn,
    description: locale === 'fr' ? service.descriptionFr : service.descriptionEn,
    serviceType: service.serviceType,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="text-white py-32 mt-24" style={{background: 'linear-gradient(135deg, #2d5aa8 0%, #1e3a7a 100%)'}}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {locale === 'fr' ? 'Nos Services' : 'Our Services'}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {locale === 'fr'
              ? 'Des solutions professionnelles adaptées à vos besoins de développement de carrière'
              : 'Professional solutions tailored to your career development needs'}
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-8"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-lg" style={{background: 'linear-gradient(135deg, rgba(35, 54, 145, 0.1) 0%, rgba(249, 170, 4, 0.1) 100%)'}}>
                    <Icon className="h-8 w-8" style={{color: '#233691'}} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {service.title}
                    </h3>
                  </div>
                </div>

                <p className="text-gray-600 mb-6 line-clamp-4">{service.description}</p>

                <Link
                  href={`/${locale}/appointment?service=${encodeURIComponent(service.serviceType)}`}
                  className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                  style={{background: 'linear-gradient(135deg, #F9AA04 0%, #e69a03 100%)'}}
                >
                  {locale === 'fr' ? 'Réserver maintenant' : 'Book Now'}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {locale === 'fr' ? 'Prêt à commencer votre transformation?' : 'Ready to start your transformation?'}
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {locale === 'fr'
              ? 'Prenez rendez-vous dès aujourd\'hui et donnez un nouvel élan à votre carrière'
              : 'Book an appointment today and give your career a new boost'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/appointment`}
              className="inline-flex items-center justify-center gap-2 bg-white text-teal-600 px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              {locale === 'fr' ? 'Prendre rendez-vous' : 'Book Appointment'}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-teal-600 transition-all"
            >
              {locale === 'fr' ? 'Nous contacter' : 'Contact Us'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
