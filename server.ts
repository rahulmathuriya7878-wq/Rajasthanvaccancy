import express from 'express';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser, getUserByUid } from './src/db/users.ts';
import { getSavedVacanciesByUserId, saveVacancyItem, removeSavedVacancyItem } from './src/db/vacancies.ts';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Routes
  // Synchronize authenticated user profile to Cloud SQL
  app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { email, name, picture } = req.body;
      const user = await getOrCreateUser(
        req.user.uid,
        email || req.user.email || '',
        name || req.user.name,
        picture || req.user.picture
      );
      res.json(user);
    } catch (error: any) {
      console.error('Failed to sync user:', error);
      res.status(500).json({ error: 'Failed to sync user' });
    }
  });

  // Get saved vacancies
  app.get('/api/saved', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const user = await getUserByUid(req.user.uid);
      if (!user) return res.json([]);
      const saved = await getSavedVacanciesByUserId(user.id);
      res.json(saved);
    } catch (error: any) {
      console.error('Failed to get saved vacancies:', error);
      res.status(500).json({ error: 'Failed to fetch saved vacancies' });
    }
  });

  // Save vacancy
  app.post('/api/saved', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const user = await getOrCreateUser(
        req.user.uid,
        req.user.email || '',
        req.user.name,
        req.user.picture
      );
      const { vacancyId, vacancyTitle, category } = req.body;
      if (!vacancyId || !vacancyTitle) {
        return res.status(400).json({ error: 'Missing vacancyId or vacancyTitle' });
      }
      const saved = await saveVacancyItem(user.id, vacancyId, vacancyTitle, category || 'general');
      res.json(saved);
    } catch (error: any) {
      console.error('Failed to save vacancy:', error);
      res.status(500).json({ error: 'Failed to save vacancy' });
    }
  });

  // Remove saved vacancy
  app.delete('/api/saved/:vacancyId', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const user = await getUserByUid(req.user.uid);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const { vacancyId } = req.params;
      await removeSavedVacancyItem(user.id, vacancyId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Failed to remove saved vacancy:', error);
      res.status(500).json({ error: 'Failed to remove saved vacancy' });
    }
  });

  // Vite dev middleware or production static files
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
