import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { WorkflowStatus } from '../models/workflow-status.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Status`;

@Injectable({
    providedIn: 'root',
})
export class WorkflowStatusService {
    constructor(private readonly httpClient: HttpClient) { }

    public getStatus(
        params: any,
    ): Observable<TypeData<WorkflowStatus>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((workflow: TypeData<WorkflowStatus>) => {
                return workflow;
            }),
        );
    }

    public getAllStatus(params: any): Observable<TypeData<WorkflowStatus>> {
        return this.httpClient.get(`${_prefix}/list`, { params }).pipe(
            map((workflow: TypeData<WorkflowStatus>) => {
                return workflow;
            }),
        );
    }

    public getStatusDetail(id: number): Observable<WorkflowStatus> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((workflow: WorkflowStatus) => {
                return workflow;
            }),
        );
    }

    public createStatus(
        workflowStatus: WorkflowStatus,
    ): Observable<WorkflowStatus | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, workflowStatus).pipe(
            map((workflowStatus: WorkflowStatus) => {
                return workflowStatus;
            }),
        );
    }

    public updateStatus(
        workflowStatus: WorkflowStatus,
    ): Observable<WorkflowStatus> {
        const url: string = `${_prefix}/${workflowStatus.id}`;
        return this.httpClient.put(url, workflowStatus).pipe(
            map((workflowStatus: WorkflowStatus) => {
                return workflowStatus;
            }),
        );
    }

    public deleteStatus(id: number): Observable<WorkflowStatus | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((workflowStatus: WorkflowStatus) => {
                return workflowStatus;
            }),
        );
    }
}