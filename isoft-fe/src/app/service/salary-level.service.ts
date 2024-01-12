import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { TypeData } from '../models/common.model';
import { SalaryLevel } from '../models/salary-level.model';
import AppConstant from '../utilities/app-constants';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/SalaryLevel`;
@Injectable({
    providedIn: 'root',
})
export class SalaryLevelService {
    constructor(private readonly httpClient: HttpClient) {}

    public getSalaryLevel(params: any): Observable<TypeData<SalaryLevel>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((Salary: TypeData<SalaryLevel>) => {
                return Salary;
            }),
        );
    }

    public postSalaryLevel(params: any): Observable<TypeData<SalaryLevel>> {
        return this.httpClient.post(`${_prefix}`, params).pipe(
            map((Salary: TypeData<SalaryLevel>) => {
                return Salary;
            }),
        );
    }
    public putSalaryLevel(id: any, params): Observable<TypeData<SalaryLevel>> {
        return this.httpClient.put(`${_prefix}/${id}`, params).pipe(
            map((Salary: TypeData<SalaryLevel>) => {
                return Salary;
            }),
        );
    }
    public deleteSalaryLevel(id): Observable<TypeData<SalaryLevel>> {
        return this.httpClient.delete(`${_prefix}/${id}`, {}).pipe(
            map((Salary: TypeData<SalaryLevel>) => {
                return Salary;
            }),
        );
    }
}
