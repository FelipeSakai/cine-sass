import "dotenv/config";
import { number, string, z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(3333),

  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: string().default("15m"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.issues);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
