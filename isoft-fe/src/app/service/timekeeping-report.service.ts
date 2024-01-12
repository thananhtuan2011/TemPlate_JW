import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import AppConstant from '../utilities/app-constants';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/InOut`;

@Injectable({
    providedIn: 'root',
})
export class TimekeepingReportService {
    constructor(private readonly httpClient: HttpClient) {}

    getAllReport(params?): Observable<any> {
        return this.httpClient.post(`${_prefix}/report`, params);
    }

    exportExcel(params?): Observable<any> {
        return this.httpClient.post(`${_prefix}/exportreportexcel`, params, {
            responseType: 'blob',
        });
    }
}
