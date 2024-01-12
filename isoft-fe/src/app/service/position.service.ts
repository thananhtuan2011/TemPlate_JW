import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { Position } from '../models/position.model';

export interface PageFilterPosition extends Page {
    provinceIds?: number[];
    districtIds?: number[];
    wardIds?: number[];
}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Positions`;

@Injectable({
    providedIn: 'root',
})
export class PositionService {
    constructor(private readonly httpClient: HttpClient) {}

    public getListPosition(params: any): Observable<TypeData<Position>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((Position: TypeData<Position>) => {
                return Position;
            }),
        );
    }

    public getAllPosition(): Observable<TypeData<Position>> {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((Position: TypeData<Position>) => {
                return Position;
            }),
        );
    }

    public getPositionDetail(id: number): Observable<Position> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((Position: Position) => {
                return Position;
            }),
        );
    }

    public createPosition(Position: Position): Observable<Position | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, Position).pipe(
            map((Position: Position) => {
                return Position;
            }),
        );
    }

    public updatePosition(
        Position: Position,
        id: number,
    ): Observable<Position> {
        console.log(Position);
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, Position).pipe(
            map((Position: Position) => {
                return Position;
            }),
        );
    }

    public deletePosition(id: number): Observable<Position | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((Position: Position) => {
                return Position;
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

    getExcelReport(param: PageFilterPosition): Observable<{ dt: string }> {
        let url: string = `${_prefix}/export-excel-Position`;

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
            .post(`${_prefix}/import-Position`, formData)
            .pipe(
                map((data: any) => {
                    return data;
                }),
            );
    }
}
