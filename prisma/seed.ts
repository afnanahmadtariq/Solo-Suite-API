import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'afnan@example.com' },
    update: {},
    create: {
      email: 'afnan@example.com',
      password: hashedPassword,
      name: 'Afnan',
    },
  });

  console.log('Created user:', user.email);

  // Create clients
  const client1 = await prisma.client.create({
    data: {
      name: 'Jane Cooper',
      company: 'Acme Corp',
      email: 'jane@acme.com',
      phone: '+1 555-0123',
      status: 'Active',
      userId: user.id,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Cody Fisher',
      company: 'TechStart',
      email: 'cody@techstart.io',
      phone: '+1 555-0124',
      status: 'Active',
      userId: user.id,
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'Esther Howard',
      company: 'Design Co',
      email: 'esther@design.co',
      phone: '+1 555-0125',
      status: 'Inactive',
      userId: user.id,
    },
  });

  console.log('Created clients');

  // Create projects
  await prisma.project.createMany({
    data: [
      { name: 'Website Redesign', status: 'In Progress', progress: 65, dueDate: 'Dec 20', userId: user.id, clientId: client1.id },
      { name: 'Mobile App MVP', status: 'Planning', progress: 10, dueDate: 'Jan 15', userId: user.id, clientId: client2.id },
      { name: 'Marketing Campaign', status: 'Completed', progress: 100, dueDate: 'Nov 30', userId: user.id, clientId: client3.id },
    ],
  });

  console.log('Created projects');

  // Create invoices
  await prisma.invoice.createMany({
    data: [
      { number: 'INV-001', date: 'Dec 01, 2025', amount: 1200.00, status: 'Paid', userId: user.id, clientId: client1.id },
      { number: 'INV-002', date: 'Dec 05, 2025', amount: 3500.00, status: 'Pending', userId: user.id, clientId: client2.id },
      { number: 'INV-003', date: 'Nov 20, 2025', amount: 850.00, status: 'Overdue', userId: user.id, clientId: client3.id },
    ],
  });

  console.log('Created invoices');

  // Create leads
  await prisma.lead.createMany({
    data: [
      { title: 'E-commerce Platform', company: 'Global Retail Inc.', value: 5000, status: 'New', type: 'Web Dev', userId: user.id },
      { title: 'Logo Redesign', company: 'Startup X', value: 800, status: 'New', type: 'Design', userId: user.id },
      { title: 'SEO Audit', company: 'Local Shop', value: 1200, status: 'Contacted', type: 'Consulting', userId: user.id },
      { title: 'Corporate Site', company: 'Big Corp', value: 12000, status: 'Proposal Sent', type: 'Web Dev', userId: user.id },
    ],
  });

  console.log('Created leads');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
