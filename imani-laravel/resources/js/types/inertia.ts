import { User } from '@/types';

export interface AuthUser extends User {
    email?: string;
}

export interface Church {
    id: string;
    name: string;
}

export interface PageProps {
    auth: {
        user: AuthUser;
    };
    activeChurch: Church | null;
    churches: Church[];
    flash?: {
        success?: string;
        error?: string;
        info?: string;
    };
    [key: string]: unknown;
}

export interface Church {
    id: string;
    name: string;
}
