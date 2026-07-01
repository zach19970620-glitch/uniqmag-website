import { handleContactRequest } from '../../api/contact-handler';

interface Env {
  RESEND_API_KEY: string;
  FROM_EMAIL?: string;
  TO_EMAIL?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  return handleContactRequest(context.request, {
    RESEND_API_KEY: context.env.RESEND_API_KEY,
    FROM_EMAIL: context.env.FROM_EMAIL ?? 'UNIQMAG <noreply@uniqmagx.com>',
    TO_EMAIL: context.env.TO_EMAIL ?? 'zach@uniqmagx.com',
  });
};
