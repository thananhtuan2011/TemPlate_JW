export interface InventoryModel {
    id?: number;
    account?: number;
    accountName?: string;
    warehouse?: string;
    warehouseName?: string;
    detail1?: string;
    detailName1?: string;
    detail2?: string;
    detailName2?: string;
    image1?: string;
    inputQuantity?: number;
    outputQuantity?: number;
    closeQuantity?: number;
    closeQuantityReal?: number;
    createAt?: Date;
    note?: string;
}
