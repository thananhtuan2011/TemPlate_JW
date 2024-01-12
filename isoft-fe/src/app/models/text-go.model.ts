export interface TextGoModel {
    id?: number;
    documentTypeId?: number;
    documentId?: number;
    documentName?: string;
    textSymbol?: string;
    dateText?: Date;
    branchId?: number;
    departmentId?: number;
    departmentName?: string;
    draftarId?: number;
    draftarName?: string;
    content?: string;
    signerTextId?: number;
    signerTextName?: string;
    recipient?: string;
    fileUrl?: string;
    file?: any;
}
