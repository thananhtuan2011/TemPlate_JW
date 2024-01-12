import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { SellReportServiceService } from 'src/app/service/sell-report-service.service';
import AppUtil from '../../../../utilities/app-util';
import { DatePipe } from '@angular/common';
@Component({
    selector: 'app-profit-after-tax',
    templateUrl: './profit-after-tax.component.html',
    styles: [``],
})
export class ProfitAfterTaxComponent implements OnInit {
    isInvalidForm = false;
    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    pendingRequest: any;
    isMobile = screen.width <= 1199;
    lstDailyReport: any[] = [];

    display: boolean = false;
    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;
    startDate = new Date();
    endDate = new Date();
    cols: any[] = [
        {
            header: 'label.date',
            value: 'createdDate',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: false,
        },
        {
            header: 'label.tien_hang',
            value: 'price',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: false,
        },
        {
            header: 'label.price_tax',
            value: 'taxVAT',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: false,
        },
        {
            header: 'label.Triet_khau',
            value: 'discountPrice',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.Phai_thu',
            value: 'phaiThu',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.Tien_mat',
            value: 'tienMat',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.bank',
            value: 'nganHang',
            width: 'width:14%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.cong_no',
            value: 'congNo',
            width: 'width:14%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
    ];

    public getParams = {
        page: 0,
        pageSize: 20,
    };
    constructor(private readonly sellReportService: SellReportServiceService) {}

    ngOnInit(): void {
        this.getDailyReport();
    }

    getDailyReport(event?: any, isExport: boolean = false) {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        if (event) {
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }

        this.loading = true;
        this.getParams['startDate'] = moment(this.startDate).format(
            'YYYY-MM-DD',
        );
        this.getParams['endDate'] = moment(this.endDate).format('YYYY-MM-DD');
        this.sellReportService
            .getDailyReport(this.getParams)
            .subscribe((res) => {
                this.lstDailyReport = res.data;
                this.loading = false;
            });
    }

    onChangePrintExcel(): void {
        const params = {
            startDate: new DatePipe('en_US').transform(
                new Date(this.startDate),
                'yyyy/MM/dd HH:mm:ss',
            ),
            endDate: new DatePipe('en_US').transform(
                new Date(this.endDate),
                'yyyy/MM/dd HH:mm:ss',
            ),
        };
        this.sellReportService
            .getBaoCaoLoiNhuanTruThue(params)
            .subscribe((res) => {
                AppUtil.openDownloadFile(res.data, 'excel');
            });
    }
}
