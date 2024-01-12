import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { TypeData } from '../models/common.model';
import { KPIScoreModel } from '../models/kpi-score.model';
import { SalaryAdvanceModel } from '../models/salary-advance.model';
import AppConstant from '../utilities/app-constants';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/MenuKpis`;

@Injectable({
    providedIn: 'root',
})
export class KPIScoreService {
    constructor(private readonly httpClient: HttpClient) {}

    public getPagingKPIScore(params: any): Observable<TypeData<KPIScoreModel>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((model: TypeData<KPIScoreModel>) => {
                return model;
            }),
        );
    }
    public getAllKPIScore(): Observable<TypeData<KPIScoreModel>> {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((model: TypeData<KPIScoreModel>) => {
                return model;
            }),
        );
    }
    public submitKPIScore(model: KPIScoreModel): Observable<KPIScoreModel> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, model).pipe(
            map((model: KPIScoreModel) => {
                return model;
            }),
        );
    }

    public getKPIScoreDetail(id: number): Observable<KPIScoreModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((model: KPIScoreModel) => {
                return model;
            }),
        );
    }

    public updateKPIScore(
        model: KPIScoreModel,
        id: number,
    ): Observable<KPIScoreModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, model).pipe(
            map((model: KPIScoreModel) => {
                return model;
            }),
        );
    }

    public deleteKPIScore(id: number): Observable<KPIScoreModel | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((model: KPIScoreModel) => {
                return model;
            }),
        );
    }
}
