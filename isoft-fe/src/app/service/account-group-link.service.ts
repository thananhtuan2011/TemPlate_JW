import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { AccountGroupSyncModel } from '../models/account-group-sync.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/ChartOfAccountGroupLinks`;

@Injectable({
    providedIn: 'root',
})
export class AccountGroupLinkService {
    mockData = false;

    constructor(private readonly httpClient: HttpClient) {}

    availableSelection(): Observable<any> {
        return this.httpClient.get(`${_prefix}/available-selection`);
    }
}
