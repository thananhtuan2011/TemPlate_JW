import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import {
    AccountGroupDetailModel,
    ImportExportAcccountQueryParam,
} from '../models/account-group.model';
import { environment } from 'src/environments/environment';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/ChartOfAccounts`;

@Injectable({
    providedIn: 'root',
})
export class AccountGroupService {
    mockData = false;

    constructor(private readonly httpClient: HttpClient) {}

    getListDetail(params: any): Observable<TypeData<AccountGroupDetailModel>> {
        return this.httpClient
            .get(`${_prefix}/get-chart-accounts`, { params })
            .pipe(
                map((data: TypeData<AccountGroupDetailModel>) => {
                    return data;
                }),
            );
    }

    getListDetailForChildNode(
        parentCode: string,
        params: any,
    ): Observable<TypeData<any>> {
        return this.httpClient
            .get(`${_prefix}/details/${parentCode}`, { params })
            .pipe(
                map((data: TypeData<AccountGroupDetailModel>) => {
                    return data;
                }),
            );
    }

    validateExistingAccount(code: string): Observable<any> {
        return this.httpClient.get(`${_prefix}/check-account-test/${code}`);
    }

    validateExistingAccountDetail(request: any): Observable<any> {
        return this.httpClient.post(
            `${_prefix}/details/check-account-detail`,
            request,
        );
    }

    postCreateAccount(data: AccountGroupDetailModel): Observable<any> {
        return this.httpClient.post(`${_prefix}/create`, data);
    }

    putAccount(data: AccountGroupDetailModel): Observable<any> {
        return this.httpClient.put(`${_prefix}`, data);
    }

    deleteAccount(id: number): Observable<any> {
        return this.httpClient.delete(`${_prefix}/${id}`);
    }

    codeAuto(parentRef, isInternal) {
        return this.httpClient.get(
            `${_prefix}/code-auto?parentRef=${parentRef}&isInternal=${isInternal}`,
        );
    }

    importTaiKhoan(data: any) {
        return this.httpClient.post(`${_prefix}/importTaiKhoan`, data);
    }

    importExcelTaiKhoan(parentCode: string, data: any) {
        return this.httpClient.post(
            `${_prefix}/importExcelTaiKhoan/${parentCode}`,
            data,
        );
    }

    importTaiKhoanCT1(parentCode: string, data: any): Observable<any> {
        return this.httpClient.post(
            `${_prefix}/importTaiKhoanCT1/${parentCode}`,
            data,
        );
    }

    exportTaiKhoanNoiBoChiTiet1(params: any): Observable<any> {
        return this.httpClient.get(`${_prefix}/ExportTaiKhoanNoiBoChiTiet1`, {
            params: params,
        });
    }

    postCreateDetail(data: AccountGroupDetailModel): Observable<any> {
        return this.httpClient.post(`${_prefix}/details`, data);
    }

    putDetail(data: AccountGroupDetailModel): Observable<any> {
        return this.httpClient.put(`${_prefix}/details`, data);
    }

    deleteDetail(id: number): Observable<any> {
        return this.httpClient.delete(`${_prefix}/details/${id}`);
    }

    getAccountGroup(params: any): Observable<any> {
        return this.httpClient.get(`${_prefix}/groups`, { params: params });
    }

    putAccountGroup(data: any): Observable<any> {
        return this.httpClient.put(`${_prefix}/groups`, data);
    }

    getFolderPathDownload(f: string, t: string): string {
        var k =
            environment.serverURL +
            '/api/ReportDownload/DownloadReportFromFile' +
            `?filename=${f}&fileType=${t}`;
        return k;
    }

    exportTaiKhoan(Loai: any = 0): Observable<any> {
        return this.httpClient.get(
            `${_prefix}/ExportTaiKhoanNoiBo?Loai=${Loai}`,
        );
    }

    exportGetAllArisingAccounts(): Observable<any> {
        return this.httpClient.get(`${_prefix}/ExportGetAllArisingAccounts`);
    }

    importFromExcelTaiKhoanArising(body: any): Observable<any> {
        return this.httpClient.post(
            `${_prefix}/ImportFromExcelTaiKhoanArising`,
            body,
        );
    }
}
