import { ghl } from '../ghl/client.js';
import { logger } from '../logger.js';
import { orderCustomFields, tagsFromOrder } from '../mapping/fashion.js';
import type { ShopifyOrder } from '../types.js';

export async function handleOrderCreated(order: ShopifyOrder): Promise<void> {
  const email = order.email ?? order.customer?.email;
  const phone = order.phone ?? order.customer?.phone;

  if (!email && !phone) {
    logger.warn({ orderId: order.id }, 'Order has no email or phone; skipping');
    return;
  }

  const tags = tagsFromOrder(order);
  const customer = order.customer;

  const contact = await ghl.upsertContact({
    email,
    phone,
    firstName: customer?.first_name,
    lastName: customer?.last_name,
    tags,
    source: 'shopify',
    customField: orderCustomFields(order),
  });

  const total = parseFloat(order.total_price ?? '0');
  if (total > 0 && contact?.id) {
    await ghl.createOpportunity({
      contactId: contact.id,
      title: `Shopify Order #${order.id}`,
      monetaryValue: total,
      status: order.financial_status === 'paid' ? 'won' : 'open',
    });
  }

  logger.info(
    { orderId: order.id, contactId: contact?.id, total, tags },
    'Order synced to GHL',
  );
}
