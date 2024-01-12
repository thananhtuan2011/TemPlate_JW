import { SearchCriteria } from './common.model';

/** Tìm kiếm */
export class AriseExcelSearch extends SearchCriteria {
    constructor() {
        super();
    }
    documentTypeCode?: string = 'PT';
    filterMonth?: number = new Date().getMonth() + 1;
    voucherNumber?: string =
        (new Date().getMonth() + 1 < 10
            ? '0' + (new Date().getMonth() + 1).toString()
            : (new Date().getMonth() + 1).toString()) + '/PT';
    documentDay?: Date = new Date();
    month?: number;
    documentType?: string = '';
    isInternal?: number = 1;
}

/** Cập nhật OrginalVoucherNumber */
export class AriseUpdateOrginalVoucherRequest {
    startDate?: Date = null;
    endDate?: Date = null;
    type?: string = '';
    month?: number = 0;
}

export class TransferModel {
    documentType: string = '';
    month: number = 1;
    ledgerIds?: number[] = [];
    isNoiBo: boolean = true;
    isDeleteData: boolean = false;
    typeData?: number = 1;
}

export enum TransferType {
    DocumentType = 1,
    Month = 2,
}
