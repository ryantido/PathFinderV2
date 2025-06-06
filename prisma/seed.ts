import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Utilisateurs
  const user = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      password: 'hashedpassword',
      profile: {
        create: {
          firstName: 'Alice',
          lastName: 'Martin',
          role: 'USER',
          settings: {
            bio: 'Passionnée par le développement web',
            location: 'Paris',
            skills: ['React', 'TypeScript'],
            preferences: { jobAlerts: true, publicProfile: true, newsletterSubscribed: false },
          },
        },
      },
    },
    include: { profile: true },
  });

  // Jobs
  const job1 = await prisma.job.create({
    data: {
      title: 'Développeur Frontend React',
      company: 'TechCorp',
      location: 'Paris',
      description: 'Développez des applications web modernes avec React.',
      salaryRange: '45K - 55K €',
      tags: ['React', 'TypeScript', 'JavaScript'],
    },
  });
  const job2 = await prisma.job.create({
    data: {
      title: 'UX Designer',
      company: 'DesignStudio',
      location: 'Lyon',
      description: 'Concevez des expériences utilisateur exceptionnelles.',
      salaryRange: '50K - 60K €',
      tags: ['Figma', 'Design', 'Prototypage'],
    },
  });

  // Quiz
  const quiz = await prisma.quiz.create({
    data: {
      title: "Quiz d'Orientation Professionnelle",
      description: 'Découvrez votre profil professionnel',
      questions: {
        create: [
          {
            text: 'Dans quel environnement préférez-vous travailler ?',
            options: ['Bureau', 'Télétravail', 'Extérieur', 'Atelier'],
            correct: null,
          },
          {
            text: 'Quelle activité vous motive le plus ?',
            options: ['Résoudre des problèmes', 'Créer', 'Aider', 'Organiser'],
            correct: null,
          },
        ],
      },
    },
    include: { questions: true },
  });

  // Résultat de quiz
  await prisma.quizResult.create({
    data: {
      quizId: quiz.id,
      userId: user.id,
      resultData: { 1: 0, 2: 1 },
      score: 2,
    },
  });

  // Favoris
  await prisma.favoriteJob.create({
    data: {
      userId: user.id,
      jobId: job1.id,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 