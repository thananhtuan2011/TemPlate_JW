interface SalaryAdvanceItemModel {
    id?: number;
    p_SalaryAdvanceId?: number;
    userId?: number;
    branchId?: number;
    value?: number;
}

export interface SalaryAdvanceModel {
    id?: number;
    name?: string;
    branchId?: number;
    departmentId?: number;
    date?: Date | string;
    createAt?: Date;
    procedureNumber?: string;
    p_ProcedureStatusId?: number;
    p_ProcedureStatusName?: string;
    items?: SalaryAdvanceItemModel[];
}
