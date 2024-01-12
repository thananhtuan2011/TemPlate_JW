import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import AppConstant from '../utilities/app-constants';
import { map, Observable } from 'rxjs';
import { TypeData } from '../models/common.model';
import { FixedAssets242 } from '../models/fixed-assets-242.model';
import { CustomActionResult } from '../models/custom-action-result.model';
import { environment } from '../../environments/environment';

const _prefix = `${AppConstant.DEFAULT_URLS.API}/FixedAsset242s`;

@Injectable({
    providedIn: 'root',
})
export class AssetsFixed242Service {
    constructor(private readonly httpClient: HttpClient) {}

    public getListAssets242(params: any): Observable<TypeData<FixedAssets242>> {
        return this.httpClient.get(_prefix, { params }).pipe(
            map((assets: TypeData<FixedAssets242>) => {
                return assets;
            }),
        );
    }

    getListAssets242Search(params?: any): Observable<any> {
        return this.httpClient.post(`${_prefix}/search`, params);
    }

    public fixedAssets242Update(id: number, request: any): Observable<any> {
        return this.httpClient.put(`${_prefix}/${id}`, request).pipe(
            map((assets: any) => {
                return assets;
            }),
        );
    }

    public deleteAssets(id: any): Observable<FixedAssets242 | null> {
        return this.httpClient.delete(`${_prefix}/${id}`);
    }

    public updateAsstes(
        isInternal: number,
        entities: Array<FixedAssets242>,
    ): Observable<CustomActionResult<Array<FixedAssets242>>> {
        return this.httpClient
            .put(`${_prefix}/update?isInternal=${isInternal}`, entities)
            .pipe(
                map((assets: CustomActionResult<Array<FixedAssets242>>) => {
                    return assets;
                }),
            );
    }

    getByID(id: string | number): Observable<any> {
        return this.httpClient.get(`${_prefix}/${id}`);
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
    public updateAsstesAccount(
        entities: Array<FixedAssets242>,
        isAutoAddDetail: boolean = false,
    ): Observable<CustomActionResult<Array<FixedAssets242>>> {
        return this.httpClient
            .put(
                `${_prefix}/update-account?isAutoAddDetail=${isAutoAddDetail}`,
                entities,
            )
            .pipe(
                map((assets: CustomActionResult<Array<FixedAssets242>>) => {
                    return assets;
                }),
            );
    }
}
