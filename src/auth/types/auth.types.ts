export interface UserResponse {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthResponse {
    access_token: string;
    user: {
        id: number;
        name: string;
        email: string;
        phoneNumber: string;
    };
}
