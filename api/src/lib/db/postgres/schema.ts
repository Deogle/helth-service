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
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
  accessToken: varchar({ length: 255 }).notNull(),
  refreshToken: varchar({ length: 255 }).notNull(),
  providerData: jsonb().notNull().default({}),
});

export { userTable };
