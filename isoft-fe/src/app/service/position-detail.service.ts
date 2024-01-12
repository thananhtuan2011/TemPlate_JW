import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { PositionDetail } from '../models/position-detail.model';

export interface PageFilterPositionDetail extends Page {
    provinceIds?: number[];
    districtIds?: number[];
    wardIds?: number[];
}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/PositionDetails`;

@Injectable({
    providedIn: 'root',
})
export class PositionDetailService {
    constructor(private readonly httpClient: HttpClient) {}

    public getListPositionDetail(
        params: any,
    ): Observable<TypeData<PositionDetail>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((PositionDetail: TypeData<PositionDetail>) => {
                return PositionDetail;
            }),
        );
    }

    public getAllPositionDetail(): Observable<TypeData<PositionDetail>> {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((PositionDetail: TypeData<PositionDetail>) => {
                return PositionDetail;
            }),
        );
    }

    public getPositionDetailDetail(id: number): Observable<PositionDetail> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((PositionDetail: PositionDetail) => {
                return PositionDetail;
            }),
        );
    }

    public createPositionDetail(
        PositionDetail: PositionDetail,
    ): Observable<PositionDetail | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, PositionDetail).pipe(
            map((PositionDetail: PositionDetail) => {
                return PositionDetail;
            }),
        );
    }

    public updatePositionDetail(
        PositionDetail: PositionDetail,
        id: number,
    ): Observable<PositionDetail> {
        console.log(PositionDetail);
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, PositionDetail).pipe(
            map((PositionDetail: PositionDetail) => {
                return PositionDetail;
            }),
        );
    }

    public deletePositionDetail(id: number): Observable<PositionDetail | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((PositionDetail: PositionDetail) => {
                return PositionDetail;
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

    getExcelReport(
        param: PageFilterPositionDetail,
    ): Observable<{ dt: string }> {
        let url: string = `${_prefix}/export-excel-PositionDetail`;

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
        return this.httpClient
            .post(`${_prefix}/import-PositionDetail`, formData)
            .pipe(
                map((data: any) => {
                    return data;
                }),
            );
    }
}
