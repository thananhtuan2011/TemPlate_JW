import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';

@Injectable({
    providedIn: 'root',
})
export class WarehousePositionsService {
    private readonly _prefix = `${AppConstant.DEFAULT_URLS.API}/WareHousePositions`;

    constructor(private readonly httpClient: HttpClient) {}

    public getWareHousePositionsPaging(
        params: any = null,
    ): Observable<TypeData<any>> {
        return this.httpClient
            .get(`${this._prefix}`, { params })
            .pipe(map((data) => data as TypeData<any>));
    }

    public getWareHousePositions(
        params: any = null,
    ): Observable<TypeData<any>> {
        return this.httpClient
            .get(`${this._prefix}/list`, { params })
            .pipe(map((data) => data as TypeData<any>));
    }

    public getWareHousePositionsDetail(id: number): Observable<any> {
        const url: string = `${this._prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((Positions: any) => {
                return Positions;
            }),
        );
    }

    public updateWareHousePositions(
        Positions: any,
        id: number,
    ): Observable<any> {
        const url: string = `${this._prefix}/${id}`;
        return this.httpClient.put(url, Positions).pipe(
            map((Positions: any) => {
                return Positions;
            }),
        );
    }

    public createPositions(Positions: any): Observable<any | null> {
        const url: string = `${this._prefix}`;
        return this.httpClient.post(url, Positions).pipe(
            map((Positions: any) => {
                return Positions;
            }),
        );
    }

    public deletePositions(id: number): Observable<any | null> {
        const url: string = `${this._prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((Positions: any) => {
                return Positions;
            }),
        );
    }
}
