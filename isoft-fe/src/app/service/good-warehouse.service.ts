import AppConstant from '../utilities/app-constants';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { TypeData } from '../models/common.model';
import { Goods } from '../models/goods.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/GoodWarehouses`;
@Injectable({
    providedIn: 'root',
})
export class GoodWarehouseService {
    constructor(private readonly httpClient: HttpClient) {}

    public getDetail(id: number): Observable<any> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    create(payload) {
        return this.httpClient.post(`${_prefix}/`, payload).pipe(
            map((res: TypeData<any>) => {
                return res;
            }),
        );
    }

    public update(body, id: number): Observable<any> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, body).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    getGoodWarehouse(params): Observable<any> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((res: TypeData<any>) => {
                return res.data;
            }),
        );
    }

    getGoodWarehouseDiagram(
        warehouseId: any,
        shelveId: any,
        floorId: any,
        type: string,
    ): Observable<any> {
        let params: any = { warehouseId, type };

        if (shelveId != null) {
            params.shelveId = shelveId;
        }

        if (floorId != null) {
            params.floorId = floorId;
        }

        return this.httpClient
            .get(`${_prefix}/report-good-for-warehouse`, { params })
            .pipe(
                map((res: TypeData<any>) => {
                    return res;
                }),
            );
    }

    syncChartOfAccount(): Observable<any> {
        return this.httpClient.get(`${_prefix}/sync-chartofaccount`).pipe(
            map((res: TypeData<any>) => {
                return res.data;
            }),
        );
    }

    completeBill(isForce, payload): Observable<any> {
        return this.httpClient
            .post(`${_prefix}/complete-bill/${isForce}`, payload)
            .pipe(
                map((res: TypeData<any>) => {
                    return res;
                }),
            );
    }

    uploadFiles(formData): Observable<any> {
        return this.httpClient
            .post(`${_prefix}/uploadImage`, formData, {
                reportProgress: true,
                observe: 'events',
            })
            .pipe(catchError(this.errorMgmt));
    }

    deleteFiles(paths): Observable<any> {
        let data = [];
        for (let i = 0; i < paths.length; i++) {
            data.push({ imageUrl: paths[i] });
        }
        return this.httpClient
            .delete(`${_prefix}/deleteImages`, { body: data })
            .pipe(
                map((imageUrl: string) => {
                    return imageUrl;
                }),
            );
    }

    errorMgmt(error: HttpErrorResponse) {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
            // Get client-side error
            errorMessage = error.error.message;
        } else {
            // Get server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        console.log(errorMessage);
        return throwError(errorMessage);
    }

    updatePrintedStatus(ids) {
        return this.httpClient
            .post(`${_prefix}/update-good-printed-status`, ids)
            .pipe(
                map((res: TypeData<any>) => {
                    return res;
                }),
            );
    }
}
