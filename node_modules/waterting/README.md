# Waterting — AI-Powered Real Estate CRM

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15 (or NeonDB account)
- npm

### 1. Clone & Install
```bash
git clone <repo-url>
cd waterting

# Install backend dependencies
cd apps/api && npm install

# Install frontend dependencies
cd ../web && npm install
```

### 2. Configure Environment

**Backend** (`apps/api/.env`):
```bash
DATABASE_URL=postgresql://user:pass@host/waterting?sslmode=require
JWT_SECRET=minimum-32-character-strong-secret-here
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`apps/web/.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup
```bash
cd apps/api
npx prisma generate --schema=../../prisma/schema.prisma
npx prisma migrate dev --name init --schema=../../prisma/schema.prisma
```

### 4. Run
```bash
# Terminal 1 — Backend
cd apps/api && npm run start:dev

# Terminal 2 — Frontend
cd apps/web && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
waterting/
├── apps/
│   ├── web/              # Next.js 14 frontend
│   │   ├── app/          # App Router pages (17 routes)
│   │   ├── components/   # CRM Layout, shared components
│   │   └── lib/          # API client, auth provider
│   └── api/              # NestJS backend
│       └── src/
│           ├── modules/  # 19 feature modules
│           └── common/   # Guards, decorators, Prisma
├── packages/shared/      # Shared TypeScript types
├── prisma/               # Database schema
└── .github/workflows/    # CI/CD
```

## 🏗 Architecture

| Layer | Technology | Deploy Target |
|-------|-----------|--------------|
| Frontend | Next.js 14 (App Router) | Vercel |
| Backend | NestJS 10 | Render |
| Database | PostgreSQL 15 | NeonDB |
| Cache/Queue | Redis | Upstash |
| Storage | S3-compatible | Cloudflare R2 |
| Email | SMTP | Brevo |

## 📊 Backend Modules (19)

Auth → Tenants → Users → Projects → Towers → Units → Leads → Webhooks → Activities → SiteVisits → Brokers → Bookings → Payments → Media → Dashboard → Analytics → Automations → Portal → AI

## 🎨 Frontend Pages (17)

| Page | Route |
|------|-------|
| Login | `/login` |
| Signup | `/signup` |
| Dashboard | `/dashboard` |
| Leads List | `/leads` |
| Lead Detail | `/leads/[id]` |
| Pipeline Kanban | `/pipeline` |
| Projects | `/projects` |
| Inventory | `/inventory` |
| Site Visits | `/site-visits` |
| Brokers | `/brokers` |
| Bookings | `/bookings` |
| Analytics | `/analytics` |
| Settings | `/settings` |
| Portal Login | `/portal/login` |
| Portal Dashboard | `/portal/dashboard` |

## 🔐 Multi-Tenancy

Every database table includes `tenantId`. All API queries are scoped to the authenticated user's tenant via JWT payload.

## 🤖 AI Features (Stub-Ready)

- **Lead Scoring**: Score 0-100 with Cold/Warm/Hot/Very Hot labels
- **AI Analytics Query**: Natural language analytics via `/analytics/ask`
- **Property Recommendations**: pgvector-powered similarity matching

---

**Built with ❤️ by Waterting**
