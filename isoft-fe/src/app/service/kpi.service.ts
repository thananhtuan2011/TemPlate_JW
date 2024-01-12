import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TypeData } from '../models/common.model';
import { Target } from '../models/target.model';
import { map } from 'rxjs/operators';
import AppConstant from '../utilities/app-constants';
import { environment } from '../../environments/environment';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/P_Kpi`;

@Injectable({
    providedIn: 'root',
})
export class KpiService {
    constructor(private readonly httpClient: HttpClient) {}

    public getListKPI(params?: any): Observable<TypeData<Target>> {
        params = {
            Page: 1,
            ...params,
        };
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((Target: TypeData<Target>) => {
                return Target;
            }),
        );
    }

    public getProcedureNumber(): Observable<string> {
        return this.httpClient
            .get(`${_prefix}/get-procedure-number`, { responseType: 'text' })
            .pipe(
                map((model: string) => {
                    return model;
                }),
            );
    }

    public getKPIById(id: number): Observable<TypeData<Target>> {
        return this.httpClient.get(`${_prefix}/${id}`).pipe(
            map((Target: TypeData<Target>) => {
                return Target;
            }),
        );
    }

    public getListTargetKPI(params?: any): Observable<TypeData<Target>> {
        params = {
            Page: 1,
            ...params,
        };
        return this.httpClient.get(`${_prefix}/get-user-kpi`, { params }).pipe(
            map((Target: TypeData<Target>) => {
                return Target;
            }),
        );
    }

    public getReportKPI(params?: any): Observable<TypeData<Target>> {
        return this.httpClient.get(`${_prefix}/report-kpi`, { params }).pipe(
            map((Target: TypeData<Target>) => {
                return Target;
            }),
        );
    }

    public getReportKPIFullByMonth(params?: any): Observable<TypeData<Target>> {
        return this.httpClient
            .get(`${_prefix}/get-report-kpi-full-for-month`, { params })
            .pipe(
                map((Target: TypeData<Target>) => {
                    return Target;
                }),
            );
    }

    public createKPI(body): Observable<any> {
        return this.httpClient.post(`${_prefix}`, body);
    }

    public exportExcel(params?: any): Observable<any> {
        return this.httpClient.get(`${_prefix}/report-export-kpi`, {
            responseType: 'text',
            ...params,
        });
    }

    public updateTargetKPI(id, body): Observable<TypeData<any>> {
        return this.httpClient.put(`${_prefix}/${id}`, body).pipe(
            map((Target: TypeData<any>) => {
                return Target;
            }),
        );
    }

    public deleteKPI(id: string | number) {
        return this.httpClient.delete(`${_prefix}/${id}`);
    }

    getFolderPathDownload(f: string, t: string): string {
        var k =
            environment.serverURL +
            '/api/ReportDownload/DownloadReportFromFile' +
            `?filename=${f}&fileType=${t}`;
        return k;
    }
}
