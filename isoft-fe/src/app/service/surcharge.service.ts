import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { any } from 'codelyzer/util/function';
import {
    JobAndStatusDto,
    JobDto,
    StatusDto,
} from '../models/job-and-status.model';
import { SurchargeModel } from '../models/sur-charge.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Surcharges`;

@Injectable({
    providedIn: 'root',
})
export class SurchargesService {
    constructor(private readonly httpClient: HttpClient) {}

    // public getJobAndStatusExistingInCustomerHistories(customerId:number): Observable<any> {
    //     return this.httpClient.get(`${_prefix}/customer-histories/${customerId}/jobs-and-statuses`, { }).pipe(
    //         map((res:JobAndStatusDto) => {
    //             return {
    //                 jobs: res.jobs.map(m => JobDto.fromJS(m)),
    //                 statuses: res.statuses.map(m => StatusDto.fromJS(m))
    //             } as JobAndStatusDto;
    //         })
    //     );
    // }

    public getSurCharges(params: any): Observable<TypeData<SurchargeModel>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((surcharge: TypeData<SurchargeModel>) => {
                return surcharge;
            }),
        );
    }

    public getLastSurcharge(): Observable<TypeData<SurchargeModel>> {
        return this.httpClient.get(`${_prefix}/get-current-surcharge`).pipe(
            map((surcharge: TypeData<SurchargeModel>) => {
                return surcharge;
            }),
        );
    }

    public getAllSurCharge(): Observable<TypeData<SurchargeModel>> {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((customer: TypeData<SurchargeModel>) => {
                return customer;
            }),
        );
    }

    public getCustomerJobDetail(id: number): Observable<SurchargeModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((customer: SurchargeModel) => {
                return customer;
            }),
        );
    }

    public createCustomerJob(
        customer: SurchargeModel,
    ): Observable<SurchargeModel | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, customer).pipe(
            map((customer: SurchargeModel) => {
                return customer;
            }),
        );
    }

    public updateCustomerJob(
        customer: SurchargeModel,
        id: number,
    ): Observable<SurchargeModel> {
        console.log(customer);
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, customer).pipe(
            map((customer: SurchargeModel) => {
                return customer;
            }),
        );
    }

    public deleteSurcharge(id: number): Observable<SurchargeModel | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((customer: SurchargeModel) => {
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
