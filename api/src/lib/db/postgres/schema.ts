import "dotenv/config";
import { integer, jsonb, pgTable, varchar } from "drizzle-orm/pg-core";

const userTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull().unique(),
  provider_data: jsonb().notNull().default({}),
});

export { userTable };
