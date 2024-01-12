export class LedgerSheetReportDto {
    fromMonth?: string;
    toMonth?: string;
    fromDate?: Date;
    toDate?: Date;
    voucherType?: string;
    ledgerReportMaker?: string;
    accountCode?: string;
    fileType?: string;
    isCheckName: boolean;
}

export class RegisterReceiptSheetReportDto {
    fromMonth?: string;
    toMonth?: string;
    fromDate?: Date;
    toDate?: Date;
    voucherType?: string;
    ledgerReportMaker?: string;
    accountCode?: string;
    accountCodeDetail1?: string;
    accountCodeDetail2?: string;
    fileType?: string;
    isCheckName: boolean;
    bookDetailType: number = 1;
}
