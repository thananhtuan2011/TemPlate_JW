import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { Ward } from '../models/ward.model';

export interface PageFilterWard extends Page {}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Wards`;

@Injectable({
    providedIn: 'root',
})
export class WardService {
    constructor(private readonly httpClient: HttpClient) {}

    public getPagingWard(params: any): Observable<TypeData<Ward>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((ward: TypeData<Ward>) => {
                return ward;
            }),
        );
    }

    public getListWard(): Observable<any> {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((result: any) => {
                return result;
            }),
        );
    }

    public getWardForDistrict(districtId: number): Observable<Ward[]> {
        const url: string = `${_prefix}/list/district/${districtId}`;
        return this.httpClient.get(url, {}).pipe(
            map((res: any) => {
                return res.data;
            }),
        );
    }

    public getWardDetail(id: number): Observable<Ward> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((ward: Ward) => {
                return ward;
            }),
        );
    }

    public createWard(ward: Ward): Observable<Ward | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, ward).pipe(
            map((ward: Ward) => {
                return ward;
            }),
        );
    }

    public updateWard(ward: Ward, id: number): Observable<Ward> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, ward).pipe(
            map((ward: Ward) => {
                return ward;
            }),
        );
    }

    public deleteWard(id: number): Observable<Ward | null> {
        const url: string = `${_prefix}/delete/${id}`;
        return this.httpClient.post(url, {}).pipe(
            map((ward: Ward) => {
                return ward;
            }),
        );
    }

    getExcelReport(param: PageFilterWard): Observable<{ dt: string }> {
        let url: string = `${_prefix}/export-excel-labor-country`;

        return this.httpClient.get(url).pipe(
            map((data: { dt: string }) => {
                return data;
            }),
        );
    }

    getFolderPathDownload(f: string, t: string): string {
        var k =
            environment.serverURL +
            '/ReportDownload/DownloadReportFromFile' +
            `?filename=${f}&fileType=${t}`;
        return k;
    }

    importExcel(formData): Observable<any> {
        return this.httpClient.post(`/api/Ward/import-bkhh`, formData).pipe(
            map((data: any) => {
                return data;
            }),
        );
    }
}
