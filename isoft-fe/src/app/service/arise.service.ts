import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Arise, AriseSelectList } from '../models/arise.model';
import { SearchPageArise, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
@Injectable({
    providedIn: 'root',
})
export class AriseService {
    private readonly _baseUrl = AppConstant.DEFAULT_URLS.API;
    constructor(private readonly httpClient: HttpClient) {}

    public getArises(param: SearchPageArise): Observable<TypeData<Arise>> {
        const url: string = this._baseUrl + '/Invoices/getall';
        return this.httpClient.post(url, param).pipe(
            map((ariseManager: TypeData<Arise>) => {
                return ariseManager;
            }),
        );
    }

    public getAriseWithID(Id: String): Observable<Arise> {
        const url: string = this._baseUrl + `/Invoices/${Id}`;
        return this.httpClient.post(url, {}).pipe(
            map((ariseManager: Arise) => {
                return ariseManager;
            }),
        );
    }

    public getSelectList(): Observable<TypeData<AriseSelectList>> {
        const url: string = this._baseUrl + `/Invoices/selectlist`;
        return this.httpClient.post(url, {}).pipe(
            map((arisetmp: TypeData<AriseSelectList>) => {
                return arisetmp;
            }),
        );
    }

    public getSelectListWithId(
        id: string,
    ): Observable<TypeData<AriseSelectList>> {
        const url: string = this._baseUrl + `/Invoices/selectlist/${id}`;
        return this.httpClient.post(url, {}).pipe(
            map((arisetmp: TypeData<AriseSelectList>) => {
                return arisetmp;
            }),
        );
    }

    public createArise(ariseManager: Arise): Observable<Arise | null> {
        const url: string = this._baseUrl + '/Invoices/save';
        return this.httpClient.post(url, ariseManager).pipe(
            map((ariseManager: Arise) => {
                return ariseManager;
            }),
        );
    }

    public updateArise(Id, ariseManager: Arise): Observable<Arise> {
        const url: string = this._baseUrl + `/Invoices/save/${Id}`;
        return this.httpClient.post(url, ariseManager).pipe(
            map((ariseManager: Arise) => {
                return ariseManager;
            }),
        );
    }

    public deleteArise(param): Observable<Arise | null> {
        const url: string = this._baseUrl + `/Invoices/deleteListIds`;
        return this.httpClient.post(url, param).pipe(
            map((ariseManager: Arise) => {
                return ariseManager;
            }),
        );
    }
}
