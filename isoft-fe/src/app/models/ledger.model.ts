import { ChartOfAccount } from './case.model';
import { Description } from './description.model';
import { Payer } from './payer.model';

export class Ledger {
    id?: number = 0;
    type?: string = '';
    typeName?: string = '';
    month?: number = 0;
    bookDate?: Date | string;
    voucherNumber?: string = '';
    isVoucher?: boolean = false;
    orginalCode?: string = '';
    orginalVoucherNumber?: string = '';
    orginalBookDate?: Date | string = new Date();
    orginalFullName?: string = '';
    orginalDescription?: string = '';
    orginalDescriptionEN?: string = '';
    orginalCompanyName?: string = '';
    orginalAddress?: string = '';
    attachVoucher?: string = '';
    referenceVoucherNumber?: string = '';
    referenceBookDate?: Date | string;
    referenceFullName?: string = '';
    referenceAddress?: string = '';
    invoiceCode?: string = '';
    invoiceAdditionalDeclarationCode?: string = 'BT';
    invoiceNumber?: string = '';
    invoiceTaxCode?: string = '';
    invoiceAddress?: string = '';
    invoiceSerial?: string = '';
    invoiceDate?: Date | string = new Date();
    invoiceName?: string = '';
    invoiceProductItem?: string = '';
    debitCode?: string = '';
    debitWarehouse?: string = '';
    debitDetailCodeFirst?: string = '';
    debitDetailCodeSecond?: string = '';
    creditCode?: string = '';
    creditWarehouse?: string = '';
    creditDetailCodeFirst?: string = '';
    creditDetailCodeSecond?: string = '';
    projectCode?: string = '';
    taxCode?: string = '';
    depreciaMonth?: number = 0;
    order?: number = 0;
    group?: number = 0;
    depreciaDuration?: Date | string;
    quantity?: number | string = 0;
    unitPrice?: number | string = 0;
    orginalCurrency?: number | string = 0;
    exchangeRate?: number | string = 0;
    amount?: number | string = 0;
    isAriseMark?: boolean = false;
    isDelete?: boolean = false;
    createAt?: Date | string;
    updateAt?: Date | string;
    deleteAt?: Date | string;
    userCreated?: number = 0;
    userUpdated?: number = 0;
    userDeleted?: number = 0;
    isInternal?: number = 1;
    debitCodeName?: string = '';
    debitDetailCodeFirstName?: string = '';
    debitDetailCodeSecondName?: string = '';
    creditCodeName?: string = '';
    creditDetailCodeFirstName?: string = '';
    creditDetailCodeSecondName?: string = '';
    debitWarehouseName?: string = '';
    creditWarehouseName?: string = '';

    debitRemaining?: number = 0;
    debitFirstDetailRemaining?: number = 0;
    debitSecondDetailRemaining?: number = 0;

    creditRemaining?: number = 0;
    creditFirstDetailRemaining?: number = 0;
    creditSecondDetailRemaining?: number = 0;

    payer?: Payer = new Payer();
    company?: Payer = new Payer();
    description?: Description = new Description();

    isSelected?: boolean = false;

    debitDetail1?: ChartOfAccount = null;
    debitDetails1?: ChartOfAccount[] = [];
    debitDetail2?: ChartOfAccount = null;
    debitDetails2?: ChartOfAccount[] = [];
    creditDetail1?: ChartOfAccount = null;
    creditDetails1?: ChartOfAccount[] = [];
    creditDetail2?: ChartOfAccount = null;
    creditDetails2?: ChartOfAccount[] = [];
    billId?: number;
    totalAmount?: number;
    isHover?: boolean = false;
}

export class EditOrderRequest {
    editOrderStart?: number = 0;
    editOrderEnd?: number = 0;
    orderType?: number = 0;
    editValue?: number = 0;
    isInternal?: number = 0;
}

export interface ILedgerWarehouse {
    id: number,
    totalAmount: number,
    orginalVoucherNumber: string | null,
    orginalBookDate: string | null,
    orginalDescription: string | null,
    customerId: number | null
    month: number | null
    isInternal: number | null
    type: number | null
}
