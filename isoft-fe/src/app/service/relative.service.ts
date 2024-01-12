import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Page, TypeData } from '../models/common.model';
import { Relative } from '../models/relative.model';
import AppConstant from '../utilities/app-constants';

export interface PageFilterRelative extends Page {
    provinceIds?: number[];
    districtIds?: number[];
    wardIds?: number[];
}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Relatives`;

export interface PageFilterRelative extends Page {
    SearchText?: string;
    keyword?: string;
    warehouseId?: number;
    positionId?: number;
    departmentId?: number;
    requestPassword?: boolean;
    quit?: boolean;
    gender?: number;
    birthday?: Date | string;
    startDate?: Date | string;
    endDate?: Date | string;
    currentPage?: number;
    pagesize?: number;
    targetId?: number;
    typeOfWork?: number;
    month?: number;
    degreeId?: number;
    certificatedId?: number;
}

@Injectable({
    providedIn: 'root',
})
export class RelativeService {
    constructor(private readonly httpClient: HttpClient) {}

    public getListRelative(params: any): Observable<TypeData<Relative>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((Relative: TypeData<Relative>) => {
                return Relative;
            }),
        );
    }

    public getAllRelative(): Observable<TypeData<Relative>> {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((Relative: TypeData<Relative>) => {
                return Relative;
            }),
        );
    }

    public getRelativeDetail(id: number): Observable<Relative> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((Relative: Relative) => {
                return Relative;
            }),
        );
    }

    public createRelative(Relative: Relative): Observable<Relative | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, Relative).pipe(
            map((Relative: Relative) => {
                return Relative;
            }),
        );
    }

    public updateRelative(
        Relative: Relative,
        id: number,
    ): Observable<Relative> {
        console.log(Relative);
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, Relative).pipe(
            map((Relative: Relative) => {
                return Relative;
            }),
        );
    }

    public deleteRelative(id: number): Observable<Relative | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((Relative: Relative) => {
                return Relative;
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

    getExcelReport(): Observable<any> {
        return this.httpClient.post(
            `${_prefix}/export`,
            {},
            { responseType: 'blob' },
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
        return this.httpClient
            .post(`${_prefix}/import-Relation`, formData)
            .pipe(
                map((data: any) => {
                    return data;
                }),
            );
    }
}
