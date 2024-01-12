import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import AppConstant from '../../../utilities/app-constants';
import { environment } from '../../../../environments/environment';

let _prefix = `${AppConstant.DEFAULT_URLS.URL}/GeneralDiaryReport`;

@Injectable({
    providedIn: 'root',
})
export class GeneralDiaryReportService {
    constructor(private readonly httpClient: HttpClient) {}

    public getReport(params?: any): Observable<any> {
        return this.httpClient
            .get(`${_prefix}/get-report-general-diary`, { params })
            .pipe(
                map((Target: any) => {
                    return Target;
                }),
            );
    }

    getFolderPathDownload(f: string, t: string): string {
        var k =
            environment.serverURL +
            '/api/ReportDownload/DownloadReportFromFile' +
            `?filename=${f}&fileType=${t}`;
        return k;
    }
}
