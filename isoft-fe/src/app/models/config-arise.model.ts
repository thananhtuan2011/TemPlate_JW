export interface IFormConfigAriseDto {
    codeData: string;
    code: string;
    ariseBehaviourId: number;
    value: boolean;
}

export interface IConfigAriseDocumentBehaviourDto {
    id: number;
    ariseBehaviourId: number;
    documentId: number;
    nokeepDataChartOfAccount: boolean;
    nokeepDataBill: boolean;
    nokeepDataTax: boolean;
    focusLedger: boolean;
    configAriseBehaviour: IConfigAriseBehaviourDto;
}

export interface IConfigAriseBehaviourDto {
    id: number;
    name: string;
    code: string;
    codeData: string;
    index: number;
    order: number;
}

export enum ConfigButtonAriseEnum {
    nokeepDataChartOfAccount,
    nokeepDataBill,
    nokeepDataTax,
}

export enum ConfigAriseEnum {
    orginalVoucherNumber,
    orginalBookDate,
    referenceVoucherNumber,
    referenceBookDate,
    referenceFullName,
    referenceAddress,
    orginalCompanyName,
    orginalAddress,
    orginalDescription,
    attachVoucher,
    invoiceCode,
    invoiceNumber,
    invoiceSerial,
    invoiceDate,
    invoiceTaxCode,
    invoiceAddress,
    invoiceName,
    invoiceProductItem,
    debitCode,
    debitDetailCodeFirst,
    debitDetailCodeSecond,
    creditCode,
    creditDetailCodeFirst,
    creditDetailCodeSecond,
    warehouse,
    projectCode,
    depreciaMonth,
    orginalCurrency,
    exchangeRate,
    quantity,
    unitPrice,
    amount,
}

export interface IConfigAriseDocumentBehaviourInputDto {
    key: string;
    ariseBehaviourId: number;
    documentId: number;
    value: boolean;
}
