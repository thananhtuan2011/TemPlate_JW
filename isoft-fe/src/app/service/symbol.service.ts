import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { Symbol } from '../models/symbol.model';

export interface PageFilterSymbol extends Page {
    provinceIds?: number[];
    districtIds?: number[];
    wardIds?: number[];
}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Symbols`;

@Injectable({
    providedIn: 'root',
})
export class SymbolService {
    constructor(private readonly httpClient: HttpClient) {}

    public getListSymbol(params: any): Observable<TypeData<Symbol>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((Symbol: TypeData<Symbol>) => {
                return Symbol;
            }),
        );
    }

    public getAllSymbol(): Observable<TypeData<Symbol>> {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((Symbol: TypeData<Symbol>) => {
                return Symbol;
            }),
        );
    }

    public getSymbolDetail(id: number): Observable<Symbol> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((Symbol: Symbol) => {
                return Symbol;
            }),
        );
    }

    public createSymbol(Symbol: Symbol): Observable<Symbol | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, Symbol).pipe(
            map((Symbol: Symbol) => {
                return Symbol;
            }),
        );
    }

    public updateSymbol(Symbol: Symbol, id: number): Observable<Symbol> {
        console.log(Symbol);
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, Symbol).pipe(
            map((Symbol: Symbol) => {
                return Symbol;
            }),
        );
    }

    public deleteSymbol(id: number): Observable<Symbol | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((Symbol: Symbol) => {
                return Symbol;
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

    getExcelReport(param: PageFilterSymbol): Observable<{ dt: string }> {
        let url: string = `${_prefix}/export-excel-Symbol`;

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
        return this.httpClient.post(`${_prefix}/import-Symbol`, formData).pipe(
            map((data: any) => {
                return data;
            }),
        );
    }
}
