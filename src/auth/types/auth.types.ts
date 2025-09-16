export interface UserWithoutPassword {
    id: number;
    email: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthResponse {
    access_token: string;
    user: {
        id: number;
        email: string;
        name: string | null;
    };
}
