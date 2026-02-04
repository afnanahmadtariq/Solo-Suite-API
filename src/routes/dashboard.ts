import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Get dashboard stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Get counts
    const [
      totalClients,
      activeClients,
      activeProjects,
      invoices,
      leads
    ] = await Promise.all([
      prisma.client.count({ where: { userId } }),
      prisma.client.count({ where: { userId, status: 'Active' } }),
      prisma.project.count({ where: { userId, status: 'In Progress' } }),
      prisma.invoice.findMany({ where: { userId } }),
      prisma.lead.findMany({ where: { userId } }),
    ]);

    // Calculate revenue stats
    const totalRevenue = invoices
      .filter(i => i.status === 'Paid')
      .reduce((sum, i) => sum + i.amount, 0);

    const pendingAmount = invoices
      .filter(i => i.status === 'Pending' || i.status === 'Overdue')
      .reduce((sum, i) => sum + i.amount, 0);

    const overdueCount = invoices.filter(i => i.status === 'Overdue').length;

    // Calculate leads stats
    const newLeadsCount = leads.filter(l => l.status === 'New').length;
    const wonLeadsValue = leads
      .filter(l => l.status === 'Won')
      .reduce((sum, l) => sum + l.value, 0);

    res.json({
      clients: {
        total: totalClients,
        active: activeClients,
      },
      projects: {
        active: activeProjects,
      },
      invoices: {
        totalRevenue,
        pendingAmount,
        overdueCount,
      },
      leads: {
        new: newLeadsCount,
        wonValue: wonLeadsValue,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
