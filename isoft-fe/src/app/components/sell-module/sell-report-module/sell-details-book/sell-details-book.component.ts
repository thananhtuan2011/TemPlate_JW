import { Component, OnInit } from '@angular/core';
import { AccountBalanceSheetReportService } from 'src/app/service/account-balance-sheet-report';
import { AuthService } from 'src/app/service/auth.service';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import { SellReportServiceService } from 'src/app/service/sell-report-service.service';
import AppUtil from 'src/app/utilities/app-util';
@Component({
    selector: 'app-sell-details-book',
    templateUrl: './sell-details-book.component.html',
    styles: [``],
})
export class SellDetailsBookComponent implements OnInit {
    appUtil = AppUtil;
    content: string = '';
    types: any = {};
    showTypes: any = [];

    constructor(
        private readonly sellReportService: SellReportServiceService,
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
        bookDetailType: 1,
        fileType: '',
        isNoiBo: false,
        fromMonth: `${new Date().getMonth() + 1}`,
        toMonth: `${new Date().getMonth() + 1}`,
        fromDate: new Date(),
        toDate: new Date(),
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

    onAction(type) {
        console.log(this.getParams);
        this.getParams.fileType = type;
        this.getParams.isNoiBo = false;
        this.sellReportService
            .exportReportSctLedgerData(
                this.appUtil.cleanFilterTypeReport(
                    this.getParams,
                    this.showTypes,
                ),
                false,
            )
            .subscribe((res) => {
                this.content = res.data;
                if (type != 'html') {
                    this.openDownloadFile(res.data, type);
                } else {
                    this.appUtil.setShowReportReceiptHtml(res.data);
                }
            });
    }

    openDownloadFile(_fileName: string, _ft: string) {
        try {
            var _l = this.sellReportService.getFolderPathDownload(
                _fileName,
                _ft,
            );
            if (_l) window.open(_l);
        } catch (ex) {
            // this.notificationService.error('Lỗi', 'Không thể download file');
        }
    }
}
