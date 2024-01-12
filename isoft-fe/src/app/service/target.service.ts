import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { Target } from '../models/target.model';

export interface PageFilterTarget extends Page {
    provinceIds?: number[];
    districtIds?: number[];
    wardIds?: number[];
}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Targets`;

@Injectable({
    providedIn: 'root',
})
export class TargetService {
    constructor(private readonly httpClient: HttpClient) {}

    public getListTarget(params: any): Observable<TypeData<Target>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((Target: TypeData<Target>) => {
                return Target;
            }),
        );
    }

    public getAllTarget(): Observable<TypeData<Target>> {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((Target: TypeData<Target>) => {
                return Target;
            }),
        );
    }

    public getTargetDetail(id: number): Observable<Target> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((Target: Target) => {
                return Target;
            }),
        );
    }

    public createTarget(Target: Target): Observable<Target | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, Target).pipe(
            map((Target: Target) => {
                return Target;
            }),
        );
    }

    public updateTarget(Target: Target, id: number): Observable<Target> {
        console.log(Target);
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, Target).pipe(
            map((Target: Target) => {
                return Target;
            }),
        );
    }

    public deleteTarget(id: number): Observable<Target | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((Target: Target) => {
                return Target;
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

    getExcelReport(param: PageFilterTarget): Observable<{ dt: string }> {
        let url: string = `${_prefix}/export-excel-Target`;

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
        return this.httpClient.post(`${_prefix}/import-Target`, formData).pipe(
            map((data: any) => {
                return data;
            }),
        );
    }
}
