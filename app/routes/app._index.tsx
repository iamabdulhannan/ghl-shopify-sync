import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  Banner,
  InlineStack,
  Badge,
  DataTable,
  Box,
  Link as PolarisLink,
} from '@shopify/polaris';
import { authenticate } from '../shopify.server';
import prisma from '../db.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const [config, recent, totals] = await Promise.all([
    prisma.shopConfig.findUnique({ where: { shop } }),
    prisma.syncLog.findMany({
      where: { shop },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.syncLog.groupBy({
      by: ['status'],
      where: { shop },
      _count: { _all: true },
    }),
  ]);

  const counts: Record<string, number> = {};
  for (const t of totals) counts[t.status] = t._count._all;

  return json({
    configured: Boolean(config),
    counts,
    recent: recent.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  });
};

export default function Dashboard() {
  const { configured, counts, recent } = useLoaderData<typeof loader>();

  const rows = recent.map((r) => [
    new Date(r.createdAt).toLocaleString(),
    r.topic,
    r.resourceId,
    statusBadge(r.status),
    r.errorMessage ?? '—',
  ]);

  return (
    <Page title="GHL Sync Dashboard">
      <Layout>
        {!configured && (
          <Layout.Section>
            <Banner tone="warning" title="GHL credentials missing">
              <p>
                Paste your GoHighLevel API key in{' '}
                <PolarisLink url="/app/settings">Settings</PolarisLink> to start syncing.
              </p>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <InlineStack gap="400">
            <StatCard label="Synced" value={counts.ok ?? 0} tone="success" />
            <StatCard label="Errors" value={counts.error ?? 0} tone="critical" />
            <StatCard label="Skipped" value={counts.skipped ?? 0} tone="info" />
          </InlineStack>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Recent activity
              </Text>
              {rows.length === 0 ? (
                <Text as="p" tone="subdued">
                  No syncs yet. Place a test order in your store to see it here.
                </Text>
              ) : (
                <DataTable
                  columnContentTypes={['text', 'text', 'text', 'text', 'text']}
                  headings={['Time', 'Topic', 'Resource', 'Status', 'Error']}
                  rows={rows}
                />
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'success' | 'critical' | 'info';
}) {
  return (
    <Box minWidth="160px">
      <Card>
        <BlockStack gap="100">
          <Text as="p" tone="subdued" variant="bodySm">
            {label}
          </Text>
          <Text as="p" variant="headingLg">
            {value.toLocaleString()}
          </Text>
          <Badge tone={tone}>{tone === 'success' ? 'Healthy' : tone === 'critical' ? 'Needs attention' : 'Info'}</Badge>
        </BlockStack>
      </Card>
    </Box>
  );
}

function statusBadge(status: string): string {
  if (status === 'ok') return '✓ Synced';
  if (status === 'error') return '✗ Error';
  return '⊘ Skipped';
}
