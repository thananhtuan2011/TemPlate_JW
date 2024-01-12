import { Component, OnInit } from '@angular/core';
import { AccountBalanceSheetReportService } from 'src/app/service/account-balance-sheet-report';
import { AuthService } from 'src/app/service/auth.service';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import AppUtil from 'src/app/utilities/app-util';
@Component({
    selector: 'app-internal-saved-currency',
    templateUrl: './saved-currency.component.html',
    styles: [``],
})
export class InternalSavedCurrencyComponent implements OnInit {
    appUtil = AppUtil;
    content: string = '';
    types: any = {};
    showTypes: any = [];

    constructor(
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
        bookDetailType: '',
        fileType: '',
        isNoiBo: false,
        fromMonth: `${new Date().getMonth() + 1}`,
        toMonth: `${new Date().getMonth() + 1}`,
        fromDate: new Date(),
        toDate: new Date(),
    };
    ngOnInit(): void {
        this.types = this.appUtil.getAriseReportTypes();
        this.showTypes = ['previousYear'];
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
                this.getParams.accountCode = this.types.chartOfAccounts[0].code;
            });
    }

    onAction(type) {
        console.log(this.getParams);
        this.getParams.fileType = type;
        this.getParams.isNoiBo = true;
        this.accountBalanceSheetReportService
            .exportMovedMoneyData(
                this.appUtil.cleanFilterTypeReport(
                    this.getParams,
                    this.showTypes,
                ),
                true,
            )
            .subscribe((res) => {
                this.content = res.data;
                if (type != 'html') {
                    this.openDownloadFile(res.data, type);
                } else {
                    this.setShowReportReceiptHtml(res.data);
                }
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
        } catch (ex) {
            // this.notificationService.error('Lỗi', 'Không thể download file');
        }
    }

    setShowReportReceiptHtml(content: any) {
        var _idFrameReceipt = document.getElementById(
            'iframe-html-report-balance-account',
        );
        _idFrameReceipt.innerHTML = '';
        const divHTML = document.createElement('div');
        if (content.error) {
            divHTML.innerHTML = content.error;
        } else {
            divHTML.innerHTML = content;
        }
        _idFrameReceipt.appendChild(divHTML);
    }
}
