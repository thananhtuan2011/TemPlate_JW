export interface InvoiceDeclarationModel {
    id?: number;
    name?: string;
    templateSymbol?: string;
    invoiceSymbol?: string;
    totalInvoice?: number;
    fromOpening?: number;
    toOpening?: number;
    fromArising?: number;
    toArising?: number;
    note?: string;
    totalRelease?: number;
}
