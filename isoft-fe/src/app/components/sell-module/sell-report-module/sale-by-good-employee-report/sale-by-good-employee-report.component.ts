import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { SellReportServiceService } from 'src/app/service/sell-report-service.service';
import AppUtil from '../../../../utilities/app-util';
import { UserService } from '../../../../service/user.service';
import { GoodsService } from '../../../../service/goods.service';

@Component({
    selector: 'app-sale-by-good-employee-report',
    templateUrl: './sale-by-good-employee-report.component.html',
    styles: [],
})
export class SaleByGoodEmployeeReportComponent implements OnInit {
    viewMode: number = 0;
    isInvalidForm = false;
    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    pendingRequest: any;
    isMobile = screen.width <= 1199;
    lstGoodReport: any[] = [];
    employees: any[] = [];

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
            header: 'label.employee_code',
            value: 'userCode',
            width: 'width:10%',
            display: true,
            classify: 'salary_level',
            optionHide: false,
            specType: '',
        },
        {
            header: 'label.employee_name',
            value: 'userName',
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

    colSpanWidthStyle = 'width:52%';

    genders: any[] = [
        { key: 'Tạm tính trước thuế', value: true },
        { key: 'Tạm tính trừ thuế', value: false },
    ];

    public getParams = {
        page: 0,
        pageSize: 20,
        // customerId: '',
        userId: '',
        // goodId: '',
        type: 2,
    };

    totalData: any = {};

    constructor(
        private readonly sellReportService: SellReportServiceService,
        private readonly goodService: GoodsService,
    ) {}

    ngOnInit(): void {
        this.startDate.setDate(1);
        this.getAllUserActive();
    }

    getAllUserActive() {
        this.getParams['startDate'] = moment(this.startDate).format(
            'YYYY-MM-DD',
        );
        this.getParams['endDate'] = moment(this.endDate).format('YYYY-MM-DD');

        this.sellReportService
            .getUserForReportBill(this.getParams)
            .subscribe((res: any) => {
                this.employees = res.data;
                if (!this.getParams.userId && this.employees.length > 0) {
                    this.getParams.userId = this.employees[0].id;
                }
                this.getGoodReportSale();
            });
    }

    getGoodReportSale(event?: any) {
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
                            goodCode: item.goodcODE,
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

    onChangePrintExcel(): void {
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
