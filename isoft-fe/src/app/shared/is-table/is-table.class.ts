import { IsTableColumn } from './is-table.model';

export interface IIsTableClass {
    data: any[];
    dataKey: string;
    totalRecords: number;
    isLoading: boolean;
    isSearchable: boolean;
    columns: IsTableColumn[];
}

export class IsTableClass implements IIsTableClass {
    data: any[] = [];
    dataKey: string = 'id';
    totalRecords: number = 50;
    isLoading = false;
    isSearchable = false;
    columns: IsTableColumn[] = [];

    constructor() {}

    showLoading() {
        this.isLoading = true;
    }

    hideLoading() {
        this.isLoading = false;
    }

    updateTable(data: any[]) {
        this.data = data;
        this.hideLoading();
    }

    updateTotalRecords(totalRecords: number) {
        this.totalRecords = totalRecords;
    }
}
