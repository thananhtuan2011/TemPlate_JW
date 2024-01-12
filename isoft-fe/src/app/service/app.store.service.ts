import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { Store } from '../models/store.model';

export interface PageFilterStore extends Page {
    provinceIds?: number[];
    districtIds?: number[];
    wardIds?: number[];
}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Stores`;

@Injectable({
    providedIn: 'root',
})
export class StoreService {
    constructor(private readonly httpClient: HttpClient) {}

    public getListStore(params: any): Observable<TypeData<Store>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((Store: TypeData<Store>) => {
                return Store;
            }),
        );
    }

    public getAllStore(): Observable<TypeData<Store>> {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((Store: TypeData<Store>) => {
                return Store;
            }),
        );
    }

    public getStoreDetail(id: number): Observable<Store> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((Store: Store) => {
                return Store;
            }),
        );
    }

    public createStore(Store: Store): Observable<Store | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, Store).pipe(
            map((Store: Store) => {
                return Store;
            }),
        );
    }

    public updateStore(Store: Store, id: number): Observable<Store> {
        console.log(Store);
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, Store).pipe(
            map((Store: Store) => {
                return Store;
            }),
        );
    }

    public deleteStore(id: number): Observable<Store | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((Store: Store) => {
                return Store;
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
        const url: string = `${_prefix}/deleteImages`;
        return this.httpClient.post(url, data).pipe(
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

    getExcelReport(param: PageFilterStore): Observable<{ dt: string }> {
        let url: string = `${_prefix}/export-excel-Store`;

        return this.httpClient.get(url).pipe(
            map((data: { dt: string }) => {
                return data;
            }),
        );
    }

    getFolderPathDownload(f: string, t: string): string {
        var k =
            environment.serverURL +
            '/ReportDownload/DownloadReportFromFile' +
            `?filename=${f}&fileType=${t}`;
        return k;
    }

    importExcel(formData): Observable<any> {
        return this.httpClient.post(`${_prefix}/import-Store`, formData).pipe(
            map((data: any) => {
                return data;
            }),
        );
    }
}
