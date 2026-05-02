import type { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node';
import { Link, Outlet, useLoaderData, useRouteError } from '@remix-run/react';
import { boundary } from '@shopify/shopify-app-remix/server';
import { AppProvider } from '@shopify/shopify-app-remix/react';
import { NavMenu } from '@shopify/app-bridge-react';
import polarisStyles from '@shopify/polaris/build/esm/styles.css?url';
import { authenticate, MONTHLY_PLAN } from '../shopify.server';

export const links = () => [{ rel: 'stylesheet', href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { billing } = await authenticate.admin(request);

  // Require an active subscription (after 14-day trial)
  await billing.require({
    plans: [MONTHLY_PLAN],
    isTest: process.env.NODE_ENV !== 'production',
    onFailure: async () =>
      billing.request({
        plan: MONTHLY_PLAN,
        isTest: process.env.NODE_ENV !== 'production',
      }),
  });

  return { apiKey: process.env.SHOPIFY_API_KEY || '' };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Dashboard
        </Link>
        <Link to="/app/settings">Settings</Link>
        <Link to="/app/tags">Tag rules</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
