// types/owner.ts
export interface SystemMetrics {
  totalUsers: number;
  activeTenants: number;
  totalRevenue: number;
  systemUptime: number;
  apiCalls24h: number;
  errorRate: number;
}

export type TenantStatus = "active" | "suspended" | "trial";

export interface TenantData {
  id: string;
  name: string;
  userCount: number;
  status: TenantStatus;
  lastActivity: string;
  revenue: number;
  plan: string;
}

export type SecurityAlertType = "security" | "compliance" | "access";
export type SecuritySeverity = "low" | "medium" | "high" | "critical";

export interface SecurityAlert {
  id: string;
  type: SecurityAlertType;
  severity: SecuritySeverity;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export type DiscountType = "fixed" | "percentage";

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface NewPromoCode {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  maxUses: number;
  expiresAt: string; // ISO string
  isActive: boolean;
}