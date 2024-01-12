export class LedgerCostOfGoods {
    id: number;
    orginalVoucherNumber: string;
    orginalBookDate?: string;
    orginalDescription: string;
    creditCode: string;
    creditDetailCodeFirst: string;
    creditDetailCodeSecond: string;
    debitCode: string;
    debitDetailCodeFirst: string;
    debitDetailCodeSecond: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    debitWarehouse: string;
    debitWarehouseName: string;
    type: string;
    voucherNumber: string;
    revenueCode: string;
    revenueUnitPrice: number;
    revenueAmmountPrice: number;
    month: number;

    debitCodeName: string;
    debitDetailCodeFirstName: string;
    debitDetailCodeSecondName: string;
    order: number;
}
