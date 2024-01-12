import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { TypeData } from '../models/common.model';
import { SalarySocial } from '../models/salary-socail.model';
import AppConstant from '../utilities/app-constants';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Users`;
@Injectable({
    providedIn: 'root',
})
export class SalarySocailService {
    constructor(private readonly httpClient: HttpClient) {}

    public getDetail(id: number): Observable<any> {
        return this.httpClient
            .get(`${_prefix}/get-salarey-social-by-id/${id}`, {})
            .pipe(
                map((document: any) => {
                    return document;
                }),
            );
    }

    public getSalarySocial(): Observable<TypeData<SalarySocial>> {
        return this.httpClient.get(`${_prefix}/GetListSalarySocial`).pipe(
            map((Salary: TypeData<SalarySocial>) => {
                return Salary;
            }),
        );
    }

    public UpadateSalarySocial(params): Observable<TypeData<SalarySocial>> {
        return this.httpClient
            .post(`${_prefix}/UpdateSalarySocial`, params)
            .pipe(
                map((Salary: TypeData<SalarySocial>) => {
                    return Salary;
                }),
            );
    }
    public deleteSalaryLevel(id): Observable<TypeData<SalarySocial>> {
        return this.httpClient.delete(`${_prefix}/${id}`, {}).pipe(
            map((Salary: TypeData<SalarySocial>) => {
                return Salary;
            }),
        );
    }
}
