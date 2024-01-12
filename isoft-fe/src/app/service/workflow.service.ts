import AppConstant from '../utilities/app-constants';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TypeData } from '../models/common.model';
import { map } from 'rxjs/operators';
import {
    UserTask,
    UserTaskFileModel,
    UserTaskModel,
    UserTaskModeList,
    UserTaskRequestModel,
    UserTaskStatusModel,
    WorkflowModel,
} from '../models/workflow.model';
import { environment } from '../../environments/environment';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/UserTask`;
let serverImg = environment.serverURLImage;

@Injectable({
    providedIn: 'root',
})
export class WorkflowService {
    constructor(private readonly httpClient: HttpClient) {}

    public add(request: UserTaskModel): Observable<UserTaskModel> {
        return this.httpClient.post(`${_prefix}`, request).pipe(
            map((workflow: UserTaskModel) => {
                return workflow;
            }),
        );
    }

    public copy(id: number): Observable<UserTaskModel> {
        return this.httpClient.post(`${_prefix}/copy/${id}`, null).pipe(
            map((workflow: UserTaskModel) => {
                return workflow;
            }),
        );
    }

    public update(
        id: number,
        request: UserTaskModel,
    ): Observable<UserTaskModel> {
        return this.httpClient.put(`${_prefix}/${id}`, request).pipe(
            map((workflow: UserTaskModel) => {
                return workflow;
            }),
        );
    }

    public delete(id: number): Observable<UserTask> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((workflow: UserTask) => {
                return workflow;
            }),
        );
    }

    public pinTask(id: number): Observable<UserTask> {
        return this.httpClient.post(`${_prefix}/pintask/${id}`, null).pipe(
            map((workflow: UserTask) => {
                return workflow;
            }),
        );
    }

    public statusTask(request: UserTaskStatusModel): Observable<UserTask> {
        return this.httpClient.post(`${_prefix}/statustask`, request).pipe(
            map((workflow: UserTask) => {
                return workflow;
            }),
        );
    }

    public getById(id: number): Observable<UserTaskModel> {
        return this.httpClient.get(`${_prefix}/${id}`).pipe(
            map((workflow: UserTaskModel) => {
                return workflow;
            }),
        );
    }

    public getParentList(): Observable<UserTaskModeList[] | null> {
        return this.httpClient.post(`${_prefix}/getparentlist`, null).pipe(
            map((workflow: UserTaskModeList[]) => {
                return workflow;
            }),
        );
    }

    public getListMode(params: any): Observable<TypeData<UserTaskModeList>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((workflow: TypeData<UserTaskModeList>) => {
                return workflow;
            }),
        );
    }

    public getDueDateMode(params: any): Observable<TypeData<UserTaskModeList>> {
        return this.httpClient.get(`${_prefix}/getduedate`, { params }).pipe(
            map((workflow: TypeData<UserTaskModeList>) => {
                return workflow;
            }),
        );
    }

    public export(request: any): Observable<any> {
        return this.httpClient.post(`${_prefix}/export`, request).pipe(
            map((workflow: any) => {
                return workflow;
            }),
        );
    }

    public uploadFile(formData: any): Observable<UserTaskFileModel> {
        return this.httpClient.post(`${_prefix}/uploadfile`, formData).pipe(
            map((workflow: UserTaskFileModel) => {
                return workflow;
            }),
        );
    }

    public getListProjectParent(
        params: any,
    ): Observable<TypeData<UserTaskModeList>> {
        return this.httpClient
            .get(`${_prefix}/get-list-project-parent`, { params })
            .pipe(
                map((workflow: TypeData<UserTaskModeList>) => {
                    return workflow;
                }),
            );
    }

    public getListProjectChildren(params: any): Observable<UserTaskModeList[]> {
        return this.httpClient
            .get(`${_prefix}/get-list-project-children`, { params })
            .pipe(
                map((workflow: UserTaskModeList[]) => {
                    return workflow;
                }),
            );
    }

    public changeStatusTaskForManager(
        id: number,
        status: number,
    ): Observable<UserTaskModel> {
        return this.httpClient
            .put(
                `${_prefix}/change-status-for-manager?id=${id}&status=${status}`,
                {},
            )
            .pipe(
                map((workflow: UserTaskModel) => {
                    return workflow;
                }),
            );
    }
}
