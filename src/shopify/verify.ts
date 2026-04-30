import crypto from 'node:crypto';
import { config } from '../config.js';

export function verifyShopifyWebhook(rawBody: Buffer, hmacHeader: string | undefined): boolean {
  if (!hmacHeader) return false;

  const computed = crypto
    .createHmac('sha256', config.SHOPIFY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('base64');

  const a = Buffer.from(computed);
  const b = Buffer.from(hmacHeader);
  if (a.length !== b.length) return false;

  try {
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
