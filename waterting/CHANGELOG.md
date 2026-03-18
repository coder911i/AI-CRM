# CHANGELOG

## v1.0.0 — Initial Build (2026-03-18)

### Phase 1: Foundation
- ✅ Created monorepo structure (apps/web, apps/api, packages/shared)
- ✅ Set up Prisma schema with 15 models, 15 enums, pgvector support
- ✅ Created `.env.example` with all environment variables

### Phase 2: Backend (19 NestJS Modules)
- ✅ **AuthModule** — JWT login/register/refresh with bcrypt hashing
- ✅ **TenantsModule** — Get/update tenant settings
- ✅ **UsersModule** — CRUD with role-based access
- ✅ **ProjectsModule** — Full CRUD for real estate projects
- ✅ **TowersModule** — Nested under projects
- ✅ **UnitsModule** — Inventory status management (Available/Reserved/Booked/Sold)
- ✅ **LeadsModule** — CRUD with phone deduplication and stage tracking
- ✅ **WebhooksModule** — Facebook Lead Ads webhook handler
- ✅ **ActivitiesModule** — Lead activity timeline
- ✅ **SiteVisitsModule** — Schedule visits and record outcomes
- ✅ **BrokersModule** — Broker management with referral codes
- ✅ **BookingsModule** — Transactional booking creation with unit status update
- ✅ **PaymentsModule** — Installment tracking and payment recording
- ✅ **MediaModule** — Cloudflare R2 file uploads
- ✅ **DashboardModule** — KPI aggregation (lead counts, revenue, bookings)
- ✅ **AnalyticsModule** — Funnel, source, agent analytics + AI query placeholder
- ✅ **AutomationsModule** — Workflow rule management with toggle
- ✅ **PortalModule** — OTP-based buyer authentication and dashboard
- ✅ Global guards: JwtAuthGuard, RolesGuard
- ✅ Health check endpoint at `/health`

### Phase 3: Frontend (17 Next.js Pages)
- ✅ Central API client with auto-token attachment
- ✅ AuthProvider with login/register/logout flows
- ✅ Comprehensive design system CSS (cards, badges, tables, kanban, modals)
- ✅ CRM Layout shell with collapsible sidebar
- ✅ Login and 3-step Signup pages
- ✅ Dashboard with 6 KPI cards, recent leads, pipeline distribution
- ✅ Leads table view with create modal
- ✅ Lead detail with WhatsApp/Call, notes, activity timeline
- ✅ Pipeline 8-stage Kanban board with drag-and-drop
- ✅ Projects card grid with create modal
- ✅ Bookings table with status badges
- ✅ Analytics with funnel chart, source breakdown, AI query box
- ✅ Brokers table with referral codes
- ✅ Site Visits table
- ✅ Inventory placeholder with status legend
- ✅ Settings with profile and team management
- ✅ Buyer Portal with OTP login and payment dashboard

### Phase 6: Deployment
- ✅ `vercel.json` for frontend deployment
- ✅ GitHub Actions CI/CD workflow
- ✅ README with complete setup guide
