import { Component, OnInit } from '@angular/core';
import { AccountBalanceSheetReportService } from 'src/app/service/account-balance-sheet-report';
import { AuthService } from 'src/app/service/auth.service';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import { AccountingReportService } from 'src/app/service/accounting-report.service';
import AppUtil from 'src/app/utilities/app-util';
@Component({
    selector: 'app-period-overreach-register-receipt-detail',
    templateUrl: './period-register-receipt-detail.component.html',
    styles: [``],
})
export class PeriodOverreachRegisterReceiptDetailComponent implements OnInit {
    appUtil = AppUtil;
    content: string = '';
    types: any = {};
    showTypes: any = [];

    constructor(
        private readonly accountingReportService: AccountingReportService,
        private accountBalanceSheetReportService: AccountBalanceSheetReportService,
        private authService: AuthService,
        private readonly chartOfAccountService: ChartOfAccountService,
    ) {}

    getParams = {
        filterType: null,
        fillFullName: true,
        preparedBy: '',
        dfPreparedBy: '',
        accountCode: '',
        bookDetailType: 2,
        fileType: '',
        isNoiBo: false,
        fromMonth: `${new Date().getMonth() + 1}`,
        toMonth: `${new Date().getMonth() + 1}`,
        fromDate: new Date(),
        toDate: new Date(),
        accountCodeReciprocal: '',
        accountCodeDetail1Reciprocal: '',
        accountCodeDetail2Reciprocal: '',
    };
    ngOnInit(): void {
        this.types = this.appUtil.getAriseReportTypes();
        this.showTypes = [
            'account',
            'accountCodeDetail1',
            'accountCodeDetail2',
            'bookDetailType',
        ];
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
                this.getParams.accountCode = null;
                // this.getParams.bookDetailType = '1';
            });
    }

    onPreview(type) {
        this.getParams.fileType = type;
        this.accountingReportService
            .getReportSctLedgerData({ ...this.getParams })
            .subscribe((res) => {
                if (type != 'html') {
                    console.log(res.data);
                } else {
                    console.log(res.data);
                    this.appUtil.setShowReportReceiptHtml(res.data);
                }
            });
    }

    onPrint(type) {
        this.getParams.fileType = type;
        this.accountingReportService
            .getReportSctLedgerData(this.getParams)
            .subscribe((res) => {
                this.openDownloadFile(res.data, type);
            });
    }

    onPrintExcel(type) {
        this.getParams.fileType = type;
        this.accountingReportService
            .getReportSctLedgerData(this.getParams)
            .subscribe((res) => {
                this.openDownloadFile(res.data, type);
            });
    }
    openDownloadFile(_fileName: string, _ft: string) {
        try {
            var _l =
                this.accountBalanceSheetReportService.getFolderPathDownload(
                    _fileName,
                    _ft,
                );
            if (_l) window.open(_l);
        } catch (ex) {}
    }
}
