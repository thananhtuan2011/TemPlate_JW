import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { CustomerContactHistory } from '../models/customer-contact-history.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/CustomerContactHistories`;

export interface PageFilterCustomerContactHistory extends Page {
    customerId?: number;
    fromDate?: string | Date;
    toDate?: string | Date;
    jobId?: number;
    status?: number;
}

@Injectable({
    providedIn: 'root',
})
export class CustomerContactHistoryService {
    constructor(private readonly httpClient: HttpClient) {}

    public getCustomerContactHistory(
        params: any,
    ): Observable<TypeData<CustomerContactHistory>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((customer: TypeData<CustomerContactHistory>) => {
                return customer;
            }),
        );
    }

    public getCustomerContactHistoryByCustomer(
        params: any,
    ): Observable<TypeData<CustomerContactHistory>> {
        return this.httpClient
            .get(`${_prefix}/get-by-customer`, { params })
            .pipe(
                map((customer: TypeData<CustomerContactHistory>) => {
                    return customer;
                }),
            );
    }

    public getAllCustomerContactHistory(): Observable<
        TypeData<CustomerContactHistory>
    > {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((customer: TypeData<CustomerContactHistory>) => {
                return customer;
            }),
        );
    }

    public getCustomerContactHistoryDetail(
        id: number,
    ): Observable<CustomerContactHistory> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((customer: CustomerContactHistory) => {
                return customer;
            }),
        );
    }

    public createCustomerContactHistory(
        customer: FormData,
    ): Observable<CustomerContactHistory | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, customer).pipe(
            map((customer: CustomerContactHistory) => {
                return customer;
            }),
        );
    }

    public updateCustomerContactHistory(
        customer: FormData,
        id: number,
    ): Observable<CustomerContactHistory> {
        console.log(customer);
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, customer).pipe(
            map((customer: CustomerContactHistory) => {
                return customer;
            }),
        );
    }

    public getCustomerContacts(customerId: number): Observable<any> {
        return this.httpClient
            .get(`${_prefix}/contacts-for-customer`, { params: { customerId } })
            .pipe(
                map((res: TypeData<any>) => {
                    return res.data;
                }),
            );
    }

    public addNewContact(customerId: number, payload: any): Observable<any> {
        let url = `${_prefix}/contacts-for-customer/${customerId}`;
        return this.httpClient.post(url, payload).pipe(
            map((res: any) => {
                return res;
            }),
        );
    }


    getCustomerContactNotification(): Observable<any> {
        return this.httpClient
            .get(`${_prefix}/customer-contact-notification`)
            .pipe(
                map((res: any) => {
                    return res;
                }),
            );
    }

    public getCountCustomerContact(): Observable<number> {
        return this.httpClient
            .get(`${_prefix}/count-customer-contact`)
            .pipe(
                map((count: number) => {
                    return count;
                }),
            );
    }
}
