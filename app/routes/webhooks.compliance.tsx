import type { ActionFunctionArgs } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import prisma from '../db.server';

/**
 * GDPR mandatory webhooks (Shopify requires all 3 for app store approval).
 *
 *   customers/data_request — merchant requests a customer's stored data
 *   customers/redact       — delete a specific customer's data
 *   shop/redact            — delete all data for a shop (48h after uninstall)
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  switch (topic) {
    case 'CUSTOMERS_DATA_REQUEST': {
      // We don't store customer PII beyond ephemeral webhook processing.
      // GHL is the data controller; merchants should fulfill requests there.
      // eslint-disable-next-line no-console
      console.log('customers/data_request', { shop, payload });
      break;
    }
    case 'CUSTOMERS_REDACT': {
      // Same as above — no per-customer data is retained.
      // Sync logs intentionally do not include PII.
      // eslint-disable-next-line no-console
      console.log('customers/redact', { shop, payload });
      break;
    }
    case 'SHOP_REDACT': {
      // Shop has been uninstalled for 48h+. Wipe everything we know about it.
      await prisma.$transaction([
        prisma.shopConfig.deleteMany({ where: { shop } }),
        prisma.syncLog.deleteMany({ where: { shop } }),
      ]);
      break;
    }
    default:
      break;
  }

  return new Response();
};
