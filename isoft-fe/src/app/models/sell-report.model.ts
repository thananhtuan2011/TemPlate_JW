export interface ProfitBeforeTax {
    id: number;
    billId: number;
    goodsId: number;
    quantity: number;
    unitPrice: number;
    discountPrice: number;
    taxVAT: number;
    discountType: string;
    createdDate: Date;
    updatedDate: Date;
    isDeleted: boolean;
    price: number;
    note?: any;
    goodsName: string;
    profit: number;
    goodsCode?: any;
    wareHouseName?: any;
    openQuantity?: any;
    inputQuantity?: any;
    outputQuantity?: any;
    closeQuantity?: any;
    minStockLevel: number;
    maxStockLevel: number;
}

export interface DaylyReport {
    createdDate: Date;
    price: number;
    unitPrice: number;
    discountPrice: number;
    taxVAT: number;
    discountType?: any;
    phaiThu: number;
    tienMat: number;
    nganHang: number;
    congNo: number;
}

export interface Order {
    id: number;
    orderDetails: any[];
    totalPrice: number;
    totalPriceDiscount: number;
    totalPricePaid: number;
    status: number;
    statusName: string;
    customerId: number;
    customerName?: any;
    shippingAddress: string;
    tell: string;
    fullName: string;
    notify?: any;
    createAt: Date;
}
