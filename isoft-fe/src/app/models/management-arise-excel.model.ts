import { Ledger } from './ledger.model';

export interface AriesExcelImportModel {
    year?: number;
    month?: number;
    ledgers?: Ledger[];
}
