import { Component, OnInit } from '@angular/core';
import { AccountBalanceSheetReportService } from 'src/app/service/account-balance-sheet-report';
import { AccountingReportService } from 'src/app/service/accounting-report.service';
import { AuthService } from 'src/app/service/auth.service';
import { DocumentService } from 'src/app/service/document.service';
import AppUtil from 'src/app/utilities/app-util';
@Component({
    selector: 'app-internal-receipt-list',
    templateUrl: './receipt-list.component.html',
    styles: [``],
})
export class InternalReceiptListComponent implements OnInit {
    appUtil = AppUtil;
    content: string = '';
    types: any = {};
    showTypes: any = [];

    constructor(
        private accountBalanceSheetReportService: AccountBalanceSheetReportService,
        private authService: AuthService,
        private documentService: DocumentService,
        private readonly accountingReportService: AccountingReportService,
    ) {}

    getParams = {
        filterType: null,
        fillFullName: true,
        preparedBy: '',
        dfPreparedBy: '',
        voucherType: '',
        fileType: '',
        isNoiBo: false,
        fromMonth: `${new Date().getMonth() + 1}`,
        toMonth: `${new Date().getMonth() + 1}`,
        fromDate: new Date(),
        toDate: new Date(),
    };
    ngOnInit(): void {
        this.types = this.appUtil.getAriseReportTypes();
        this.showTypes = ['document', 'isNoiBo'];
        this.getDocuments();
        this.getParams.preparedBy = this.authService.user.fullname;
        this.getParams.dfPreparedBy = this.authService.user.fullname;
    }

    getDocuments() {
        this.documentService.getDocuments({ page: 0, pagesize: 1000 }).subscribe((res: any) => {
            this.types.document = res.data;
            this.getParams.voucherType = null;
        });
    }

    onAction(type) {
        console.log(this.getParams);
        this.getParams.fileType = type;
        this.getParams.isNoiBo = true;
        this.accountingReportService
            .getReportTransactionData(
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
                    this.appUtil.setShowReportReceiptHtml(res.data);
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
}
