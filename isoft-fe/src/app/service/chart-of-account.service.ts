import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    ChartAccountModelNew,
    ChartOfAccount,
    ChartOfAccountGroupModel,
    IChartOfAccountSelectionModel,
} from '../models/case.model';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/ChartOfAccounts`;

@Injectable({
    providedIn: 'root',
})
export class ChartOfAccountService {
    constructor(private readonly http: HttpClient) {}

    getPage(param: Page): Observable<TypeData<ChartOfAccount>> {
        return this.http
            .post('/chartofaccount/get-page', param)
            .pipe(map((data) => data as TypeData<ChartOfAccount>));
    }

    getAllByDisplayInsert(): Observable<TypeData<ChartOfAccount>> {
        return this.http
            .get(`${_prefix}/getAllByDisplayInsert`)
            .pipe(map((data) => data as TypeData<ChartOfAccount>));
    }

    getAllCustomer(): Observable<TypeData<ChartOfAccount>> {
        return this.http
            .get(`${_prefix}/selection-customer`)
            .pipe(map((data) => data as TypeData<ChartOfAccount>));
    }

    getAllAccounts(params): Observable<TypeData<ChartOfAccount>> {
        return this.http.get(`${_prefix}/get-chart-accounts`, { params }).pipe(
            map((data: TypeData<ChartOfAccount>) => {
                return data;
            }),
        );
    }

    getAllClassification(params): Observable<TypeData<ChartOfAccount>> {
        return this.http
            .get(`${_prefix}/get-chart-accounts-classification`, { params })
            .pipe(
                map((data: TypeData<ChartOfAccount>) => {
                    return data;
                }),
            );
    }

    getDetails(
        param: Page,
        parentCode: string,
        warehouseCode: string,
    ): Observable<TypeData<ChartOfAccount>[]> {
        return this.http
            .post(
                `/chartofaccount/details/${parentCode}?warehouseCode=${
                    warehouseCode || ''
                }`,
                param,
            )
            .pipe(map((data) => data as TypeData<ChartOfAccount>[]));
    }

    getDetailV2(
        accountCode: string,
        params: any,
    ): Observable<TypeData<ChartOfAccount>> {
        return this.http
            .get(`${_prefix}/details/${accountCode}`, { params })
            .pipe(map((data) => data as TypeData<ChartOfAccount>));
    }

    getDetail(accountCode: string): Observable<TypeData<ChartOfAccount>> {
        return this.http
            .get(`${_prefix}/details/${accountCode}`)
            .pipe(map((data) => data as TypeData<ChartOfAccount>));
    }

    getDetailHasParam(
        accountCode: string,
        params: any,
    ): Observable<TypeData<ChartOfAccount>> {
        return this.http
            .get(`${_prefix}/details/${accountCode}`, { params })
            .pipe(map((data) => data as TypeData<ChartOfAccount>));
    }

    create(param: ChartOfAccount): Observable<any> {
        return this.http.post('/chartofaccount/create', param);
    }

    update(param: ChartOfAccount) {
        return this.http.put('/chartofaccount', param);
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`/chartofaccount/${id}`);
    }

    createGroup(model: ChartOfAccountGroupModel) {
        return this.http.post('/chartofaccount/groups', model);
    }

    deleteGroup(groupId: number) {
        return this.http.delete(`/chartofaccount/groups/${groupId}`);
    }

    getAllGroups(): Observable<ChartOfAccountGroupModel[]> {
        return this.http
            .get('/chartofaccount/groups')
            .pipe(map((data) => data as ChartOfAccountGroupModel[]));
    }

    updateGroupDetails(group: ChartOfAccountGroupModel) {
        return this.http.put(`/chartofaccount/groups`, group);
    }

    getAvailableSelectionData(): Observable<IChartOfAccountSelectionModel[]> {
        return this.http
            .get('/chartofaccount/available-selection')
            .pipe(map((data) => data as IChartOfAccountSelectionModel[]));
    }

    createAccountDetail(model: ChartOfAccount) {
        return this.http.post('/chartofaccount/details', model);
    }

    updateAccountDetail(model: ChartOfAccount) {
        return this.http.put('/chartofaccount/details', model);
    }

    deleteAccountDetail(id: number) {
        return this.http.delete(`/chartofaccount/details/${id}`);
    }

    getAllAccount(): Observable<TypeData<ChartAccountModelNew>> {
        return this.http
            .get('/chartofaccount/GetAllAccount')
            .pipe(map((data) => data as TypeData<ChartAccountModelNew>));
    }

    export(Loai): Observable<HttpResponse<any>> {
        return this.http.get(
            `/chartofaccount/ExportTaiKhoanNoiBo?Loai=${Loai}`,
            { responseType: 'arraybuffer', observe: 'response' },
        );
    }

    exportCT1(code, Loai): Observable<HttpResponse<any>> {
        return this.http.get(
            `/chartofaccount/ExportTaiKhoanNoiBoChiTiet1?code=${code}&Loai=${Loai}`,
            { responseType: 'arraybuffer', observe: 'response' },
        );
    }

    importExcel(formData): Observable<any> {
        return this.http.post('/chartofaccount/importTaiKhoan', formData);
    }

    importExcelCT1(formData, parentCode): Observable<any> {
        return this.http
            .post(`/chartofaccount/importTaiKhoanCT1/${parentCode}`, formData)
            .pipe(
                map((data: any) => {
                    return data;
                }),
            );
    }

    importExcelTaiKhoan(formData, parentCode): Observable<any> {
        return this.http
            .post(`/chartofaccount/importExcelTaiKhoan/${parentCode}`, formData)
            .pipe(
                map((data: any) => {
                    return data;
                }),
            );
    }

    GetListAccountCustomers(
        accGroup,
    ): Observable<TypeData<ChartAccountModelNew>> {
        return this.http
            .get('/chartofaccount/GetListAccountCustomers?accGroup=' + accGroup)
            .pipe(map((data) => data as TypeData<ChartAccountModelNew>));
    }

    UpdateArisingAccount() {
        return this.http.get(`${_prefix}/UpdateArisingAccount`).pipe(
            map((data) => {
                return data;
            }),
        );
    }

    exportArising(): Observable<HttpResponse<any>> {
        return this.http.get(`/chartofaccount/ExportGetAllArisingAccounts`, {
            responseType: 'arraybuffer',
            observe: 'response',
        });
    }

    importExcelArising(formData): Observable<any> {
        return this.http.post(
            '/chartofaccount/ImportFromExcelTaiKhoanArising',
            formData,
        );
    }

    /**
     * ThaiNX
     * @param accountCode
     */

    async getDetail1(
        accountCode: string,
        params?: any,
    ): Promise<TypeData<ChartOfAccount>> {
        const response = await this.http
            .get(`${_prefix}/details/${accountCode}`, { params })
            .pipe(map((data) => data as TypeData<ChartOfAccount>))
            .toPromise();
        return response;
    }

    transferAccount() {
        return this.http.get(`${_prefix}/transfer-account`).pipe(
            map((data) => {
                return data;
            }),
        );
    }
}
