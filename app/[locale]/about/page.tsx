'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Target, Users, Award, Heart, TrendingUp, Sparkles } from 'lucide-react';

interface TeamMember {
  id: string;
  nameFr: string;
  nameEn: string;
  titleFr: string;
  titleEn: string;
  bioFr: string | null;
  bioEn: string | null;
  image: string;
}

export default function AboutPage() {
  const locale = useLocale();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Convert Google Drive share links to direct image URLs
  const convertGoogleDriveUrl = (url: string): string => {
    if (!url) return url;
    
    const patterns = [
      /drive\.google\.com\/file\/d\/([^/]+)/,
      /drive\.google\.com\/open\?id=([^&]+)/,
      /drive\.google\.com\/uc\?id=([^&]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
      }
    }
    
    return url;
  };

  useEffect(() => {
    fetch('/api/admin/team')
      .then((res) => res.json())
      .then((data) => {
        setTeamMembers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching team members:', err);
        setLoading(false);
      });
  }, []);

  const values = [
    {
      icon: Target,
      title: locale === 'fr' ? 'Excellence' : 'Excellence',
      description: locale === 'fr'
        ? 'Nous visons l\'excellence dans chaque service que nous offrons'
        : 'We aim for excellence in every service we provide',
    },
    {
      icon: Heart,
      title: locale === 'fr' ? 'Empathie' : 'Empathy',
      description: locale === 'fr'
        ? 'Nous comprenons vos défis et aspirations professionnelles'
        : 'We understand your professional challenges and aspirations',
    },
    {
      icon: Users,
      title: locale === 'fr' ? 'Personnalisation' : 'Personalization',
      description: locale === 'fr'
        ? 'Chaque client reçoit un accompagnement adapté à ses besoins'
        : 'Each client receives support tailored to their needs',
    },
    {
      icon: TrendingUp,
      title: locale === 'fr' ? 'Innovation' : 'Innovation',
      description: locale === 'fr'
        ? 'Nous utilisons les méthodes les plus récentes en développement de carrière'
        : 'We use the latest methods in career development',
    },
  ];

  const stats = [
    {
      number: '500+',
      label: locale === 'fr' ? 'Clients accompagnés' : 'Clients Supported',
    },
    {
      number: '95%',
      label: locale === 'fr' ? 'Taux de satisfaction' : 'Satisfaction Rate',
    },
    {
      number: '10+',
      label: locale === 'fr' ? 'Années d\'expérience' : 'Years of Experience',
    },
    {
      number: '50+',
      label: locale === 'fr' ? 'Partenaires entreprises' : 'Corporate Partners',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="text-white py-20" style={{background: 'linear-gradient(135deg, #233691 0%, #1a2870 100%)'}}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {locale === 'fr' ? 'À propos de BECOF' : 'About BECOF'}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {locale === 'fr'
              ? 'Votre partenaire de confiance pour le développement de carrière en Tunisie'
              : 'Your trusted partner for career development in Tunisia'}
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-8 w-8 text-teal-600" />
              <h2 className="text-3xl font-bold text-gray-900">
                {locale === 'fr' ? 'Notre Mission' : 'Our Mission'}
              </h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              {locale === 'fr'
                ? 'BECOF (Bureau d\'Études, de Conseil, d\'Orientation et de Formation) est un cabinet de conseil spécialisé dans l\'orientation professionnelle et le développement de carrière. Notre mission est d\'accompagner les individus et les organisations dans leur évolution professionnelle.'
                : 'BECOF (Bureau of Studies, Consulting, Orientation and Training) is a consulting firm specialized in career guidance and development. Our mission is to support individuals and organizations in their professional evolution.'}
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              {locale === 'fr'
                ? 'Nous croyons que chaque personne possède un potentiel unique. Notre approche personnalisée permet à nos clients de découvrir leurs forces, clarifier leurs objectifs et construire une carrière épanouissante et réussie.'
                : 'We believe that each person has unique potential. Our personalized approach enables our clients to discover their strengths, clarify their goals, and build a fulfilling and successful career.'}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 text-center"
              >
                <div className="text-3xl font-bold text-teal-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Values */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {locale === 'fr' ? 'Nos Valeurs' : 'Our Values'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-br from-blue-100 to-amber-100 p-3 rounded-lg">
                        <Icon className="h-6 w-6 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {value.title}
                        </h3>
                        <p className="text-gray-600">{value.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Section */}
          {teamMembers.length > 0 && (
            <div className="mb-12">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 mb-4">
                  <Users className="h-8 w-8" style={{color: '#F9AA04'}} />
                  <h2 className="text-3xl font-bold text-gray-900">
                    {locale === 'fr' ? 'Notre Équipe' : 'Our Team'}
                  </h2>
                </div>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {locale === 'fr'
                    ? 'Des professionnels passionnés et dévoués à votre réussite'
                    : 'Passionate professionals dedicated to your success'}
                </p>
              </div>

              <div className="max-w-5xl mx-auto">
                <div className="flex flex-wrap justify-center gap-8">
                  {teamMembers.map((member, index) => {
                    const name = locale === 'fr' ? member.nameFr : member.nameEn;
                    const title = locale === 'fr' ? member.titleFr : member.titleEn;
                    const bio = locale === 'fr' ? member.bioFr : member.bioEn;
                    const imageUrl = convertGoogleDriveUrl(member.image);

                    return (
                      <div
                        key={member.id}
                        className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 w-full sm:w-[calc(50%-1rem)] max-w-md"
                      >
                        {/* Decorative gradient background */}
                        <div 
                          className="absolute top-0 left-0 w-full h-32 opacity-10"
                          style={{background: `linear-gradient(135deg, ${index % 2 === 0 ? '#233691' : '#F9AA04'} 0%, ${index % 2 === 0 ? '#1a2870' : '#e69a03'} 100%)`}}
                        />
                        
                        {/* Content */}
                        <div className="relative p-8 text-center">
                          {/* Image with animated border */}
                          <div className="mb-6 inline-block">
                            <div 
                              className="p-1 rounded-full group-hover:scale-105 transition-transform duration-300"
                              style={{background: `linear-gradient(135deg, ${index % 2 === 0 ? '#233691' : '#F9AA04'} 0%, ${index % 2 === 0 ? '#1a2870' : '#e69a03'} 100%)`}}
                            >
                              <div className="bg-white p-1 rounded-full">
                                <img
                                  src={imageUrl}
                                  alt={name}
                                  className="w-40 h-40 rounded-full object-cover"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    console.error('Failed to load image:', imageUrl);
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Name */}
                          <h3 
                            className="text-2xl font-bold mb-2"
                            style={{color: index % 2 === 0 ? '#233691' : '#F9AA04'}}
                          >
                            {name}
                          </h3>

                          {/* Title */}
                          <p className="text-base font-medium text-gray-600 mb-4">
                            {title}
                          </p>

                          {/* Bio */}
                          {bio && (
                            <p className="text-sm text-gray-500 leading-relaxed">
                              {bio}
                            </p>
                          )}

                          {/* Decorative element */}
                          <div 
                            className="mt-6 h-1 w-16 mx-auto rounded-full"
                            style={{backgroundColor: index % 2 === 0 ? '#233691' : '#F9AA04'}}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Original Team Description (shown if no members) */}
          {teamMembers.length === 0 && !loading && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center gap-3 mb-6">
                <Award className="h-8 w-8 text-teal-600" />
                <h2 className="text-3xl font-bold text-gray-900">
                  {locale === 'fr' ? 'Notre Équipe' : 'Our Team'}
                </h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                {locale === 'fr'
                  ? 'Notre équipe est composée de conseillers d\'orientation certifiés, de coachs professionnels expérimentés et d\'experts en développement de carrière. Chaque membre de notre équipe apporte une expertise unique et une passion pour aider les autres à réussir.'
                  : 'Our team consists of certified career counselors, experienced professional coaches, and career development experts. Each team member brings unique expertise and a passion for helping others succeed.'}
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                {locale === 'fr'
                  ? 'Nous nous engageons à rester à la pointe des tendances du marché du travail et des meilleures pratiques en matière de développement professionnel pour offrir à nos clients un service de qualité supérieure.'
                  : 'We are committed to staying at the forefront of labor market trends and best practices in professional development to provide our clients with superior service.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {locale === 'fr' ? 'Commencez votre parcours avec nous' : 'Start your journey with us'}
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {locale === 'fr'
              ? 'Découvrez comment nous pouvons vous aider à atteindre vos objectifs professionnels'
              : 'Discover how we can help you achieve your professional goals'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/appointment`}
              className="inline-flex items-center justify-center bg-white text-teal-600 px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              {locale === 'fr' ? 'Prendre rendez-vous' : 'Book Appointment'}
            </Link>
            <Link
              href={`/${locale}/services`}
              className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-teal-600 transition-all"
            >
              {locale === 'fr' ? 'Voir nos services' : 'View Services'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
