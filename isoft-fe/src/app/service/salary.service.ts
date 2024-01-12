import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TypeData } from '../models/common.model';
import { Salary } from '../models/salary.model';
import AppConstant from '../utilities/app-constants';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Users`;
@Injectable({
    providedIn: 'root',
})
export class SalaryService {
    constructor(private readonly httpClient: HttpClient) {}
    public getListSalary(params: any): Observable<TypeData<Salary>> {
        return this.httpClient
            .get(`${_prefix}/GetListUserSalary`, { params })
            .pipe(
                map((Salary: TypeData<Salary>) => {
                    return Salary;
                }),
            );
    }
    getExcelReport(param: any): Observable<{ dt: string }> {
        let url: string = `${_prefix}/exportUserSalary?month=${param.month}`;

        return this.httpClient.get(url).pipe(
            map((data: { dt: string }) => {
                return data;
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
    public UpdateSalaryToAccountant(params: any): Observable<TypeData<Salary>> {
        return this.httpClient
            .get(`${_prefix}/UpdateSalaryToAccountant`, { params })
            .pipe(
                map((Salary: TypeData<Salary>) => {
                    return Salary;
                }),
            );
    }
}
