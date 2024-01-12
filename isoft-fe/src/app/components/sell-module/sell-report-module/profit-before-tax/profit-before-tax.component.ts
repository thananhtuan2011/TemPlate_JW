import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { SellReportServiceService } from 'src/app/service/sell-report-service.service';
import AppUtil from '../../../../utilities/app-util';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-profit-before-tax',
    templateUrl: './profit-before-tax.component.html',
    styles: [
        `
            //:host ::ng-deep .p-dropdown {
            //    width: 30%
            //}
        `,
    ],
})
export class ProfitBeforeTaxComponent implements OnInit {
    isInvalidForm = false;
    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    pendingRequest: any;
    isMobile = screen.width <= 1199;
    lstProfitBeforeTax: any[] = [];

    display: boolean = false;
    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;
    startDate = new Date();
    endDate = new Date();
    cols: any[] = [
        {
            header: 'label.date',
            value: 'updatedDate',
            width: 'width:15%',
            display: true,
            classify: 'salary_level',
            optionHide: false,
        },
        {
            header: 'label.sale_product',
            value: 'goodsName',
            width: 'width:15%',
            display: true,
            classify: 'salary_level',
            optionHide: false,
        },
        {
            header: 'label.cost_of_capital',
            value: 'price',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: false,
        },
        {
            header: 'label.tax_vat',
            value: 'taxVAT',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: false,
        }, //
        {
            header: 'label.cost_sell',
            value: 'unitPrice',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.cost_discount',
            value: 'discountPrice',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.margin',
            value: 'profit',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.note',
            value: 'note',
            width: 'width:20%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
    ];
    genders: any[] = [
        { key: 'Tạm tính trước thuế', value: true },
        { key: 'Tạm tính trừ thuế', value: false },
    ];

    public getParams = {
        page: 0,
        pageSize: 20,
    };

    constructor(private readonly sellReportService: SellReportServiceService) {}

    ngOnInit(): void {
        this.getProfitBeforeTax();
    }

    logChange() {
        console.log(this.cols[3].display);
    }

    getProfitBeforeTax(event?: any, isExport: boolean = false) {
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
            .getProfitBeforeTax(this.getParams)
            .subscribe((res) => {
                this.lstProfitBeforeTax = res.data;
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
            .getBaoCaoDoanhThuTheoNgay(params)
            .subscribe((res) => {
                AppUtil.openDownloadFile(res.data, 'excel');
            });
    }
}
