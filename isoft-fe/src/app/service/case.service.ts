import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import {
    Case,
    CaseListLastestCase,
    CaseSelectList,
    ChartOfAccount,
    ChartOfAccount_ForDropDownBookDetail,
} from '../models/case.model';
import { Page, TypeData } from '../models/common.model';
import AppConstant from '../utilities/app-constants';

@Injectable({
    providedIn: 'root',
})
export class CaseService {
    private readonly _baseUrl = AppConstant.DEFAULT_URLS.API;
    constructor(private readonly httpClient: HttpClient) {}

    public getCases(param: Page): Observable<TypeData<Case>> {
        const url: string = this._baseUrl + '/cases';
        return this.httpClient.post(url, param).pipe(
            map((caseManager: TypeData<Case>) => {
                return caseManager;
            }),
        );
    }

    public getCaseWithID(Id: String): Observable<Case> {
        const url: string = this._baseUrl + `/cases/${Id}`;
        return this.httpClient.post(url, {}).pipe(
            map((caseManager: Case) => {
                return caseManager;
            }),
        );
    }

    public getSelectList(
        checkNorm: boolean = false,
        checkArise: boolean = false,
        parentId: string = '',
        Type: number = 0,
        HasChild: boolean = true,
    ): Observable<TypeData<CaseSelectList>> {
        const url: string = this._baseUrl + `/cases/selectlist`;
        return this.httpClient
            .post(url, { checkNorm, checkArise, parentId, Type, HasChild })
            .pipe(
                map((casetmp: TypeData<CaseSelectList>) => {
                    return casetmp;
                }),
            );
    }

    public getSelectListArise(
        param: any,
    ): Observable<TypeData<CaseSelectList>> {
        const url: string = this._baseUrl + `/cases/selectlist`;
        return this.httpClient.post(url, param).pipe(
            map((casetmp: TypeData<CaseSelectList>) => {
                return casetmp;
            }),
        );
    }
    ///
    public getListCommodity(): Observable<ChartOfAccount[]> {
        const url: string = this._baseUrl + `/ChartOfAccount/GetListCommodity`;
        return this.httpClient.get(url, {}).pipe(
            map((casetmp: ChartOfAccount[]) => {
                return casetmp;
            }),
        );
    }

    public getListCommodityLV1(
        parentCode: string = '',
    ): Observable<ChartOfAccount[]> {
        const url: string =
            this._baseUrl + `/ChartOfAccount/GetListCommodityLV1/${parentCode}`;
        return this.httpClient.get(url, {}).pipe(
            map((casetmp: ChartOfAccount[]) => {
                return casetmp;
            }),
        );
    }

    public getListCommodityLV2(
        parentCode: string = '',
    ): Observable<ChartOfAccount[]> {
        const url: string =
            this._baseUrl + `/ChartOfAccount/GetListCommodityLV2/${parentCode}`;
        return this.httpClient.get(url, {}).pipe(
            map((casetmp: ChartOfAccount[]) => {
                return casetmp;
            }),
        );
    }
    ////
    public getListLastestCase(): Observable<TypeData<CaseListLastestCase>> {
        const url: string = this._baseUrl + `/cases/getlistlastestcase`;
        return this.httpClient.get(url, {}).pipe(
            map((casetmp: TypeData<CaseListLastestCase>) => {
                return casetmp;
            }),
        );
    }

    public getListDetailsDisplayInsertCase(
        page: Page,
        parentCode: string,
        currentInput: string = '',
    ): Observable<TypeData<ChartOfAccount>> {
        const url: string =
            this._baseUrl + `/ChartOfAccount/details/${parentCode}`;
        page.searchText = currentInput;
        return this.httpClient.post(url, page).pipe(
            map((casetmp: TypeData<ChartOfAccount>) => {
                return casetmp;
            }),
        );
    }

    public getListChartOfAccount(
        code: string = '',
    ): Observable<ChartOfAccount[]> {
        let url: string = this._baseUrl + `/ChartOfAccount/get-chart-accounts`;
        if (code && code.length > 0) {
            url += '?code=' + code;
        }
        return this.httpClient.get(url, {}).pipe(
            map((casetmp: ChartOfAccount[]) => {
                return casetmp;
            }),
        );
    }

