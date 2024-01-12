import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { BillDetail } from '../models/cashier.model';
import { BillHistoryCollection } from '../models/customer.model';

export interface PageFilterBillDetail extends Page {}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/BillHistoryCollections`;

@Injectable({
    providedIn: 'root',
})
export class BillHistoryCollectionsService {
    constructor(private readonly httpClient: HttpClient) {}

    public getBillHistoryCollections(): Observable<
        TypeData<BillHistoryCollection>
    > {
        let url: string = `${_prefix}`;
        return this.httpClient.get(url).pipe(
            map((billHistoryCollections: TypeData<BillHistoryCollection>) => {
                return billHistoryCollections;
            }),
        );
    }

    public createBillHistoryCollections(
        billDetail: BillDetail[],
    ): Observable<TypeData<BillHistoryCollection>> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, billDetail).pipe(
            map((billDetail: TypeData<BillHistoryCollection>) => {
                return billDetail;
            }),
        );
    }

    public updateBillHistoryCollections(
        billDetails: BillDetail[],
    ): Observable<TypeData<BillHistoryCollection>> {
        const url: string = `${_prefix}/note`;
        return this.httpClient.put(url, billDetails).pipe(
            map((billDetails: TypeData<BillHistoryCollection>) => {
                return billDetails;
            }),
        );
    }
    public updateStatus(
        billDetails: any,
    ): Observable<TypeData<BillHistoryCollection>> {
        console.log(billDetails);
        const url: string = `${_prefix}`;
        return this.httpClient.put(url, billDetails).pipe(
            map((billDetails: TypeData<BillHistoryCollection>) => {
                return billDetails;
            }),
        );
    }
}
