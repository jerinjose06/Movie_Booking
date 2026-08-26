import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export type EnvSchemaType = z.infer<typeof envSchema>;

export function validateEnv(env: Record<string, unknown>) {
  return envSchema.safeParse(env);
}

// In a real app, you would export the validated process.env here as well
// but for the tests we just expose the validate function.
