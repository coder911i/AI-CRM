// ── Enums ──────────────────────────────────────────────────────
export enum Plan {
  STARTER = 'STARTER',
  GROWTH = 'GROWTH',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  SALES_MANAGER = 'SALES_MANAGER',
  SALES_AGENT = 'SALES_AGENT',
  ACCOUNTS = 'ACCOUNTS',
  BROKER = 'BROKER',
}

export enum LeadStage {
  NEW_LEAD = 'NEW_LEAD',
  CONTACTED = 'CONTACTED',
  INTERESTED = 'INTERESTED',
  VISIT_SCHEDULED = 'VISIT_SCHEDULED',
  VISIT_DONE = 'VISIT_DONE',
  NEGOTIATION = 'NEGOTIATION',
  BOOKING_DONE = 'BOOKING_DONE',
  LOST = 'LOST',
}

export enum LeadSource {
  WEBSITE = 'WEBSITE',
  LANDING_PAGE = 'LANDING_PAGE',
  FACEBOOK = 'FACEBOOK',
  GOOGLE = 'GOOGLE',
  WHATSAPP = 'WHATSAPP',
  PORTAL_99ACRES = 'PORTAL_99ACRES',
  PORTAL_MAGICBRICKS = 'PORTAL_MAGICBRICKS',
  PORTAL_HOUSING = 'PORTAL_HOUSING',
  MANUAL = 'MANUAL',
  BROKER = 'BROKER',
  QR_CODE = 'QR_CODE',
}

export enum ScoreLabel {
  COLD = 'COLD',
  WARM = 'WARM',
  HOT = 'HOT',
  VERY_HOT = 'VERY_HOT',
}

export enum UnitStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  BOOKED = 'BOOKED',
  SOLD = 'SOLD',
  BLOCKED = 'BLOCKED',
}

export enum UnitType {
  ONE_BHK = 'ONE_BHK',
  TWO_BHK = 'TWO_BHK',
  THREE_BHK = 'THREE_BHK',
  FOUR_BHK = 'FOUR_BHK',
  STUDIO = 'STUDIO',
  PENTHOUSE = 'PENTHOUSE',
  VILLA = 'VILLA',
  PLOT = 'PLOT',
}

export enum ProjectType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  MIXED = 'MIXED',
  VILLA = 'VILLA',
  TOWNSHIP = 'TOWNSHIP',
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  UPCOMING = 'UPCOMING',
  ON_HOLD = 'ON_HOLD',
}

export enum PaymentMethod {
  UPI = 'UPI',
  NEFT = 'NEFT',
  RTGS = 'RTGS',
  CHEQUE = 'CHEQUE',
  CASH = 'CASH',
  DEMAND_DRAFT = 'DEMAND_DRAFT',
}

export enum BookingStatus {
  INITIATED = 'INITIATED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export enum VisitOutcome {
  INTERESTED = 'INTERESTED',
  NOT_INTERESTED = 'NOT_INTERESTED',
  NEED_MORE_TIME = 'NEED_MORE_TIME',
  BOOKED = 'BOOKED',
  NO_SHOW = 'NO_SHOW',
}

export enum ActivityType {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  NOTE = 'NOTE',
  STAGE_CHANGE = 'STAGE_CHANGE',
  VISIT_SCHEDULED = 'VISIT_SCHEDULED',
  VISIT_COMPLETED = 'VISIT_COMPLETED',
  DOCUMENT_SHARED = 'DOCUMENT_SHARED',
  AI_ACTION = 'AI_ACTION',
}

// ── Interfaces ─────────────────────────────────────────────────
export interface JwtPayload {
  sub: string;       // userId
  tenantId: string;
  role: UserRole;
  email: string;
}
