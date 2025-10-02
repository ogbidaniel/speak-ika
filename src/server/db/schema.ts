import { randomUUID } from "node:crypto";

import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTableCreator,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/**
 * Multi-project schema helper so every table is namespaced with the app name when sharing a single
 * Turso database instance.
 */
export const createTable = sqliteTableCreator((name) => `speak-ika_${name}`);

export const CONTRIBUTION_STATUSES = ["pending", "processing", "completed", "failed"] as const;
export const SENTIMENT_LABELS = ["positive", "neutral", "negative"] as const;
export const EMOTION_LABELS = [
  "joy",
  "trust",
  "fear",
  "surprise",
  "sadness",
  "disgust",
  "anger",
  "anticipation",
  "neutral",
] as const;

export const users = createTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  email: text("email").unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const contributions = createTable(
  "contribution",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    title: text("title"),
    description: text("description"),
    sourceLanguageCode: text("source_language_code", { length: 8 }).notNull(),
    audioUrl: text("audio_url"),
    status: text("status", { enum: CONTRIBUTION_STATUSES })
      .default("pending")
      .notNull(),
    metadata: text("metadata"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("contribution_user_idx").on(table.userId),
    index("contribution_status_idx").on(table.status),
  ],
);

export const transcripts = createTable(
  "transcript",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    contributionId: text("contribution_id")
      .references(() => contributions.id, { onDelete: "cascade" })
      .notNull(),
    languageCode: text("language_code", { length: 8 }).notNull(),
    content: text("content").notNull(),
    confidence: real("confidence"),
    metadata: text("metadata"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("transcript_contribution_idx").on(table.contributionId),
    uniqueIndex("transcript_unique_language").on(
      table.contributionId,
      table.languageCode,
    ),
  ],
);

export const translations = createTable(
  "translation",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    transcriptId: text("transcript_id")
      .references(() => transcripts.id, { onDelete: "cascade" })
      .notNull(),
    targetLanguageCode: text("target_language_code", { length: 8 }).notNull(),
    content: text("content").notNull(),
    sentiment: text("sentiment", { enum: SENTIMENT_LABELS }),
    sentimentScore: real("sentiment_score"),
    emotion: text("emotion", { enum: EMOTION_LABELS }),
    emotionScore: real("emotion_score"),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("translation_transcript_idx").on(table.transcriptId),
    uniqueIndex("translation_unique_language").on(
      table.transcriptId,
      table.targetLanguageCode,
    ),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  contributions: many(contributions),
}));

export const contributionsRelations = relations(contributions, ({ many, one }) => ({
  user: one(users, {
    fields: [contributions.userId],
    references: [users.id],
  }),
  transcripts: many(transcripts),
}));

export const transcriptsRelations = relations(transcripts, ({ many, one }) => ({
  contribution: one(contributions, {
    fields: [transcripts.contributionId],
    references: [contributions.id],
  }),
  translations: many(translations),
}));

export const translationsRelations = relations(translations, ({ one }) => ({
  transcript: one(transcripts, {
    fields: [translations.transcriptId],
    references: [transcripts.id],
  }),
}));

export type ContributionStatus = (typeof CONTRIBUTION_STATUSES)[number];
export type SentimentLabel = (typeof SENTIMENT_LABELS)[number];
export type EmotionLabel = (typeof EMOTION_LABELS)[number];
