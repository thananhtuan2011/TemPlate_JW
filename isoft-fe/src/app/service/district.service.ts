import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { District } from '../models/district.model';
import { Ward } from '../models/ward.model';

export interface PageFilterDistrict extends Page {}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Districts`;

@Injectable({
    providedIn: 'root',
})
export class DistrictService {
    constructor(private readonly httpClient: HttpClient) {}

    public getPagingDistrict(params: any): Observable<TypeData<District>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((District: TypeData<District>) => {
                return District;
            }),
        );
    }

    public getListDistrict(): Observable<any> {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((result: any) => {
                return result;
            }),
        );
    }

    public getDistrictForProvince(provinceId: number): Observable<District[]> {
        const url: string = `${_prefix}/list/province/${provinceId}`;
        return this.httpClient.get(url, {}).pipe(
            map((res: any) => {
                return res.data;
            }),
        );
    }

    public createDistrict(District: District): Observable<District | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, District).pipe(
            map((District: District) => {
                return District;
            }),
        );
    }

    public updateDistrict(
        District: District,
        id: number,
    ): Observable<District> {
        console.log(District);
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, District).pipe(
            map((District: District) => {
                return District;
            }),
        );
    }

    public deleteDistrict(id: number): Observable<District | null> {
        const url: string = `${_prefix}/delete/${id}`;
        return this.httpClient.post(url, {}).pipe(
            map((District: District) => {
                return District;
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

    getExcelReport(param: PageFilterDistrict): Observable<{ dt: string }> {
        let url: string = `${_prefix}/export-excel-labor-country`;

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
        return this.httpClient.post(`/api/District/import-bkhh`, formData).pipe(
            map((data: any) => {
                return data;
            }),
        );
    }
}
