import { db, plansTable, usersTable, templatesTable, userSavedDesignsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import type { Plan } from "@workspace/db";

// Default plan limits (used as fallback if plans table is empty)
const DEFAULT_PLANS: Record<string, Omit<Plan, "id" | "name" | "createdAt" | "isActive" | "sortOrder" | "priceMonthly" | "priceYearly">> = {
  free:    { slug: "free",    cardsPerDay: 5,   maxTemplates: 2,  maxSavedDesigns: 5,   apiAccess: false, telegramBot: false, overlayUpload: false, customWatermark: false },
  starter: { slug: "starter", cardsPerDay: 30,  maxTemplates: 10, maxSavedDesigns: 20,  apiAccess: true,  telegramBot: true,  overlayUpload: false, customWatermark: true  },
  pro:     { slug: "pro",     cardsPerDay: 150, maxTemplates: 50, maxSavedDesigns: 100, apiAccess: true,  telegramBot: true,  overlayUpload: true,  customWatermark: true  },
  agency:  { slug: "agency",  cardsPerDay: -1,  maxTemplates: -1, maxSavedDesigns: -1,  apiAccess: true,  telegramBot: true,  overlayUpload: true,  customWatermark: true  },
};

let planCache: Plan[] = [];
let planCacheAt = 0;

export async function getPlans(): Promise<Plan[]> {
  if (Date.now() - planCacheAt < 30_000 && planCache.length > 0) return planCache;
  const rows = await db.select().from(plansTable).where(eq(plansTable.isActive, true)).orderBy(plansTable.sortOrder);
  if (rows.length > 0) {
    planCache = rows;
    planCacheAt = Date.now();
    return rows;
  }
  return [];
}

export function invalidatePlanCache() {
  planCacheAt = 0;
}

export async function getPlanLimits(slug: string): Promise<typeof DEFAULT_PLANS["free"]> {
  const plans = await getPlans();
  const dbPlan = plans.find(p => p.slug === slug);
  if (dbPlan) return dbPlan;
  return DEFAULT_PLANS[slug] ?? DEFAULT_PLANS["free"];
}

export async function checkDailyLimit(userId: number, planSlug: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const limits = await getPlanLimits(planSlug);
  if (limits.cardsPerDay === -1) return { allowed: true, used: 0, limit: -1 };

  const [user] = await db.select({ imagesToday: usersTable.imagesToday, lastResetDate: usersTable.lastResetDate })
    .from(usersTable).where(eq(usersTable.id, userId));
  if (!user) return { allowed: false, used: 0, limit: limits.cardsPerDay };

  const today = new Date().toISOString().slice(0, 10);
  const used = user.lastResetDate === today ? user.imagesToday : 0;
  return { allowed: used < limits.cardsPerDay, used, limit: limits.cardsPerDay };
}

export async function checkTemplateLimit(userId: number, planSlug: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const limits = await getPlanLimits(planSlug);
  if (limits.maxTemplates === -1) return { allowed: true, used: 0, limit: -1 };
  const [{ total }] = await db.select({ total: count() }).from(templatesTable).where(eq(templatesTable.userId, userId));
  const used = Number(total);
  return { allowed: used < limits.maxTemplates, used, limit: limits.maxTemplates };
}

export async function checkDesignLimit(userId: number, planSlug: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const limits = await getPlanLimits(planSlug);
  if (limits.maxSavedDesigns === -1) return { allowed: true, used: 0, limit: -1 };
  const [{ total }] = await db.select({ total: count() }).from(userSavedDesignsTable).where(eq(userSavedDesignsTable.userId, userId));
  const used = Number(total);
  return { allowed: used < limits.maxSavedDesigns, used, limit: limits.maxSavedDesigns };
}

export async function getUserUsage(userId: number, planSlug: string) {
  const limits = await getPlanLimits(planSlug);

  const [user] = await db.select({ imagesToday: usersTable.imagesToday, lastResetDate: usersTable.lastResetDate })
    .from(usersTable).where(eq(usersTable.id, userId));
  const today = new Date().toISOString().slice(0, 10);
  const cardsUsed = user?.lastResetDate === today ? (user?.imagesToday ?? 0) : 0;

  const [{ total: tplTotal }] = await db.select({ total: count() }).from(templatesTable).where(eq(templatesTable.userId, userId));
  const [{ total: dsnTotal }] = await db.select({ total: count() }).from(userSavedDesignsTable).where(eq(userSavedDesignsTable.userId, userId));

  return {
    cardsToday: cardsUsed,
    cardsLimit: limits.cardsPerDay,
    templates: Number(tplTotal),
    templatesLimit: limits.maxTemplates,
    savedDesigns: Number(dsnTotal),
    savedDesignsLimit: limits.maxSavedDesigns,
    apiAccess: limits.apiAccess,
    telegramBot: limits.telegramBot,
    overlayUpload: limits.overlayUpload,
    customWatermark: limits.customWatermark,
  };
}
