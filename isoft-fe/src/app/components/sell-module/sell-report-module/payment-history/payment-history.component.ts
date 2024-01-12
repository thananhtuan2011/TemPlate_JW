import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import * as moment from 'moment';
import { GoodsService } from 'src/app/service/goods.service';
import { SellReportServiceService } from 'src/app/service/sell-report-service.service';
import { UserService } from 'src/app/service/user.service';
import AppUtil from '../../../../utilities/app-util';
import { AuthService } from '../../../../service/auth.service';
import AppConstant from 'src/app/utilities/app-constants';
import { StyleCustom } from '../../cashier/PTCSS';
import { Goods } from 'src/app/models/goods.model';
import { CompanyService } from 'src/app/service/company.service';
import { Bill, BillDetail, ProductModel } from 'src/app/models/cashier.model';
import { PTCSS } from 'src/app/components/accounting-module/arise/prints/const_css';
import { BillDetailService } from 'src/app/service/bill-detail.service';
import { TypeData } from 'src/app/models/common.model';
import { RoomTableService } from 'src/app/service/room-table.service';
import { RoomTable } from 'src/app/models/room-table.model';
import { MessageService } from 'primeng/api';
import { DashboardService } from '../../../../service/dashboard.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BillHistoryCollectionsService } from '../../../../service/bill-history-collections.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError } from 'rxjs/operators';
import { forkJoin, throwError } from 'rxjs';
import { CustomerService } from '../../../../service/customer.service';
import { CustomerTax } from '../../../../models/customer-tax.model';
import { CustomerTaxService } from '../../../../service/customer-tax.service';
import { BillService } from '../../../../service/bill.service';
import * as _ from 'lodash';
import { BillRefundComponent } from './components/bill-refund/bill-refund.component';
import { int } from '@zxing/library/es2015/customTypings';
import { BillPdfGeneratorService } from '../../../../service/bill-pdf-generator.service';

