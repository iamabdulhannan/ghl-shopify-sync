import {
  Card,
  Page,
  Text,
  Button,
  TextField,
  FormLayout,
  Banner,
} from '@shopify/polaris';
import { json } from '@remix-run/node';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import { login } from '../../shopify.server';
import { loginErrorMessage } from './error.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));
  return json({ errors, polarisTranslations: undefined });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));
  return json({ errors });
};

export default function Auth() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [shop, setShop] = useState('');
  const errors = { ...loaderData.errors, ...(actionData?.errors ?? {}) };

  return (
    <Page narrowWidth>
      <Card>
        <Form method="post">
          <FormLayout>
            <Text variant="headingMd" as="h2">
              Log in
            </Text>
            {errors.shop && <Banner tone="critical">{errors.shop}</Banner>}
            <TextField
              type="text"
              name="shop"
              label="Shop domain"
              helpText="e.g: my-shop-domain.myshopify.com"
              value={shop}
              onChange={setShop}
              autoComplete="on"
            />
            <Button submit>Log in</Button>
          </FormLayout>
        </Form>
      </Card>
    </Page>
  );
}
