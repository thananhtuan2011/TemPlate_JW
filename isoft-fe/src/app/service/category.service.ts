import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import AppConstant from '../utilities/app-constants';
import { Page, TypeData } from '../models/common.model';
import { Category } from '../models/category.model';
import { environment } from 'src/environments/environment';

export interface PageFilterCategory extends Page {
    type: number;
}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Category`;

@Injectable({
    providedIn: 'root',
})
export class CategoryService {
    constructor(private readonly httpClient: HttpClient) {}

    public getPaging(params): Observable<TypeData<Category>> {
        if (params.floorId === 0) {
            delete params.floorId;
        }
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((data: TypeData<Category>) => {
                return data;
            }),
        );
    }
    public getAll(): Observable<TypeData<Category>> {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((data: TypeData<Category>) => {
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

    public checkExistInGoodsAsync(code: string): Observable<boolean> {
        const url: string = `${_prefix}/${code}/goods/existing`;
        return this.httpClient.get(url).pipe(
            map((res: boolean) => {
                return res;
            }),
        );
    }

    public deleteCategory(id: number): Observable<any> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    public import(data): Observable<any> {
        const url: string = `${_prefix}/import`;
        return this.httpClient.post(url, data).pipe(
            map((res) => {
                return res;
            }),
        );
    }
    public export(type: number): Observable<any> {
        const url: string = `${_prefix}/export?type=${type}`;
        return this.httpClient.get(url, {}).pipe(
            map((res) => {
                return res;
            }),
        );
    }
    getFolderPathDownload(f: string, t: string): string {
        var k =
            environment.serverURL +
            '/api/ReportDownload/DownloadReportFromFile' +
            `?filename=${f}&fileType=${t}`;
        return k;
    }
}
