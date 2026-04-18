const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed (JS)...');

  const tenant = await prisma.tenant.upsert({
    where: { domain: 'skyline.waterting.com' },
    update: {},
    create: {
      name: 'Skyline Developers',
      domain: 'skyline.waterting.com',
      isActive: true,
    },
  });

  const password = await bcrypt.hash('Skyline@2026', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@skyline.com' },
    update: {},
    create: {
      email: 'admin@skyline.com',
      password,
      name: 'Tanishq (Admin)',
      role: 'TENANT_ADMIN',
      tenantId: tenant.id,
      isActive: true,
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: 'agent@skyline.com' },
    update: {},
    create: {
      email: 'agent@skyline.com',
      password,
      name: 'Agent Rohit',
      role: 'SALES_AGENT',
      tenantId: tenant.id,
      isActive: true,
    },
  });

  const project = await prisma.project.create({
    data: {
      name: 'Skyline Altura',
      location: 'Sector 150, Noida',
      description: 'Ultra-luxury high rise apartments.',
      status: 'UNDER_CONSTRUCTION',
      tenantId: tenant.id,
    },
  });

  const tower = await prisma.tower.create({
    data: {
      name: 'Tower A',
      projectId: project.id,
    },
  });

  await prisma.unit.create({ data: { unitNumber: '101', floor: 1, type: 'BHK_3', carpetArea: 1800, basePrice: 15000000, totalPrice: 15500000, towerId: tower.id, status: 'AVAILABLE' } });
  await prisma.unit.create({ data: { unitNumber: '102', floor: 1, type: 'BHK_3', carpetArea: 1800, basePrice: 15000000, totalPrice: 15500000, towerId: tower.id, status: 'BOOKED' } });

  const lead = await prisma.lead.create({
    data: {
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '+919999999999',
      source: 'FACEBOOK',
      stage: 'CONTACTED',
      score: 85,
      scoreLabel: 'HOT',
      tenantId: tenant.id,
      assignedToId: agent.id,
      projectId: project.id,
      lastActivityAt: new Date(),
    },
  });

  await prisma.activity.create({
    data: {
      leadId: lead.id,
      type: 'CALL',
      title: 'Intro Call',
      description: 'Client is interested in 3BHK high floor.',
    },
  });

  console.log('✅ JS Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