@Component({
    selector: 'app-payment-history',
    templateUrl: './payment-history.component.html',
    styles: [
        `
            .marquee {
                width: 300px;
            }

            :host ::ng-deep {
                .p-calendar .p-datepicker {
                    width: 400px;
                }
            }

            :host ::ng-deep .date-debit {
                .p-calendar {
                    width: 100%;
                }
            }
        `,
    ],
})
export class PaymentHistoryComponent implements OnInit {
    @ViewChild('billRefundDialog') billRefundDialog: BillRefundComponent;
    appUtil = AppUtil;
    isEditSoLuong = false;
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
    debtData: any = {
        isShow: false,
        idBil: '',
    };
    billDetail: any[] = [];
    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;
    startDate = new Date();
    endDate = new Date();
    customers: any[];
    employees: any[];
    lstGoods: any[];
    cols: any[] = [
        {
            header: 'Số bill',
            value: 'displayOrder',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: false,
        },
        {
            header: 'Trạng thái',
            value: 'status',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: false,
        },
        {
            header: 'label.employee_code',
            value: 'userCode',
            width: 'width:16%',
            display: true,
            classify: 'salary_level',
            optionHide: false,
        },
        {
            header: 'label.customer_name',
            value: 'customerName',
            width: 'width:16%',
            display: true,
            classify: 'salary_level',
            optionHide: false,
        },
        {
            header: 'label.amount_customer',
            value: 'quantityCustomer',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.price_discount',
            value: 'discountPrice',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.total_price',
            value: 'totalAmount',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'Công nợ',
            value: 'debt',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.amount_given_by_customer',
            value: 'amountReceivedByCus',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.amount_paid_by_customer',
            value: 'amountSendToCus',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'Số tiền khách trả Công nợ',
            value: '',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.date_create',
            value: 'createdDate',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'Số hóa đơn',
            value: 'invoiceNumber',
            width: 'width:10%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.note',
            value: 'note',
            width: 'width:12%',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
    ];
    totalNumberReportHome: any;
    formDebit!: FormGroup;
    customerFormData: any = {};
    formCustomerTaxData: any = {};
    isShowCustomerForm: boolean = false;

    public getParams = {
        page: 0,
        pageSize: 100,
        customerId: '',
        userCode: '',
        goodId: '',
    };

    constructor(
        private readonly sellReportService: SellReportServiceService,
        private readonly goodService: GoodsService,
        private readonly userService: UserService,
        private readonly companyService: CompanyService,
        private readonly billService: BillService,
        private readonly billDetailService: BillDetailService,
        private readonly billHistoryCollectionsService: BillHistoryCollectionsService,
        private readonly roomTableService: RoomTableService,
        private readonly customerService: CustomerService,
        private readonly customerTaxService: CustomerTaxService,
        private readonly messageService: MessageService,
        private authService: AuthService,
        private dashboardService: DashboardService,
        public fb: FormBuilder,
        public translateService: TranslateService,
        private readonly billPdfGeneratorService: BillPdfGeneratorService,
        viewContainerRef: ViewContainerRef,
    ) {
        this.getParams.userCode = authService.user?.username || '';
        this.billPdfGeneratorService.setup(viewContainerRef);
    }

    ngOnInit(): void {
        this.onLoadDeskFloor();
        this.getLastInfo();
        this.getdata();
        this.formDebit = this.fb.group({
            userId: [''],
            date: [new Date()],
        });
    }

    company: any = {};
    getLastInfo() {
        this.companyService.getLastCompanyInfo().subscribe((response: any) => {
            this.company = response.data;
        });

        this.dashboardService.getReportHome().subscribe((res) => {
            this.totalNumberReportHome = res;
        });
    }

    getDailyReport(event?: any, isExport: boolean = false) {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        if (event) {
            this.getParams.page =
                Math.floor((event.first || 0) / (event.rows || 1)) + 1;
            this.getParams.pageSize = event.rows || 20;
        }
        this.getParams.page = this.getParams.page || 1;
        this.loading = true;
        this.getParams['startDate'] = moment(this.startDate).format(
            'YYYY-MM-DD',
        );
        this.getParams['endDate'] = moment(this.endDate).format('YYYY-MM-DD');
        this.sellReportService
            .getPaymentHistory(this.appUtil.cleanObject(this.getParams))
            .subscribe((res) => {
                this.paymentHistoryOverview = res.data[0];
                this.lstPayment = res.data;
                this.lstPayment.shift();
                this.totalRecords = res.totalItems || 0;
                this.totalPages = res.totalItems / res.pageSize + 1;
                this.loading = false;
            });
    }
    getdata() {
        this.getParams['startDate'] = moment(this.startDate).format(
            'YYYY-MM-DD',
        );
        this.getParams['endDate'] = moment(this.endDate).format('YYYY-MM-DD');
        this.getGood();
        this.getCustomer();
        this.getAllUserActive();
        this.getDailyReport();
    }
    getGood() {
        Object.keys(this.getParams).forEach(
            (k) => this.getParams[k] == null && delete this.getParams[k],
        );
        this.sellReportService
            .getChartOfAccountForReportBill(this.getParams)
            .subscribe((res) => {
                this.lstGoods = res.data;
            });
    }

    getCustomer() {
        Object.keys(this.getParams).forEach(
            (k) => this.getParams[k] == null && delete this.getParams[k],
        );
        this.sellReportService
            .getCustomerForReportBill(this.getParams)
            .subscribe((res) => {
                this.customers = res.data;
            });
    }

    getAllUserActive() {
        this.sellReportService
            .getUserForReportBill(this.getParams)
            .subscribe((res: any) => {
                this.employees = res.data;
            });
    }

    exportBill() {
        this.sellReportService
            .getExportBill(this.getParams)
            .subscribe((res) => {
                AppUtil.openDownloadFile(res.data, 'excel');
            });
    }

    exportBillDetail() {
        this.sellReportService
            .getExportBillDetail(this.getParams)
            .subscribe((res) => {
                AppUtil.openDownloadFile(res.data, 'excel');
            });
    }

    onView(bill: any) {
        bill.isShowDetail = !bill.isShowDetail;
        this.getBillDetails(bill, false, true);
    }

    onViewGetMoney(_idBill: any) {
        this.debtData = {
            isShow: true,
            idBil: _idBill,
        };
    }

    submitGetMoney() {
        this.billHistoryCollectionsService
            .createBillHistoryCollections({
                ...this.formDebit.value,
                idBill: this.debtData.idBil,
            })
            .pipe(
                catchError((err) => {
                    this.messageService.add({
                        severity: 'error',
                        detail: AppUtil.translate(
                            this.translateService,
                            'error.0',
                        ),
                    });
                    return throwError(err);
                }),
            )
            .subscribe(() => {
                this.debtData.isShow = false;
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.create',
                    ),
                });
            });
    }
    onPrint(bill: any) {
        this.getBillDetails(bill);
    }

    isPrintXuatKho: boolean = false;
    onPrintXuatKho(bill) {
        this.billPdfGeneratorService.prepareAndGenerate(bill.id);
    }

    onLoadDeskFloor() {
        this.roomTableService
            .getListNoQuery()
            .subscribe((deskFloors: TypeData<RoomTable>) => {
                this.lstFloors = deskFloors.data.filter(
                    (x) => x.isDesk === false,
                );
                this.lstDesks = deskFloors.data.filter(
                    (x) => x.isDesk === true,
                );
            });
    }

    dataPrint: any = { floorName: '', deskName: '' };
    lstFloors: any[] = [];
    lstDesks: any[] = [];
    getBillDetails(
        bill: Bill,
        isXuatKho: boolean = false,
        isView: boolean = false,
    ): void {
        this.billDetailService
            .getBillDetails(bill.id)
            .subscribe((res: TypeData<BillDetail>) => {
                bill.billDetails = res.data;
                bill.billDetailsRoot = bill.billDetails.map((m) => {
                    return {
                        id: m.id,
                        quantity: m.quantity,
                    };
                });
                if (isView) {
                    this.displayBillDetail = true;
                    return;
                }
                let temp: any;
                temp = this.lstFloors.find(
                    (x) => x.id === bill.floorId,
                );
                this.dataPrint.floorName = temp ? temp.name : '';
                temp = this.lstDesks.find(
                    (x) => x.id === bill.deskId,
                );
                this.dataPrint.deskName = temp ? temp.name : '';
                temp = this.employees.find(
                    (x) => x.username === bill.userCode,
                );
                this.dataPrint.username = temp ? temp.fullName : '';
                if (isXuatKho == false) this.doPrintBill(bill);
                else {
                    this.dataPrint.goods = res.data;
                    this.dataPrint.discountPriceBill =
                        res.data[0]?.discountPriceBill;
                    this.dataPrint.surchargeBill = res.data[0]?.surchargeBill;

                    this.dataPrint.bill = bill;
                    this.onPrintModal();
                }
            });
    }

    doPrintBill(bill) {
        if (bill.billDetails && bill.billDetails.length > 0) {
            setTimeout(() => {
                if (window) {
                    const cssFile = StyleCustom;
                    let products: string = '';
                    const dateNow = moment().format('DD/MM/YYYY hh:mm:ss');
                    bill.billDetails.forEach((billDetail: BillDetail) => {
                        let goods = this.lstGoods.find(
                            (x) => x.id === billDetail.goodsId,
                        );
                        products +=
                            '    \t\t\t\t\t\t\t<tr>\n' +
                            '    \t\t\t\t\t\t\t\t<td>' +
                            this.getAccountName(goods) +
                            '</td>\n' +
                            "    \t\t\t\t\t\t\t\t<td style='text-align: center;'>" +
                            billDetail.quantity +
                            '</td>\n' +
                            "    \t\t\t\t\t\t\t\t<td style='text-align: right;'>" +
                            this.formatMoney(goods.salePrice) +
                            'đ</td>\n' +
                            "    \t\t\t\t\t\t\t\t<td style='text-align: right;'>" +
                            this.formatMoney(billDetail.discountPrice) +
                            (billDetail.discountType === 'percent'
                                ? '%'
                                : 'đ') +
                            '</td>\n' +
                            "    \t\t\t\t\t\t\t\t<td style='text-align: right;'>" +
                            this.formatMoney(
                                billDetail.quantity * billDetail.unitPrice,
                            ) +
                            'đ</td>\n' +
                            '    \t\t\t\t\t\t\t</tr>\n' +
                            '                                <tr>\n';
                    });
                    if (
                        navigator.userAgent.toLowerCase().indexOf('chrome') > -1
                    ) {
                        const popup = window.open(
                            '',
                            '_blank',
                            'width=600,height=600,scrollbars=no,menubar=no,toolbar=no,' +
                                'location=no,status=no,titlebar=no',
                        );
                        popup.window.focus();
                        popup.document.write(
                            '<!DOCTYPE html><html><head>  ' +
                                `${cssFile} ` +
                                '</head><body onload="window.print()"><div class="reward-body">' +
                                '<div class="container">\n' +
                                '    <div class="row">\n' +
                                '        <div class="col-xs-12">\n' +
                                '    \t\t<div class="invoice-title">\n' +
                                "    \t\t\t<div style='text-align: center;'><p style='font-size: 24px; padding: 2px;'><strong>" +
                                this.company.name +
                                '</strong></p></div>\n' +
                                "    \t\t\t<div style='text-align: center;'><p style='font-size: 20px; padding: 2px;'><strong>Hóa đơn thanh toán</strong></p></div>\n" +
                                "    \t\t\t<div style='text-align: right;'><p style='font-size: 16px;'>Số phiếu: " +
                                bill.id +
                                '</p></div>\n' +
                                '    \t\t</div>\n' +
                                '    \t\t<hr>\n' +
                                "    \t\t\t<div style='text-align: center;'><p style='font-size: 16px; padding: 2px;'><strong>Pass Wifi: " +
                                this.appUtil.getStorage(AppConstant.WIFI) +
                                '</strong></p></div>\n' +
                                '    \t\t<div class="row">\n' +
                                '    \t\t\t<div class="col-xs-6">\n' +
                                '    \t\t\t\t<address>\n' +
                                '    \t\t\t\tTên bàn: <span>' +
                                (this.dataPrint.floorName || '') +
                                '<span></span> / <span>' +
                                (this.dataPrint.deskName || '') +
                                '</span>' +
                                ' <br />\n' +
                                '    \t\t\tTên KH: <span>' +
                                bill.customerName +
                                '</span><br />\n' +
                                '    \t\t\tSL: <span>' +
                                bill.quantityCustomer +
                                '</span>KH<br />\n' +
                                "    \t\t\t<span style='font-size: 12px;'>" +
                                dateNow +
                                '</span><br />\n' +
                                // "    \t\t\tNgày: <span>" + moment().format('DD/MM/YYYY HH:MM:SS') + "</span><br />\n" +
                                '    \t\t</div>\n' +
                                '    \t</div>\n' +
                                '    </div>\n' +
                                '    \n' +
                                '    <div class="row">\n' +
                                '    \t<div class="col-md-12">\n' +
                                '    \t\t<div class="panel panel-default">\n' +
                                '    \t\t\t<div class="panel-heading">\n' +
                                '    \t\t\t\t<h4 class="panel-title">Chi tiết biên nhận</h4>\n' +
                                '    \t\t\t<div class="panel-body">\n' +
                                '    \t\t\t\t<div class="table-responsive">' +
                                '    \t\t\t\t\t<table class="table table-condensed">' +
                                '    \t\t\t\t\t\t<thead>' +
                                '                                <tr>\n' +
                                "        \t\t\t\t\t\t\t<td style='text-align: center; width: 40%;'>Mặt hàng</td>\n" +
                                "        \t\t\t\t\t\t\t<td style='text-align: center; width: 10%;'>SL</td>\n" +
                                "        \t\t\t\t\t\t\t<td style='text-align: center; width: 15%;'>Đơn giá</td>\n" +
                                "        \t\t\t\t\t\t\t<td style='text-align: center; width: 15%;'>Giá giảm/SP</td>\n" +
                                "        \t\t\t\t\t\t\t<td style='text-align: center; width: 20%;'>Thành tiền</td>\n" +
                                '                                </tr>\n' +
                                '    \t\t\t\t\t\t</thead>\n' +
                                '    \t\t\t\t\t\t<tbody>\n' +
                                '    \t\t\t\t\t\t\t<!-- foreach ($order->lineItems as $line) or some such thing here -->\n' +
                                products +
                                '    \t\t\t\t\t\t</tbody>\n' +
                                '    \t\t\t\t\t</table>\n' +
                                '    \t\t\t\t</div>\n' +
                                '    \t\t\t</div>\n' +
                                '    \t\t</div>\n' +
                                '    \t\t\t\tGiảm trên tổng hóa đơn: <span>' +
                                this.formatMoney(bill.discountPrice) +
                                (bill.discountType === 'percent' ? '%' : 'đ') +
                                '.</span>' +
                                ' <br />\n' +
                                '    \t\t\t\tTổng tiền: <span>' +
                                this.formatMoney(bill.totalAmount) +
                                'đ.</span>' +
                                ' <br />\n' +
                                '    \t\t\t\tBằng chữ: <span>' +
                                this.appUtil.formatCurrencyVNDString(
                                    bill.totalAmount,
                                ) +
                                '.</span>' +
                                ' <br />\n' +
                                '    \t\t\t\tSố tiền khách đưa: <span>' +
                                this.formatMoney(bill.amountReceivedByCus) +
                                'đ.</span>' +
                                ' <br />\n' +
                                '    \t\t\t\tSố tiền trả lại khách: <span>' +
                                this.formatMoney(bill.amountReceivedByCus) +
                                'đ.</span>' +
                                ' <br />\n' +
                                '    \t\t\t\tGhi chú: <span>' +
                                bill.note +
                                '.</span>' +
                                ' <br /><br /><br /><br />\n' +
                                '    \t\t<hr>\n' +
                                "    \t\t\t<div style='text-align: center;'><p style='font-size: 16px; padding: 2px;'>Cảm ơn Quý khách và hẹn gặp lại!!!</p></div><br />\n" +
                                "<div style='page-break-before:always'></div>" +
                                '    \t</div>\n' +
                                '    </div>\n' +
                                '</div>' +
                                '</div></html>',
                        );
                        popup.onbeforeunload = (event) => {
                            popup.document.close();
                            // this.dataPrint = null;
                            return '.\n';
                        };
                        popup.onabort = (event) => {
                            popup.document.close();
                            // this.dataPrint = null;
                        };
                        popup.document.close();
                        // this.dataPrint = null;
                    } else {
                        const popup = window.open(
                            '',
                            '_blank',
                            'width=800,height=600',
                        );
                        popup.document.open();
                        popup.document.write(
                            '<!DOCTYPE html><html><head>  ' +
                                `${cssFile} ` +
                                '</head><body onload="window.print()"><div class="reward-body">' +
                                '<div class="container">\n' +
                                '    <div class="row">\n' +
                                '        <div class="col-xs-12">\n' +
                                '    \t\t<div class="invoice-title">\n' +
                                "    \t\t\t<div style='text-align: center;'><p style='font-size: 24px; padding: 2px;'><strong>" +
                                this.company.name +
                                '</strong></p></div>\n' +
                                "    \t\t\t<div style='text-align: center;'><p style='font-size: 20px; padding: 2px;'><strong>Hóa đơn thanh toán</strong></p></div>\n" +
                                "    \t\t\t<div style='text-align: right;'><p style='font-size: 16px;'>Số phiếu: " +
                                bill.id +
                                '</p></div>\n' +
                                '    \t\t</div>\n' +
                                '    \t\t<hr>\n' +
                                "    \t\t\t<div style='text-align: center;'><p style='font-size: 16px; padding: 2px;'><strong>Pass Wifi: " +
                                this.appUtil.getStorage(AppConstant.WIFI) +
                                '</strong></p></div>\n' +
                                '    \t\t<div class="row">\n' +
                                '    \t\t\t<div class="col-xs-6">\n' +
                                '    \t\t\t\t<address>\n' +
                                '    \t\t\t\tTên bàn: <span>' +
                                (this.dataPrint.floorName || '') +
                                '<span></span> / <span>' +
                                (this.dataPrint.deskName || '') +
                                '</span>' +
                                ' <br />\n' +
                                '    \t\t\tTên KH: <span>' +
                                bill.customerName +
                                '</span><br />\n' +
                                '    \t\t\tSL: <span>' +
                                bill.quantityCustomer +
                                '</span>KH<br />\n' +
                                "    \t\t\t<span style='font-size: 12px;'>" +
                                dateNow +
                                '</span><br />\n' +
                                // "    \t\t\tNgày: <span>" + moment().format('DD/MM/YYYY HH:MM:SS') + "</span><br />\n" +
                                '    \t\t</div>\n' +
                                '    \t</div>\n' +
                                '    </div>\n' +
                                '    \n' +
                                '    <div class="row">\n' +
                                '    \t<div class="col-md-12">\n' +
                                '    \t\t<div class="panel panel-default">\n' +
                                '    \t\t\t<div class="panel-heading">\n' +
                                '    \t\t\t\t<h4 class="panel-title">Chi tiết biên nhận</h4>\n' +
                                '    \t\t\t<div class="panel-body">\n' +
                                '    \t\t\t\t<div class="table-responsive">' +
                                '    \t\t\t\t\t<table class="table table-condensed">' +
                                '    \t\t\t\t\t\t<thead>' +
                                '                                <tr>\n' +
                                "        \t\t\t\t\t\t\t<td style='text-align: center; width: 40%;'>Mặt hàng</td>\n" +
                                "        \t\t\t\t\t\t\t<td style='text-align: center; width: 10%;'>SL</td>\n" +
                                "        \t\t\t\t\t\t\t<td style='text-align: center; width: 15%;'>Đơn giá</td>\n" +
                                "        \t\t\t\t\t\t\t<td style='text-align: center; width: 15%;'>Giá giảm/SP</td>\n" +
                                "        \t\t\t\t\t\t\t<td style='text-align: center; width: 20%;'>Thành tiền</td>\n" +
                                '                                </tr>\n' +
                                '    \t\t\t\t\t\t</thead>\n' +
                                '    \t\t\t\t\t\t<tbody>\n' +
                                '    \t\t\t\t\t\t\t<!-- foreach ($order->lineItems as $line) or some such thing here -->\n' +
                                products +
                                '    \t\t\t\t\t\t</tbody>\n' +
                                '    \t\t\t\t\t</table>\n' +
                                '    \t\t\t\t</div>\n' +
                                '    \t\t\t</div>\n' +
                                '    \t\t</div>\n' +
                                '    \t\t\t\tGiảm trên tổng hóa đơn: <span>' +
                                this.formatMoney(bill.discountPrice) +
                                (bill.discountType === 'percent' ? '%' : 'đ') +
                                '.</span>' +
                                ' <br />\n' +
                                '    \t\t\t\tTổng tiền: <span>' +
                                this.formatMoney(bill.totalAmount) +
                                'đ.</span>' +
                                ' <br />\n' +
                                '    \t\t\t\tBằng chữ: <span>' +
                                this.appUtil.formatCurrencyVNDString(
                                    bill.totalAmount,
                                ) +
                                '.</span>' +
                                ' <br />\n' +
                                '    \t\t\t\tSố tiền khách đưa: <span>' +
                                this.formatMoney(bill.amountReceivedByCus) +
                                'đ.</span>' +
                                ' <br />\n' +
                                '    \t\t\t\tSố tiền trả lại khách: <span>' +
                                this.formatMoney(bill.amountReceivedByCus) +
                                'đ.</span>' +
                                ' <br />\n' +
                                '    \t\t\t\tGhi chú: <span>' +
                                bill.note +
                                '.</span>' +
                                ' <br /><br /><br /><br />\n' +
                                '    \t\t<hr>\n' +
                                "    \t\t\t<div style='text-align: center;'><p style='font-size: 16px; padding: 2px;'>Cảm ơn Quý khách và hẹn gặp lại!!!</p></div><br />\n" +
                                "<div style='page-break-before:always'></div>" +
                                '    \t</div>\n' +
                                '    </div>\n' +
                                '</div>' +
                                '</div></html>',
                        );
                        popup.onbeforeunload = (event) => {
                            popup.document.close();
                            // this.dataPrint = null;
                            return '.\n';
                        };
                        popup.onabort = (event) => {
                            popup.document.close();
                            // this.dataPrint = null;
                        };
                        popup.document.close();
                        // this.dataPrint = null;
                    }
                }
            }, 1000);
        }
    }

    onPrintModal() {
        setTimeout(() => {
            if (window) {
                const printContents = document.getElementById('PXN').innerHTML;
                const cssfile = PTCSS;
                if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
                    const popup = window.open(
                        '',
                        '_blank',
                        'width=600,height=600,scrollbars=no,menubar=no,toolbar=no,' +
                            'location=no,status=no,titlebar=no',
                    );
                    popup.window.focus();
                    popup.document.write(
                        '<!DOCTYPE html><html><head>  ' +
                            `${cssfile} ` +
                            '</head><body onload="window.print()"><div class="reward-body">' +
                            printContents +
                            '</div></html>',
                    );
                    popup.onbeforeunload = (event) => {
                        popup.document.close();
                        return '.\n';
                    };
                    popup.onabort = (event) => {
                        popup.document.close();
                    };
                    popup.document.close();
                } else {
                    const popup = window.open(
                        '',
                        '_blank',
                        'width=800,height=600',
                    );
                    popup.document.open();
                    popup.document.write(
                        '<html><head>' +
                            ` ${cssfile} ` +
                            '</head><body onload="window.print()">' +
                            printContents +
                            '</html>',
                    );
                    popup.document.close();
                }
            }
            this.messageService.add({
                severity: 'success',
                summary: 'In kho',
                detail: 'In kho thành công',
            });
            this.isPrintXuatKho = false;
        }, 1000);
    }

    getAccountName(data: Goods) {
        if (data.detail2) {
            return data.detailName2;
        }
        if (data.detail1) {
            return data.detailName1;
        }
        return data.accountName;
    }

    getDiscountMoney(product: ProductModel, discountTemp: number) {
        if (product.discountType === 'percent') {
            return (
                product.salePrice +
                product.taxVat -
                (product.salePrice / 100) * discountTemp
            );
        }
        return product.salePrice + product.taxVat - discountTemp;
    }

    getAccountCode(data: Goods) {
        if (data.detail2) {
            return data.detail2;
        }
        if (data.detail1) {
            return data.detail1.split('_')[0];
        }
        return data.account;
    }

    getCustomerName(customerId) {
        if (customerId > 0) {
            return this.customers.find((x) => x.id === customerId).name;
        }
        return '';
    }

    getDiscountBillMoney() {
        return 0;
        // if (this.selectedBillTab.data.discountType === 'percent') {
        //     return this.selectedBillTab.data.totalAmount - this.selectedBillTab.data.totalAmount / 100 * this.selectedBillTab.data.discountPrice;
        // }
        // return this.selectedBillTab.data.totalAmount - this.selectedBillTab.data.discountPrice;
    }

    formatMoney(n) {
        if (n)
            return n
                .toFixed(2)
                .replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
                .replace('.00', '');
        return 0;
    }

    numberWithCommas(n) {
        return n?.toString()?.replace(/\B(?!\.\d*)(?=(\d{3})+(?!\d))/g, '.');
    }

    showCustomerForm(customerId: number) {
        this.customerTaxService
            .getCustomerTaxDetailByCustomerId(customerId)
            .subscribe((response: CustomerTax) => {
                this.formCustomerTaxData = response;
            });

        this.customerService
            .getCustomerDetail(customerId)
            .subscribe((response: any) => {
                this.formData = response.data;
                this.isShowCustomerForm = true;
                this.isEdit = true;
            });
    }

    createInvoice(rowData: any) {
        let customerId = rowData.customerId;

        // Validate
        if (customerId == null || customerId <= 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Hóa đơn',
                detail: 'Không có thông tin khách hàng',
            });
            return;
        }

        // Get customer tax
        this.customerTaxService
            .getCustomerTaxDetailByCustomerId(customerId)
            .subscribe((res) => {
                // Validate tax
                if (
                    res.address == null ||
                    res.companyName == null ||
                    res.taxCode == null
                ) {
                    this.showCustomerForm(customerId);
                    return;
                }

                this.billService.createInvoice(rowData.id).subscribe((res) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Hóa đơn',
                        detail: 'Xuất hóa đơn thành công',
                    });
                });
            });
    }
    copyBill(bill: any) {
        this.billService.copyBill(bill.id).subscribe((res: any) => {
            this.messageService.add({
                severity: 'success',
                detail: AppUtil.translate(
                    this.translateService,
                    'success.create',
                ),
            });
            this.getDailyReport();
        });
    }

    editSoLuong(bill) {
        const billId = bill.id;
        var inputs = _.filter(
            bill.billDetails.map((m) => {
                return {
                    id: m.id,
                    billId: m.billId,
                    goodsId: m.goodsId,
                    quantity: m.quantity,
                };
            }),
            (item) => {
                return (
                    _.findIndex(bill.billDetailsRoot, (root: any) => {
                        return (
                            root.id == item.id && item.quantity != root.quantity
                        );
                    }) != -1
                );
            },
        );
        if (inputs.length == 0) {
            this.isEditSoLuong = false;
            return;
        }

        this.billDetailService
            .saveRefundGoods(billId, inputs)
            .subscribe((res) => {
                this.getBillDetails({ id: billId } as Bill);
                this.isEditSoLuong = false;
            });
    }

    onAdjustBillDetail(billId: number) {
        this.billDetailService
            .getBillDetails(billId)
            .subscribe((res: TypeData<BillDetail>) => {
                this.billRefundDialog.onAdjustBillDetail(billId, res.data);
            });
    }
}
