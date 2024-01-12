import { Component, OnInit } from '@angular/core';
import AppUtil from '../../../../utilities/app-util';
import { AccountingReportService } from '../../../../service/accounting-report.service';
import { AccountBalanceSheetReportService } from '../../../../service/account-balance-sheet-report';
import { AuthService } from '../../../../service/auth.service';
import { ChartOfAccountService } from '../../../../service/chart-of-account.service';
import { ReportTaxService } from '../../../../service/report-tax.service';
import * as saveFile from 'file-saver';
import { environment } from '../../../../../environments/environment';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-value-add-tax',
    templateUrl: './value-add-tax.component.html',
    styleUrls: [],
})
export class ValueAddTaxComponent implements OnInit {
    appUtil = AppUtil;
    content: string = '';
    types: any = {};
    showTypes: any = [];

    getParams = {
        filterType: null,
        fillFullName: true,
        preparedBy: '',
        dfPreparedBy: '',
        accountCode: '',
        fileType: '',
        isNoiBo: false,
        fromMonth: `${new Date().getMonth() + 1}`,
        toMonth: `${new Date().getMonth() + 1}`,
        fromDate: new Date(),
        toDate: new Date(),
    };

    constructor(
        private readonly accountingReportService: AccountingReportService,
        private accountBalanceSheetReportService: AccountBalanceSheetReportService,
        private authService: AuthService,
        private readonly chartOfAccountService: ChartOfAccountService,
        private readonly reportTaxService: ReportTaxService,
    ) {}

    ngOnInit(): void {
        this.types = this.appUtil.getAriseReportTypes();
        this.showTypes = ['exportXML', 'taxVat'];
        this.getChartOfAccounts();
        this.getParams.preparedBy = this.authService.user.fullname;
        this.getParams.dfPreparedBy = this.authService.user.fullname;
    }

    // get list chart of account
    getChartOfAccounts() {
        this.chartOfAccountService
            .getAllByDisplayInsert()
            .subscribe((res: any) => {
                this.types.chartOfAccounts = res;
                // this.getParams.accountCode = this.types.chartOfAccounts[0].code;
                this.getParams.accountCode = null;
            });
    }

    onPreview(type) {
        this.getParams.fileType = type;
        this.reportTaxService
            .getData({
                ...this.getParams,
            })
            .subscribe((res) => {
                this.appUtil.setShowReportReceiptHtml(res.data);
            });
    }

    onExportPDF(type) {
        this.getParams.fileType = type;
        this.reportTaxService
            .getData({
                ...this.getParams,
            })
            .subscribe((res) => {
                AppUtil.openDownloadFile(res.data, type);
            });
    }

    onPrintXML(type) {
        this.reportTaxService.exportReportXML().subscribe((res) => {
            const url = `${environment.serverURL}/api/ReportDownload/DownloadReportFromFile?filename=${res.data}&fileType=xml`;
            fetch(url)
                .then((res) => res.blob())
                .then((result) => {
                    saveFile(
                        result,
                        `BaoCaoThue_${new DatePipe('en_US').transform(
                            new Date(),
                            'yyyyMMddHHmmss',
                        )}.xml`,
                    );
                });
        });
    }
}
