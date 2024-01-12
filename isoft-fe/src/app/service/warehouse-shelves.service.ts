import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TypeData } from '../models/common.model';
import { Warehouse } from '../models/warehouse.model';
import AppConstant from '../utilities/app-constants';
import { Branch } from '../models/branch.model';

@Injectable({
    providedIn: 'root',
})
export class WarehouseShelvesService {
    private readonly _prefix = `${AppConstant.DEFAULT_URLS.API}/WareHouseShelves`;

    constructor(private readonly httpClient: HttpClient) {}

    public getWareHouseShelvesPaging(
        params: any = null,
    ): Observable<TypeData<any>> {
        return this.httpClient
            .get(`${this._prefix}`, { params })
            .pipe(map((data) => data as TypeData<any>));
    }

    public getWareHouseShelves(params: any = null): Observable<TypeData<any>> {
        return this.httpClient
            .get(`${this._prefix}/list`, { params })
            .pipe(map((data) => data as TypeData<any>));
    }

    public getWareHouseShelvesDetail(id: number): Observable<any> {
        const url: string = `${this._prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((shelves: any) => {
                return shelves;
            }),
        );
    }

    public updateWareHouseShelves(shelves: any, id: number): Observable<any> {
        const url: string = `${this._prefix}/${id}`;
        return this.httpClient.put(url, shelves).pipe(
            map((shelves: any) => {
                return shelves;
            }),
        );
    }

    public createShelves(shelves: any): Observable<any | null> {
        const url: string = `${this._prefix}`;
        return this.httpClient.post(url, shelves).pipe(
            map((shelves: any) => {
                return shelves;
            }),
        );
    }

    public deleteShelves(id: number): Observable<any | null> {
        const url: string = `${this._prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((shelves: any) => {
                return shelves;
            }),
        );
    }
}
