import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const userSavedDesignsTable = pgTable("user_saved_designs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  designData: text("design_data").notNull().default("{}"),
  previewUrl: text("preview_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserSavedDesign = typeof userSavedDesignsTable.$inferSelect;
export type InsertUserSavedDesign = typeof userSavedDesignsTable.$inferInsert;
