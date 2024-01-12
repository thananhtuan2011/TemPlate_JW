import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';

@Injectable({
    providedIn: 'root',
})
export class WarehouseFloorsService {
    private readonly _prefix = `${AppConstant.DEFAULT_URLS.API}/WareHouseFloors`;

    constructor(private readonly httpClient: HttpClient) {}

    public getWareHouseFloorsPaging(
        params: any = null,
    ): Observable<TypeData<any>> {
        return this.httpClient
            .get(`${this._prefix}`, { params })
            .pipe(map((data) => data as TypeData<any>));
    }

    public getWareHouseFloors(params: any = null): Observable<TypeData<any>> {
        return this.httpClient
            .get(`${this._prefix}/list`, { params })
            .pipe(map((data) => data as TypeData<any>));
    }

    public getWareHouseFloorsDetail(id: number): Observable<any> {
        const url: string = `${this._prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((Floors: any) => {
                return Floors;
            }),
        );
    }

    public updateWareHouseFloors(Floors: any, id: number): Observable<any> {
        const url: string = `${this._prefix}/${id}`;
        return this.httpClient.put(url, Floors).pipe(
            map((Floors: any) => {
                return Floors;
            }),
        );
    }

    public createFloors(Floors: any): Observable<any | null> {
        const url: string = `${this._prefix}`;
        return this.httpClient.post(url, Floors).pipe(
            map((Floors: any) => {
                return Floors;
            }),
        );
    }

    public deleteFloors(id: number): Observable<any | null> {
        const url: string = `${this._prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((Floors: any) => {
                return Floors;
            }),
        );
    }
}
