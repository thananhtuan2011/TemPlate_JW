import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import AppConstant from '../utilities/app-constants';
import { Page, TypeData } from '../models/common.model';
import { Description } from '../models/description.model';

export interface PageFilterDescription extends Page {
    floorId: number;
    isFloor: string;
}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Descriptions`;

@Injectable({
    providedIn: 'root',
})
export class DescriptionService {
    constructor(private readonly httpClient: HttpClient) {}

    public getPaging(params): Observable<TypeData<Description>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((data: TypeData<Description>) => {
                return data;
            }),
        );
    }

    public getListV2(): Observable<TypeData<Description>> {
        return this.httpClient
            .get(`${AppConstant.DEFAULT_URLS.API}/v2/description`)
            .pipe(
                map((data: TypeData<Description>) => {
                    return data;
                }),
            );
    }

    public getList(): Observable<TypeData<Description>> {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((data: TypeData<Description>) => {
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

    public deleteMany(body): Observable<any> {
        const url: string = `${_prefix}/delete-many`;
        return this.httpClient.post(url, body).pipe(
            map((res) => {
                return res;
            }),
        );
    }
}
