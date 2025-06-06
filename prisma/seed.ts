import { PrismaClient, Job } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Nettoyage de la base
  await prisma.favoriteJob.deleteMany();
  await prisma.application.deleteMany();
  await prisma.quizResult.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.job.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Utilisateurs
  const user = await prisma.user.create({
    data: {
      email: 'testuser@example.com',
      password: 'hashedpassword',
      profile: {
        create: {
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
          settings: {
            bio: 'Utilisateur de test',
            location: 'Paris',
            skills: ['Test', 'React', 'Node'],
            preferences: { jobAlerts: true, publicProfile: true, newsletterSubscribed: false },
            phone: '0600000000',
            title: 'Développeur Test',
            experience: [{ id: 1, title: 'Testeur', company: 'TestCorp', period: '2022-2024', description: 'Tests QA' }],
            education: [{ id: 1, degree: 'Licence Test', school: 'TestFac', year: '2022' }],
          },
        },
      },
    },
    include: { profile: true },
  });

  // Jobs
  const jobs: any[] = [];
  for (let i = 1; i <= 20; i++) {
    jobs.push(await prisma.job.create({
      data: {
        title: `Job ${i}`,
        company: `Company ${i}`,
        location: ['Paris', 'Lyon', 'Remote', 'Marseille', 'Bordeaux'][i % 5],
        description: `Description du job ${i}`,
        salaryRange: `${35 + i}K - ${45 + i}K €`,
        tags: ["tag1", "tag2", i % 2 === 0 ? "remote" : "on-site"],
        postedAt: new Date(),
      },
    }));
  }

  // Quiz
  const quizIds: number[] = [];
  for (let q = 1; q <= 10; q++) {
    const quiz = await prisma.quiz.create({
      data: {
        title: `Quiz ${q}`,
        description: `Description du quiz ${q}`,
        createdAt: new Date(),
        updatedAt: null,
      },
    });
    quizIds.push(quiz.id);
    for (let j = 1; j <= 20; j++) {
      await prisma.question.create({
        data: {
          quizId: quiz.id,
          text: `Question ${j} du quiz ${q}`,
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correct: null,
        },
      });
    }
  }

  // Favoris
  await prisma.favoriteJob.create({ data: { userId: user.id, jobId: jobs[0].id } });
  await prisma.favoriteJob.create({ data: { userId: user.id, jobId: jobs[1].id } });

  // Résultats de quiz
  await prisma.quizResult.create({ data: { quizId: quizIds[0], userId: user.id, resultData: { 1: 2, 2: 1 }, score: 15 } });
  await prisma.quizResult.create({ data: { quizId: quizIds[1], userId: user.id, resultData: { 1: 0, 2: 2 }, score: 12 } });

  // Vérification
  const jobCount = await prisma.job.count();
  const quizCount = await prisma.quiz.count();
  const questionCount = await prisma.question.count();
  console.log(`Seed terminé : ${jobCount} jobs, ${quizCount} quiz, ${questionCount} questions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 