import { Component, OnInit } from '@angular/core';
import { AccountBalanceSheetReportService } from 'src/app/service/account-balance-sheet-report';
import { AuthService } from 'src/app/service/auth.service';
import { DocumentService } from 'src/app/service/document.service';
import * as moment from 'moment';
import { AccountingReportService } from 'src/app/service/accounting-report.service';
import AppUtil from 'src/app/utilities/app-util';
@Component({
    selector: 'app-overreach-receipt',
    templateUrl: './receipt.component.html',
    styles: [``],
})
export class OverreachReceiptComponent implements OnInit {
    appUtil = AppUtil;
    content: string = '';
    types: any = {};
    showTypes: any = [];
    appConstant: any;

    constructor(
        private accountBalanceSheetReportService: AccountBalanceSheetReportService,
        private authService: AuthService,
        private readonly accountingReportService: AccountingReportService,
        private documentService: DocumentService,
    ) {}

    getParams = {
        filterType: null,
        fillFullName: true,
        preparedBy: '',
        dfPreparedBy: '',
        document: '',
        fileType: '',
        isNoiBo: false,
        fromMonth: `${new Date().getMonth() + 1}`,
        toMonth: `${new Date().getMonth() + 1}`,
        fromDate: new Date(),
        toDate: new Date(),
    };
    ngOnInit(): void {
        this.types = this.appUtil.getAriseReportTypes();
        this.showTypes = ['document'];
        this.getDocuments();
        this.getParams.preparedBy = this.authService.user.fullname;
        this.getParams.dfPreparedBy = this.authService.user.fullname;
    }

    getDocuments() {
        this.documentService
            .getDocuments({ page: 0, pagesize: 1000 })
            .subscribe((resp) => {
                this.types.document = [...resp.data];
            });
        // this.documentService.getAllActiveDocument().subscribe((res: any) => {
        //     this.types.document = res.data;
        //     this.getParams.document = 'PT';
        // });
    }

    onPreview(type) {
        this.getParams.fileType = type;
        this.accountingReportService
            .getReportReceiptData(
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
            .getReportReceiptData(
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
            .getReportReceiptData(
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
        } catch (ex) {
            // this.notificationService.error('Lỗi', 'Không thể download file');
        }
    }
}
