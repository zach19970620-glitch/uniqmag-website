import { handleContactRequest } from '../../api/contact-handler';
export const onRequest = async (context) => {
    return handleContactRequest(context.request, {
        RESEND_API_KEY: context.env.RESEND_API_KEY,
        FROM_EMAIL: context.env.FROM_EMAIL ?? 'UNIQMAG <noreply@uniqmagx.com>',
        TO_EMAIL: context.env.TO_EMAIL ?? 'zach@uniqmagx.com',
    });
};
