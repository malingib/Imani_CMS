import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "../env.js";
import * as schema from "./schema/index.js";

const client = postgres(env.DATABASE_URL, { max: 3, idle_timeout: 20, connect_timeout: 10 });
export const db = drizzle(client, { schema });
export const closeDb = async () => { await client.end(); };
