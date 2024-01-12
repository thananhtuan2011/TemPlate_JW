import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { Customer, Job } from '../models/customer.model';
import { da } from 'date-fns/locale';

export interface PageFilterCustomer extends Page {
    keyword?: string;
    warehouseId?: number;
    positionId?: number;
    departmentId?: number;
    requestPassword?: boolean;
    quit?: boolean;
    gender?: number;
    birthday?: String;
    startDate?: Date;
    endDate?: Date;
    currentPage?: number;
    pagesize?: number;
    targetId?: number;
    typeOfWork?: number;
    month?: number;
    degreeId?: number;
    certificatedId?: number;
    type?: number;
}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Customers`;
let _prefixUpload = `${AppConstant.DEFAULT_URLS.API}/ReportDownload`;

@Injectable({
    providedIn: 'root',
})
export class CustomerService {
    constructor(private readonly httpClient: HttpClient) {}

    public getPagingCustomer(params: any): Observable<TypeData<Customer>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((customer: TypeData<Customer>) => {
                return customer;
            }),
        );
    }

    public getChartBirthDay(type: number = 0): Observable<TypeData<any>> {
        return this.httpClient
            .get(`${_prefix}/chart-birthday-customer?type=${type}`)
            .pipe(
                map((customer: TypeData<any>) => {
                    return customer;
                }),
            );
    }

    public getAllCustomer(
        searchText: string = '',
        type: number = 0,
        customerId: [] = [],
    ): Observable<TypeData<Customer>> {
        var url = `${_prefix}/list?type=${type}&searchText=${searchText}`;
        if (customerId && customerId.length > 0) {
            url += Object.keys(customerId)
                .map((key) => '&customerId' + '=' + customerId[key])
                .join('&');
        }
        return this.httpClient.get(url).pipe(
            map((customer: TypeData<Customer>) => {
                return customer;
            }),
        );
    }

    public getCustomerDetail(id: number): Observable<any> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((customer: any) => {
                return customer;
            }),
        );
    }

    public getTotalJob(): Observable<TypeData<Job>> {
        return this.httpClient.post(`${_prefix}/gettotaljob`, {}).pipe(
            map((job: TypeData<Job>) => {
                return job;
            }),
        );
    }

    public getTotalStatus(): Observable<TypeData<any>> {
        return this.httpClient.post(`${_prefix}/gettotalstatus`, {}).pipe(
            map((status: TypeData<any>) => {
                return status;
            }),
        );
    }

    public createCustomer(customer: Customer): Observable<Customer | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, customer).pipe(
            map((customer: Customer) => {
                return customer;
            }),
        );
    }

    public updateCustomer(
        customer: Customer,
        id: number,
    ): Observable<Customer> {
        console.log(customer);
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, customer).pipe(
            map((customer: Customer) => {
                return customer;
            }),
        );
    }

    public deleteCustomer(id: number): Observable<Customer | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((customer: Customer) => {
                return customer;
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

    public getExcelReport(params: any): Observable<{ dt: string }> {
        return this.httpClient.get(`${_prefix}/export-excel`, { params }).pipe(
            map((data: { dt: string }) => {
                return data;
            }),
        );
    }

    // getExcelReport(param: PageFilterCustomer): Observable<{ dt: string }> {
    //     let url: string = `${_prefix}/export-excel`;

    //     // return this.httpClient.get(`${_prefix}`, {params}).pipe(
    //     //     map((customer: TypeData<Customer>) => {
    //     //         return customer;
    //     //     })
    //     // );

    //     return this.httpClient.get(`${url}`, {param}).pipe(
    //         map((data: { dt: string }) => {
    //             return data;
    //         })
    //     );
    // }

    getFolderPathDownload(f: string, t: string): string {
        var k =
            environment.serverURL +
            '/api/ReportDownload/DownloadReportFromFile' +
            `?filename=${f}&fileType=${t}`;
        return k;
    }

    importExcel(formData, type): Observable<any> {
        return this.httpClient
            .post(`${_prefix}/import-excel/${type}`, formData)
            .pipe(
                map((data: any) => {
                    return data;
                }),
            );
    }

    getCode(type: number): Observable<any> {
        return this.httpClient
            .get(`${_prefix}/get-code-customer?type=${type}`)
            .pipe(
                map((data: any) => {
                    return data;
                }),
            );
    }

    createQuoteCustomer(customerId: number, request: any): Observable<any> {
        return this.httpClient
            .post(`${_prefix}/CreateCustomerQuote/${customerId}`, request)
            .pipe(
                map((data: any) => {
                    return data;
                }),
            );
    }

    reportCustomerQuoteDetail(params: any): Observable<any> {
        return this.httpClient
            .get(`${_prefix}/ReportCustomerQuoteDetail`, { params })
            .pipe(
                map((data: any) => {
                    return data;
                }),
            );
    }

    getListCustomerQuoteHistory(params: any): Observable<any> {
        return this.httpClient
            .post(`${_prefix}/GetListCustomerQuoteHistory`, params)
            .pipe(
                map((data: any) => {
                    return data;
                }),
            );
    }

    getListCustomerQuoteDetail(params: any): Observable<any> {
        return this.httpClient
            .get(`${_prefix}/GetListCustomerQuoteDetail`, { params })
            .pipe(
                map((data: any) => {
                    return data;
                }),
            );
    }

    getCustomerDebit(id): Observable<any> {
        return this.httpClient
            .get(`${_prefix}/get-customer-debit?id=${id}`)
            .pipe(
                map((data: any) => {
                    return data;
                }),
            );
    }

    getCustomerWarning(): Observable<any> {
        return this.httpClient.get(`${_prefix}/get-customer-warning`).pipe(
            map((data: any) => {
                return data;
            }),
        );
    }
    public updateUserCreate(param: any): Observable<any> {
        const url: string = `${_prefix}/update-user-create`;
        return this.httpClient.put(url, param).pipe(
            map((customer: any) => {
                return customer;
            }),
        );
    }

    GetDataBaoGia(customerId: number, customerQuoteId: number): Observable<any> {
        return this.httpClient
            .get(`${_prefix}/GetDataBaoGia?customerQuoteId=${customerQuoteId}&customerId=${customerId}`)
            .pipe(
                map((data: any) => {
                    return data;
                }),
            );
    }
}
