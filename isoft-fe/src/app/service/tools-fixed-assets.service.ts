import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import AppConstant from '../utilities/app-constants';
import { map } from 'rxjs/operators';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/FixedAssets`;

@Injectable({
    providedIn: 'root',
})
export class ToolsFixedAssetsService {
    constructor(private readonly httpClient: HttpClient) {}

    getList(params: any): Observable<any> {
        return this.httpClient.get(`${_prefix}`, { params });
    }

    getListToolsFixedAssets(params: any): Observable<any> {
        return this.httpClient.post(`${_prefix}/search`, params);
    }

    getByID(id: string | number): Observable<any> {
        return this.httpClient.get(`${_prefix}/${id}`);
    }

    createToolFixedAssets(params: any): Observable<any> {
        return this.httpClient.post(`${_prefix}/save`, params);
    }

    updateToolFixedAssets(params: any): Observable<any> {
        return this.httpClient.put(`${_prefix}/${params.id}`, params);
    }

    deleteToolFixedAssets(id): Observable<any> {
        return this.httpClient.delete(`${_prefix}/${id}`, {
            body: [id],
        });
    }

    importExcel(body: any): Observable<any> {
        return this.httpClient.post(`${_prefix}/import-excel`, body).pipe(
            map((res: any) => {
                return res;
            }),
        );
    }
    exportExcel(body: any): Observable<any> {
        return this.httpClient.post(`${_prefix}/export-excel`, body);
    }
}
