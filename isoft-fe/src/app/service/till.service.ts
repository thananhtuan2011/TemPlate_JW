import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { SurchargeModel } from '../models/sur-charge.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/TillManagers`;

@Injectable({
    providedIn: 'root',
})
export class TillService {
    constructor(private readonly httpClient: HttpClient) {}
    public getTills(params: any): Observable<TypeData<SurchargeModel>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((till: TypeData<SurchargeModel>) => {
                return till;
            }),
        );
    }

    public getTillDetail(id: number): Observable<SurchargeModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((customer: SurchargeModel) => {
                return customer;
            }),
        );
    }

    public createTill(
        customer: SurchargeModel,
    ): Observable<SurchargeModel | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, customer).pipe(
            map((customer: SurchargeModel) => {
                return customer;
            }),
        );
    }

    public updateTill(
        customer: SurchargeModel,
        id: number,
    ): Observable<SurchargeModel> {
        console.log(customer);
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, customer).pipe(
            map((customer: SurchargeModel) => {
                return customer;
            }),
        );
    }

    public deleteTill(id: number): Observable<SurchargeModel | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((customer: SurchargeModel) => {
                return customer;
            }),
        );
    }

    public getCurrentTill() {
        const url: string = `${_prefix}/get-current-till`;
        return this.httpClient.get(url, {}).pipe(
            map((customer: SurchargeModel) => {
                return customer;
            }),
        );
    }

    public startOfShift(body): Observable<TypeData<SurchargeModel>> {
        return this.httpClient.post(`${_prefix}`, body).pipe(
            map((till: TypeData<SurchargeModel>) => {
                return till;
            }),
        );
    }
    public endOfShift(): Observable<TypeData<SurchargeModel>> {
        return this.httpClient.post(`${_prefix}`, {}).pipe(
            map((till: TypeData<SurchargeModel>) => {
                return till;
            }),
        );
    }
}
