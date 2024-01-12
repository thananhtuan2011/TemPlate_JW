import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import AppConstant from '../utilities/app-constants';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/InOut`;

@Injectable({
    providedIn: 'root',
})
export class TimekeepingHistoryService {
    constructor(private readonly httpClient: HttpClient) {}

    getAll(params?: any): Observable<any> {
        return this.httpClient.post(`${_prefix}/findAll`, params);
    }

    updateHistory(body): Observable<any> {
        return this.httpClient.post(`${_prefix}/update/${body.id}`, body);
    }
    deleteHistory(id: number): Observable<any> {
        return this.httpClient.delete(`${_prefix}/${id}`);
    }
}
