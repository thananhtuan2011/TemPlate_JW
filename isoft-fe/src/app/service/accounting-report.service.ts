import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import AppConstant from '../utilities/app-constants';
import { map } from 'rxjs/operators';
import { TypeData } from '../models/common.model';

let _prefix = `${AppConstant.DEFAULT_URLS.URL}`;

@Injectable({
    providedIn: 'root',
})
export class AccountingReportService {
    constructor(private readonly httpClient: HttpClient) { }

    getReportReceiptData(params): Observable<any> {
        return this.httpClient.post(
            `${_prefix}/VoucherReport/get-report-voucher`,
            params,
        );

    }

    getReportTransactionData(params, isNoiBo?: boolean): Observable<any> {
        if (isNoiBo) {
            return this.httpClient.post(
                `${_prefix}/api/TransactionListReport/get-report-transaction?isNoiBo=true`,
                params,
            );
        } else {
            return this.httpClient.post(
                `${_prefix}/api/TransactionListReport/get-report-transaction?isNoiBo=false`,
                params,
            );
        }
    }

    getReportLedgerData(params, isNoiBo?: boolean): Observable<any> {
        if (isNoiBo) {
            return this.httpClient.post(
                `${_prefix}/api/Ledgers/get-report-ledger?isNoiBo=true`,
                params,
            );
        } else {
            return this.httpClient.post(
                `${_prefix}/api/Ledgers/get-report-ledger?isNoiBo=false`,
                params,
            );
        }
    }

    getReportDkctgsLedgerData(params, isNoiBo?: boolean): Observable<any> {
        if (isNoiBo) {
            return this.httpClient.post(
                `${_prefix}/api/Ledgers/get-report-dkctgs-ledger?isNoiBo=true`,
                params,
            );
        } else {
            return this.httpClient.post(
                `${_prefix}/api/Ledgers/get-report-dkctgs-ledger?isNoiBo=false`,
                params,
            );
        }
    }

    getReportSctLedgerData(params, isNoiBo?: boolean): Observable<any> {
        if (isNoiBo) {
            return this.httpClient.post(
                `${_prefix}/api/Ledgers/get-report-sct-ledger?isNoiBo=true`,
                params,
            );
        } else {
            return this.httpClient.post(
                `${_prefix}/api/Ledgers/get-report-sct-ledger?isNoiBo=false`,
                params,
            );
        }
    }

    getListTaxCode(request): Observable<TypeData<any>> {
        return this.httpClient
            .post(
                `${_prefix}/api/TransactionListReport/get-list-taxcode`,
                request,
            )
            .pipe(
                map((res) => {
                    return res as TypeData<any>;
                }),
            );
    }
}
