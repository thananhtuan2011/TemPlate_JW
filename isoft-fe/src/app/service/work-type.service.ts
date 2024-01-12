import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TypeData } from '../models/common.model';
import { map } from 'rxjs/operators';
import AppConstant from '../utilities/app-constants';
import { WorkTypeModel } from '../models/work-type.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/TypeWorks`;

@Injectable({
    providedIn: 'root',
})
export class WorkTypeService {
    constructor(private readonly httpClient: HttpClient) {}

    public getPagingWorkTYpe(params: any): Observable<TypeData<WorkTypeModel>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((workType: TypeData<WorkTypeModel>) => {
                return workType;
            }),
        );
    }

    public getWorkTYpeDetail(id: number): Observable<WorkTypeModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((workType: WorkTypeModel) => {
                return workType;
            }),
        );
    }

    public createWorkTYpe(
        workType: WorkTypeModel,
    ): Observable<WorkTypeModel | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, workType).pipe(
            map((workType: WorkTypeModel) => {
                return workType;
            }),
        );
    }

    public updateWorkTYpe(
        workType: WorkTypeModel,
        id: number,
    ): Observable<WorkTypeModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, workType).pipe(
            map((workType: WorkTypeModel) => {
                return workType;
            }),
        );
    }

    public deleteWorkTYpe(id: number): Observable<WorkTypeModel | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((workType: WorkTypeModel) => {
                return workType;
            }),
        );
    }

    public getAllWorkTYpe(): Observable<TypeData<WorkTypeModel>> {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((workType: TypeData<WorkTypeModel>) => {
                return workType;
            }),
        );
    }
}
