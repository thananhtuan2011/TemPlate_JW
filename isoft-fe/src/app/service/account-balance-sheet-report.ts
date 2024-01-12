import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import AppConstant from '../utilities/app-constants';
import { environment } from 'src/environments/environment';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/AccountBalanceSheetReport`;

@Injectable({
    providedIn: 'root',
})
export class AccountBalanceSheetReportService {
    mockData = false;

    constructor(private readonly httpClient: HttpClient) {}

    exportData(params): Observable<any> {
        return this.httpClient.get(`${_prefix}/export-data`, { params });
    }
    exportBlanceAccountantData(params, isNoiBo?: boolean): Observable<any> {
        if (isNoiBo) {
            return this.httpClient.post(
                `${AppConstant.DEFAULT_URLS.URL}/AccountantBalanceSheetReport/get-report-accountant-balance?isNoiBo=true`,
                params,
            );
        } else {
            return this.httpClient.post(
                `${AppConstant.DEFAULT_URLS.URL}/AccountantBalanceSheetReport/get-report-accountant-balance?isNoiBo=false`,
                params,
            );
        }
    }

    exportMovedMoneyData(params, isNoiBo?: boolean): Observable<any> {
        if (isNoiBo) {
            return this.httpClient.post(
                `${AppConstant.DEFAULT_URLS.URL}/TableSavedMovedMoneyReport/get-report-saved-moved-money?isNoiBo=true`,
                params,
            );
        } else {
            return this.httpClient.post(
                `${AppConstant.DEFAULT_URLS.URL}/TableSavedMovedMoneyReport/get-report-saved-moved-money?isNoiBo=false`,
                params,
            );
        }
    }

    exportPlanMissionCountryTaxData(
        params,
        isNoiBo?: boolean,
    ): Observable<any> {
        if (isNoiBo) {
            return this.httpClient.post(
                `${AppConstant.DEFAULT_URLS.URL}/PlanMissionCountryTaxReport/get-report-plan-mission-country-tax?isNoiBo=true`,
                params,
            );
        } else {
            return this.httpClient.post(
                `${AppConstant.DEFAULT_URLS.URL}/PlanMissionCountryTaxReport/get-report-plan-mission-country-tax?isNoiBo=false`,
                params,
            );
        }
    }

    getFolderPathDownload(f: string, t: string): string {
        var k =
            environment.serverURL +
            '/api/ReportDownload/DownloadReportFromFile' +
            `?filename=${f}&fileType=${t}`;
        return k;
    }
}
