import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { templatesTable } from "./templates";

export const generatedImagesTable = pgTable("generated_images", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  templateId: integer("template_id").references(() => templatesTable.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  aspectRatio: text("aspect_ratio").notNull().default("1:1"),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type GeneratedImage = typeof generatedImagesTable.$inferSelect;
export type InsertGeneratedImage = typeof generatedImagesTable.$inferInsert;
