import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Page, TypeData } from '../models/common.model';
import { Relation } from '../models/relation.model';
import AppConstant from '../utilities/app-constants';

export interface PageFilterRelation extends Page {
    provinceIds?: number[];
    districtIds?: number[];
    wardIds?: number[];
}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/RelationShips`;

@Injectable({
    providedIn: 'root',
})
export class RelationService {
    constructor(private readonly httpClient: HttpClient) {}

    public getListRelation(params: any): Observable<TypeData<Relation>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((Relation: TypeData<Relation>) => {
                return Relation;
            }),
        );
    }

    public getAllRelation(): Observable<TypeData<Relation>> {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((Relation: TypeData<Relation>) => {
                return Relation;
            }),
        );
    }

    public getRelationDetail(id: number): Observable<Relation> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((Relation: Relation) => {
                return Relation;
            }),
        );
    }

    public createRelation(Relation: Relation): Observable<Relation | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, Relation).pipe(
            map((Relation: Relation) => {
                return Relation;
            }),
        );
    }

    public updateRelation(
        Relation: Relation,
        id: number,
    ): Observable<Relation> {
        console.log(Relation);
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, Relation).pipe(
            map((Relation: Relation) => {
                return Relation;
            }),
        );
    }

    public deleteRelation(id: number): Observable<Relation | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((Relation: Relation) => {
                return Relation;
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

    getExcelReport(param: PageFilterRelation): Observable<{ dt: string }> {
        let url: string = `${_prefix}/export-excel-Relation`;

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
            .post(`${_prefix}/import-Relation`, formData)
            .pipe(
                map((data: any) => {
                    return data;
                }),
            );
    }

    public getAllUserActive(): Observable<any> {
        const url: string = `${AppConstant.DEFAULT_URLS.API}/Relatives/getAllUserActive`;
        return this.httpClient.get(url, {}).pipe(
            map((res: TypeData<any>) => {
                return res;
            }),
        );
    }
}
