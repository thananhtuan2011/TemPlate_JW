import AppConstant from '../utilities/app-constants';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TypeData } from '../models/common.model';
import { DocumentTypeModel } from '../models/document-type.model';
import { FurloughModel } from '../models/furlough.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/P_Leave`;

@Injectable({
    providedIn: 'root',
})
export class FurloughService {
    constructor(private readonly httpClient: HttpClient) {}

    getPagingFurloughs(params?: any): Observable<TypeData<FurloughModel>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((furlough: TypeData<FurloughModel>) => {
                return furlough;
            }),
        );
    }

    getFurloughDetail(id: number): Observable<any> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((furlough: any) => {
                return furlough;
            }),
        );
    }

    createFurlough(furlough: any): Observable<any> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, furlough).pipe(
            map((furlough: any) => {
                return furlough;
            }),
        );
    }

    updateFurlough(furlough: any, id: number): Observable<any> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, furlough).pipe(
            map((furlough: any) => {
                return furlough;
            }),
        );
    }

    deleteFurlough(id: number): Observable<any> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((furlough: any) => {
                return furlough;
            }),
        );
    }

    approveFurlough(id: number, request: any): Observable<any> {
        const url: string = `${_prefix}/accept/${id}`;
        return this.httpClient.put(url, request).pipe(
            map((furlough: any) => {
                return furlough;
            }),
        );
    }

    getProcedureNumber(): Observable<any> {
        return this.httpClient.get(`${_prefix}/get-procedure-number`).pipe(
            map((procedureNumbers: TypeData<any>) => {
                return procedureNumbers;
            }),
        );
    }
}
