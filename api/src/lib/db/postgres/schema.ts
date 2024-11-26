import "dotenv/config";
import {
  integer,
  jsonb,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

const userTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull().unique(),
  provider: varchar({ length: 255 }).notNull(),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow(),
  access_token: varchar({ length: 255 }).notNull(),
  refresh_token: varchar({ length: 255 }).notNull(),
  provider_data: jsonb().notNull().default({}),
});

export { userTable };
