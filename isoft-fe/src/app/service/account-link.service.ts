import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import AppConstant from '../utilities/app-constants';

export interface AccountBody {
    id?: number;
    code?: string;
    nullable?: true;
    name?: string;
    account?: string;
    accountName?: string;
    detail1?: string;
    detailName1?: string;
    detail2?: string;
    detailName2?: string;
}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/AccountPay`;
@Injectable({
    providedIn: 'root',
})
export class AccountLinkService {
    constructor(private readonly httpClient: HttpClient) {}

    getListAccount(): Observable<any> {
        return this.httpClient.get(`${_prefix}/GetAll`);
    }

    updateAccount(body: AccountBody): Observable<any> {
        return this.httpClient.put(`${_prefix}/update`, body);
    }
}
