import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('CODE PATH:', __filename);
console.log('TEST LOG UNIQUE');
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const app = express();
const PORT = 4000;
const JWT_SECRET = 'supersecret'; // À mettre dans un vrai .env en prod

app.use(cors());
app.use(bodyParser.json());

// Middleware JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  try {
    const user = jwt.verify(token, JWT_SECRET); // version synchrone
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token invalide' });
  }
}

// Auth: Signup
app.post('/api/auth/signup', async (req, res) => {
  console.log('ROUTE /api/auth/signup HIT', req.method, req.body);
  const { email, password, firstName, lastName } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: 'Email déjà utilisé' });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      profile: {
        create: {
          firstName,
          lastName,
          role: 'USER',
        },
      },
    },
    include: { profile: true },
  });
  res.json({ id: user.id, email: user.email, profile: user.profile });
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  console.log('ROUTE /api/auth/login HIT', req.method, req.body);
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
  if (!user) return res.status(401).json({ error: 'Utilisateur inconnu' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect' });
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, profile: user.profile } });
});

// Users
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany({ include: { profile: true } });
  res.json(users);
});

// Jobs
app.get('/api/jobs', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [jobs, totalCount] = await Promise.all([
    prisma.job.findMany({
      skip,
      take: limit,
      orderBy: { postedAt: 'desc' },
    }),
    prisma.job.count(),
  ]);

  res.json({ jobs, totalCount });
});

// Quizzes
app.get('/api/quizzes', async (req, res) => {
  const quizzes = await prisma.quiz.findMany();
  res.json(quizzes);
});

// Questions for a quiz
app.get('/api/quizzes/:quizId/questions', async (req, res) => {
  const quizId = Number(req.params.quizId);
  const questions = await prisma.question.findMany({ where: { quizId } });
  res.json(questions);
});

// Quiz Results
app.get('/api/quizResults', async (req, res) => {
  const results = await prisma.quizResult.findMany();
  res.json(results);
});

app.post('/api/quizResults', authenticateToken, async (req, res) => {
  const { quizId, userId, resultData, score } = req.body;
  if (req.user.id !== userId) return res.status(403).json({ error: 'Accès interdit' });
  const result = await prisma.quizResult.create({
    data: { quizId, userId, resultData, score },
  });
  res.json(result);
});

// Favorite Jobs
app.get('/api/users/:userId/favorites', authenticateToken, async (req, res) => {
  const userId = req.params.userId;
  if (req.user.id !== userId) return res.status(403).json({ error: 'Accès interdit' });
  const favorites = await prisma.favoriteJob.findMany({ where: { userId } });
  res.json(favorites);
});

app.post('/api/users/:userId/favorites', authenticateToken, async (req, res) => {
  const userId = req.params.userId;
  if (req.user.id !== userId) return res.status(403).json({ error: 'Accès interdit' });
  const { jobId } = req.body;
  const fav = await prisma.favoriteJob.create({ data: { userId, jobId } });
  res.json(fav);
});

app.delete('/api/users/:userId/favorites/:jobId', authenticateToken, async (req, res) => {
  const userId = req.params.userId;
  if (req.user.id !== userId) return res.status(403).json({ error: 'Accès interdit' });
  const jobId = Number(req.params.jobId);
  await prisma.favoriteJob.deleteMany({ where: { userId, jobId } });
  res.json({ success: true });
});

app.get('/api/test', (req, res) => {
  res.json({ ok: true, msg: 'Test route OK' });
});

app.post('/api/test', (req, res) => {
  res.json({ ok: true, msg: 'POST test route OK', body: req.body });
});

app.post('/api/jobs/:jobId/apply', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const jobId = Number(req.params.jobId);
  const { message } = req.body;
  try {
    const application = await prisma.application.create({
      data: { userId, jobId, message },
    });
    res.json(application);
  } catch (e) {
    res.status(400).json({ error: 'Erreur lors de la candidature', details: e.message });
  }
});

app.get('/api/profile', authenticateToken, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { profile: true },
  });

  // Récupère toutes les candidatures de l'utilisateur
  const applications = await prisma.application.findMany({
    where: { userId: req.user.id },
    include: { job: true },
    orderBy: { createdAt: 'desc' },
  });

  // Nombre total
  const total = applications.length;
  // 5 dernières
  const lastApplications = applications.slice(0, 5).map(app => ({
    id: app.id,
    job: app.job ? { id: app.job.id, title: app.job.title, company: app.job.company } : null,
    createdAt: app.createdAt,
    message: app.message,
  }));
  // Stats par entreprise
  const byCompany = {};
  for (const app of applications) {
    const company = app.job?.company || 'Inconnu';
    byCompany[company] = (byCompany[company] || 0) + 1;
  }
  // Stats par mois (6 derniers mois)
  const byMonth = {};
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    byMonth[key] = 0;
  }
  for (const app of applications) {
    const d = new Date(app.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (byMonth[key] !== undefined) byMonth[key]++;
  }

  res.json({
    ...user,
    applicationsSummary: {
      total,
      lastApplications,
      byCompany,
      byMonth,
    },
  });
});

app.get('/api/applications', authenticateToken, async (req, res) => {
  const userId = req.query.userId || req.user.id;
  const applications = await prisma.application.findMany({
    where: { userId: userId },
    include: { job: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(applications);
});

app.post('/api/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { firstName, lastName, email, phone, location, title, bio, skills, experience, education, preferences } = req.body;
  // Vérifie si le profil existe déjà
  const existing = await prisma.profile.findUnique({ where: { userId } });
  if (existing) return res.status(400).json({ error: 'Profil déjà existant' });
  // Met à jour l'email si besoin
  if (email) {
    await prisma.user.update({ where: { id: userId }, data: { email } });
  }
  // Crée le profil
  const profile = await prisma.profile.create({
    data: {
      userId,
      firstName,
      lastName,
      role: 'USER',
      settings: {
        phone,
        location,
        title,
        bio,
        skills: skills || [],
        experience: experience || [],
        education: education || [],
        preferences: preferences || { jobAlerts: true, publicProfile: true, newsletterSubscribed: false },
      },
    },
  });
  res.json(profile);
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
}); 