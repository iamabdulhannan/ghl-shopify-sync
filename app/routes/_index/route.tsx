import type { LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { login } from '../../shopify.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  if (url.searchParams.get('shop')) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }
  return json({ showForm: Boolean(login) });
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>GHL Sync</h1>
        <p style={subtitleStyle}>
          Auto-sync Shopify orders & customers into GoHighLevel CRM with smart tagging.
        </p>
        {showForm && (
          <Form method="post" action="/auth/login">
            <label style={labelStyle}>
              Your Shopify store
              <input
                type="text"
                name="shop"
                placeholder="your-store.myshopify.com"
                style={inputStyle}
              />
            </label>
            <button type="submit" style={buttonStyle}>
              Install
            </button>
          </Form>
        )}
        <ul style={featureList}>
          <li>Real-time webhook sync (orders & customers)</li>
          <li>Auto-tagging: VIP, category, vendor, repeat-buyer</li>
          <li>Auto-create opportunities from paid orders</li>
          <li>Custom fields: total spent, orders count, marketing opt-in</li>
          <li>14-day free trial · $9.99/mo</li>
        </ul>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Inter, system-ui, sans-serif',
  background: '#f6f6f7',
  padding: 24,
};
const cardStyle: React.CSSProperties = {
  maxWidth: 480,
  width: '100%',
  background: '#fff',
  borderRadius: 12,
  padding: 32,
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
};
const titleStyle: React.CSSProperties = { margin: 0, fontSize: 28, fontWeight: 700 };
const subtitleStyle: React.CSSProperties = { color: '#6d7175', marginTop: 8, marginBottom: 24 };
const labelStyle: React.CSSProperties = { display: 'block', fontWeight: 500, marginBottom: 12 };
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 10,
  borderRadius: 6,
  border: '1px solid #c9cccf',
  marginTop: 4,
  fontSize: 14,
};
const buttonStyle: React.CSSProperties = {
  width: '100%',
  background: '#008060',
  color: '#fff',
  padding: '10px 16px',
  border: 0,
  borderRadius: 6,
  fontWeight: 600,
  cursor: 'pointer',
};
const featureList: React.CSSProperties = {
  marginTop: 24,
  paddingLeft: 18,
  color: '#202223',
  lineHeight: 1.7,
};
