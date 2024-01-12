import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import AppConstant from '../utilities/app-constants';
import { Page, TypeData } from '../models/common.model';
import { Goods } from '../models/goods.model';
import { AddPriceList } from '../models/add-price-list';
import { UpdatePriceList } from '../models/update-price-list';
import { environment } from 'src/environments/environment';

export interface PageFilterGoods extends Page {
    account: number;
    customerId?: number;
    customerName?: string;
    isCashier?: boolean;
}

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Goods`;
let _prefixCashiers = `${AppConstant.DEFAULT_URLS.API}/ChartOfAccountForCashiers`;

@Injectable({
    providedIn: 'root',
})
export class GoodsService {
    reCallApi = new BehaviorSubject<boolean>(false);
    stateReCallApi$ = this.reCallApi.asObservable();
    setStateCallApi(value: boolean) {
        this.reCallApi.next(value);
    }
    constructor(private readonly httpClient: HttpClient) {}

    public getList(params): Observable<TypeData<Goods>> {
        if (params.floorId === 0) {
            delete params.floorId;
        }
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((data: TypeData<Goods>) => {
                return data;
            }),
        );
    }

    public getListChartOfAccountForCashiser(
        params,
    ): Observable<TypeData<Goods>> {
        if (params.floorId === 0) {
            delete params.floorId;
        }
        return this.httpClient.get(`${_prefixCashiers}`, { params }).pipe(
            map((data: TypeData<Goods>) => {
                return data;
            }),
        );
    }

    public getListNoQuery(): Observable<TypeData<Goods>> {
        return this.httpClient.get(`${_prefix}/list`).pipe(
            map((data: TypeData<Goods>) => {
                return data;
            }),
        );
    }

    public getDetail(id: number): Observable<any> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    public create(body): Observable<any> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, body).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    public update(body, id: number): Observable<any> {
        const url: string = `${_prefix}`;
        return this.httpClient.put(url, body).pipe(
            map((res) => {
                return res;
            }),
        );
    }
    public updateForWebsite(body, id: number): Observable<any> {
        const url: string = `${_prefix}/update-for-website/${id}`;
        return this.httpClient.put(url, body).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    public deleteGoods(id: number): Observable<any> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((res) => {
                return res;
            }),
        );
    }

    uploadFiles(formData): Observable<any> {
        return this.httpClient
            .post(`${_prefix}/uploadImage`, formData, {
                reportProgress: true,
                observe: 'events',
            })
            .pipe(catchError(this.errorMgmt));
    }

    deleteFiles(paths): Observable<any> {
        let data = [];
        for (let i = 0; i < paths.length; i++) {
            data.push({ imageUrl: paths[i] });
        }
        return this.httpClient
            .delete(`${_prefix}/deleteImages`, { body: data })
            .pipe(
                map((imageUrl: string) => {
                    return imageUrl;
                }),
            );
    }

    errorMgmt(error: HttpErrorResponse) {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
            // Get client-side error
            errorMessage = error.error.message;
        } else {
            // Get server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        console.log(errorMessage);
        return throwError(errorMessage);
    }

    addPriceList(body: AddPriceList): Observable<any> {
        return this.httpClient.post(`${_prefix}/copy-price-list`, body);
    }

    updatePriceList(body: UpdatePriceList): Observable<any> {
        return this.httpClient.post(`${_prefix}/update-price-list`, body);
    }

    syncAccountGood(): Observable<any> {
        return this.httpClient.get(`${_prefix}/SyncAccountGood`);
    }

    compareGoodPrice(body): Observable<any> {
        return this.httpClient.post(`${_prefix}/compare-good-price`, body);
    }

    exportExcelListOfGoods(body, isManager: boolean = false): Observable<any> {
        return this.httpClient.post(
            `${_prefix}/export-bkhh?isManager=${isManager}`,
            body,
        );
    }

    exportExcelCompareGoodPrice(body): Observable<any> {
        return this.httpClient.post(
            `${_prefix}/export-compare-good-price`,
            body,
        );
    }

    getFolderPathDownload(f: string, t: string): string {
        var k =
            environment.serverURL +
            '/api/ReportDownload/DownloadReportFromFile' +
            `?filename=${f}&fileType=${t}`;
        return k;
    }

    importExcelListOfGoods(
        body: any[],
        isManager: boolean = false,
    ): Observable<any> {
        return this.httpClient.post(
            `${_prefix}/import-bkhh?isManager=${isManager}`,
            body,
        );
    }

    public checkGoodNew(): Observable<any> {
        return this.httpClient.get(`${_prefix}/check-new-good`).pipe(
            map((data: any) => {
                return data;
            }),
        );
    }

    ReportGoodInWarehouse(params: any) {
        return this.httpClient
            .get(`${_prefix}/report-good-in-warehouse`, { params })
            .pipe(
                map((res: TypeData<any>) => {
                    return res;
                }),
            );
    }

    getGoodPricesByPriceCode(priceCode: string, goodCodes: any[]) {
        return this.httpClient
            .post(`${_prefix}/get-prices-by-price-code/${priceCode}`, goodCodes)
            .pipe(
                map((res: any[]) => {
                    return res;
                }),
            );
    }
}
