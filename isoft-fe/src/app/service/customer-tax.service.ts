import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { Customer } from '../models/customer.model';
import { CustomerTax } from '../models/customer-tax.model';

export interface PageFilterCustomerTax extends Page {
    keyword?: string;
    warehouseId?: number;
    positionId?: number;
    departmentId?: number;
    requestPassword?: boolean;
    quit?: boolean;
    gender?: number;
    birthday?: Date;
    startDate?: Date;
    endDate?: Date;
    currentPage?: number;
    pagesize?: number;
    targetId?: number;
    typeOfWork?: number;
    month?: number;
    degreeId?: number;
    certificatedId?: number;
}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/CustomerTaxInformation`;
let _prefixUpload = `${AppConstant.DEFAULT_URLS.API}/ReportDownload`;

@Injectable({
    providedIn: 'root',
})
export class CustomerTaxService {
    constructor(private readonly httpClient: HttpClient) {}

    public getCustomerTax(params: any): Observable<TypeData<CustomerTax>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((customer: TypeData<CustomerTax>) => {
                return customer;
            }),
        );
    }

    public getAllCustomerTax(): Observable<TypeData<CustomerTax>> {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((customer: TypeData<CustomerTax>) => {
                return customer;
            }),
        );
    }

    public getCustomerTaxDetail(id: number): Observable<CustomerTax> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((customer: CustomerTax) => {
                return customer;
            }),
        );
    }

    public getCustomerTaxDetailByCustomerId(
        customerId: number,
    ): Observable<CustomerTax> {
        const url: string = `${_prefix}/customer/${customerId}`;
        return this.httpClient.get(url, {}).pipe(
            map((customer: CustomerTax) => {
                return customer;
            }),
        );
    }

    public createCustomerTax(customer: any): Observable<CustomerTax | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, customer).pipe(
            map((customer: CustomerTax) => {
                return customer;
            }),
        );
    }

    public updateCustomerTax(
        customer: CustomerTax,
        id: number,
    ): Observable<CustomerTax> {
        console.log(customer);
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, customer).pipe(
            map((customer: CustomerTax) => {
                return customer;
            }),
        );
    }

    // public deleteCustomer(id: number): Observable<Customer | null> {
    //     const url: string = `${_prefix}/${id}`;
    //     return this.httpClient.delete(url, {}).pipe(
    //         map((customer: Customer) => {
    //             return customer;
    //         })
    //     );
    // }

    // uploadFiles(formData): Observable<any> {
    //     return this.httpClient
    //         .post(`${_prefixUpload}/uploadImage`, formData, {
    //             reportProgress: true,
    //             observe: 'events',
    //         })
    //         .pipe(catchError(this.errorMgmt));
    // }

    // errorMgmt(error: HttpErrorResponse) {
    //     let errorMessage = '';
    //     if (error.error instanceof ErrorEvent) {
    //         // Get client-side error
    //         errorMessage = error.error.message;
    //     } else {
    //         // Get server-side error
    //         errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    //     }
    //     console.log(errorMessage);
    //     return throwError(errorMessage);
    // }

    // getExcelReport(param: PageFilterCustomerTax): Observable<{ dt: string }> {
    //     let url: string = `${_prefix}/export-excel-customer`;

    //     return this.httpClient.get(url).pipe(
    //         map((data: { dt: string }) => {
    //             return data;
    //         })
    //     );
    // }

    // getFolderPathDownload(f: string, t: string): string {
    //     var k =
    //         environment.serverURL +
    //         '/ReportDownload/DownloadReportFromFile' +
    //         `?filename=${f}&fileType=${t}`;
    //     return k;
    // }

    // importExcel(formData): Observable<any> {
    //     return this.httpClient.post(`${_prefix}/import-customer`, formData).pipe(
    //         map((data: any) => {
    //             return data;
    //         })
    //     );
    // }
}
