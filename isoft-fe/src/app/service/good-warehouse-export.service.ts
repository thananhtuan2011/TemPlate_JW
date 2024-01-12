import AppConstant from '../utilities/app-constants';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { TypeData } from '../models/common.model';
import { Goods } from '../models/goods.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/GoodWarehouseExports`;
@Injectable({
    providedIn: 'root',
})
export class GoodWarehouseExportService {
    constructor(private readonly httpClient: HttpClient) {}

    getGoodWarehouse(params): Observable<any> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((res: TypeData<any>) => {
                return res.data;
            }),
        );
    }
}
