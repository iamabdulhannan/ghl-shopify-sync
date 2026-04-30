import type { ShopifyCustomer, ShopifyOrder } from '../types.js';

const VIP_THRESHOLD = 500;
const HIGH_VALUE_THRESHOLD = 200;

export function tagsFromOrder(order: ShopifyOrder): string[] {
  const tags = new Set<string>(['shopify-customer']);

  const total = parseFloat(order.total_price ?? '0');
  if (total >= VIP_THRESHOLD) tags.add('vip');
  else if (total >= HIGH_VALUE_THRESHOLD) tags.add('high-value');

  for (const item of order.line_items ?? []) {
    if (item.product_type) {
      tags.add(`category-${slug(item.product_type)}`);
    }
    if (item.vendor) {
      tags.add(`brand-${slug(item.vendor)}`);
    }
  }

  const ordersCount = order.customer?.orders_count ?? 0;
  if (ordersCount === 1) tags.add('first-purchase');
  else if (ordersCount > 1) tags.add('repeat-buyer');

  if (order.customer?.accepts_marketing) tags.add('marketing-opt-in');

  return Array.from(tags);
}

export function customerCustomFields(customer: ShopifyCustomer): Record<string, unknown> {
  return {
    shopify_customer_id: customer.id,
    shopify_total_spent: customer.total_spent,
    shopify_orders_count: customer.orders_count,
    accepts_marketing: customer.accepts_marketing,
  };
}

export function orderCustomFields(order: ShopifyOrder): Record<string, unknown> {
  return {
    last_order_id: order.id,
    last_order_total: order.total_price,
    last_order_currency: order.currency,
    last_order_status: order.financial_status,
    last_order_at: order.created_at,
  };
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
