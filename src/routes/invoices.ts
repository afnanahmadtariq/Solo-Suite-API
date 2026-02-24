import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Get all invoices
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId: req.userId },
      include: {
        client: { select: { name: true, company: true } },
        project: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
    const mapped = invoices.map(i => ({
      ...i,
      client: i.client.company || i.client.name,
      project: i.project?.name || null,
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get single invoice
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: parseInt(req.params.id as string), userId: req.userId },
      include: { client: true },
    });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Create invoice
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { number, clientId, date, amount, status, projectId } = req.body;
    const invoice = await prisma.invoice.create({
      data: {
        number,
        date,
        amount,
        status: status || 'Pending',
        userId: req.userId!,
        clientId,
        projectId,
      },
      include: {
        client: { select: { name: true, company: true } },
        project: { select: { name: true } }
      },
    });
    res.status(201).json({
      ...invoice,
      client: invoice.client.company || invoice.client.name,
      project: invoice.project?.name || null,
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Update invoice
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { number, date, amount, status, clientId, projectId } = req.body;
    const result = await prisma.invoice.updateMany({
      where: { id: parseInt(req.params.id as string), userId: req.userId },
      data: { number, date, amount, status, clientId, projectId },
    });
    if (result.count === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    const updated = await prisma.invoice.findFirst({
      where: { id: parseInt(req.params.id as string) },
      include: {
        client: { select: { name: true, company: true } },
        project: { select: { name: true } }
      },
    });
    res.json({
      ...updated,
      client: updated?.client.company || updated?.client.name,
      project: updated?.project?.name || null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// Update invoice status
router.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const result = await prisma.invoice.updateMany({
      where: { id: parseInt(req.params.id as string), userId: req.userId },
      data: { status },
    });
    if (result.count === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    const updated = await prisma.invoice.findFirst({
      where: { id: parseInt(req.params.id as string) },
      include: {
        client: { select: { name: true, company: true } },
        project: { select: { name: true } }
      },
    });
    res.json({
      ...updated,
      client: updated?.client.company || updated?.client.name,
      project: updated?.project?.name || null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
});

// Delete invoice
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await prisma.invoice.deleteMany({
      where: { id: parseInt(req.params.id as string), userId: req.userId },
    });
    if (result.count === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

export default router;
