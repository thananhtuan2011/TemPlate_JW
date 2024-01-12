export interface Document {
    id: number;
    stt: number;
    code: string;
    name: string;
    allowDelete: boolean;
    check: boolean;
    nextStt: number;
    title: string;
    debitCode: string;
    nameDebitCode: string;
    creditCode: string;
    nameCreditCode: string;
    debitCodeFirst: string;
    debitCodeSecond: string;
    creditCodeFirst: string;
    creditCodeSecond: string;
    debitCodeFirstName: string;
    debitCodeSecondName: string;
    creditCodeFirstName: string;
    creditCodeSecondName: string;
    userId: string;
    userCode: string;
    userFullName: string;
}

export interface Position {
    id: number;
    name: string;
    positionId: string;
    isDelete: boolean;
    code: string;
}

export interface Department {
    id: number;
    name: string;
    code: string;
    isDelete: boolean;
}

export interface Target {
    id: number;
    name: string;
    code: string;
    isDelete: boolean;
    address: string;
    armyNumber: number;
    present: number;
    nameContact: string;
    dateInvoice: string;
    unitPrice: number;
    total: number;
    startDate: string;
    endDate: string;
    phone: string;
    identityCode: string;
    note: string;
    status: boolean;
    order: number;
    checkedInCount: number;
}

export interface Degree {
    createAt: string;
    updateAt: string;
    deleteAt: string;
    isDelete: boolean;
    userCreated: string;
    userUpdated: string;
    id: number;
    name: string;
    description: string;
    companyId: number;
    status: boolean;
    order: number;
}
