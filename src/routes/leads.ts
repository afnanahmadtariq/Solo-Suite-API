import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Get all leads
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const leads = await prisma.lead.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    // Add relative date for frontend compatibility
    const mapped = leads.map(l => ({
      ...l,
      date: getRelativeDate(l.createdAt),
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Get single lead
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const lead = await prisma.lead.findFirst({
      where: { id: parseInt(req.params.id as string), userId: req.userId },
    });
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ ...lead, date: getRelativeDate(lead.createdAt) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// Create lead
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, company, value, status, type } = req.body;
    const lead = await prisma.lead.create({
      data: {
        title,
        company,
        value,
        status: status || 'New',
        type,
        userId: req.userId!,
      },
    });
    res.status(201).json({ ...lead, date: 'Just now' });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// Update lead
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { title, company, value, status, type } = req.body;
    const result = await prisma.lead.updateMany({
      where: { id: parseInt(req.params.id as string), userId: req.userId },
      data: { title, company, value, status, type },
    });
    if (result.count === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    const updated = await prisma.lead.findFirst({
      where: { id: parseInt(req.params.id as string) },
    });
    res.json({ ...updated, date: getRelativeDate(updated!.createdAt) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Update lead status
router.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const result = await prisma.lead.updateMany({
      where: { id: parseInt(req.params.id as string), userId: req.userId },
      data: { status },
    });
    if (result.count === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    const updated = await prisma.lead.findFirst({
      where: { id: parseInt(req.params.id as string) },
    });
    res.json({ ...updated, date: getRelativeDate(updated!.createdAt) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lead status' });
  }
});

// Delete lead
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await prisma.lead.deleteMany({
      where: { id: parseInt(req.params.id as string), userId: req.userId },
    });
    if (result.count === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

function getRelativeDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Just now';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  if (days < 14) return '1w ago';
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default router;
