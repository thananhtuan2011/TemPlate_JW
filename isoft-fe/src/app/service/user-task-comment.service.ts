import AppConstant from '../utilities/app-constants';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    UserTaskCommentModel,
    UserTaskFileModel,
    UserTaskModel,
} from '../models/workflow.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/UserTaskComment`;
let serverImg = environment.serverURLImage;

@Injectable({
    providedIn: 'root',
})
export class UserTaskCommentService {
    constructor(private readonly httpClient: HttpClient) {}

    public getByTask(params: any): Observable<UserTaskCommentModel[]> {
        return this.httpClient.get(`${_prefix}/GetByTask`, { params }).pipe(
            map((comments: UserTaskCommentModel[]) => {
                return comments;
            }),
        );
    }

    public add(request: any): Observable<UserTaskCommentModel> {
        return this.httpClient.post(`${_prefix}`, request).pipe(
            map((comment: UserTaskCommentModel) => {
                return comment;
            }),
        );
    }

    public update(request: any, id: number): Observable<UserTaskCommentModel> {
        return this.httpClient.put(`${_prefix}/${id}`, request).pipe(
            map((comment: UserTaskCommentModel) => {
                return comment;
            }),
        );
    }

    public uploadFile(formData: any): Observable<UserTaskFileModel> {
        return this.httpClient.post(`${_prefix}/uploadfile`, formData).pipe(
            map((comment: UserTaskFileModel) => {
                return comment;
            }),
        );
    }
}
