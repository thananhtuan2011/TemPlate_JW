import { Injectable } from '@angular/core';
import AppConstant from '../utilities/app-constants';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Bills`;

@Injectable({
    providedIn: 'root',
})
export class DashboardService {
    constructor(private readonly httpClient: HttpClient) {}

    getReportHome() {
        return this.httpClient.get(`${_prefix}/report-home`).pipe(
            map((res: any) => {
                return res;
            }),
        );
    }
}
