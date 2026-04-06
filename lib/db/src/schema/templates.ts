import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const templatesTable = pgTable("templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug"),
  backgroundUrl: text("background_url"),
  logoUrl: text("logo_url"),
  overlayUrl: text("overlay_url"),
  elements: text("elements").notNull().default("[]"),
  category: text("category").notNull().default("general"),
  aspectRatio: text("aspect_ratio").notNull().default("1:1"),
  bannerColor: text("banner_color").notNull().default("#c0392b"),
  bannerGradient: text("banner_gradient"),
  textColor: text("text_color").notNull().default("#ffffff"),
  labelColor: text("label_color").notNull().default("#ffffff"),
  font: text("font").notNull().default("Cairo"),
  fontSize: integer("font_size").notNull().default(42),
  fontWeight: integer("font_weight").notNull().default(700),
  photoHeight: integer("photo_height").notNull().default(60),
  subtitle: text("subtitle"),
  label: text("label"),
  logoText: text("logo_text"),
  logoPos: text("logo_pos").notNull().default("top-left"),
  logoInvert: boolean("logo_invert").notNull().default(false),
  textShadow: boolean("text_shadow").notNull().default(false),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Template = typeof templatesTable.$inferSelect;
export type InsertTemplate = typeof templatesTable.$inferInsert;
