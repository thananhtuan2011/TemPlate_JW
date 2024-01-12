import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { AccountBalanceSheetReportService } from 'src/app/service/account-balance-sheet-report';
import { GoodsService } from 'src/app/service/goods.service';
import { SellReportServiceService } from 'src/app/service/sell-report-service.service';
import { UserService } from 'src/app/service/user.service';
import AppConstant from 'src/app/utilities/app-constants';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/`;
@Component({
    selector: 'app-website-orders',
    templateUrl: './website-orders.component.html',
    styles: [
        `
            :host ::ng-deep .p-dropdown {
                width: 250px;
            }
            :host ::ng-deep .p-inputtext {
                width: 250px;
            }
        `,
    ],
})
export class WebsiteOrdersComponent implements OnInit {
    isInvalidForm = false;
    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    pendingRequest: any;
    isMobile = screen.width <= 1199;
    lstPayment: any[] = [];
    paymentHistoryOverview;
    first = 0;
    totalRecords;
    totalPages;

    display: boolean = false;
    displayBillDetail = false;
    billDetail: any[] = [];
    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;
    startDate = new Date();
    endDate = new Date();
    customers: any[];
    employees: any[];
    goods: any[];
    cols: any[] = [
        { header: 'label.code_orders', value: 'id', width: 'width:12%' },
        { header: 'label.status', value: 'status', width: 'width:12%' },
        { header: 'label.create_at', value: 'createAt', width: 'width:12%' },
        {
            header: 'label.customer_name',
            value: 'fullName',
            width: 'width:12%',
        },
        { header: 'label.phone', value: 'tell', width: 'width:12%' },
        {
            header: 'label.delivery_address',
            value: 'shippingAddress',
            width: 'width:12%',
        },
        {
            header: 'label.number_of_product',
            value: 'orderDetails.length()',
            width: 'width:12%',
        },
        {
            header: 'label.total_price',
            value: 'totalPrice',
            width: 'width:12%',
        },
    ];
    status: any[] = [
        {
            statusName: 'Mới tạo',
            statu: 1,
        },
        {
            statusName: 'Đã xác nhận',
            statu: 2,
        },
        {
            statusName: 'Đang giao',
            statu: 3,
        },
        {
            statusName: 'Đã giao',
            statu: 4,
        },
        {
            statusName: 'Hoàn thành',
            statu: 5,
        },
        {
            statusName: 'Hủy',
            statu: 6,
        },
    ];

    public getParams = {
        page: 0,
        pageSize: 100,
        status: 1,
        textSearch: '',
    };
    constructor(
        private readonly sellReportService: SellReportServiceService,
        private readonly goodService: GoodsService,
        private readonly userService: UserService,
        private accountBalanceSheetReportService: AccountBalanceSheetReportService,
        private http: HttpClient,
    ) {}

    ngOnInit(): void {
        this.startDate.setDate(1);
        this.getOrder();
    }

    getOrder(event?: any, isExport: boolean = false) {
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
            .getWebsiteOrder(this.getParams)
            .subscribe((res) => {
                this.lstPayment = res.data;
                this.totalRecords = res.totalItems || 0;
                this.totalPages = res.totalItems / res.pageSize + 1;
                this.loading = false;
            });
    }
    GetDeatil(bill) {
        this.sellReportService.getBillDetail(bill.id).subscribe((res) => {
            if (this.billDetail.length > 0) {
                this.billDetail.pop();
            }
            this.billDetail.push(res.data);
            this.displayBillDetail = true;
        });
    }

    exportBill() {
        this.sellReportService
            .getExportBill(this.getParams)
            .subscribe((res) => {
                this.customers = res.data;
                this.openDownloadFile(res.data, 'excel');
            });
    }
    openDownloadFile(_fileName, _ft: string) {
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
