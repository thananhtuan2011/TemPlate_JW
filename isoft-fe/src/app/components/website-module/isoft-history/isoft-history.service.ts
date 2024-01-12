import AppConstant from '../../../utilities/app-constants';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TypeData } from '../../../models/common.model';
import { map } from 'rxjs/operators';
import { IsoftHistoryModel } from './isoft-history.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/IsoftHistory`;
// let _prefix = `http://127.0.0.1:5191/api/IsoftHistory`;

@Injectable({
    providedIn: 'root',
})
export class IsoftHistoryService {
    constructor(private readonly httpClient: HttpClient) {}

    public getPagingHistory(
        params: any,
    ): Observable<TypeData<IsoftHistoryModel>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((history: TypeData<IsoftHistoryModel>) => {
                return history;
            }),
        );
    }

    public getHistoryDetail(id: number): Observable<IsoftHistoryModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((history: IsoftHistoryModel) => {
                return history;
            }),
        );
    }

    public createHistory(
        history: IsoftHistoryModel,
    ): Observable<IsoftHistoryModel | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, history).pipe(
            map((history: IsoftHistoryModel) => {
                return history;
            }),
        );
    }

    public updateHistory(
        history: IsoftHistoryModel,
        id: number,
    ): Observable<IsoftHistoryModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, history).pipe(
            map((history: IsoftHistoryModel) => {
                return history;
            }),
        );
    }

    public deleteHistory(id: number): Observable<IsoftHistoryModel | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((history: IsoftHistoryModel) => {
                return history;
            }),
        );
    }
}
