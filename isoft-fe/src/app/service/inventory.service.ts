import AppConstant from '../utilities/app-constants';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { InventoryModel } from '../models/inventory.model';
import { TypeData } from '../models/common.model';
import { ContractType } from '../models/contract-type.model';
import { environment } from '../../environments/environment';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Inventory`;
let _P_prefix = `${AppConstant.DEFAULT_URLS.API}/P_Inventory`;
const INVENTORY_CACHE = 'INVENTORY_CACHE';

@Injectable({
    providedIn: 'root',
})
export class InventoryService {
    constructor(private readonly httpClient: HttpClient) {}

    async getInventories(): Promise<InventoryModel[]> {
        return this.httpClient
            .get(_prefix)
            .pipe(
                map((res) => {
                    return res as InventoryModel[];
                }),
            )
            .toPromise();
    }

    // updateInventory(request: InventoryModel[]): Observable<any> {
    //     return this.httpClient.post(`${_prefix}/update`, request).pipe(map(res => {
    //         return res
    //     }))
    // }

    getInventoryByDate(params): Observable<TypeData<InventoryModel>> {
        return this.httpClient
            .get(`${_prefix}/get-list-inventory`, { params })
            .pipe(
                map((res) => {
                    return res as TypeData<InventoryModel>;
                }),
            );
    }

    getListDateInventory(): Observable<Date[]> {
        return this.httpClient.get(`${_prefix}/get-list-date-inventory`).pipe(
            map((res) => {
                return res as Date[];
            }),
        );
    }

    /** P_Inventory **/
    getPagingInventory(params: any): Observable<TypeData<any>> {
        return this.httpClient.get(_P_prefix, { params }).pipe(
            map((inventories) => {
                return inventories as TypeData<any>;
            }),
        );
    }

    getGoodInventory(params: any): Observable<any> {
        return this.httpClient
            .get(`${_P_prefix}/get-good-inventory`, { params })
            .pipe(
                map((goods) => {
                    return goods as TypeData<any>;
                }),
            );
    }

    createInventory(request: any): Observable<any> {
        return this.httpClient.post(`${_P_prefix}`, request).pipe(
            map((goods) => {
                return goods;
            }),
        );
    }

    updateInventory(body, id): Observable<any> {
        const url: string = `${_P_prefix}/${id}`;
        return this.httpClient.put(url, body).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    approveInventory(id: number, request: any): Observable<any> {
        const url: string = `${_P_prefix}/accept/${id}`;
        return this.httpClient.put(url, request).pipe(
            map((inventory: any) => {
                return inventory;
            }),
        );
    }

    public deleteInventory(id: number): Observable<any> {
        const url: string = `${_P_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((inventory: any) => {
                return inventory;
            }),
        );
    }

    public getDetail(id: number): Observable<any> {
        const url: string = `${_P_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    public getProcedureNumber(): Observable<any> {
        const url: string = `${_P_prefix}/get-procedure-number`;
        return this.httpClient.get(url, {}).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    exportExcel(id: number): Observable<any> {
        return this.httpClient
            .get(`${_P_prefix}/export-inventory`, { params: { id } })
            .pipe(
                map((res) => {
                    return res;
                }),
            );
    }

    getFolderPathDownload(f: string, t: string): string {
        return (
            environment.serverURL +
            '/api/ReportDownload/DownloadReportFromFile' +
            `?filename=${f}&fileType=${t}`
        );
    }

    storeInventoryCache(inventory: any) {
        console.log('Store inventory cache successfully', inventory);
        localStorage.setItem(INVENTORY_CACHE, JSON.stringify(inventory));
    }

    restoreInventoryCache() {
        let jsonObj = localStorage.getItem(INVENTORY_CACHE);
        return JSON.parse(jsonObj);
    }

    removeInventoryCache() {
        localStorage.removeItem(INVENTORY_CACHE);
    }
}