    public getListChartOfAccountByClassification(
        classifications: number[],
    ): Observable<ChartOfAccount[]> {
        let url: string =
            this._baseUrl +
            `/ChartOfAccount/get-chart-accounts-classification?`;
        if (classifications && classifications.length > 0) {
            url += Object.keys(classifications)
                .map((key) => 'classification' + '=' + classifications[key])
                .join('&');
        }

        return this.httpClient.get(url, {}).pipe(
            map((casetmp: ChartOfAccount[]) => {
                return casetmp;
            }),
        );
    }

    public getListChartOfAccount_ForReportLedger(
        code: string = '',
    ): Observable<ChartOfAccount[]> {
        let url: string =
            this._baseUrl +
            `/ChartOfAccount/get-chart-accounts-for-ledger-report`;
        if (code && code.length > 0) {
            url += '?code=' + code;
        }
        return this.httpClient.get(url, {}).pipe(
            map((casetmp: ChartOfAccount[]) => {
                return casetmp;
            }),
        );
    }

    public getListChartOfAccount_ForBookDetailReport(
        code: string = '',
    ): Observable<ChartOfAccount_ForDropDownBookDetail[]> {
        let url: string =
            this._baseUrl +
            `/ChartOfAccount/get-chart-accounts-for-book-detail-reoport`;
        if (code && code.length > 0) {
            url += '?code=' + code;
        }
        return this.httpClient.get(url, {}).pipe(
            map((casetmp: ChartOfAccount_ForDropDownBookDetail[]) => {
                return casetmp;
            }),
        );
    }

    // public getListChartOfAccountOne(): Observable<TypeData<ChartOfAccounts1>> {
    //     const url: string = `/ChartOfAccountOne/get-all`;
    //     return this.httpClient.get(url, {}).pipe(
    //         map((casetmp: TypeData<ChartOfAccounts1>) => {
    //             return casetmp;
    //         })
    //     );
    // }

    // public getListDetailsCharOfAccountOne(page: Page, parentCode : string): Observable<TypeData<ChartOfAccounts1>> {
    //     const url: string = `/ChartOfAccountOne/details/${parentCode}`;
    //     return this.httpClient.post(url, page).pipe(
    //         map((casetmp: TypeData<ChartOfAccounts1>) => {
    //             return casetmp;
    //         })
    //     );
    // }

    public getChildCase(id, type): Observable<TypeData<ChartOfAccount>> {
        const url: string =
            this._baseUrl +
            `/ChartOfAccount/getAllWithParentID?parentId=` +
            id +
            `&type=` +
            type;
        return this.httpClient.post(url, {}).pipe(
            map((casetmp: TypeData<ChartOfAccount>) => {
                return casetmp;
            }),
        );
    }

    public getSelectListWithId(
        id: string,
    ): Observable<TypeData<CaseSelectList>> {
        const url: string = this._baseUrl + `/cases/selectlist/${id}`;
        return this.httpClient.post(url, {}).pipe(
            map((casetmp: TypeData<CaseSelectList>) => {
                return casetmp;
            }),
        );
    }

    public createCase(caseManager: Case): Observable<Case | null> {
        const url: string = this._baseUrl + '/Cases/save';
        return this.httpClient.post(url, caseManager).pipe(
            map((caseManager: Case) => {
                return caseManager;
            }),
        );
    }

    public updateCase(Id: string, caseManager: Case): Observable<Case> {
        const url: string = this._baseUrl + `/cases/save/${Id}`;
        return this.httpClient.post(url, caseManager).pipe(
            map((caseManager: Case) => {
                return caseManager;
            }),
        );
    }

    public deleteCase(Id: String): Observable<Case | null> {
        const url: string = this._baseUrl + `/cases/delete/${Id}`;
        return this.httpClient.post(url, {}).pipe(
            map((caseManager: Case) => {
                return caseManager;
            }),
        );
    }

    public getListLastestExceptGroupCase(): Observable<
        TypeData<CaseSelectList>
    > {
        const url: string =
            this._baseUrl + `/cases/getListLastestExceptGroupCase`;
        return this.httpClient.get(url).pipe(
            map((casetmp: TypeData<CaseSelectList>) => {
                return casetmp;
            }),
        );
    }
}
