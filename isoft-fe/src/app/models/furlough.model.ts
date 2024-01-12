export interface FurloughModel {
    id?: number;
    procedureNumber?: string;
    name?: string;
    fromdt?: Date;
    todt?: Date;
    isLicensed?: string;
    pProcedureStatusId?: number;
    pProcedureStatusName?: string;
    createAt?: Date;
    userCreated?: number;
    userUpdated?: number;
    reason?: string;
}
