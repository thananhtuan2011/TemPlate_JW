export interface ProductModel {
    id: number;
    billId: number;
    productId: number;
    productName: string;
    productCode: string;
    quantity: number;
    mergeQuantity?: number;
    unitPrice: number;
    salePrice: number;
    discountType: string;
    discountPrice: number;
    isCooked: boolean;
    isSelect?: boolean;
    taxVat?: number;
    note?: string;
    realPrice?: number;
}

export interface Bill {
    id: number;
    displayOrder?: number;
    floorId?: number;
    deskId?: number;
    userCode?: string;
    userType?: string;
    customerId?: number;
    customerName?: string;
    quantityCustomer?: number;
    totalAmount?: number;
    amountReceivedByCus?: number;
    amountSendToCus?: number;
    discountPrice?: number;
    discountType?: string;
    status: string;
    note?: string;
    isPayment?: boolean;
    isPrintBill?: boolean;
    isPriority?: boolean;
    createdDate?: string;
    updatedDate?: string;
    isDeleted?: boolean;
    products?: BillDetail[];
    typePay?: string;
    totalCustomer?: number;
    debitCode?: string;
    debitDetailCodeFirst?: string;
    surcharge?: number;
    billNumber?: string;
    type?: string;
    vat?: number;
    vatCode?: string;
    vatRate?: number;
    detail1?: string;
    detail2?: string;
    billDetails?: any[];
    billDetailsRoot?: any[];
}

export interface BillDetail {
    id: number;
    billId: number;
    goodsId: number;
    quantity: number;
    unitPrice: number;
    discountPrice: number;
    discountType: string;
    createdDate?: string;
    updatedDate?: string;
    isDeleted?: boolean;
    taxVat?: number;
    goodsName?: string;
    goodsCode?: string;
    note?: string;
    image1?: string;
    discountPriceBill?: number;
    surchargeBill?: number;
}
export interface BillDetailPrint {
    id: number;
    billId: number;
    goodsId: number;
    quantity: number;
    unitPrice: number;
    pricePay: number;
    discountPrice: number;
    discountType: string;
    createdDate?: string;
    updatedDate?: string;
    isDeleted?: boolean;
    taxVat?: number;
    goodsName?: string;
    goodsCode?: string;
    note?: string;
    discountPriceBill?: number;
    surchargeBill?: number;
}
export class NotificationCountResult {
    count: number;
}

export class NotificationResult {
    id: number;
    billId: number;
    userCode: string;
    customerName: string;
    tranType: string;
    note: string;
    status: string;
    createdDate: Date;
    displayOrder: number;
    totalAmount?: number;
    deskName?: string;
    billNumber?: string;
}

export class ChangeStatusResult {
    id: number;
    billId?: number;
    currentTranType: string;
}

export interface ICashierImport {
    id: number;
    code: string;
    name: string;
    openingDebit: number;
    openingCredit: number;
    arisingDebit: number;
    arisingCredit: number;
    isForeignCurrency: boolean;
    openingForeignDebit: number;
    openingForeignCredit: number;
    arisingForeignDebit: number;
    arisingForeignCredit: number;
    duration: string;
    currency: string;
    exchangeRate: any;
    accGroup: number;
    classification: number;
    protected: number;
    type: number;
    hasChild: boolean;
    hasDetails: boolean;
    parentRef: string;
    displayInsert: boolean;
    displayDelete: boolean;
    stockUnit: string;
    openingStockQuantity: number;
    arisingStockQuantity: number;
    stockUnitPrice: number;
    warehouseCode: string;
    warehouseName: string;
    openingDebitNB: any;
    openingCreditNB: any;
    arisingDebitNB: number;
    arisingCreditNB: number;
    openingForeignDebitNB: number;
    openingForeignCreditNB: number;
    arisingForeignDebitNB: number;
    arisingForeignCreditNB: number;
    openingStockQuantityNB: any;
    arisingStockQuantityNB: number;
    stockUnitPriceNB: any;
    year: number;
    isInternal: number;
    cashierRequest: ICashierRequest;
}


export interface ICashierRequest {
    id: number
    type: string
    month: number
    voucherNumber: string
    orginalAddress: string
    orginalVoucherNumber: string
    orginalBookDate: string
    referenceVoucherNumber: string
    referenceBookDate: string
    referenceFullName: string
    referenceAddress: string
    isInternal: number
    attachVoucher: string
    invoiceCode: string
    invoiceName: string
    invoiceTaxCode: string
    invoiceAddress: string
    invoiceProductItem: string
    invoiceAdditionalDeclarationCode: string
    invoiceSerial: string
    invoiceNumber: string
    invoiceDate: string
    debitCode: string
    debitDetailCodeFirst: string
    debitDetailCodeSecond: string
    creditCode: string
    creditDetailCodeFirst: string
    creditDetailCodeSecond: string
    debitWarehouse: string
    creditWarehouse: string
    orginalCompanyName: string
    orginalDescription: string
    projectCode: string
    depreciaMonth: number
    orginalCurrency: number
    exchangeRate: number
    quantity: number
    unitPrice: number
    amount: number
    tab: number,
    billNec: number,
    billBox: number,
    percentTransport: number
    amountTransport: number
    amountImportWarehouse: number
    percentImportTax: number
    bookDate: string
}
