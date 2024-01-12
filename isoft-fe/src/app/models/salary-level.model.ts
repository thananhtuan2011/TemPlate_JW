export interface SalaryLevel {
    id: number;
    name: string;
    positionId: number;
    positionName: string;
    salaryCost: number;
    amount: number;
    amounts?: string;
    date?: Date;
    coefficient: number;
    note: string;
    createAt?: Date;
    updateAt?: Date;
    deleteAt?: Date;
    isDelete: boolean;
    userCreated: number;
    userUpdated: number;
}
