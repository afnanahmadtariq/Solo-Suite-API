import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Get all clients
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Get single client
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const client = await prisma.client.findFirst({
      where: { id: parseInt(req.params.id as string), userId: req.userId },
    });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// Create client
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, company, email, phone, status, leadId } = req.body;
    const client = await prisma.client.create({
      data: {
        name,
        company,
        email,
        phone,
        status: status || 'Active',
        userId: req.userId!,
        leadId,
      },
    });
    res.status(201).json(client);
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Update client
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { name, company, email, phone, status, leadId } = req.body;
    const client = await prisma.client.updateMany({
      where: { id: parseInt(req.params.id as string), userId: req.userId },
      data: { name, company, email, phone, status, leadId },
    });
    if (client.count === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    const updated = await prisma.client.findFirst({
      where: { id: parseInt(req.params.id as string) },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Delete client
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await prisma.client.deleteMany({
      where: { id: parseInt(req.params.id as string), userId: req.userId },
    });
    if (result.count === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ message: 'Client deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

export default router;
