export interface Auth {
    data: AuthData;
    message: string;
    status: number;
}

export interface AuthData {
    id: number;
    avatar: string;
    fullname: string;
    targetId: number;
    timekeeper: number;
    token: string;
    username: string;
    roleName: string[];
    menus: any[];
}
