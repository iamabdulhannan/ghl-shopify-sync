import type { ActionFunctionArgs } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import prisma from '../db.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session } = await authenticate.webhook(request);

  // Shopify retries this if 5xx; if session is gone (already uninstalled), still ok.
  if (session) {
    await prisma.session.deleteMany({ where: { shop } });
  }

  // We keep ShopConfig around for 48h in case of accidental uninstall;
  // shop/redact will purge it permanently.
  return new Response();
};
