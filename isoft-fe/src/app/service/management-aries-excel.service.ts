import AppConstant from '../utilities/app-constants';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

let _prefix = `${AppConstant.DEFAULT_URLS.URL}/ManagementAriesExcel`;

@Injectable({
    providedIn: 'root',
})
export class ManagementAriesExcelService {
    constructor(private readonly httpClient: HttpClient) {}

    exportAries(body: any): Observable<any> {
        return this.httpClient.post(`${_prefix}/exportAries`, body, {
            responseType: 'blob',
        });
    }
    exportAriesSample(): Observable<any> {
        return this.httpClient.post(
            `${_prefix}/exportAries-sample`,
            {},
            { responseType: 'blob' },
        );
    }
    importExcel(body: any): Observable<any> {
        return this.httpClient.post(`${_prefix}/importExcel`, body).pipe(
            map((res: any) => {
                return res;
            }),
        );
    }

    updateOrginalVoucherNumber(body: any): Observable<any> {
        return this.httpClient
            .post(`${_prefix}/updateOrginalVoucherNumber`, body)
            .pipe(
                map((res: any) => {
                    return res;
                }),
            );
    }

    transferInfoLedger(body: any): Observable<any> {
        return this.httpClient.post(`${_prefix}/transferInfoLedger`, body).pipe(
            map((res: any) => {
                return res;
            }),
        );
    }
}
