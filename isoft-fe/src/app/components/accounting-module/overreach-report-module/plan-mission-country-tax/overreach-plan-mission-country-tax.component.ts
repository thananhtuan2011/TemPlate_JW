import { Component, OnInit } from '@angular/core';
import { AccountBalanceSheetReportService } from 'src/app/service/account-balance-sheet-report';
import { AuthService } from 'src/app/service/auth.service';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import AppUtil from 'src/app/utilities/app-util';
@Component({
    selector: 'app-overreach-plan-mission-country-tax',
    templateUrl: './plan-mission-country-tax.component.html',
    styles: [``],
})
export class OverreachPlanMissionCountryTaxComponent implements OnInit {
    appUtil = AppUtil;
    content: string = '';
    types: any = {};
    showTypes: any = [];

    constructor(
        private accountBalanceSheetReportService: AccountBalanceSheetReportService,
        private authService: AuthService,
    ) {}

    getParams = {
        filterType: null,
        fillFullName: true,
        preparedBy: '',
        dfPreparedBy: '',
        voteMaker: '',
        fileType: '',
        isNoiBo: false,
        fromMonth: `${new Date().getMonth() + 1}`,
        toMonth: `${new Date().getMonth() + 1}`,
        fromDate: new Date(),
        toDate: new Date(),
        isCheckName: false,
    };
    ngOnInit(): void {
        this.types = this.appUtil.getAriseReportTypes();
        this.showTypes = ['previousYear', 'isNoiBo', 'ledgerReportMaker'];
        this.getParams.preparedBy = this.authService.user.fullname;
        this.getParams.dfPreparedBy = this.authService.user.fullname;
    }
    onAction(type) {
        this.getParams.fileType = type;
        this.getParams.isNoiBo = false;
        this.accountBalanceSheetReportService
            .exportPlanMissionCountryTaxData(
                this.appUtil.cleanFilterTypeReport(
                    this.getParams,
                    this.showTypes,
                ),
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
