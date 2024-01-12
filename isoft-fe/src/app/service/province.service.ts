import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { Province } from '../models/province.model';
import { District } from '../models/district.model';

export interface PageFilterProvince extends Page {}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Provinces`;

@Injectable({
    providedIn: 'root',
})
export class ProvinceService {
    constructor(private readonly httpClient: HttpClient) {}

    public getPagingProvince(params: any): Observable<TypeData<Province>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((province: TypeData<Province>) => {
                return province;
            }),
        );
    }

    public getListProvince(): Observable<any> {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((result: any) => {
                return result.data;
            }),
        );
    }

    public createProvince(province: Province): Observable<Province | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, province).pipe(
            map((province: Province) => {
                return province;
            }),
        );
    }

    public updateProvince(
        province: Province,
        id: number,
    ): Observable<Province> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, province).pipe(
            map((province: Province) => {
                return province;
            }),
        );
    }

    public deleteProvince(id: number): Observable<Province | null> {
        const url: string = `${_prefix}/delete/${id}`;
        return this.httpClient.post(url, {}).pipe(
            map((province: Province) => {
                return province;
            }),
        );
    }

    getExcelReport(param: PageFilterProvince): Observable<{ dt: string }> {
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
        return this.httpClient.post(`/api/Province/import-bkhh`, formData).pipe(
            map((data: any) => {
                return data;
            }),
        );
    }
}
