export interface ContactFormPayload {
    name: string;
    email: string;
    subject: string;
    message: string;
}
export interface ContactEnv {
    RESEND_API_KEY: string;
    FROM_EMAIL: string;
    TO_EMAIL: string;
}
export declare function validateContactPayload(data: unknown): {
    ok: true;
    data: ContactFormPayload;
} | {
    ok: false;
    error: string;
};
export declare function sendContactEmail(payload: ContactFormPayload, env: ContactEnv): Promise<{
    ok: true;
} | {
    ok: false;
    error: string;
}>;
export declare function handleContactRequest(request: Request, env: ContactEnv): Promise<Response>;
