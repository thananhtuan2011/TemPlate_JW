import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { IResponse, TypeData } from '../models/common.model';
import { CustomActionResult } from '../models/custom-action-result.model';
import { EditOrderRequest, ILedgerWarehouse, Ledger } from '../models/ledger.model';
import AppConstant from '../utilities/app-constants';
import { LedgerCostOfGoods } from '../models/ledger-cost-of-goods.model';

@Injectable({
    providedIn: 'root',
})
export class LedgerService {
    private _prefix = `${AppConstant.DEFAULT_URLS.API}/Ledgers`;
    private _prefixV2 = `${AppConstant.DEFAULT_URLS.API}/v2/ledgers`;
    private _prefixV3 = `${AppConstant.DEFAULT_URLS.API}/v3/ledgers`;
    private _LedgerWarehousesURL = `${AppConstant.DEFAULT_URLS.API}/LedgerWarehouses`;

    constructor(private readonly httpClient: HttpClient) {}

    public getArisingForOriginVoucherNumber(
        orginalVoucherNumber: string,
        isInternal: number,
    ) {
        const url = this._prefixV2;
        const params = {
            orginalVoucherNumber: orginalVoucherNumber,
            isInternal: isInternal,
        };
        return this.httpClient.get(`${url}/arising-for-origin-voucher-number`, {
            params,
        });
    }

    public getListV2(params): Observable<TypeData<Ledger>> {
        const url = this._prefixV2;
        return this.httpClient.get(`${url}`, { params }).pipe(
            map((data: TypeData<Ledger>) => {
                return data;
            }),
        );
    }

    public getListLedgerWarehouses(params): Observable<any> {
        const url = this._LedgerWarehousesURL;
        return this.httpClient.get(`${url}`, { params }).pipe(
            map((data: any) => {
                return data;
            }),
        );
    }

    getLedgersDetailV3(id: any): Observable<IResponse<Ledger[]>> {
        return this.httpClient
            .get(`${this._prefixV3}/${id}`)
            .pipe(map((data) => data as IResponse<Ledger[]>));
    }

    public getLedgerV2(id: number, isInternal: number): Observable<any> {
        const url = `${this._prefixV2}/${id}?isInternal=${isInternal}`;
        return this.httpClient.get(`${url}`);
    }

    public getList(params): Observable<TypeData<Ledger>> {
        return this.httpClient.get(`${this._prefix}`, { params }).pipe(
            map((data: TypeData<Ledger>) => {
                return data;
            }),
        );
    }

    createLedgerV3(ledger: Ledger[]): Observable<CustomActionResult<Ledger>> {
        return this.httpClient.post(this._prefixV3, ledger).pipe(
            map((response: CustomActionResult<Ledger>) => {
                return response;
            }),
        );
    }

    updateLedgerV3(ledgers: Ledger[]): Observable<CustomActionResult<Ledger>> {
        return this.httpClient.put(this._prefixV3, ledgers).pipe(
            map((response: CustomActionResult<Ledger>) => {
                return response;
            }),
        );
    }

    createLedgerV2(ledger: Ledger): Observable<CustomActionResult<Ledger>> {
        return this.httpClient.post(this._prefix, ledger).pipe(
            map((response: CustomActionResult<Ledger>) => {
                return response;
            }),
        );
    }

    async createLedger(ledger: Ledger): Promise<CustomActionResult<Ledger>> {
        const res = await this.httpClient
            .post(this._prefix, ledger)
            .pipe(
                map(
                    (response: CustomActionResult<Ledger>) => {
                        return response;
                    },
                    () => {},
                ),
            )
            .toPromise();
        return res;
    }

    public deleteLedger(
        params,
        isInternal: number,
    ): Observable<CustomActionResult<Ledger>> {
        return this.httpClient
            .delete(`${this._prefix}?isInternal=${isInternal}`, { params })
            .pipe(
                map((res: any) => {
                    return res;
                }),
            );
    }

    async editOrderLedger(model: EditOrderRequest): Promise<any> {
        const url: string = `${this._prefix}/edit-order`;
        return this.httpClient
            .post(url, model)
            .pipe(
                map(
                    (response) => {
                        return response;
                    },
                    (err) => {},
                ),
            )
            .toPromise();
    }

    public getCostOfGoods(
        params: any,
    ): Observable<TypeData<LedgerCostOfGoods>> {
        const url = `${this._prefix}/get-cost-of-goods-page`;
        return this.httpClient.get(url, { params }).pipe(
            map((data: TypeData<LedgerCostOfGoods>) => {
                return data;
            }),
        );
    }

    public createCostOfGoods(params: any, isInternal: any): Observable<any> {
        const url: string = `${this._prefix}/create-cost-of-goods?isInternal=${isInternal}`;
        return this.httpClient.post(url, params).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    public getTotalAmountTax(request: any): Observable<any> {
        const url = `${this._prefix}/get-total-amount-tax`;
        return this.httpClient.post(url, request).pipe(
            map((data: any) => {
                return data.data;
            }),
        );
    }

    public getListLedgerPrint(
        originalVoucherNumber: string,
        isInternal: number,
    ): Observable<any> {
        const params = {
            OrginalVoucherNumber: originalVoucherNumber,
            isInternal: isInternal,
        };
        const url = `${this._prefix}/get-list-ledger-print`;
        return this.httpClient.get(url, { params }).pipe(
            map((data: any) => {
                return data.data;
            }),
        );
    }
}
