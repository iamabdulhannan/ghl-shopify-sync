import express from 'express';
import { config } from './config.js';
import { logger } from './logger.js';
import { verifyShopifyWebhook } from './shopify/verify.js';
import { handleOrderCreated } from './handlers/orderCreated.js';
import { handleCustomerCreated } from './handlers/customerCreated.js';

const app = express();

// Raw body needed for HMAC verification — must come before any json parser on this path
app.use('/webhooks/shopify', express.raw({ type: 'application/json' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'ghl-shopify-sync' });
});

app.post('/webhooks/shopify/:topic', async (req, res) => {
  const { topic } = req.params;
  const hmac = req.get('X-Shopify-Hmac-Sha256');
  const rawBody = req.body as Buffer;

  if (!verifyShopifyWebhook(rawBody, hmac)) {
    logger.warn({ topic, ip: req.ip }, 'Invalid Shopify HMAC signature');
    res.status(401).send('invalid hmac');
    return;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch (err) {
    logger.error({ err, topic }, 'Failed to parse webhook JSON');
    res.status(400).send('invalid json');
    return;
  }

  // Acknowledge fast — Shopify retries if it doesn't get 200 within 5s
  res.status(200).send('ok');

  try {
    if (topic === 'orders-create' || topic === 'orders-paid') {
      await handleOrderCreated(payload as never);
    } else if (topic === 'customers-create' || topic === 'customers-update') {
      await handleCustomerCreated(payload as never);
    } else {
      logger.info({ topic }, 'Unhandled webhook topic');
    }
  } catch (err) {
    logger.error({ err, topic }, 'Failed to process webhook');
  }
});

const port = parseInt(config.PORT, 10);
app.listen(port, () => {
  logger.info({ port }, 'GHL ↔ Shopify Sync listening');
});
