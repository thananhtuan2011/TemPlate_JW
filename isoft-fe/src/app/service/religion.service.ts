import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { TypeData } from '../models/common.model';
import { Religion } from '../models/religion.model';
import AppConstant from '../utilities/app-constants';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Religion`;

@Injectable({
    providedIn: 'root',
})
export class ReligionService {
    constructor(private readonly httpClient: HttpClient) {}

    public getListReligion(params: any): Observable<TypeData<Religion>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((Religion: TypeData<Religion>) => {
                return Religion;
            }),
        );
    }

    public getAllReligion(): Observable<any> {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((result: any) => {
                return result;
            }),
        );
    }

    public getReligionDetail(id: number): Observable<Religion> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((Religion: Religion) => {
                return Religion;
            }),
        );
    }

    public createReligion(Religion: Religion): Observable<Religion | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, Religion).pipe(
            map((Religion: Religion) => {
                return Religion;
            }),
        );
    }

    public updateReligion(
        Religion: Religion,
        id: number,
    ): Observable<Religion> {
        console.log(Religion);
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, Religion).pipe(
            map((Religion: Religion) => {
                return Religion;
            }),
        );
    }

    public deleteReligion(id: number): Observable<Religion | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((Religion: Religion) => {
                return Religion;
            }),
        );
    }
}
