import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { TypeData } from '../models/common.model';
import { HeaderGeneralStatistics } from '../models/general-statistics.model';
import AppConstant from '../utilities/app-constants';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Users`;
@Injectable({
    providedIn: 'root',
})
export class GeneralStatisticsService {
    constructor(private readonly httpClient: HttpClient) {}

    public getHeaderGeneralStatistics(): Observable<
        TypeData<HeaderGeneralStatistics>
    > {
        return this.httpClient.get(`${_prefix}/HeaderThongKeTongQuat`, {}).pipe(
            map((document: TypeData<HeaderGeneralStatistics>) => {
                return document;
            }),
        );
    }

    public getListGeneralStatistics(): Observable<
        TypeData<HeaderGeneralStatistics>
    > {
        return this.httpClient
            .get(`${_prefix}/getListThongKeTongQuat`, {})
            .pipe(
                map((document: TypeData<HeaderGeneralStatistics>) => {
                    return document;
                }),
            );
    }

    public exportGeneralStatistis(): Observable<
        TypeData<HeaderGeneralStatistics>
    > {
        return this.httpClient.get(`${_prefix}/exportThongKeTongQuat`, {}).pipe(
            map((document: TypeData<HeaderGeneralStatistics>) => {
                return document;
            }),
        );
    }
}
