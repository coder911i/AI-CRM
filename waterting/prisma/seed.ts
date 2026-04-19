import { PrismaClient, UserRole, UnitStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Tenant (Skyline Developers)
  const tenant = await prisma.tenant.upsert({
    where: { domain: 'skyline.waterting.com' },
    update: {},
    create: {
      name: 'Skyline Developers',
      domain: 'skyline.waterting.com',
      isActive: true,
    },
  });

  // 2. Create Users
  const password = await bcrypt.hash('Skyline@2026', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@skyline.com' },
    update: {},
    create: {
      email: 'admin@skyline.com',
      password,
      name: 'Tanishq (Admin)',
      role: UserRole.TENANT_ADMIN,
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
      role: UserRole.SALES_AGENT,
      tenantId: tenant.id,
      isActive: true,
    },
  });

  const accounts = await prisma.user.upsert({
    where: { email: 'accounts@skyline.com' },
    update: {},
    create: {
      email: 'accounts@skyline.com',
      password,
      name: 'Accounts Team',
      role: UserRole.ACCOUNTS,
      tenantId: tenant.id,
      isActive: true,
    },
  });

  // 3. Create Project
  const project = await prisma.project.create({
    data: {
      name: 'Skyline Altura',
      location: 'Sector 150, Noida',
      description: 'Ultra-luxury high rise apartments.',
      status: 'UNDER_CONSTRUCTION',
      tenantId: tenant.id,
    },
  });

  // 4. Create Tower & Units
  const tower = await prisma.tower.create({
    data: {
      name: 'Tower A',
      projectId: project.id,
    },
  });

  const units = await Promise.all([
    prisma.unit.create({ data: { unitNumber: '101', floor: 1, type: 'BHK_3', carpetArea: 1800, basePrice: 15000000, totalPrice: 15500000, towerId: tower.id, status: UnitStatus.AVAILABLE } }),
    prisma.unit.create({ data: { unitNumber: '102', floor: 1, type: 'BHK_3', carpetArea: 1800, basePrice: 15000000, totalPrice: 15500000, towerId: tower.id, status: UnitStatus.BOOKED } }),
    prisma.unit.create({ data: { unitNumber: '201', floor: 2, type: 'BHK_4', carpetArea: 2400, basePrice: 21000000, totalPrice: 22000000, towerId: tower.id, status: UnitStatus.AVAILABLE } }),
  ]);

  // 5. Create Leads
  const lead1 = await prisma.lead.create({
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

  // 6. Create Activity & Site Visit
  await prisma.activity.create({
    data: {
      leadId: lead1.id,
      type: 'CALL',
      title: 'Intro Call',
      description: 'Client is interested in 3BHK high floor.',
    },
  });

  await prisma.siteVisit.create({
    data: {
      leadId: lead1.id,
      agentId: agent.id,
      scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
      notes: 'Coming with family for model flat visit.',
    },
  });

  console.log('✅ Seed complete!');
  console.log('Admin Email: admin@skyline.com / Skyline@2026');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
