export interface SurchargeModel {
    id: number;
    code: string;
    name: string;
    fromDate: Date;
    toDate: Date;
    value: number;
    type: string;
    note: string;
}
