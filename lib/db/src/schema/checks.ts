import {
  boolean,
  doublePrecision,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * A listing check. `mode` separates live checks from demo checks so demo
 * outcomes never leak into live stats or live publishing.
 * `decision` is the backend-recorded rule outcome (JSON matching the
 * CheckDecision API schema); publishing is only allowed when status = "passed".
 */
export const checksTable = pgTable("checks", {
  id: text("id").primaryKey(),
  mode: text("mode").notNull(), // "live" | "demo"
  demoCaseId: text("demo_case_id"),
  /** "model_specific" | "category_checklist" | "basic_photo", chosen by the backend */
  tier: text("tier").notNull().default("model_specific"),
  tierNote: text("tier_note").notNull().default(""),
  categoryId: text("category_id").notNull().default("outerwear"),
  profileId: text("profile_id").notNull(),
  condition: text("condition").notNull(),
  askingPrice: doublePrecision("asking_price").notNull(),
  currency: text("currency").notNull().default("USD"),
  /** Legacy single wash-tag answer; superseded by `presence`. */
  washTagPresent: boolean("wash_tag_present"),
  /** Seller answers to the profile's presence questions, keyed by question id. */
  presence: jsonb("presence").$type<Record<string, boolean>>().notNull().default({}),
  status: text("status").notNull().default("in_progress"),
  decision: jsonb("decision"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  listingId: text("listing_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Vision observations per inspection step. Live photo bytes are NOT stored;
 * `imageUrl` is only set for demo sample photos served by the web app.
 */
export const checkPhotosTable = pgTable(
  "check_photos",
  {
    id: text("id").primaryKey(),
    checkId: text("check_id")
      .notNull()
      .references(() => checksTable.id, { onDelete: "cascade" }),
    stepId: text("step_id").notNull(),
    imageUrl: text("image_url"),
    observation: jsonb("observation").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("check_photos_check_step_idx").on(t.checkId, t.stepId)],
);

export type CheckRow = typeof checksTable.$inferSelect;
export type CheckPhotoRow = typeof checkPhotosTable.$inferSelect;
