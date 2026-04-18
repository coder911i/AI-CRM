const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Tenant
  let tenant = await prisma.tenant.findFirst({ where: { name: 'Skyline Developers' } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: { name: 'Skyline Developers', plan: 'GROWTH', isActive: true },
    });
  }
  console.log('✅ Tenant:', tenant.name, '|', tenant.id);

  const password = await bcrypt.hash('Skyline@2026', 10);

  // 2. Create Admin User
  let admin = await prisma.user.findFirst({ where: { email: 'admin@skyline.com', tenantId: tenant.id } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: 'admin@skyline.com',
        password,
        name: 'Tanishq (Admin)',
        role: 'TENANT_ADMIN',
        tenantId: tenant.id,
        isActive: true,
      },
    });
  }
  console.log('✅ Admin:', admin.email);

  // 3. Create Agent
  let agent = await prisma.user.findFirst({ where: { email: 'agent@skyline.com', tenantId: tenant.id } });
  if (!agent) {
    agent = await prisma.user.create({
      data: {
        email: 'agent@skyline.com',
        password,
        name: 'Agent Rohit',
        role: 'SALES_AGENT',
        tenantId: tenant.id,
        isActive: true,
      },
    });
  }
  console.log('✅ Agent:', agent.email);

  // 4. Create Project
  let project = await prisma.project.findFirst({ where: { name: 'Skyline Altura', tenantId: tenant.id } });
  if (!project) {
    project = await prisma.project.create({
      data: {
        name: 'Skyline Altura',
        location: 'Sector 150, Noida',
        status: 'ACTIVE',
        type: 'RESIDENTIAL',
        tenantId: tenant.id,
      },
    });
  }
  console.log('✅ Project:', project.name);

  // 5. Create Tower
  let tower = await prisma.tower.findFirst({ where: { name: 'Tower A', projectId: project.id } });
  if (!tower) {
    tower = await prisma.tower.create({
      data: { name: 'Tower A', projectId: project.id, totalFloors: 20 },
    });
  }

  // 6. Create Units
  const u1 = await prisma.unit.findFirst({ where: { unitNumber: '101', towerId: tower.id } });
  if (!u1) await prisma.unit.create({ data: { unitNumber: '101', floor: 1, type: 'THREE_BHK', carpetArea: 1800, basePrice: 15000000, totalPrice: 15500000, towerId: tower.id, status: 'AVAILABLE' } });
  const u2 = await prisma.unit.findFirst({ where: { unitNumber: '102', towerId: tower.id } });
  if (!u2) await prisma.unit.create({ data: { unitNumber: '102', floor: 1, type: 'THREE_BHK', carpetArea: 1800, basePrice: 15000000, totalPrice: 15500000, towerId: tower.id, status: 'AVAILABLE' } });
  console.log('✅ Units created');

  // 7. Create Demo Lead
  let lead = await prisma.lead.findFirst({ where: { phone: '+919999999999', tenantId: tenant.id } });
  if (!lead) {
    lead = await prisma.lead.create({
      data: {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '+919999999999',
        source: 'FACEBOOK',
        stage: 'NEW_LEAD',
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
  }
  console.log('✅ Demo lead:', lead.name);

  console.log('\n🎉 Seed complete!');
  console.log('──────────────────────────────────');
  console.log('Email:    admin@skyline.com');
  console.log('Password: Skyline@2026');
  console.log('Role:     TENANT_ADMIN');
  console.log('──────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
