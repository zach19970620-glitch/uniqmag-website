interface Env {
    RESEND_API_KEY: string;
    FROM_EMAIL?: string;
    TO_EMAIL?: string;
}
export declare const onRequest: PagesFunction<Env>;
export {};
