import AppConstant from '../utilities/app-constants';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/ReportTax`;

@Injectable({
    providedIn: 'root',
})
export class ReportTaxService {
    constructor(private readonly httpClient: HttpClient) {}

    exportReportXML(): Observable<any> {
        return this.httpClient.get(`${_prefix}/export-report-xml`).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    getData(body): Observable<any> {
        return this.httpClient
            .post(`${_prefix}/export-report-pdf`, {
                ...body,
            })
            .pipe(
                map((res) => {
                    return res;
                }),
            );
    }
}
