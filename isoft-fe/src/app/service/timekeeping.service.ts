import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import AppConstant from '../utilities/app-constants';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/InOut`;
@Injectable({
    providedIn: 'root',
})
export class TimekeepingService {
    constructor(private httpClient: HttpClient) {}

    getListInOut(params: any): Observable<any> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((InOut) => {
                return InOut;
            }),
        );
    }

    getAllInOut(): Observable<any> {
        return this.httpClient.get(`${_prefix}/countTargetId`).pipe(
            map((InOut: any) => {
                return InOut;
            }),
        );
    }

    saveInOut(body): Observable<any> {
        return this.httpClient.post(`${_prefix}`, body);
    }
}
