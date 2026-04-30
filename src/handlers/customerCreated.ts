import { ghl } from '../ghl/client.js';
import { logger } from '../logger.js';
import { customerCustomFields } from '../mapping/fashion.js';
import type { ShopifyCustomer } from '../types.js';

export async function handleCustomerCreated(customer: ShopifyCustomer): Promise<void> {
  if (!customer.email && !customer.phone) {
    logger.warn({ customerId: customer.id }, 'Customer has no email or phone; skipping');
    return;
  }

  const tags = ['shopify-customer'];
  if (customer.accepts_marketing) tags.push('marketing-opt-in');

  const contact = await ghl.upsertContact({
    email: customer.email,
    phone: customer.phone,
    firstName: customer.first_name,
    lastName: customer.last_name,
    tags,
    source: 'shopify',
    customField: customerCustomFields(customer),
  });

  logger.info({ customerId: customer.id, contactId: contact?.id }, 'Customer synced to GHL');
}
