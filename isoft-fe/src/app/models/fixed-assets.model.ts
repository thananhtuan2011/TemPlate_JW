export class FixedAssets {
    id: number;
    name: string;
    usedDate?: Date;
    historicalCost?: number;
    totalMonth?: number;
    totalMonthLeft?: number;
    totalDayDepreciationOfThisPeriod?: number;
    depreciationOfOneDay?: number;
    depreciationOfThisPeriod?: number;
    carryingAmount?: number;
    debitCode: string;
    debitDetailCodeFirst: string;
    debitDetailCodeSecond: string;
    creditCode: string;
    creditDetailCodeFirst: string;
    creditDetailCodeSecond: string;
    quantity?: number;
    unitPrice?: number;
    type?: string;
    price?: number;
    buyDate?: Date;
    checked?: boolean;
}

export class FixedAssetsRequest {
    month: number;
    year: number;
    debitCode: string;
    debitDetailCodeFirst: string;
    debitDetailCodeSecond: string;
    creditCode: string;
    creditDetailCodeFirst: string;
    creditDetailCodeSecond: string;

    debitCodeName: string;
    debitDetailCodeFirstName: string;
    debitDetailCodeSecondName: string;
    creditCodeName: string;
    creditDetailCodeFirstName: string;
    creditDetailCodeSecondName: string;
}

export enum FixedAssetsType {
    PB = 4,
    KH = 5,
}
