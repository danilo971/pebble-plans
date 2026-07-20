import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
  boolean,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createId } from "./id.js";

// ─── Users ─────────────────────────────────────────────────────
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 30 })
      .primaryKey()
      .$defaultFn(() => createId()),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: boolean("email_verified").default(false),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    avatarInitials: varchar("avatar_initials", { length: 4 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("idx_users_email").on(t.email)]
);

// ─── Refresh Tokens ────────────────────────────────────────────
export const refreshTokens = pgTable("refresh_tokens", {
  id: varchar("id", { length: 30 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar("user_id", { length: 30 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Categories ────────────────────────────────────────────────
export const categories = pgTable(
  "categories",
  {
    id: varchar("id", { length: 30 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 30 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 50 }).notNull(),
    icon: varchar("icon", { length: 50 }),
    spent: numeric("spent", { precision: 12, scale: 2 }).default("0"),
    limit: numeric("limit", { precision: 12, scale: 2 }).default("0"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("idx_categories_user_name").on(t.userId, t.name)]
);

// ─── Accounts ──────────────────────────────────────────────────
export const accounts = pgTable(
  "accounts",
  {
    id: varchar("id", { length: 30 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 30 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    kind: varchar("kind", { length: 50 }).notNull(),
    balance: numeric("balance", { precision: 14, scale: 2 }).default("0").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("idx_accounts_user_name").on(t.userId, t.name)]
);

// ─── Credit Cards ──────────────────────────────────────────────
export const cards = pgTable(
  "cards",
  {
    id: varchar("id", { length: 30 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 30 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    brand: varchar("brand", { length: 50 }).notNull(),
    last4: varchar("last4", { length: 4 }).notNull(),
    limit: numeric("card_limit", { precision: 12, scale: 2 }).notNull(),
    used: numeric("used", { precision: 12, scale: 2 }).default("0").notNull(),
    dueDay: integer("due_day").notNull(),
    color: text("color"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("idx_cards_user_name").on(t.userId, t.name)]
);

// ─── Goals ─────────────────────────────────────────────────────
export const goals = pgTable("goals", {
  id: varchar("id", { length: 30 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar("user_id", { length: 30 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 100 }).notNull(),
  saved: numeric("saved", { precision: 12, scale: 2 }).default("0").notNull(),
  target: numeric("target", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Transactions ──────────────────────────────────────────────
export const transactions = pgTable(
  "transactions",
  {
    id: varchar("id", { length: 30 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 30 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    merchant: varchar("merchant", { length: 200 }).notNull(),
    category: varchar("category", { length: 50 }).notNull(),
    kind: varchar("kind", { length: 20 }).notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
    account: varchar("account", { length: 100 }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    { idxUserDate: uniqueIndex("idx_transactions_user_date").on(t.userId, t.id) },
  ]
);
