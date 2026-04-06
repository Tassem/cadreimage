import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const userSavedDesignsTable = pgTable("user_saved_designs", {
  id:        serial("id").primaryKey(),
  userId:    integer("user_id").notNull(),
  name:      text("name").notNull(),
  settings:  jsonb("settings").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserSavedDesign = typeof userSavedDesignsTable.$inferSelect;
