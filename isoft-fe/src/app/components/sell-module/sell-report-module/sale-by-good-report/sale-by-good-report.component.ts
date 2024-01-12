import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { SellReportServiceService } from 'src/app/service/sell-report-service.service';
import AppUtil from '../../../../utilities/app-util';
import { any } from 'codelyzer/util/function';
import { ChartOfAccountService } from '../../../../service/chart-of-account.service';

@Component({
    selector: 'app-sale-by-good-report',
    templateUrl: './sale-by-good-report.component.html',
    styles: [],
})
export class SaleByGoodReportComponent implements OnInit {
    isInvalidForm = false;
    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    pendingRequest: any;
    isMobile = screen.width <= 1199;
    lstGoodReport: any[] = [];
    accounts: any[] = [];
    goods: any[];

    display: boolean = false;
    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;
    startDate = new Date();
    endDate = new Date();
    cols: any[] = [
        {
            header: 'label.goods_code',
            value: 'goodCode',
            width: 'width:15%',
            display: true,
            classify: 'salary_level',
            optionHide: false,
            specType: '',
        },
        {
            header: 'label.goods_name',
            value: 'goodName',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: false,
        },
        {
            header: 'label.stock_unit',
            value: 'stockUnit',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: false,
        },
        {
            header: 'label.sale_quantity',
            value: 'quantity',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: false,
            specType: 'number',
        },
        {
            header: 'label.sale_revenue',
            value: 'amount',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
            specType: 'number',
        },
        {
            header: 'label.returned_quantity',
            value: 'quantityBack',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
            specType: 'number',
        },
        {
            header: 'label.returned_value',
            value: 'amountBack',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
            specType: 'number',
        },
        {
            header: 'label.revenue_and_profit',
            value: 'amountProfit',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
            specType: 'number',
        },
        {
            header: 'label.good_group_name',
            value: 'goodGroupName',
            width: 'width:12%',
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
        customerId: '',
        userCode: '',
        detail1: '',
        type: 1,
        accountCode: '',
    };

    totalData: any = {};

    constructor(
        private readonly sellReportService: SellReportServiceService,
        private readonly chartOfAccountService: ChartOfAccountService,
    ) {}

    ngOnInit(): void {
        this.getGoodReportSale();
        this.getAccount();
    }

    logChange() {
        console.log(this.cols[3].display);
    }

    getGoodByAccount() {
        const { accountCode } = this.getParams;

        if (!accountCode) return;
        this.getParams['startDate'] = moment(this.startDate).format(
            'YYYY-MM-DD',
        );
        this.getParams['endDate'] = moment(this.endDate).format('YYYY-MM-DD');

        this.sellReportService
            .getChartOfAccountForReportBill(this.getParams)
            .subscribe((res) => {
                this.goods = res.data;
                if (!this.getParams.detail1 && this.goods.length > 0) {
                    this.getParams.detail1 = this.goods[0].code;
                }
                this.getGoodReportSale();
            });
    }

    sumData(field: string) {
        this.lstGoodReport.reduce((partialSum, a) => partialSum + a, 0);
    }

    getGoodReportSale(event?: any, isExport: boolean = false) {
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
            .getGoodReportSale(this.getParams)
            .subscribe((res) => {
                this.lstGoodReport = [];
                this.loading = false;

                this.totalData = {
                    amount: res.amount,
                    quantity: res.quantity,
                    amountBack: res.amountBack,
                    amountProfit: res.amountProfit,
                    quantityBack: res.quantityBack,
                };

                res.items.forEach((gr) => {
                    let items = gr.items.map((item, index) => {
                        return {
                            ...item,
                            goodCode: item.goodCode,
                            goodName: item.goodName,
                            goodGroupName: gr.detail1Name || gr.detail2Name,
                            goodGroup: {
                                id: index,
                                code: gr.detail1 || gr.detail2,
                                name: gr.detail1Name || gr.detail2Name,
                                quantity: gr.quantity,
                                amount: gr.amount,
                                quantityBack: gr.quantityBack,
                                amountBack: gr.amountBack,
                                amountProfit: gr.amountProfit,
                                rowTotal: gr.items.length || 0,
                            },
                        };
                    });
                    this.lstGoodReport.push(...items);
                });
            });
    }

    getAccount() {
        this.chartOfAccountService
            .getAllClassification({ classification: [2, 3] })
            .subscribe((res: any) => {
                this.accounts = res.map((item) => {
                    item.name = `${item.code}|${item.name}`;
                    return item;
                });
            });
    }

    onChangePrintExcel(): void {
        this.getParams.type = 1;
        this.sellReportService
            .exportGoodReportSale(this.getParams)
            .subscribe((res) => {
                AppUtil.openDownloadFile(res.data, 'excel');
            });
    }
    onChangePrintpdf(): void {
        this.sellReportService
            .exportPdfGoodReportSale(this.getParams)
            .subscribe((res) => {
                AppUtil.openDownloadFile(res.data, 'pdf');
            });
    }
}
