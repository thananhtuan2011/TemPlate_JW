export interface MenuRoleModel {
    id?: number;
    code?: string;
    name?: string;
    codeParent?: string;
    note?: string;
    colorRandom?: string;
}

export interface MenuViewModel {
    id?: number;
    code?: string;
    name?: string;
    nameEn?: string;
    nameKo?: string;
    codeParent?: string;
    note?: string;
    order?: string;
    listItem?: MenuRoleViewModel[];
}

export interface MenuRoleViewModel {
    id?: number;
    menuId?: number;
    userRoleId?: number;
    userRoleName?: string;
    all?: boolean;
    add?: boolean;
    edit?: boolean;
    delete?: boolean;
    view?: boolean;
}
