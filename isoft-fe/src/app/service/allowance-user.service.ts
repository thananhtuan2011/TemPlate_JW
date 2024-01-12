import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import AppConstant from '../utilities/app-constants';
import { Observable } from 'rxjs';
import { TypeData } from '../models/common.model';
import { AllowanceModel } from '../models/allowance.model';
import { map } from 'rxjs/operators';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/AllowanceUsers`;

@Injectable({
    providedIn: 'root',
})
export class AllowanceUserService {
    constructor(private readonly httpClient: HttpClient) {}

    public getPagingAllowanceUsers(params: any): Observable<TypeData<any>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((allowance: TypeData<any>) => {
                return allowance;
            }),
        );
    }

    public getAllowanceUserDetail(id: number): Observable<any> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((allowance: any) => {
                return allowance;
            }),
        );
    }

    public createAllowanceUser(allowance: any): Observable<any> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, allowance).pipe(
            map((allowance: any) => {
                return allowance;
            }),
        );
    }

    public updateAllowanceUser(allowance: any, id: number): Observable<any> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, allowance).pipe(
            map((allowance: any) => {
                return allowance;
            }),
        );
    }

    public deleteAllowanceUser(id: number): Observable<any> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((allowance: any) => {
                return allowance;
            }),
        );
    }
}
