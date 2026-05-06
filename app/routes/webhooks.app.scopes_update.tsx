import type { ActionFunctionArgs } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import prisma from '../db.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const { payload, session } = await authenticate.webhook(request);

  if (session) {
    const newScopes = (payload.current as string[] | undefined) ?? [];
    await prisma.session.update({
      where: { id: session.id },
      data: { scope: newScopes.join(',') },
    });
  }

  return new Response();
};
