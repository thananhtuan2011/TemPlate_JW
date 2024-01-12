export interface ICase {
    Id: string;
    Title: string;
    Code: string;
    Balance: number;
    BalanceAvailable: number;
    IsCurrency: boolean;
    BalanceCurrency: number;
    BalanceCurrencyAvailable: number;
    Phone: string;
    TaxIdentify: string;
    Currency: number;
    Detail: string;
    Quantity: number;
    Unit: string;
    UnitCode: string;
    WarehouseMin: number;
    WarehouseMax: number;
    PriceCost: number;
    PriceSale: number;
    Commission: number;
    DateType: string;
    AccountType: string;
    CompanyId: number;
    Children: string;
    ParentId: string;
    Lv2Address: string;
    Lv2Phone: string;
    Lv2MST: string;
    Lv3DVT: string;
    Lv3Quantity: number;
    Lv3Cost: number;
    Lv3Price: number;
    Lv3Sell: number;
    Lv3Commission: number;
    CheckNorm: boolean;
    CheckArise: boolean;
    CheckDel: boolean;
    Type: number;
    HasChild: boolean;

    CanInsert: boolean;
    CanUpdate: boolean;
    CanDelete: boolean;
}

export interface CaseSelectList {
    Balance: number;
    BalanceAvailable: number;
    BalanceCurrency: number;
    BalanceCurrencyAvailable: number;
    Code: string;
    Id: string;
    Title: string;
    Lv3Cost: number;
}

export interface CaseListLastestCase {
    balance: number;
    balanceAvailable: number;
    balanceCurrency: number;
    balanceCurrencyAvailable: number;
    code: string;
    id: string;
    title: string;
    type: number;
}

export class ChartOfAccount {
    id: number = 0;
    code: string = '';
    name: string = '';
    openingDebit: number = 0;
    openingCredit: number = 0;
    arisingDebit: number = 0;
    arisingCredit: number = 0;
    closingDebit: number = 0;
    closingCredit: number = 0;
    currency: string = '';
    isForeignCurrency: boolean = false;
    exchangeRate: number = null;
    arisingForeignDebit: number = 0;
    arisingForeignCredit: number = 0;
    openingForeignDebit: number = 0;
    openingForeignCredit: number = 0;
    isSpendAccount: boolean = false;
    type: number = 0;
    duration: string = '';
    isProtected: boolean = false;
    displayInsert: boolean = false;
    displayUpdate: boolean = false;
    displayDelete: boolean = false;
    description: string = '';
    accGroup: number = 0;
    classification: number = 0;
    parentRef: string = '';
    isDelete: boolean = false;
    hasChild: boolean = false;
    hasDetails = false;
    minimumStockQuantity = null;
    maximumStockQuantity = null;
    stockCostPrice = null;
    stockSellingPrice = null;
    stockUnitPrice = null;
    stockUnit = null;
    warehouseCode = null;
    openingStockQuantity = null;
    closingStockQuantity = null;
    details: ChartOfAccount[] = [];
    openingForeignDebitNB: number = 0;
    openingForeignCreditNB: number = 0;
    openingStockQuantityNB = null;
    stockUnitPriceNB = null;
    openingDebitNB: number = null;
    openingCreditNB: number = null;
    isInternal: number = 0;
    typeInternal: number = 1;
    constructor(account?: ChartOfAccount) {
        Object.assign(this, account);
    }
}

export interface IChartOfAccountSelectionModel {
    id: number;
    code: string;
    name: string;
    accGroupCode: string;
    type: number;
}

export interface IChartOfAccountGroupDetailModel {
    groupId: number;
    accountCode: string;
    code: string;
    name: string;
    newInsert: boolean;
}

export class ChartOfAccountGroup {
    id = 0;
    code = '';
    name = '';
}

export class ChartOfAccountGroupModel {
    groupId = 0;
    code = '';
    name = '';
    details: string[] = [];
    originalDetails: string[] = [];
    hasChanged = false;
    originalList: IChartOfAccountSelectionModel[] = [];
    filteredList: IChartOfAccountSelectionModel[] = [];
}

