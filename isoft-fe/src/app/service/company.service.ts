import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { Company } from '../models/company.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Companies`;
let _prefixDataSeller = `${AppConstant.DEFAULT_URLS.API}/DataSeller`;

let _prefixUpload = `${AppConstant.DEFAULT_URLS.API}/ReportDownload`;

@Injectable({
    providedIn: 'root',
})
export class CompanyService {
    constructor(private readonly httpClient: HttpClient) {}

    public getListCompany(params: any): Observable<TypeData<Company>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((Company: TypeData<Company>) => {
                return Company;
            }),
        );
    }

    public getAllCompany(): Observable<TypeData<Company>> {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((Company: TypeData<Company>) => {
                return Company;
            }),
        );
    }

    public getLastCompanyInfo(): Observable<any> {
        const url: string = `${_prefix}/get-company`;
        return this.httpClient.get(url, {}).pipe(
            map((res: any) => {
                return res;
            }),
        );
    }

    public getCompanyDetail(id: number): Observable<Company> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((Company: Company) => {
                return Company;
            }),
        );
    }

    public createCompany(company: Company): Observable<Company | null> {
        company.id = 0;
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, company).pipe(
            map((Company: Company) => {
                return Company;
            }),
        );
    }

    public updateCompany(company: Company, id: number): Observable<Company> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, company).pipe(
            map((company: Company) => {
                return company;
            }),
        );
    }

    public deleteCompany(id: number): Observable<Company | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((Company: Company) => {
                return Company;
            }),
        );
    }

    uploadFiles(formData): Observable<any> {
        return this.httpClient
            .post(`${_prefixUpload}/uploadImage`, formData, {
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
        const url: string = `${_prefixUpload}/deleteImages`;
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

    public getCompanyDataSeller(): Observable<any> {
        const url: string = `${_prefixDataSeller}/get-company-data`;
        return this.httpClient.get(url, {}).pipe(
            map((res: any) => {
                return res;
            }),
        );
    }

    async verifyCompanyDbName(dbName: string): Promise<any> {
        const url: string = `${_prefixDataSeller}/verify/${dbName}`;
        return await this.httpClient.post(url, {}).pipe(
            map((res: any) => {
                return res;
            }),
        ).toPromise();
    }
}
