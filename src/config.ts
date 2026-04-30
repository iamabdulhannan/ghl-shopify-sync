import 'dotenv/config';
import { z } from 'zod';

const Schema = z.object({
  PORT: z.string().default('3000'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  GHL_API_KEY: z.string().min(1, 'GHL_API_KEY is required'),
  GHL_LOCATION_ID: z.string().min(1, 'GHL_LOCATION_ID is required'),
  SHOPIFY_WEBHOOK_SECRET: z.string().min(1, 'SHOPIFY_WEBHOOK_SECRET is required'),
});

export const config = Schema.parse(process.env);
