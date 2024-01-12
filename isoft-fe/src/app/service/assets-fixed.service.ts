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

@Injectable({
    providedIn: 'root',
})
export class AssetsFixedService {
    constructor(private readonly httpClient: HttpClient) {}
    private readonly _baseUrl = AppConstant.DEFAULT_URLS.API;
    private readonly apiPath: string = this._baseUrl + '/fixedAssets';

    public getListAssets(params: any): Observable<TypeData<FixedAssets>> {
        let url: string = `${this.apiPath}`;
        return this.httpClient.get(url, { params }).pipe(
            map((assets: TypeData<FixedAssets>) => {
                return assets;
            }),
        );
    }

    public addFixedAsset242FromFixedAsset(
        isInternal: number,
        entities: Array<FixedAssets>,
    ): Observable<CustomActionResult<Array<FixedAssets>>> {
        return this.httpClient
            .put(
                `${this.apiPath}/add-fixed-sset242-from-fixed-asset?isInternal=${isInternal}`,
                entities,
            )
            .pipe(
                map((assets: CustomActionResult<Array<FixedAssets>>) => {
                    return assets;
                }),
            );
    }

    public deleteAssets(ids: Array<number>): Observable<FixedAssets | null> {
        const url: string = `${this.apiPath}/delete`;
        return this.httpClient.post(url, ids).pipe(
            map((assets: FixedAssets) => {
                return assets;
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
    public updateAsstesAccount(
        entities: Array<FixedAssets>,
        isAutoAddDetail: boolean,
    ): Observable<CustomActionResult<Array<FixedAssets>>> {
        return this.httpClient
            .put(
                `${this.apiPath}/update-account?isAutoAddDetail=${isAutoAddDetail}`,
                entities,
            )
            .pipe(
                map((assets: CustomActionResult<Array<FixedAssets>>) => {
                    return assets;
                }),
            );
    }
}
