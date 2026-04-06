import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const plansTable = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  priceMonthly: integer("price_monthly").notNull().default(0),
  priceYearly: integer("price_yearly").notNull().default(0),
  cardsPerDay: integer("cards_per_day").notNull().default(5),
  maxTemplates: integer("max_templates").notNull().default(2),
  maxSavedDesigns: integer("max_saved_designs").notNull().default(5),
  apiAccess: boolean("api_access").notNull().default(false),
  telegramBot: boolean("telegram_bot").notNull().default(false),
  overlayUpload: boolean("overlay_upload").notNull().default(false),
  customWatermark: boolean("custom_watermark").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Plan = typeof plansTable.$inferSelect;
