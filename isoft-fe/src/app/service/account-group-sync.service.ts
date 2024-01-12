import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { AccountGroupSyncModel } from '../models/account-group-sync.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/ChartOfAccountGroups`;

@Injectable({
    providedIn: 'root',
})
export class AccountGroupSyncService {
    mockData = false;

    constructor(private readonly httpClient: HttpClient) {}

    get(params: any): Observable<TypeData<AccountGroupSyncModel>> {
        return this.httpClient.get(`${_prefix}`, { params: params }).pipe(
            map((data: TypeData<AccountGroupSyncModel>) => {
                return data;
            }),
        );
    }

    create(data: AccountGroupSyncModel): Observable<any> {
        return this.httpClient.post(`${_prefix}`, data);
    }

    getById(id: number): Observable<AccountGroupSyncModel> {
        return this.httpClient
            .get(`${_prefix}/${id}`)
            .pipe(map((a) => new AccountGroupSyncModel(a)));
    }

    update(id: number, data: AccountGroupSyncModel) {
        return this.httpClient.put(`${_prefix}/${id}`, data);
    }

    delete(id: number) {
        return this.httpClient.delete(`${_prefix}/${id}`);
    }
}
