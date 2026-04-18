export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    role_id?: number | null;
    role?: {
        id: number;
        name: string;
        slug: string;
    } | null;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User | null;
        permissions?: string[];
    };
};
