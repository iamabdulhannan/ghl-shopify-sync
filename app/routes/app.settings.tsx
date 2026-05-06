import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useActionData, useLoaderData, Form } from '@remix-run/react';
import {
  Page,
  Layout,
  Card,
  Text,
  TextField,
  Button,
  FormLayout,
  Banner,
  BlockStack,
  Checkbox,
} from '@shopify/polaris';
import { useState } from 'react';
import { authenticate } from '../shopify.server';
import prisma from '../db.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const config = await prisma.shopConfig.findUnique({
    where: { shop: session.shop },
  });
  return json({ config });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const ghlApiKey = String(form.get('ghlApiKey') ?? '').trim();
  const ghlLocationId = String(form.get('ghlLocationId') ?? '').trim();
  const vipThreshold = Number(form.get('vipThreshold') ?? 500);
  const highValueThreshold = Number(form.get('highValueThreshold') ?? 200);
  const enableCategoryTags = form.get('enableCategoryTags') === 'on';
  const enableVendorTags = form.get('enableVendorTags') === 'on';
  const enableOpportunities = form.get('enableOpportunities') === 'on';

  if (!ghlApiKey || !ghlLocationId) {
    return json(
      { error: 'GHL API key and Location ID are both required.' },
      { status: 400 },
    );
  }

  await prisma.shopConfig.upsert({
    where: { shop: session.shop },
    create: {
      shop: session.shop,
      ghlApiKey,
      ghlLocationId,
      vipThreshold,
      highValueThreshold,
      enableCategoryTags,
      enableVendorTags,
      enableOpportunities,
    },
    update: {
      ghlApiKey,
      ghlLocationId,
      vipThreshold,
      highValueThreshold,
      enableCategoryTags,
      enableVendorTags,
      enableOpportunities,
    },
  });

  return redirect('/app/settings?saved=1');
};

export default function Settings() {
  const { config } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [apiKey, setApiKey] = useState(config?.ghlApiKey ?? '');
  const [locationId, setLocationId] = useState(config?.ghlLocationId ?? '');
  const [vip, setVip] = useState(String(config?.vipThreshold ?? 500));
  const [highValue, setHighValue] = useState(String(config?.highValueThreshold ?? 200));
  const [cat, setCat] = useState(config?.enableCategoryTags ?? true);
  const [vendor, setVendor] = useState(config?.enableVendorTags ?? true);
  const [opps, setOpps] = useState(config?.enableOpportunities ?? true);

  return (
    <Page title="Settings" backAction={{ content: 'Dashboard', url: '/app' }}>
      <Layout>
        <Layout.AnnotatedSection
          title="GoHighLevel credentials"
          description="Get these from GHL → Settings → Business Profile (or Settings → Integrations → Private Integrations)."
        >
          <Card>
            <Form method="post">
              <FormLayout>
                {actionData?.error && (
                  <Banner tone="critical">{actionData.error}</Banner>
                )}
                <TextField
                  label="GHL API key"
                  name="ghlApiKey"
                  value={apiKey}
                  onChange={setApiKey}
                  autoComplete="off"
                  type="password"
                />
                <TextField
                  label="GHL Location ID"
                  name="ghlLocationId"
                  value={locationId}
                  onChange={setLocationId}
                  autoComplete="off"
                />

                <Text as="h3" variant="headingMd">
                  Tag thresholds
                </Text>
                <FormLayout.Group>
                  <TextField
                    label="VIP threshold (USD)"
                    name="vipThreshold"
                    type="number"
                    value={vip}
                    onChange={setVip}
                    autoComplete="off"
                  />
                  <TextField
                    label="High-value threshold (USD)"
                    name="highValueThreshold"
                    type="number"
                    value={highValue}
                    onChange={setHighValue}
                    autoComplete="off"
                  />
                </FormLayout.Group>

                <BlockStack gap="200">
                  <Checkbox
                    label="Auto-tag by product category"
                    name="enableCategoryTags"
                    checked={cat}
                    onChange={setCat}
                  />
                  <Checkbox
                    label="Auto-tag by vendor / brand"
                    name="enableVendorTags"
                    checked={vendor}
                    onChange={setVendor}
                  />
                  <Checkbox
                    label="Create GHL opportunities for paid orders"
                    name="enableOpportunities"
                    checked={opps}
                    onChange={setOpps}
                  />
                </BlockStack>

                <Button submit variant="primary">
                  Save
                </Button>
              </FormLayout>
            </Form>
          </Card>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  );
}
