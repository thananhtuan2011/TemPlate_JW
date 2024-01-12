export interface Customer {
    id: number;
    code: string;
    name: string;
    avatar: string;
    birthday: Date;
    gender: boolean;
    phone: string;
    provinceId: number;
    districtId: number;
    wardId: number;
    email: string;
    sendEmail: boolean;
    address: string;
    facebook: string;
    identityCardNo: string;
    identityCardIssueDate: Date;
    identityCardIssuePlace: string;
    identityCardValidUntil: Date;
    identityCardProvinceId: number;
    identityCardDistrictId: number;
    identityCardWardId: number;
    identityCardPlaceOfPermanent: string;
    identityCardAddressInCard: string;
    userCreated: number;
    userUpdated: number;
    password: string;
    debitCode: string;
    debitDetailCodeFirst: string;
    debitDetailCodeSecond: string;
    customerClassficationId: number;
}

export interface Job {
    id: number;
    name: string;
    color: string;
    amount: number;
}

export interface BillHistoryCollection {
    id: number;
    billId: number;
    userId: number;
    date: Date;
    amount: number;
    statusUserId: number;
    statusAccountantId: number;
    note: string;
}
