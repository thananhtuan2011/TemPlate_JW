import { RoomTable } from './../models/room-table.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import AppConstant from '../utilities/app-constants';
import { Page, TypeData } from '../models/common.model';
import { CoaFiltersModel } from '../models/coa-filters.model';

export interface PageFilterRoomTable extends Page {
    floorId: number;
    isFloor: string;
}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/ChartOfAccountFilters`;

@Injectable({
    providedIn: 'root',
})
export class COAService {
    constructor(private readonly httpClient: HttpClient) {}

    public getList(params): Observable<TypeData<CoaFiltersModel>> {
        if (params.floorId === 0) {
            delete params.floorId;
        }
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((data: TypeData<CoaFiltersModel>) => {
                return data;
            }),
        );
    }
    public getListNoQuery(): Observable<TypeData<CoaFiltersModel>> {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((data: TypeData<CoaFiltersModel>) => {
                return data;
            }),
        );
    }

    public getDetail(id: number): Observable<any> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    public create(body): Observable<any> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, body).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    public update(body, id: number): Observable<any> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, body).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    public delete(id: number): Observable<any> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((res) => {
                return res;
            }),
        );
    }
}
