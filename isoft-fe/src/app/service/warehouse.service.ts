import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TypeData } from '../models/common.model';
import { Warehouse } from '../models/warehouse.model';
import AppConstant from '../utilities/app-constants';

@Injectable({
    providedIn: 'root',
})
export class WarehouseService {
    private readonly _prefix = `${AppConstant.DEFAULT_URLS.API}/warehouses`;

    constructor(private readonly httpClient: HttpClient) {}

    public getWarehouse(params: any): Observable<TypeData<Warehouse>> {
        return this.httpClient.get(this._prefix, { params }).pipe(
            map((warehouse: TypeData<Warehouse>) => {
                return warehouse;
            }),
        );
    }

    public getAll(): Observable<TypeData<Warehouse>> {
        return this.httpClient
            .get(`${this._prefix}/list`, {})
            .pipe(map((data) => data as TypeData<Warehouse>));
    }

    public getDetail(id: number): Observable<Warehouse> {
        return this.httpClient.get(`${this._prefix}/${id}`, {}).pipe(
            map((warehouse: Warehouse) => {
                return warehouse;
            }),
        );
    }

    public createWarehouse(warehouse: Warehouse): Observable<Warehouse | null> {
        return this.httpClient.post(this._prefix, warehouse).pipe(
            map((warehouse: Warehouse) => {
                return warehouse;
            }),
        );
    }

    public updateWarehouse(
        id: number,
        warehouse: Warehouse,
    ): Observable<Warehouse> {
        return this.httpClient.put(`${this._prefix}/${id}`, warehouse).pipe(
            map((warehouse: Warehouse) => {
                return warehouse;
            }),
        );
    }

    public deleteWarehouse(id: number): Observable<Warehouse | null> {
        return this.httpClient.delete(`${this._prefix}/${id}`, {}).pipe(
            map((warehouse: Warehouse) => {
                return warehouse;
            }),
        );
    }

    public getWareHouseShelves(): Observable<TypeData<any>> {
        return this.httpClient
            .get(`${AppConstant.DEFAULT_URLS.API}/WareHouseShelves/list`, {})
            .pipe(map((data) => data as TypeData<any>));
    }
    public getPositions(): Observable<TypeData<any>> {
        return this.httpClient
            .get(`${AppConstant.DEFAULT_URLS.API}/WareHousePositions/list`, {})
            .pipe(map((data) => data as TypeData<any>));
    }

    public getDeskFloors(): Observable<TypeData<any>> {
        return this.httpClient
            .get(`${AppConstant.DEFAULT_URLS.API}/WareHouseFloors/list`, {})
            .pipe(map((data) => data as TypeData<any>));
    }
}
