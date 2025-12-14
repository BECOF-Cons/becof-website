import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Compass, Briefcase, TrendingUp, Users, CheckCircle, ArrowRight } from 'lucide-react';

async function getPrices() {
  try {
    const prices = await prisma.siteSettings.findMany({
      where: {
        key: {
          in: [
            'price_orientation',
            'price_career_counseling',
            'price_career_coaching',
            'price_group_workshop',
          ],
        },
      },
    });

    return {
      orientation: prices.find((p) => p.key === 'price_orientation')?.value || '150',
      careerCounseling: prices.find((p) => p.key === 'price_career_counseling')?.value || '200',
      careerCoaching: prices.find((p) => p.key === 'price_career_coaching')?.value || 'Sur devis',
      groupWorkshop: prices.find((p) => p.key === 'price_group_workshop')?.value || '80',
    };
  } catch (error) {
    // Return defaults if database query fails
    return {
      orientation: '150',
      careerCounseling: '200',
      careerCoaching: 'Sur devis',
      groupWorkshop: '80',
    };
  }
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const prices = await getPrices();

  const services = [
    {
      icon: Compass,
      title: locale === 'fr' ? 'Séance d\'orientation' : 'Orientation Session',
      description: locale === 'fr' 
        ? 'Une séance personnalisée pour vous aider à clarifier vos objectifs académiques et professionnels. Nous analysons vos forces, intérêts et aspirations pour créer un plan d\'action adapté.'
        : 'A personalized session to help you clarify your academic and professional goals. We analyze your strengths, interests and aspirations to create a tailored action plan.',
      features: locale === 'fr'
        ? [
            'Évaluation complète de votre profil',
            'Identification de vos points forts',
            'Exploration des options de carrière',
            'Plan d\'action personnalisé',
          ]
        : [
            'Complete profile assessment',
            'Identification of your strengths',
            'Career options exploration',
            'Personalized action plan',
          ],
      duration: locale === 'fr' ? '1 heure' : '1 hour',
      price: `${prices.orientation} TND`,
    },
    {
      icon: Briefcase,
      title: locale === 'fr' ? 'Conseil en carrière' : 'Career Counseling',
      description: locale === 'fr'
        ? 'Un accompagnement approfondi pour développer votre carrière. Nous vous aidons à prendre des décisions éclairées concernant votre parcours professionnel et à surmonter les obstacles.'
        : 'In-depth support to develop your career. We help you make informed decisions about your professional path and overcome obstacles.',
      features: locale === 'fr'
        ? [
            'Analyse de carrière approfondie',
            'Stratégies de développement professionnel',
            'Préparation aux entretiens',
            'Optimisation du CV et LinkedIn',
          ]
        : [
            'In-depth career analysis',
            'Professional development strategies',
            'Interview preparation',
            'CV and LinkedIn optimization',
          ],
      duration: locale === 'fr' ? '1h30' : '1.5 hours',
      price: `${prices.careerCounseling} TND`,
    },
    {
      icon: TrendingUp,
      title: locale === 'fr' ? 'Coaching de carrière' : 'Career Coaching',
      description: locale === 'fr'
        ? 'Un programme de coaching sur mesure pour accélérer votre progression professionnelle. Développez vos compétences de leadership et atteignez vos objectifs de carrière.'
        : 'A tailored coaching program to accelerate your professional growth. Develop your leadership skills and achieve your career goals.',
      features: locale === 'fr'
        ? [
            'Sessions de coaching régulières',
            'Développement des soft skills',
            'Stratégies de networking',
            'Suivi personnalisé continu',
          ]
        : [
            'Regular coaching sessions',
            'Soft skills development',
            'Networking strategies',
            'Continuous personalized follow-up',
          ],
      duration: locale === 'fr' ? 'Programme sur mesure' : 'Custom program',
      price: prices.careerCoaching.includes('devis') || prices.careerCoaching.toLowerCase().includes('quote') 
        ? prices.careerCoaching 
        : `${prices.careerCoaching} TND`,
    },
    {
      icon: Users,
      title: locale === 'fr' ? 'Ateliers de groupe' : 'Group Workshops',
      description: locale === 'fr'
        ? 'Des ateliers interactifs en groupe pour développer des compétences professionnelles essentielles. Apprenez en réseau et partagez des expériences avec d\'autres professionnels.'
        : 'Interactive group workshops to develop essential professional skills. Learn by networking and share experiences with other professionals.',
      features: locale === 'fr'
        ? [
            'Sessions thématiques mensuelles',
            'Exercices pratiques en groupe',
            'Partage d\'expériences',
            'Networking professionnel',
          ]
        : [
            'Monthly thematic sessions',
            'Practical group exercises',
            'Experience sharing',
            'Professional networking',
          ],
      duration: locale === 'fr' ? '2-3 heures' : '2-3 hours',
      price: `${prices.groupWorkshop} TND`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-teal-600 to-purple-700 text-white py-20">
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
                  <div className="bg-gradient-to-br from-teal-100 to-purple-100 p-3 rounded-lg">
                    <Icon className="h-8 w-8 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{service.duration}</span>
                      <span className="font-semibold text-teal-600">{service.price}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-6">{service.description}</p>

                <div className="space-y-3 mb-6">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={`/${locale}/appointment`}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
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
      <div className="bg-gradient-to-br from-teal-600 to-purple-700 text-white py-16">
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
