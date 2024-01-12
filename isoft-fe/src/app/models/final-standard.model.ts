export class FinalStandard {
    id: number;
    creditCode: string;
    debitCode: string;
    percentRatio?: number;
    isDelete?: boolean;
    createAt: Date;
    updateAt: Date;
    deleteAt?: Date;
    userCreated?: number;
    userUpdated?: number;
    type: string;
}

export class FinalStandardDetailModel {
    debitCode: string;
    debitCodeWareHouse: string;
    debitCodeDetail1: string;
    debitCodeDetail2: string;
    creditCode: string;
    creditCodeWareHouse: string;
    creditCodeDetail1: string;
    creditCodeDetail2: string;
    quantity?: number;
    unitPrice?: number;
    amount?: number;
    percentRatio?: number;
    currentMonth: string;
    type: string;
}

export class FinalStandardToLedgerModel {
    isNotUpdate: boolean;
    listData: FinalStandardDetailModel[];
}
