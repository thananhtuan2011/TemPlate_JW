import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { ContractType } from '../models/contract-type.model';

export interface PageFilterContractType extends Page {
    provinceIds?: number[];
    districtIds?: number[];
    wardIds?: number[];
}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/ContractTypes`;

@Injectable({
    providedIn: 'root',
})
export class ContractTypeService {
    constructor(private readonly httpClient: HttpClient) {}

    public getListContractType(
        params: any,
    ): Observable<TypeData<ContractType>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((ContractType: TypeData<ContractType>) => {
                return ContractType;
            }),
        );
    }

    public getAllContractType(typeContractTogether: number): Observable<TypeData<ContractType>> {
        return this.httpClient.get(`${_prefix}/list?typeContractTogether=${typeContractTogether}`).pipe(
            map((ContractType: TypeData<ContractType>) => {
                return ContractType;
            }),
        );
    }

    public getContractTypeDetail(id: number): Observable<ContractType> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((ContractType: ContractType) => {
                return ContractType;
            }),
        );
    }

    public createContractType(
        ContractType: ContractType,
    ): Observable<ContractType | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, ContractType).pipe(
            map((ContractType: ContractType) => {
                return ContractType;
            }),
        );
    }

    public updateContractType(
        ContractType: ContractType,
        id: number,
    ): Observable<ContractType> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, ContractType).pipe(
            map((ContractType: ContractType) => {
                return ContractType;
            }),
        );
    }

    public deleteContractType(id: number): Observable<ContractType | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((ContractType: ContractType) => {
                return ContractType;
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

    getExcelReport(param: PageFilterContractType): Observable<{ dt: string }> {
        let url: string = `${_prefix}/export-excel-ContractType`;

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
            .post(`${_prefix}/import-ContractType`, formData)
            .pipe(
                map((data: any) => {
                    return data;
                }),
            );
    }
}
