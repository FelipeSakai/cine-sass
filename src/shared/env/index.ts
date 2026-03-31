import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  DATABASE_URL: z.string().min(1),
  DATABASE_URL_TEST: z.string().min(1).optional(),
  TMDB_API_KEY: z.string().min(1).optional(),

  PORT: z.coerce.number().default(3333),

  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default("15m"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.issues);
  throw new Error("Invalid environment variables");
}

const data = parsed.data;

export const env = {
  ...data,
  DATABASE_URL:
    data.NODE_ENV === "test"
      ? (data.DATABASE_URL_TEST ?? data.DATABASE_URL)
      : data.DATABASE_URL,
};
