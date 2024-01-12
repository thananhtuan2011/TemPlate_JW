import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import AppConstant from '../utilities/app-constants';
import { TypeData } from '../models/common.model';
import {
    DaylyReport,
    Order,
    ProfitBeforeTax,
} from '../models/sell-report.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Ledgers`;

@Injectable({
    providedIn: 'root',
})
export class SellReportServiceService {
    constructor(private readonly httpClient: HttpClient) {}

    exportReportSctLedgerData(params, isNoiBo?: boolean): Observable<any> {
        if (isNoiBo) {
            return this.httpClient.post(
                `${_prefix}/get-report-sct-ledger?isNoiBo=true`,
                params,
            );
        } else {
            return this.httpClient.post(
                `${_prefix}/get-report-sct-ledger?isNoiBo=false`,
                params,
            );
        }
    }

    getFolderPathDownload(f: string, t: string): string {
        var k =
            environment.serverURL +
            '/api/ReportDownload/DownloadReportFromFile' +
            `?filename=${f}&fileType=${t}`;
        return k;
    }

    getProfitBeforeTax(params): Observable<TypeData<ProfitBeforeTax>> {
        return this.httpClient
            .get(
                `${AppConstant.DEFAULT_URLS.API}/Bills/GetListBaoCaoLoiNhuan`,
                { params },
            )
            .pipe(
                map((ProfitBeforeTax: TypeData<ProfitBeforeTax>) => {
                    return ProfitBeforeTax;
                }),
            );
    }

    getDailyReport(params): Observable<TypeData<DaylyReport>> {
        return this.httpClient
            .get(
                `${AppConstant.DEFAULT_URLS.API}/Bills/GetListBaoCaoDoanhThuTheoNgay`,
                { params },
            )
            .pipe(
                map((DailyReport: TypeData<DaylyReport>) => {
                    return DailyReport;
                }),
            );
    }

    getPaymentHistory(params): Observable<TypeData<any>> {
        return this.httpClient
            .get(`${AppConstant.DEFAULT_URLS.API}/Bills`, { params })
            .pipe(
                map((DailyReport: TypeData<any>) => {
                    return DailyReport;
                }),
            );
    }

    getBillDetail(id) {
        return this.httpClient
            .get(`${AppConstant.DEFAULT_URLS.API}/Bills/${id}`, {})
            .pipe(
                map((billDetail: TypeData<DaylyReport>) => {
                    return billDetail;
                }),
            );
    }

    getListCustomer() {
        return this.httpClient
            .get(`${AppConstant.DEFAULT_URLS.API}/Customers/list`, {})
            .pipe(
                map((listCustomer: TypeData<DaylyReport>) => {
                    return listCustomer;
                }),
            );
    }

    getExportBill(params): Observable<any> {
        return this.httpClient.get(
            `${AppConstant.DEFAULT_URLS.API}/Bills/ExportBill`,
            { params },
        );
    }

    getExportBillDetail(params): Observable<any> {
        return this.httpClient.get(
            `${AppConstant.DEFAULT_URLS.API}/Bills/ExportBill-detail`,
            { params },
        );
    }

    getWebsiteOrder(params) {
        return this.httpClient
            .get(`${AppConstant.DEFAULT_URLS.API}/Order`, { params })
            .pipe(
                map((order: TypeData<Order>) => {
                    return order;
                }),
            );
    }

    getBaoCaoDoanhThuTheoNgay(params): Observable<any> {
        const url = `${AppConstant.DEFAULT_URLS.API}/Bills/BaoCaoDoanhThuTheoNgay`;
        return this.httpClient.get(url, { params });
    }

    getBaoCaoLoiNhuanTruThue(params): Observable<any> {
        const url = `${AppConstant.DEFAULT_URLS.API}/Bills/BaoCaoLoiNhuanTruThue`;
        return this.httpClient.get(url, { params });
    }

    getGoodReportSale(params): Observable<any> {
        const url = `${AppConstant.DEFAULT_URLS.API}/Bills/good-report-sale`;
        return this.httpClient.get(url, { params });
    }

    exportGoodReportSale(params): Observable<any> {
        const url = `${AppConstant.DEFAULT_URLS.API}/Bills/export-good-report-sale`;
        return this.httpClient.get(url, { params });
    }

    exportPdfGoodReportSale(params): Observable<any> {
        const url = `${AppConstant.DEFAULT_URLS.API}/Bills/export-pdf-good-report-sale`;
        return this.httpClient.get(url, { params });
    }
    getListCustomerWithCodeName() {
        return this.httpClient
            .get(`${AppConstant.DEFAULT_URLS.API}/Customers/list-code-name`, {})
            .pipe(
                map((listCustomer: TypeData<DaylyReport>) => {
                    return listCustomer;
                }),
            );
    }
    getCustomerForReportBill(params) {
        return this.httpClient
            .get(
                `${AppConstant.DEFAULT_URLS.API}/Bills/customer-for-report-bill`,
                { params },
            )
            .pipe(
                map((listCustomer: TypeData<DaylyReport>) => {
                    return listCustomer;
                }),
            );
    }
    getUserForReportBill(params) {
        return this.httpClient
            .get(`${AppConstant.DEFAULT_URLS.API}/Bills/user-for-report-bill`, {
                params,
            })
            .pipe(
                map((listCustomer: TypeData<DaylyReport>) => {
                    return listCustomer;
                }),
            );
    }
    getChartOfAccountForReportBill(params) {
        return this.httpClient
            .get(
                `${AppConstant.DEFAULT_URLS.API}/Bills/account-for-report-bill`,
                { params },
            )
            .pipe(
                map((listCustomer: TypeData<DaylyReport>) => {
                    return listCustomer;
                }),
            );
    }
}
