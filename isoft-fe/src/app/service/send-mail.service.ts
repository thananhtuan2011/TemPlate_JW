import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TypeData } from '../models/common.model';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import AppConstant from '../utilities/app-constants';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/SendMail`;

@Injectable({
    providedIn: 'root',
})
export class SendMailService {
    constructor(private readonly httpClient: HttpClient) {}

    public getList(params?: any): Observable<TypeData<any>> {
        params = {
            page: 1,
            ...params,
        };
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((res: TypeData<any>) => {
                return res;
            }),
        );
    }

    public getById(id: number): Observable<any> {
        return this.httpClient.put(`${_prefix}/${id}`, {});
    }

    public create(body): Observable<any> {
        return this.httpClient.post(`${_prefix}`, body);
    }

    public update(id, body): Observable<TypeData<any>> {
        return this.httpClient.put(`${_prefix}/${id}`, body).pipe(
            map((any: TypeData<any>) => {
                return any;
            }),
        );
    }

    public delete(id: string | number) {
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
