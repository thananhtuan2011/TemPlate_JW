export interface UserRole {
    id?: number;
    title?: string;
    code?: string;
    note?: string;
    order?: number;
}

export interface UserRoleCRUD {
    menuCode?: string;
    add?: boolean;
    edit?: boolean;
    delete?: boolean;
    view?: boolean;
    name?: string;
    nameEn?: string;
    nameKo?: string;
}
