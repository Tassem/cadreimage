import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";

export const userSavedDesignsTable = pgTable("user_saved_designs", {
  id:          serial("id").primaryKey(),
  userId:      integer("user_id").notNull(),
  name:        text("name").notNull(),
  designData:  text("design_data").notNull(),
  previewUrl:  text("preview_url"),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserSavedDesign = typeof userSavedDesignsTable.$inferSelect;
