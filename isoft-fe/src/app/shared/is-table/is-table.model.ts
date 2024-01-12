import { Observable } from 'rxjs';
import { NameValueOfInt } from 'src/app/models/common.model';

export enum IsTableColumnType {
    Expand = 1,
    AccountAction,
    AccountActionDetail2,
    ForeignCurrency,
    Index,
    AccountGroupAutoComplete,
    AccountGroupMultiSelect,
    AccountGroupSyncActions,
    DoubleInString,
}

export interface IIsTableColumn {
    header?: string;
    field: string;
    hidden?: boolean;
    isSortable?: boolean;
    styleClass?: string;
    type?: IsTableColumnType;
    innerFields?: string[];
}

export class IsTableColumn implements IIsTableColumn {
    header?: string;
    field: string;
    hidden?: boolean;
    isSortable?: boolean;
    styleClass?: string;
    type?: IsTableColumnType;
    innerFields?: string[];

    constructor(data?: IIsTableColumn) {
        if (data) {
            for (let prop in data) {
                if (data.hasOwnProperty(prop)) {
                    this[prop] = data[prop];
                }
            }
        }
    }
}

export enum ExcelActionType {
    Export = 1,
    Import,
}

export const ExcelActionTypeList: NameValueOfInt[] = [
    {
        name: 'label.export',
        value: ExcelActionType.Export,
    },
    {
        name: 'label.import',
        value: ExcelActionType.Import,
    },
];

export class AccountGroupSyncAutoComplete {
    model: any = null;
    results: string[] = [];
    search$: Observable<string[]>;
    multiple = true;
    changed = false;

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

export class AccountGroupSyncMultiSelect {
    model: any = null;
    options: string[] = [];
    changed = false;

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
