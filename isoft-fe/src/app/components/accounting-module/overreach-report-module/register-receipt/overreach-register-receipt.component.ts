import { Component, OnInit } from '@angular/core';
import { AccountBalanceSheetReportService } from 'src/app/service/account-balance-sheet-report';
import { AuthService } from 'src/app/service/auth.service';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import { AccountingReportService } from 'src/app/service/accounting-report.service';
import AppUtil from 'src/app/utilities/app-util';
@Component({
    selector: 'app-overreach-register-receipt',
    templateUrl: './register-receipt.component.html',
    styles: [``],
})
export class OverreachRegisterReceiptComponent implements OnInit {
    appUtil = AppUtil;
    content: string = '';
    types: any = {};
    showTypes: any = [];

    constructor(
        private accountBalanceSheetReportService: AccountBalanceSheetReportService,
        private authService: AuthService,
        private readonly accountingReportService: AccountingReportService,
        private readonly chartOfAccountService: ChartOfAccountService,
    ) {}

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
    ngOnInit(): void {
        this.types = this.appUtil.getAriseReportTypes();
        this.showTypes = ['account'];
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
        this.accountingReportService
            .getReportDkctgsLedgerData(
                this.appUtil.cleanFilterTypeReport(
                    this.getParams,
                    this.showTypes,
                ),
            )
            .subscribe((res) => {
                this.appUtil.setShowReportReceiptHtml(res.data);
            });
    }

    onPrint(type) {
        this.getParams.fileType = type;
        this.accountingReportService
            .getReportDkctgsLedgerData(
                this.appUtil.cleanFilterTypeReport(
                    this.getParams,
                    this.showTypes,
                ),
            )
            .subscribe((res) => {
                this.openDownloadFile(res.data, type);
            });
    }

    onPrintExcel(type) {
        this.getParams.fileType = type;
        this.accountingReportService
            .getReportDkctgsLedgerData(
                this.appUtil.cleanFilterTypeReport(
                    this.getParams,
                    this.showTypes,
                ),
            )
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
