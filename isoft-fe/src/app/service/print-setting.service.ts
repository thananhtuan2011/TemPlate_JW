import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import AppConstant from '../utilities/app-constants';
import { IsoftHistoryModel } from '../components/website-module/isoft-history/isoft-history.model';

@Injectable({
    providedIn: 'root',
})
export class PrintSettingService {
    readonly prefix = `${AppConstant.DEFAULT_URLS.API}/Prints`;
    constructor(private readonly httpClient: HttpClient) {}

    public getPageSetting(): Observable<any> {
        return this.httpClient.get(`${this.prefix}/get-page-print`).pipe(
            map((setting: any) => {
                return setting;
            }),
        );
    }

    public update(body): Observable<any> {
        return this.httpClient.put(`${this.prefix}`, body).pipe(
            map((setting: any) => {
                return setting;
            }),
        );
    }
}
