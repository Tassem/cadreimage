import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const templatesTable = pgTable("templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug"),
  backgroundUrl: text("background_url"),
  logoUrl: text("logo_url"),
  overlayUrl: text("overlay_url"),
  elements: text("elements").notNull().default("[]"),
  category: text("category").notNull().default("news"),
  aspectRatio: text("aspect_ratio").notNull().default("1:1"),
  bannerColor: text("banner_color").notNull().default("#0f2557"),
  bannerGradient: text("banner_gradient"),
  textColor: text("text_color").notNull().default("#ffffff"),
  labelColor: text("label_color").notNull().default("rgba(255,255,255,0.85)"),
  font: text("font").notNull().default("Cairo"),
  fontSize: integer("font_size").notNull().default(26),
  fontWeight: integer("font_weight").notNull().default(700),
  photoHeight: integer("photo_height").notNull().default(62),
  subtitle: text("subtitle"),
  label: text("label"),
  logoText: text("logo_text"),
  logoPos: text("logo_pos").notNull().default("top-right"),
  logoInvert: boolean("logo_invert").notNull().default(false),
  textShadow: boolean("text_shadow").notNull().default(false),
  headlineAlign: text("headline_align").notNull().default("right"),
  subtitleAlign: text("subtitle_align").notNull().default("right"),
  labelAlign: text("label_align").notNull().default("right"),
  watermarkText: text("watermark_text"),
  watermarkOpacity: text("watermark_opacity").notNull().default("0.18"),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTemplateSchema = createInsertSchema(templatesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templatesTable.$inferSelect;
