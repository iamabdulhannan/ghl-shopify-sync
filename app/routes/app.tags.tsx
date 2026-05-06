import { Page, Layout, Card, Text, BlockStack, List } from '@shopify/polaris';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { authenticate } from '../shopify.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function TagRules() {
  return (
    <Page title="Tag rules" backAction={{ content: 'Dashboard', url: '/app' }}>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Auto-tags applied to every contact
              </Text>
              <List type="bullet">
                <List.Item>
                  <code>shopify-customer</code> — every synced contact
                </List.Item>
                <List.Item>
                  <code>vip</code> — order total ≥ VIP threshold (configurable)
                </List.Item>
                <List.Item>
                  <code>high-value</code> — order total ≥ high-value threshold
                </List.Item>
                <List.Item>
                  <code>category-{`<type>`}</code> — one per product type in the order
                </List.Item>
                <List.Item>
                  <code>brand-{`<vendor>`}</code> — one per vendor in the order
                </List.Item>
                <List.Item>
                  <code>first-purchase</code> — customer's 1st order
                </List.Item>
                <List.Item>
                  <code>repeat-buyer</code> — customer's 2nd+ order
                </List.Item>
                <List.Item>
                  <code>marketing-opt-in</code> — customer accepted marketing
                </List.Item>
              </List>
              <Text as="p" tone="subdued">
                Use these tags in GHL workflows to fire SMS/email automations: VIP welcome,
                category-specific drips, abandoned-cart sequences, post-purchase follow-ups.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
