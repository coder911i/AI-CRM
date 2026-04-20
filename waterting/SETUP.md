# Waterting CRM — Setup Guide (4-Stakeholder Platform)

## 1. Environment Variables
Copy `apps/api/.env.example` to `apps/api/.env` and fill in the following:

- `EMAIL_*`: SMTP credentials for OTP delivery.
- `OPENAI_API_KEY`: Required for semantic property matching.
- `GOOGLE_*`: For social login (Phase 4 finalization).

## 2. Database Setup
Ensure Postgres is running and then run:

```bash
npx prisma generate
npx prisma migrate dev
```

## 3. Roles and Portals
The platform supports four distinct portals based on user roles:

1. **Buyer Portal** (`/portal`): Accessed via Phone/Email OTP. Landing: AI Chat which gathers preferences and recommends properties.
2. **Owner Portal** (`/owner`): For property owners to list properties and track inquiries.
3. **Broker Portal** (`/broker`): For brokers to manage assigned leads and site visits.
4. **Admin Panel** (`/admin`): For SUPER_ADMIN and TENANT_ADMIN to manage everything.
5. **Agent View**: Injected into the standard CRM for SALES_AGENT roles to supervisor deals.

## 4. Allocation Workflow
The intelligent heart of Waterting works as follows:
- **Interest Trigger**: When a buyer clicks "Schedule Visit" in the chat.
- **Auto-Allocation**: The engine selects the best broker (lowest load) and a sales agent supervisor (round-robin).
- **Notifications**: Instant WhatsApp sent to Broker, Owner, and Agent.
- **Slot Confirmation**: Buyer confirms a suggested slot via portal; all parties notified.

## 5. Development
Run both workspace apps:
```bash
npm run dev
```
API runs on `3001`, Frontend on `3000`.
