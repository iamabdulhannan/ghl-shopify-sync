import { GhlClient } from './ghl.server';
import {
  customerCustomFields,
  orderCustomFields,
  tagsFromOrder,
} from './fashion.server';
import type { ShopConfigRecord, ShopifyCustomer, ShopifyOrder } from './types';
import prisma from '../db.server';

export async function syncOrder(shop: string, order: ShopifyOrder): Promise<void> {
  const config = await prisma.shopConfig.findUnique({ where: { shop } });
  if (!config) {
    await log(shop, 'orders', String(order.id), 'skipped', undefined, 'no config');
    return;
  }

  const email = order.email ?? order.customer?.email;
  const phone = order.phone ?? order.customer?.phone;
  if (!email && !phone) {
    await log(shop, 'orders', String(order.id), 'skipped', undefined, 'no email/phone');
    return;
  }

  const ghl = new GhlClient(config.ghlApiKey, config.ghlLocationId);

  try {
    const tags = tagsFromOrder(order, config as ShopConfigRecord);
    const contact = await ghl.upsertContact({
      email,
      phone,
      firstName: order.customer?.first_name,
      lastName: order.customer?.last_name,
      tags,
      source: 'shopify',
      customField: orderCustomFields(order),
    });

    const total = parseFloat(order.total_price ?? '0');
    if (total > 0 && contact?.id && config.enableOpportunities) {
      await ghl.createOpportunity({
        contactId: contact.id,
        title: `Shopify Order #${order.id}`,
        monetaryValue: total,
        status: order.financial_status === 'paid' ? 'won' : 'open',
      });
    }

    await log(shop, 'orders', String(order.id), 'ok', contact?.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    await log(shop, 'orders', String(order.id), 'error', undefined, message);
    throw err;
  }
}

export async function syncCustomer(shop: string, customer: ShopifyCustomer): Promise<void> {
  const config = await prisma.shopConfig.findUnique({ where: { shop } });
  if (!config) return;

  if (!customer.email && !customer.phone) return;

  const ghl = new GhlClient(config.ghlApiKey, config.ghlLocationId);
  const tags = ['shopify-customer'];
  if (customer.accepts_marketing) tags.push('marketing-opt-in');

  try {
    const contact = await ghl.upsertContact({
      email: customer.email,
      phone: customer.phone,
      firstName: customer.first_name,
      lastName: customer.last_name,
      tags,
      source: 'shopify',
      customField: customerCustomFields(customer),
    });
    await log(shop, 'customers', String(customer.id), 'ok', contact?.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    await log(shop, 'customers', String(customer.id), 'error', undefined, message);
    throw err;
  }
}

async function log(
  shop: string,
  topic: string,
  resourceId: string,
  status: 'ok' | 'error' | 'skipped',
  ghlContactId?: string,
  errorMessage?: string,
): Promise<void> {
  await prisma.syncLog.create({
    data: { shop, topic, resourceId, status, ghlContactId, errorMessage },
  });
}
