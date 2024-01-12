import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { Branch } from '../models/branch.model';
import { Decide } from '../models/decide.model';

export interface PageFilterDecide extends Page {}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Decide`;
@Injectable({
    providedIn: 'root',
})
export class DecideService {
    constructor(private readonly httpClient: HttpClient) {}

    public getListDecide(params?: any): Observable<TypeData<Branch>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((Branch: TypeData<Branch>) => {
                return Branch;
            }),
        );
    }

    public getSelectList(): Observable<TypeData<Decide> | null> {
        return this.httpClient
            .get(`${AppConstant.DEFAULT_URLS.API}/DecisionType/list`, {})
            .pipe(
                map((res: TypeData<Decide>) => {
                    return res;
                }),
            );
    }

    public createDecide(Decide: FormData): Observable<Decide | null> {
        return this.httpClient.post(`${_prefix}`, Decide).pipe(
            map((Decide: Decide) => {
                return Decide;
            }),
        );
    }

    public updateDecide(Decide: FormData, id): Observable<Decide | null> {
        console.log(Decide);

        return this.httpClient.put(`${_prefix}/${id}`, Decide).pipe(
            map((Decide: Decide) => {
                return Decide;
            }),
        );
    }
    public deleteDecide(id: number): Observable<Decide | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((Decide: Decide) => {
                return Decide;
            }),
        );
    }
    public getDecideDetail(id: number): Observable<Decide> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url).pipe(
            map((Decide: Decide) => {
                return Decide;
            }),
        );
    }
    getExcelReport(param: PageFilterDecide): Observable<{ dt: string }> {
        let url: string = `${_prefix}/export-excel-Decide`;

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
}
