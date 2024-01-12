import { NameValueOfInt, NameValueOfString, Page } from './common.model';

export class AccountGroupDetailModel {
    id: number = 0;
    code: string = '';
    name: string = '';
    openingDebit: number = 0;
    openingCredit: number = 0;
    arisingDebit: number = 0;
    arisingCredit: number = 0;
    closingDebit: number = 0;
    closingCredit: number = 0;
    currency: string = '0';
    isForeignCurrency: boolean = false;
    exchangeRate: number = 0;
    arisingForeignDebit: number = 0;
    arisingForeignCredit: number = 0;
    openingForeignDebit: number = 0;
    openingForeignCredit: number = 0;
    isSpendAccount: boolean = false;
    type: number = 0;
    classification: number = 0;
    accGroup: number = 0;
    duration: string = 'N';
    protected: number = 0;
    displayInsert: boolean = true;
    displayUpdate: boolean = false;
    displayDelete: boolean = true;
    description: string = '';
    parentId: number = 0;
    parentRef: string = '';
    hasChild: boolean = false;
    hasDetails: boolean = false;
    minimumStockQuantity: number = 0;
    maximumStockQuantity: number = 0;
    stockCostPrice: number = 0;
    stockSellingPrice: number = 0;
    stockUnitPrice: number = 0;
    stockUnit: string = '0';
    warehouseCode: string = '';
    openingStockQuantity: number = 0;
    closingForeignCredit: number = 0;
    closingForeignDebit: number = 0;
    openingStockQuantityNb: number = 0;
    stockUnitPriceNb: number = 0;
    openingDebitNb: number = 0;
    openingCreditNb: number = 0;
    openingForeignDebitNb: number = 0;
    openingForeignCreditNb: number = 0;
    isInternal: number;
    constructor() {}
}

export class AccountGroupAddEditModel {
    id: number = 0;
    code: string = '';
    name: string = '';
    openingDebit: number = 0;
    openingCredit: number = 0;
    arisingDebit: number = 0;
    arisingCredit: number = 0;
    isForeignCurrency: boolean = false;
    openingForeignDebit: number = 0;
    openingForeignCredit: number = 0;
    arisingForeignDebit: number = 0;
    arisingForeignCredit: number = 0;
    duration: string = 'N';
    closingDebit: number = 0;
    closingCredit: number = 0;
    currency: string = '0';
    exchangeRate: number = 0;
    accGroup: number = 0;
    classification: number = 0;
    protected: number = 0;
    type: number = 0;
    hasChild: boolean = false;
    hasDetails: boolean = false;
    parentRef: string = '';
    displayInsert: boolean = false;
    displayDelete: boolean = false;
    stockUnit: string = '0';
    openingStockQuantity: number = 0;
    arisingStockQuantity: number = 0;
    stockUnitPrice: number = 0;
    warehouseCode: string = '';
    openingDebitNb: number = 0;
    openingCreditNb: number = 0;
    arisingDebitNb: number = 0;
    arisingCreditNb: number = 0;
    openingForeignDebitNb: number = 0;
    openingForeignCreditNb: number = 0;
    arisingForeignDebitNb: number = 0;
    arisingForeignCreditNb: number = 0;
    openingStockQuantityNb: number = 0;
    arisingStockQuantityNB: number = 0;
    stockUnitPriceNb: number = 0;
    constructor(data?: any) {
        if (data) {
            for (let prop in data) {
                if (this.hasOwnProperty(prop)) {
                    this[prop] = data[prop];
                }
            }
        }
    }
}

export interface AccountGroupDetailForChildParams extends Page {
    warehouseCode: string | undefined;
    isInternal: number | undefined;
}

export interface ImportExportAcccountQueryParam {
    code: string;
    Loai: number;
}

export const AccountDurationType = {
    n: 'N',
    d: 'D',
    k: 'K',
};

export const AccountDurationList: NameValueOfString[] = [
    <NameValueOfString>{
        name: AccountDurationType.n,
        value: AccountDurationType.n,
    },
    <NameValueOfString>{
        name: AccountDurationType.d,
        value: AccountDurationType.d,
    },
    <NameValueOfString>{
        name: AccountDurationType.k,
        value: AccountDurationType.k,
    },
];

export enum AccountGroupType {
    Normal = 1,
    Customer,
    Inventory,
    ImportExport,
}

export const AccountGroupList: NameValueOfInt[] = [
    {
        name: 'label.normal',
        value: AccountGroupType.Normal,
    },
    {
        name: 'left_menu.customer',
        value: AccountGroupType.Customer,
    },
    {
        name: 'label.inventory',
        value: AccountGroupType.Inventory,
    },
    {
        name: 'label.import_export',
        value: AccountGroupType.ImportExport,
    },
];

export enum AccountClassificationType {
    Normal = 1,
    Goods,
    Furniture,
    Tool,
    FixedAsset,
    Project,
    ToolUsage,
}

export const AccountClassificationList: NameValueOfInt[] = [
    {
        name: 'label.normal',
        value: AccountClassificationType.Normal,
    },
    {
        name: 'label.goods',
        value: AccountClassificationType.Goods,
    },
    {
        name: 'label.furnitures',
        value: AccountClassificationType.Furniture,
    },
    {
        name: 'label.tools',
        value: AccountClassificationType.Tool,
    },
    {
        name: 'label.fixed_assets',
        value: AccountClassificationType.FixedAsset,
    },
    {
        name: 'label.project',
        value: AccountClassificationType.Project,
    },
    {
        name: 'label.tools_use',
        value: AccountClassificationType.ToolUsage,
    },
];

export enum AccountProtectedType {
    Debit = 1,
    Credit,
    Both,
    None,
}

export const AccountProtectedList: NameValueOfInt[] = [
    {
        name: 'label.debit_opening',
        value: AccountProtectedType.Debit,
    },
    {
        name: 'label.credit_opening',
        value: AccountProtectedType.Credit,
    },
    {
        name: 'label.both',
        value: AccountProtectedType.Both,
    },
    {
        name: 'label.none_credit',
        value: AccountProtectedType.None,
    },
];
