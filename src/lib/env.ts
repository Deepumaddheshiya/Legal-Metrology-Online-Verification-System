import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional().default(""),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional().default("https://mock.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().default("mock-anon-key"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default("mock-service-key"),
  CRON_SECRET: z.string().optional().default("mock-cron-secret"),
  ENABLE_MOCK_SMS: z.string().optional().default("true"),
  RESEND_API_KEY: z.string().optional().default("re_mock_key"),
  FROM_EMAIL: z.string().optional().default("no-reply@lmovs.gov.in"),
  NEXTAUTH_SECRET: z.string().optional().default("lmovs-mock-auth-secret"),
  JWT_SECRET: z.string().optional().default("lmovs-mock-jwt-secret"),
});

export const getEnv = () => {
  return envSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
    ENABLE_MOCK_SMS: process.env.ENABLE_MOCK_SMS,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    FROM_EMAIL: process.env.FROM_EMAIL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
  });
};
