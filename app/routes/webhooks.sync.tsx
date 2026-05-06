import type { ActionFunctionArgs } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import { syncCustomer, syncOrder } from '../lib/sync.server';
import type { ShopifyCustomer, ShopifyOrder } from '../lib/types';

/**
 * Single endpoint for all sync webhooks. Shopify sends the topic in the
 * X-Shopify-Topic header; we route based on it. The Shopify Remix SDK
 * verifies HMAC for us and gives us a parsed payload.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  // Always 200 fast — Shopify retries on slow responses
  // Then process out-of-band
  setImmediate(async () => {
    try {
      switch (topic) {
        case 'ORDERS_CREATE':
        case 'ORDERS_PAID':
          await syncOrder(shop, payload as unknown as ShopifyOrder);
          break;
        case 'CUSTOMERS_CREATE':
        case 'CUSTOMERS_UPDATE':
          await syncCustomer(shop, payload as unknown as ShopifyCustomer);
          break;
        default:
          // unhandled topic — nothing to do
          break;
      }
    } catch (err) {
      // Errors are logged inside syncOrder/syncCustomer; nothing to surface here
      // because we already 200'd
      // eslint-disable-next-line no-console
      console.error('webhook processing failed', { topic, shop, err });
    }
  });

  return new Response();
};
