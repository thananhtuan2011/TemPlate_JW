import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import AppConstant from '../utilities/app-constants';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Goods`;

@Injectable({
    providedIn: 'root',
})
export class ComboService {
    constructor(private httpClient: HttpClient) {}

    getList(params: any): Observable<any> {
        return this.httpClient.get(`${_prefix}`, { params });
    }

    getByID(id: string): Observable<any> {
        return this.httpClient.get(`${_prefix}/GetDetailByGoodID/${id}`);
    }

    save(body: any): Observable<any> {
        return this.httpClient.post(`${_prefix}/SaveGoodDetail`, body);
    }

    deteteRow(id): Observable<any> {
        return this.httpClient.post(`${_prefix}/DeleteGoodDetail/${id}`, null);
    }
}
