import AppConstant from '../utilities/app-constants';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TypeData } from '../models/common.model';
import { DocumentTypeModel } from '../models/document-type.model';
import { map } from 'rxjs/operators';
import { AllowanceModel } from '../models/allowance.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Allowances`;

@Injectable({
    providedIn: 'root',
})
export class AllowanceService {
    constructor(private readonly httpClient: HttpClient) {}

    async getPagingAllowances(params: any): Promise<TypeData<AllowanceModel>> {
        return this.httpClient
            .get(`${_prefix}`, { params })
            .pipe(
                map((allowance: TypeData<AllowanceModel>) => {
                    return allowance;
                }),
            )
            .toPromise();
    }

    public getAllowanceDetail(id: number): Observable<AllowanceModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((allowance: AllowanceModel) => {
                return allowance;
            }),
        );
    }

    public createAllowance(
        allowance: AllowanceModel,
    ): Observable<AllowanceModel | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, allowance).pipe(
            map((allowance: AllowanceModel) => {
                return allowance;
            }),
        );
    }

    public updateAllowance(
        allowance: AllowanceModel,
        id: number,
    ): Observable<AllowanceModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, allowance).pipe(
            map((allowance: AllowanceModel) => {
                return allowance;
            }),
        );
    }

    public deleteAllowance(id: number): Observable<AllowanceModel | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((allowance: AllowanceModel) => {
                return allowance;
            }),
        );
    }
    getAllowances(): any {
        return this.httpClient.get(`${_prefix}/list`).pipe();
    }
}