export class ChartOfAccountGroupLink {
    groupId = 0;
    accountCode = '';
}

export class Case implements ICase {
    Id: string = '';
    Title: string = '';
    Code: string = '';
    Balance: number = 0;
    BalanceAvailable: number = 0;
    IsCurrency: boolean = false;
    BalanceCurrency: number = 0;
    BalanceCurrencyAvailable: number = 0;
    Phone: string = '';
    TaxIdentify: string = '';
    Currency: number = 0;
    Detail: string = '';
    Quantity: number = 0;
    Unit: string = '';
    UnitCode: string = '';
    WarehouseId: number = 0;
    WarehouseMin: number = 0;
    WarehouseMax: number = 0;
    PriceCost: number = 0;
    PriceSale: number = 0;
    Commission: number;
    DateType: string = 'N';
    AccountType: string = '1';
    CompanyId: number = 0;
    Children: string;
    ParentId: string = '';
    ChildrenArray: Array<ICase>;
    IsExpand: boolean = false;
    Lv2Address: string = '';
    Lv2Phone: string = '';
    Lv2MST: string = '';
    Lv3DVT: string = '';
    Lv3Quantity: number = 0;
    Lv3Cost: number = 0;
    Lv3Price: number = 0;
    Lv3Sell: number = 0;
    Lv3Commission: number = 0;
    Lv3Debit: number = 0;
    CheckNorm: boolean = true;
    CheckArise: boolean = true;
    CheckDel: boolean = true;
    ParentCode: string = '';
    Type: number = 0;
    HasChild: boolean = false;
    TempCode: string = '';
    TempCodeType1: string = '';
    ParentCodeType1: string = '';

    CanInsert: boolean = false;
    CanUpdate: boolean = false;
    CanDelete: boolean = false;

    constructor(params?: ICase) {
        Object.assign(this, params);
        this.ChildrenArray = this.Children
            ? JSON.parse(this.Children)
            : new Array();
        this.TempCode == this.Code && this.Type == 2
            ? this.Code.replace(this.ParentCode, '')
            : '';
        this.TempCodeType1 == this.Code && this.Type == 1
            ? this.Code.replace(this.ParentCodeType1, '')
            : '';
    }
}

export class ChartOfAccounts1 {
    id: number = 0;
    code: string = '';
    name: string = '';
    openingDebit: number = null;
    openingCredit: number = null;
    arisingDebit: number = null;
    arisingCredit: number = null;
    closingDebit: number = null;
    closingCredit: number = null;
    currency: string = '';
    isForeignCurrency: boolean = false;
    exchangeRate: number = null;
    arisingForeignDebit: number = null;
    arisingForeignCredit: number = null;
    isSpendAccount: boolean = false;
    type: number = null;
    accGroup: number = null;
    classification: number = null;
    duration: string = '';
    isProtected: boolean = false;
    displayInsert: boolean = false;
    displayUpdate: boolean = false;
    displayDelete: boolean = false;
    description: string = '';
    hasChild: boolean = false;
    hasDetails: boolean = false;
    parentRef: string = '';
    stockUnit: string = '';
    openingStockQuantity: number = null;
    arisingStockQuantity: number = null;
    closingStockQuantity: number = null;
    stockUnitPrice: number = null;
    minimumStockQuantity: number = null;
    maximumStockQuantity: number = null;
    stockCostPrice: number = null;
    stockSellingPrice: number = null;
    warehouseCode: string = '';
    openingForeignDebit: number = null;
    openingForeignCredit: number = null;
    closingForeignDebit: number = null;
    closingForeignCredit: number = null;
}

export class ChartOfAccount_ForDropDownBookDetail extends ChartOfAccount {
    childrens: ChartOfAccount_ForDropDownBookDetail[];
}

export class ChartAccountModelNew {
    id: number = 0;
    code: string = '';
    name: string = '';
    closingDebit: number = null;
    closingCredit: number = null;
    type: number = 0;
    parentRef: string = '';
    warehouseCode = null;
}
