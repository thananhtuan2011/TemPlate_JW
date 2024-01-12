import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { MainColor } from '../models/main-color.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/MainColors`;

@Injectable({
    providedIn: 'root',
})
export class MainColorService {
    constructor(private readonly httpClient: HttpClient) {}

    public getMainColor(params: any): Observable<TypeData<MainColor>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((mainColor: TypeData<MainColor>) => {
                return mainColor;
            }),
        );
    }

    public getAllMainColor(): Observable<TypeData<MainColor>> {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((mainColor: TypeData<MainColor>) => {
                return mainColor;
            }),
        );
    }

    public getMainColorDetail(id: number): Observable<MainColor> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((mainColor: MainColor) => {
                return mainColor;
            }),
        );
    }

    public getMainColorByUser(): Observable<MainColor> {
        const url: string = `${_prefix}/get-by-user`;
        return this.httpClient.get(url, {}).pipe(
            map((mainColor: MainColor) => {
                return mainColor;
            }),
        );
    }

    public createMainColor(mainColor: MainColor): Observable<MainColor | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, mainColor).pipe(
            map((mainColor: MainColor) => {
                return mainColor;
            }),
        );
    }

    public updateMainColor(
        mainColor: MainColor,
        id: number,
    ): Observable<MainColor> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, mainColor).pipe(
            map((mainColor: MainColor) => {
                return mainColor;
            }),
        );
    }

    public deleteMainColor(id: number): Observable<MainColor | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((mainColor: MainColor) => {
                return mainColor;
            }),
        );
    }
}
