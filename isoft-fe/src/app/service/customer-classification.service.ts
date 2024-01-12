import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { CustomerClassification } from '../models/customer-classification.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/CustomerClassification`;

@Injectable({
    providedIn: 'root',
})
export class CustomerClassificationService {
    constructor(private readonly httpClient: HttpClient) {}

    public getCustomerClassification(
        params: any,
    ): Observable<TypeData<CustomerClassification>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((customer: TypeData<CustomerClassification>) => {
                return customer;
            }),
        );
    }

    public getAllCustomerClassification(): Observable<
        TypeData<CustomerClassification>
    > {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((customer: TypeData<CustomerClassification>) => {
                return customer;
            }),
        );
    }

    public getCustomerClassificationDetail(
        id: number,
    ): Observable<CustomerClassification> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((customer: CustomerClassification) => {
                return customer;
            }),
        );
    }

    public createCustomerClassification(
        customer: CustomerClassification,
    ): Observable<CustomerClassification | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, customer).pipe(
            map((customer: CustomerClassification) => {
                return customer;
            }),
        );
    }

    public updateCustomerClassification(
        customer: CustomerClassification,
        id: number,
    ): Observable<CustomerClassification> {
        console.log(customer);
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, customer).pipe(
            map((customer: CustomerClassification) => {
                return customer;
            }),
        );
    }

    public deleteCustomerClassification(
        id: number,
    ): Observable<CustomerClassification | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((customer: CustomerClassification) => {
                return customer;
            }),
        );
    }

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
