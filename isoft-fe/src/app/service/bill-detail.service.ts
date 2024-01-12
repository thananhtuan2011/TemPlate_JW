import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';
import { BillDetail, BillDetailPrint } from '../models/cashier.model';

export interface PageFilterBillDetail extends Page {}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/BillDetails`;

@Injectable({
    providedIn: 'root',
})
export class BillDetailService {
    constructor(private readonly httpClient: HttpClient) {}

    public saveRefundGoods(billId: number, payload: any): Observable<any> {
        let url: string = `${_prefix}/refund-goods/${billId}`;
        return this.httpClient.put(url, payload).pipe(
            map((res: any) => {
                return res;
            }),
        );
    }

    public getBillDetails(
        billId: number,
    ): Observable<TypeData<BillDetailPrint>> {
        let url: string = `${_prefix}/get-list-by-billId/${billId}`;
        return this.httpClient.get(url).pipe(
            map((billDetail: TypeData<BillDetailPrint>) => {
                return billDetail;
            }),
        );
    }

    public getBillDetailForWarehouses(
        billId: number,
    ): Observable<TypeData<BillDetailPrint>> {
        let url: string = `${_prefix}/get-list-by-billId-for-warehouse/${billId}`;
        return this.httpClient.get(url).pipe(
            map((billDetail: TypeData<BillDetailPrint>) => {
                return billDetail;
            }),
        );
    }

    public createBillDetail(
        billDetail: BillDetail[],
    ): Observable<TypeData<BillDetail>> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, billDetail).pipe(
            map((billDetail: TypeData<BillDetail>) => {
                return billDetail;
            }),
        );
    }

    public updateBillNote(
        billDetails: BillDetail[],
    ): Observable<TypeData<BillDetail>> {
        const url: string = `${_prefix}/note`;
        return this.httpClient.put(url, billDetails).pipe(
            map((billDetails: TypeData<BillDetail>) => {
                return billDetails;
            }),
        );
    }

    public BillGoodsRefund(
        billId: number,
        billDetails: any,
    ): Observable<TypeData<any>> {
        const url: string = `${_prefix}/refund-goods/${billId}`;
        return this.httpClient.put(url, billDetails).pipe(
            map((res: TypeData<any>) => {
                return res;
            }),
        );
    }
}
