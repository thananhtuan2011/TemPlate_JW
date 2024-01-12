import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { CustomerTax } from '../models/customer-tax.model';
import { BillDetail } from '../models/cashier.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/LedgerWarehouses`;

@Injectable({
    providedIn: 'root',
})
export class LedgerWarehousesService {
    constructor(private readonly httpClient: HttpClient) {}
    public create(params: any, payload: any): Observable<TypeData<BillDetail>> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, payload, { params }).pipe(
            map((billDetail: TypeData<BillDetail>) => {
                return billDetail;
            }),
        );
    }
}
