import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Get all projects
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.userId },
      include: { client: { select: { name: true, company: true } } },
      orderBy: { createdAt: 'desc' },
    });
    // Map to include client name as string for frontend compatibility
    const mapped = projects.map(p => ({
      ...p,
      client: p.client.company || p.client.name,
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: parseInt(req.params.id as string), userId: req.userId },
      include: { client: true },
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create project
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, clientId, status, progress, dueDate } = req.body;
    const project = await prisma.project.create({
      data: {
        name,
        status: status || 'Planning',
        progress: progress || 0,
        dueDate,
        userId: req.userId!,
        clientId,
      },
      include: { client: { select: { name: true, company: true } } },
    });
    res.status(201).json({
      ...project,
      client: project.client.company || project.client.name,
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { name, status, progress, dueDate, clientId } = req.body;
    const result = await prisma.project.updateMany({
      where: { id: parseInt(req.params.id as string), userId: req.userId },
      data: { name, status, progress, dueDate, clientId },
    });
    if (result.count === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const updated = await prisma.project.findFirst({
      where: { id: parseInt(req.params.id as string) },
      include: { client: { select: { name: true, company: true } } },
    });
    res.json({
      ...updated,
      client: updated?.client.company || updated?.client.name,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await prisma.project.deleteMany({
      where: { id: parseInt(req.params.id as string), userId: req.userId },
    });
    if (result.count === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
