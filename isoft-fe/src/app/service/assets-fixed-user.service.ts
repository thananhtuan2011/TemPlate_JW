import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { FixedAssets, FixedAssetsType } from '../models/fixed-assets.model';
import { Page, TypeData } from '../models/common.model';
import { CustomActionResult } from '../models/custom-action-result.model';
import AppConstant from '../utilities/app-constants';

export interface PageFilterAssets extends Page {
    keyword?: string;
    filterType: FixedAssetsType;
    filterMonth: number;
}
let _prefix = `${AppConstant.DEFAULT_URLS.API}/FixedAssetUsers`;
@Injectable({
    providedIn: 'root',
})
export class AssetsFixedUserService {
    constructor(private readonly httpClient: HttpClient) {}
    getList(params: any): Observable<any> {
        return this.httpClient.get(`${_prefix}`, { params });
    }

    getByIdV2(id: string | number): Observable<any> {
        return this.httpClient.get(`${_prefix}/v2/${id}`);
    }

    getByID(id: string | number): Observable<any> {
        return this.httpClient.get(`${_prefix}/${id}`);
    }

    createFixedAssetUsers(params: any): Observable<any> {
        return this.httpClient.post(`${_prefix}`, params);
    }

    updateFixedAssetUsers(id, params: any): Observable<any> {
        return this.httpClient.put(`${_prefix}/${id}`, params);
    }

    deleteFixedAssetUsers(id): Observable<any> {
        return this.httpClient.delete(`${_prefix}/${id}`);
    }

    importExcel(body: any): Observable<any> {
        return this.httpClient.post(`${_prefix}/import-excel`, body).pipe(
            map((res: any) => {
                return res;
            }),
        );
    }

    exportExcel(body: any): Observable<any> {
        return this.httpClient.post(`${_prefix}/export-excel`, body);
    }
}
