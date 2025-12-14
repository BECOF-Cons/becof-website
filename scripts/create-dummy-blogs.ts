import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDummyBlogs() {
  try {
    // Get the admin user
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!admin) {
      console.error('No admin user found');
      return;
    }

    // Get categories
    const orientationCategory = await prisma.blogCategory.findFirst({
      where: { slugEn: 'orientation' },
    });

    const careerCategory = await prisma.blogCategory.findFirst({
      where: { slugEn: 'career' },
    });

    const studiesCategory = await prisma.blogCategory.findFirst({
      where: { slugEn: 'studies' },
    });

    // Blog Post 1: Orientation
    const post1 = await prisma.blogPost.create({
      data: {
        titleEn: 'How to Choose the Right University Major',
        titleFr: 'Comment choisir la bonne filière universitaire',
        slugEn: 'how-to-choose-the-right-university-major',
        slugFr: 'comment-choisir-la-bonne-filiere-universitaire',
        excerptEn: 'A comprehensive guide to help Tunisian Baccalauréat students make informed decisions about their university major.',
        excerptFr: 'Un guide complet pour aider les bacheliers tunisiens à prendre des décisions éclairées concernant leur filière universitaire.',
        contentEn: `Choosing the right university major is one of the most important decisions you'll make in your academic journey. Here are some key factors to consider:

## 1. Know Your Interests

Take time to reflect on what subjects genuinely excite you. Your passion will fuel your motivation throughout your studies.

## 2. Research Career Prospects

Investigate the job market and career opportunities related to your potential majors. Consider:
- Employment rates
- Salary ranges
- Industry growth
- Required skills

## 3. Talk to Professionals

Connect with people working in fields you're interested in. Their insights can be invaluable.

## 4. Consider Your Strengths

Choose a field that aligns with your natural abilities and skills. Success often comes easier when you play to your strengths.

## 5. Think Long-Term

Consider where you see yourself in 5-10 years. Will this major help you achieve your long-term goals?

Remember, it's okay to change your mind. Many successful professionals have switched careers or pursued different paths than their initial choice.`,
        contentFr: `Choisir la bonne filière universitaire est l'une des décisions les plus importantes que vous prendrez dans votre parcours académique. Voici quelques facteurs clés à considérer :

## 1. Connaissez vos intérêts

Prenez le temps de réfléchir aux sujets qui vous passionnent vraiment. Votre passion alimentera votre motivation tout au long de vos études.

## 2. Recherchez les perspectives de carrière

Étudiez le marché du travail et les opportunités de carrière liées à vos filières potentielles. Considérez :
- Les taux d'emploi
- Les fourchettes de salaires
- La croissance du secteur
- Les compétences requises

## 3. Parlez à des professionnels

Connectez-vous avec des personnes travaillant dans les domaines qui vous intéressent. Leurs perspectives peuvent être inestimables.

## 4. Considérez vos forces

Choisissez un domaine qui correspond à vos capacités et compétences naturelles. Le succès vient souvent plus facilement quand vous jouez sur vos forces.

## 5. Pensez à long terme

Considérez où vous vous voyez dans 5-10 ans. Cette filière vous aidera-t-elle à atteindre vos objectifs à long terme ?

N'oubliez pas, il est normal de changer d'avis. De nombreux professionnels réussis ont changé de carrière ou poursuivi des chemins différents de leur choix initial.`,
        coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200',
        published: true,
        authorId: admin.id,
        categoryId: orientationCategory?.id || null,
      },
    });

    console.log('✅ Created blog post 1:', post1.titleEn);

    // Blog Post 2: Career
    const post2 = await prisma.blogPost.create({
      data: {
        titleEn: '5 Essential Skills for Career Success in 2025',
        titleFr: '5 compétences essentielles pour réussir sa carrière en 2025',
        slugEn: '5-essential-skills-for-career-success-2025',
        slugFr: '5-competences-essentielles-reussir-carriere-2025',
        excerptEn: 'Discover the top skills employers are looking for and how to develop them for a successful career.',
        excerptFr: 'Découvrez les principales compétences recherchées par les employeurs et comment les développer pour une carrière réussie.',
        contentEn: `The job market is constantly evolving, and staying competitive requires continuous skill development. Here are five essential skills for 2025:

## 1. Digital Literacy

In our increasingly digital world, understanding technology is no longer optional. This includes:
- Basic coding knowledge
- Data analysis skills
- Digital communication tools
- Cybersecurity awareness

## 2. Emotional Intelligence

The ability to understand and manage emotions - both your own and others' - is crucial for:
- Effective teamwork
- Leadership
- Conflict resolution
- Client relationships

## 3. Adaptability

Change is the only constant. Develop your ability to:
- Learn quickly
- Embrace new technologies
- Adjust to new environments
- Overcome challenges

## 4. Critical Thinking

Employers value people who can:
- Analyze complex problems
- Make data-driven decisions
- Think creatively
- Solve problems independently

## 5. Communication Skills

Clear communication remains vital:
- Written communication
- Public speaking
- Active listening
- Cross-cultural communication

Start developing these skills now to stay ahead in your career!`,
        contentFr: `Le marché du travail évolue constamment, et rester compétitif nécessite un développement continu des compétences. Voici cinq compétences essentielles pour 2025 :

## 1. Littératie numérique

Dans notre monde de plus en plus numérique, comprendre la technologie n'est plus optionnel. Cela inclut :
- Connaissances de base en programmation
- Compétences en analyse de données
- Outils de communication digitale
- Sensibilisation à la cybersécurité

## 2. Intelligence émotionnelle

La capacité à comprendre et gérer les émotions - les vôtres et celles des autres - est cruciale pour :
- Le travail d'équipe efficace
- Le leadership
- La résolution de conflits
- Les relations clients

## 3. Adaptabilité

Le changement est la seule constante. Développez votre capacité à :
- Apprendre rapidement
- Adopter de nouvelles technologies
- S'adapter à de nouveaux environnements
- Surmonter les défis

## 4. Pensée critique

Les employeurs valorisent les personnes capables de :
- Analyser des problèmes complexes
- Prendre des décisions basées sur les données
- Penser de manière créative
- Résoudre des problèmes de manière autonome

## 5. Compétences en communication

Une communication claire reste vitale :
- Communication écrite
- Prise de parole en public
- Écoute active
- Communication interculturelle

Commencez à développer ces compétences dès maintenant pour rester en tête dans votre carrière !`,
        coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200',
        published: true,
        authorId: admin.id,
        categoryId: careerCategory?.id || null,
      },
    });

    console.log('✅ Created blog post 2:', post2.titleEn);

    // Blog Post 3: Studies
    const post3 = await prisma.blogPost.create({
      data: {
        titleEn: 'Study Abroad: Complete Guide for Tunisian Students',
        titleFr: 'Études à l\'étranger : Guide complet pour les étudiants tunisiens',
        slugEn: 'study-abroad-complete-guide-tunisian-students',
        slugFr: 'etudes-etranger-guide-complet-etudiants-tunisiens',
        excerptEn: 'Everything you need to know about studying abroad, from choosing a destination to securing scholarships.',
        excerptFr: 'Tout ce que vous devez savoir sur les études à l\'étranger, du choix de la destination à l\'obtention de bourses.',
        contentEn: `Studying abroad can be a transformative experience. Here's your complete guide to making it happen:

## Choosing Your Destination

Consider these factors:
- Language requirements
- Cost of living
- Quality of education
- Cultural fit
- Career opportunities post-graduation

### Popular Destinations for Tunisian Students:
- France (historical ties, language)
- Germany (free education, strong economy)
- Canada (immigration-friendly, bilingual)
- Turkey (affordable, growing opportunities)

## Financial Planning

### Tuition Costs
Research tuition fees carefully. Some countries offer:
- Free or low-cost education
- Scholarships for international students
- Work-study programs

### Scholarships
Key scholarship opportunities:
- Erasmus+ (Europe)
- DAAD (Germany)
- Campus France
- Fulbright (USA)
- Chevening (UK)

## Application Process

1. **Research Programs** (12-18 months before)
2. **Prepare Documents**
   - Academic transcripts
   - Letters of recommendation
   - Personal statement
   - Language certificates (TOEFL, IELTS, DELF)
3. **Apply Early** (deadlines vary)
4. **Prepare Financially**

## Visa Requirements

Each country has different requirements. Common documents:
- Acceptance letter
- Proof of financial means
- Health insurance
- Accommodation proof

## Life Abroad

### Preparation Tips:
- Learn the language basics
- Research local customs
- Join student associations
- Budget carefully
- Stay connected with family

### Challenges to Expect:
- Homesickness
- Cultural adjustment
- Language barriers
- Financial management

Remember: thousands of Tunisian students successfully study abroad every year. With proper planning and determination, you can too!`,
        contentFr: `Étudier à l'étranger peut être une expérience transformatrice. Voici votre guide complet pour y parvenir :

## Choisir votre destination

Considérez ces facteurs :
- Exigences linguistiques
- Coût de la vie
- Qualité de l'éducation
- Adéquation culturelle
- Opportunités de carrière après la graduation

### Destinations populaires pour les étudiants tunisiens :
- France (liens historiques, langue)
- Allemagne (éducation gratuite, économie forte)
- Canada (accueillant pour l'immigration, bilingue)
- Turquie (abordable, opportunités croissantes)

## Planification financière

### Frais de scolarité
Recherchez attentivement les frais de scolarité. Certains pays offrent :
- Éducation gratuite ou à faible coût
- Bourses pour étudiants internationaux
- Programmes travail-études

### Bourses
Opportunités de bourses clés :
- Erasmus+ (Europe)
- DAAD (Allemagne)
- Campus France
- Fulbright (USA)
- Chevening (UK)

## Processus de candidature

1. **Recherche de programmes** (12-18 mois avant)
2. **Préparer les documents**
   - Relevés académiques
   - Lettres de recommandation
   - Lettre de motivation
   - Certificats de langue (TOEFL, IELTS, DELF)
3. **Postuler tôt** (les délais varient)
4. **Se préparer financièrement**

## Exigences de visa

Chaque pays a des exigences différentes. Documents communs :
- Lettre d'acceptation
- Preuve de moyens financiers
- Assurance santé
- Preuve d'hébergement

## La vie à l'étranger

### Conseils de préparation :
- Apprendre les bases de la langue
- Rechercher les coutumes locales
- Rejoindre des associations étudiantes
- Budgétiser soigneusement
- Rester connecté avec la famille

### Défis à prévoir :
- Mal du pays
- Adaptation culturelle
- Barrières linguistiques
- Gestion financière

Rappelez-vous : des milliers d'étudiants tunisiens étudient avec succès à l'étranger chaque année. Avec une bonne planification et de la détermination, vous le pouvez aussi !`,
        coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200',
        published: true,
        authorId: admin.id,
        categoryId: studiesCategory?.id || null,
      },
    });

    console.log('✅ Created blog post 3:', post3.titleEn);

    console.log('\n🎉 Successfully created 3 dummy blog posts!');
    console.log('\nYou can now view them at:');
    console.log('- http://localhost:3000/en/blog');
    console.log('- http://localhost:3000/fr/blog');
    console.log('- http://localhost:3000/admin/blog');

  } catch (error) {
    console.error('❌ Error creating dummy blogs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDummyBlogs();
