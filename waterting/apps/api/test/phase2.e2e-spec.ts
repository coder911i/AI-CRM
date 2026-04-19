import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';

describe('Waterting CRM Phase 2 E2E Tests', () => {
  jest.setTimeout(60000);
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let accountsToken: string;
  let leadId: string;
  let bookingId: string;
  let siteVisitId: string;
  let brokerId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider('BullQueue_ai-scoring').useValue({ add: jest.fn(), process: jest.fn() })
    .overrideProvider('BullQueue_email').useValue({ add: jest.fn(), process: jest.fn() })
    .overrideProvider('BullQueue_pdf').useValue({ add: jest.fn(), process: jest.fn() })
    .overrideProvider('BullQueue_portal-sync').useValue({ add: jest.fn(), process: jest.fn() })
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Create Admin
    const emailAdmin = `admin_${Math.floor(Math.random()*100000)}@e2e.com`;
    const adminRes = await request(app.getHttpServer()).post('/auth/register').send({ email: emailAdmin, password: 'Test@1234', name: 'E2E Admin', tenantName: 'E2E Tenant Phase 2' });
    adminToken = adminRes.body.access_token;
    const tenantId = adminRes.body.user.tenantId;

    // Create Accounts Staff
    const emailAcc = `acc_${Math.floor(Math.random()*100000)}@e2e.com`;
    const accountsRes = await request(app.getHttpServer()).post('/auth/create-staff').set('Authorization', `Bearer ${adminToken}`).send({ email: emailAcc, password: 'Test@1234', name: 'E2E Accounts', role: 'ACCOUNTS' });
    const accLogin = await request(app.getHttpServer()).post('/auth/login').send({ email: emailAcc, password: 'Test@1234' });
    accountsToken = accLogin.body.access_token;

    // Infrastructure setup
    const project = await prisma.project.create({ data: { tenantId, name: 'E2E Project', location: 'E2E City', type: 'RESIDENTIAL' } });
    const tower = await prisma.tower.create({ data: { projectId: project.id, name: 'Tower A', totalFloors: 10 } });
    const unit = await prisma.unit.create({ data: { towerId: tower.id, floor: 1, unitNumber: 'A-101', type: 'TWO_BHK', carpetArea: 1200, basePrice: 5000000, totalPrice: 5500000, status: 'AVAILABLE' } });

    // Seed data
    const lead = await request(app.getHttpServer()).post('/leads').set('Authorization', `Bearer ${adminToken}`).send({ 
      name: 'E2E_PHASE2_LEAD', 
      phone: `9${Math.floor(Math.random()*900000000)}`, 
      source: 'MANUAL',
      projectId: project.id 
    });
    leadId = lead.body.id;

    const booking = await prisma.booking.create({ 
      data: { 
        unitId: unit.id,
        leadId, 
        buyerName: 'E2E Buyer', 
        buyerPhone: '9999999999',
        bookingAmount: 500000,
        status: 'CONFIRMED' 
      } 
    });
    bookingId = booking.id;

    const siteVisit = await prisma.siteVisit.create({ data: { leadId, scheduledAt: new Date() } });
    siteVisitId = siteVisit.id;

    const broker = await prisma.broker.create({ data: { tenantId, name: 'E2E Broker', email: `br_${Math.floor(Math.random()*100000)}@e2e.com`, phone: '9000000000', referralCode: `REF${Date.now()}` } });
    brokerId = broker.id;
  });

  afterAll(async () => {
    try {
       await prisma.lead.deleteMany({ where: { name: 'E2E_PHASE2_LEAD' } });
    } catch (e) {}
    await app.close();
  });

  // ===================== AUDIT LOGS =====================
  describe('Audit Logs (FIX 5)', () => {
    it('PASS: fetches audit logs for TENANT_ADMIN', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.logs).toBeDefined();
    });

    it('FAIL correctly: refuse audit logs for ACCOUNTS role', async () => {
      await request(app.getHttpServer())
        .get('/users/audit-logs')
        .set('Authorization', `Bearer ${accountsToken}`)
        .expect(403);
    });
  });

  // ===================== REFUND FLOW =====================
  describe('Refund Processing (FIX 3)', () => {
    let refundId: string;

    it('PASS: creates a refund request as ADMIN', async () => {
        const res = await request(app.getHttpServer())
          .post(`/bookings/${bookingId}/refunds`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ amount: 50000, reason: 'E2E Cancellation' })
          .expect(201);
        expect(res.body.id).toBeDefined();
        refundId = res.body.id;
    });

    it('PASS: processes a refund request as ACCOUNTS', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/bookings/refunds/${refundId}/process`)
        .set('Authorization', `Bearer ${accountsToken}`)
        .send({ referenceNumber: 'REF123', processedAt: new Date().toISOString() })
        .expect(200);

      expect(res.body.status).toBe('PROCESSED');
    });

    it('PASS: rejects another refund request as ACCOUNTS', async () => {
      const reqRes = await request(app.getHttpServer())
          .post(`/bookings/${bookingId}/refunds`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ amount: 10000, reason: 'Reject Test' });
      
      const res = await request(app.getHttpServer())
        .patch(`/bookings/refunds/${reqRes.body.id}/reject`)
        .set('Authorization', `Bearer ${accountsToken}`)
        .send({ reason: 'Invalid claim' })
        .expect(200);
      expect(res.body.status).toBe('REJECTED');
    });
  });

  // ===================== SITE VISITS =====================
  describe('Site Visit Workflow (FIX 6)', () => {
    it('PASS: agent can check-in to a visit', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/site-visits/${siteVisitId}/checkin`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.checkInTime).toBeDefined();
    });

    it('PASS: checkout requires feedback and updates lead stage', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/site-visits/${siteVisitId}/checkout`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ outcome: 'INTERESTED', notes: 'Very positive visit', rating: 5 })
        .expect(200);

      expect(res.body.outcome).toBe('INTERESTED');
      
      const leadMatch = await prisma.lead.findUnique({ where: { id: leadId } });
      expect(['VISIT_DONE', 'NEGOTIATION']).toContain(leadMatch?.stage);
    });
  });

  // ===================== BROKER ASSETS =====================
  describe('Broker Referral Assets (Bonus 5)', () => {
    it('PASS: returns QR code image buffer', async () => {
      const res = await request(app.getHttpServer())
        .get(`/brokers/${brokerId}/qr`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.headers['content-type']).toBe('image/png');
    });
  });

  // ===================== DASHBOARD STATS =====================
  describe('Extended Dashboard Stats (Bonus 1 & 2)', () => {
    it('PASS: includes staleLeadsCount and upcomingPayments', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.staleLeadsCount).toBeDefined();
      expect(Array.isArray(res.body.upcomingPayments)).toBe(true);
    });
  });
});
