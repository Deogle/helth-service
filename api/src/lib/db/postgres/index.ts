import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { HelthDbService } from "..";
import { eq, sql } from "drizzle-orm";

const db = drizzle({
  connection: process.env.DATABASE_URL!,
  casing: "snake_case",
  schema,
});

type CreateUser = typeof schema.userTable.$inferInsert;

const PostgresDB = (): HelthDbService => {
  const getUserByEmail = async (email: string) => {
    const user = await db.query.userTable.findFirst({
      where: (user, { eq }) => eq(user.email, email),
    });

    return user;
  };

  const createUser = async (email: string, data: Record<string, any>) => {
    const user: CreateUser = {
      email,
      provider: data.provider,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      provider_data: data,
    };

    delete data.provider;
    delete data.access_token;
    delete data.refresh_token;

    return db.insert(schema.userTable).values(user);
  };

  const getUserByEncodedId = async (id: string) => {
    const query = sql`select * from ${schema.userTable} 
        where ${schema.userTable.provider_data}->encodedId = ${id} limit 1`;
    const res = await db.execute(query);
    return res.rows[0];
  };

  const getUserByWhoopId = async (id: Number) => {
    const query = sql`select * from ${schema.userTable} 
        where ${schema.userTable.provider_data}->'user_id' = ${id} limit 1`;
    const res = await db.execute(query);
    return res.rows[0];
  };

  const getUserByRefreshToken = async (refreshToken: string) => {
    return db.query.userTable.findFirst({
      where: (user, { eq }) => eq(user.refresh_token, refreshToken),
    });
  };

  const deleteUser = async (email: string) => {
    return db.delete(schema.userTable).where(eq(schema.userTable.email, email));
  };

  const getAllUsers = async () => {
    return db.query.userTable.findMany();
  };

  const updateUser = async (email: string, data: object) => {
    return db
      .update(schema.userTable)
      .set(data)
      .where(eq(schema.userTable.email, email));
  };

  return {
    getUserByEmail,
    getUserByEncodedId,
    getUserByWhoopId,
    getUserByRefreshToken,
    createUser,
    deleteUser,
    getAllUsers,
    updateUser,
  };
};

const postgresDb = PostgresDB();
export default postgresDb;
