import AppConstant from '../utilities/app-constants';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { InventoryModel } from '../models/inventory.model';
import { TypeData } from '../models/common.model';
import { SalaryAdvanceModel } from '../models/salary-advance.model';
import { SalaryLevel } from '../models/salary-level.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/P_SalaryAdvance`;

@Injectable({
    providedIn: 'root',
})
export class SalaryAdvanceService {
    constructor(private readonly httpClient: HttpClient) {}

    public getPagingSalaryAdvance(
        params: any,
    ): Observable<TypeData<SalaryAdvanceModel>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((model: TypeData<SalaryAdvanceModel>) => {
                return model;
            }),
        );
    }
    public getProcedureNumber(): Observable<string> {
        return this.httpClient
            .get(`${_prefix}/get-procedure-number`, { responseType: 'text' })
            .pipe(
                map((model: string) => {
                    return model;
                }),
            );
    }
    public updateSalaryAdvance(
        model: SalaryAdvanceModel,
        id: number,
    ): Observable<SalaryAdvanceModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, model).pipe(
            map((model: SalaryAdvanceModel) => {
                return model;
            }),
        );
    }
    public updateSalaryAdvanceAccept(
        model: SalaryAdvanceModel,
        id: number,
    ): Observable<SalaryAdvanceModel> {
        const url: string = `${_prefix}/accept/${id}`;
        return this.httpClient.put(url, model).pipe(
            map((model: SalaryAdvanceModel) => {
                return model;
            }),
        );
    }
    public submitSalaryAdvance(
        model: SalaryAdvanceModel,
    ): Observable<SalaryAdvanceModel> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, model).pipe(
            map((model: SalaryAdvanceModel) => {
                return model;
            }),
        );
    }

    public deleteSalaryAdvance(
        id: number,
    ): Observable<SalaryAdvanceModel | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((model: SalaryAdvanceModel) => {
                return model;
            }),
        );
    }

    public getSalaryAdvanceDetail(id: number): Observable<SalaryAdvanceModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((model: SalaryAdvanceModel) => {
                return model;
            }),
        );
    }
    public AddLedger(month: number, isInternal: number) {
        const url: string = `${_prefix}/salary-advance-accountant?month=${month}&isInternal=${isInternal}`;
        return this.httpClient.post(url, {});
    }

    public getSalaryAdvanceRequest(params: any): Observable<any> {
        return this.httpClient
            .get(`${_prefix}/salary-advance-for-user`, { params })
            .pipe(
                map((res: TypeData<any>) => {
                    return res.data;
                }),
            );
    }

    public createSalaryAdvanceRequest(payload) {
        const url: string = `${_prefix}/salary-advance-for-user`;
        return this.httpClient.post(url, payload);
    }

    public updateSalaryAdvanceRequest(id: number, payload) {
        const url: string = `${_prefix}/salary-advance-for-user/${id}`;
        return this.httpClient.put(url, payload);
    }

    public deleteSalaryAdvanceRequest(id): Observable<TypeData<any>> {
        return this.httpClient
            .delete(`${_prefix}//salary-advance-for-user/${id}`, {})
            .pipe(
                map((Salary: TypeData<any>) => {
                    return Salary;
                }),
            );
    }
}
