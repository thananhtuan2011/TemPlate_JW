import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { PTCSS } from 'src/app/components/accounting-module/arise/prints/const_css';
import {
    BillDetail,
    BillDetailPrint,
    ProductModel,
} from 'src/app/models/cashier.model';
import { TypeData } from 'src/app/models/common.model';
import { Company } from 'src/app/models/company.model';
import { Goods } from 'src/app/models/goods.model';
import { BillDetailService } from 'src/app/service/bill-detail.service';
import { CompanyService } from 'src/app/service/company.service';
import AppUtil from 'src/app/utilities/app-util';
import { environment } from 'src/environments/environment';
import { mergeMap, of } from 'rxjs';
import { CustomerService } from '../../../../../service/customer.service';

@Component({
    selector: 'app-import-stock-detail',
    templateUrl: './import-stock-detail.component.html',
    styleUrls: ['./import-stock-detail.component.scss'],
})
export class ImportStockDetailComponent implements OnInit {
    appUtil = AppUtil;
    @Input('customers') customers: any[] = [];
    @Input('billTab') billTab: any = {};
    @Input('isSeller') isSeller: boolean = false;
    @Input('selectedUser') selectedUser: string = '';
    @Input('users') users: any[] = [];
    @Input('surchargeData') surchargeData: any = {};

    @Output() closeBillTab = new EventEmitter<any>();
    @Output() onShowSplitMerge = new EventEmitter();
    @Output() onShowPayment = new EventEmitter<any>();
    @Output() onSendToCashier = new EventEmitter<any>();
    @Output() onSendToChef = new EventEmitter<any>();
    @Output() onSaveTemp = new EventEmitter<any>();
    @Output() onSaveTempXK = new EventEmitter<any>();
    @Output() onSaveTempXD = new EventEmitter<any>();
    @Output() onChangeFilterCustomer = new EventEmitter<any>();

    typePays: any[] = [
        { label: 'Tiền mặt', value: 'TM' },
        { label: 'Công nợ', value: 'CN' },
        { label: 'Ngân hàng', value: 'NH' },
    ];

    filteredCustomers: any[] = [];

    items: any[] = [];

    displayDiscountPrice: boolean = false;
    isVAT: boolean = true;
    displayVat: boolean = false;
    selectedProduct: any = {};

    constructor(
        private messageService: MessageService,
        private translateService: TranslateService,
        private billDetailService: BillDetailService,
        private customerService: CustomerService,
        private companyService: CompanyService,
        private router: Router,
    ) {}

    company: Company;

    getLastInfo() {
        this.companyService.getLastCompanyInfo().subscribe((response: any) => {
            this.company = response.data;
        });
    }

    ngOnInit(): void {
        this.getLastInfo();
        this.items = [
            {
                icon: 'pi pi-shopping-cart',
                tooltip: 'In đơn',
                command: () => {
                    this.onTemp('XD');
                    this.messageService.add({
                        severity: 'info',
                        summary: 'In đơn',
                        detail: 'In đơn thành công',
                    });
                },
            },
            {
                icon: 'pi pi-building',
                tooltip: 'In kho',
                command: () => {
                    this.onTemp('XK');
                },
            },
        ];
    }

    onRemoveProduct(product) {
        this.billTab.data.products = this.billTab.data.products.filter(
            (x) => x.id !== product.id,
        );
        if (this.billTab.data.products.length === 0) {
            this.closeBillTab.emit(this.billTab.tabId);
        }
    }

    onDiscountProduct(product) {
        this.selectedProduct = product;
        if (!this.selectedProduct.discountType) {
            this.selectedProduct.discountType = 'money';
        }
        this.displayDiscountPrice = true;
    }

    onVatProduct(product) {
        this.selectedProduct = product;
        this.selectedProduct.taxVatRate =
            (this.selectedProduct.taxVat / this.selectedProduct.salePrice) *
            100;
        if (!this.selectedProduct.discountType) {
            this.selectedProduct.discountType = 'percent';
        }
        this.displayVat = true;
    }

    onVatRateChange(vat: number) {
        this.selectedProduct.taxVat = Math.floor(
            (this.selectedProduct.salePrice * vat) / 100,
        );
    }

    getAccountCode(data: Goods) {
        if (data.goodsCode) {
            return data.goodsCode;
        }
        if (data.detail2) {
            return data.detail2;
        }
        if (data.detail1) {
            return data.detail1.split('_')[0];
        }
        return data.account;
    }

    getAccountName(data: Goods) {
        if (data.goodsName) {
            return data.goodsName;
        }
        if (data.detail2) {
            return data.detailName2;
        }
        if (data.detail1) {
            return data.detailName1;
        }
        return data.accountName;
    }

    getSurchargeLabel() {
        return (
            'Tên phụ thu: ' +
            this.surchargeData.name +
            '\nGhi chú: ' +
            this.surchargeData.note +
            '\nGiá trị: ' +
            (this.surchargeData.type === 'percent'
                ? this.surchargeData.value + '%'
                : this.appUtil.formatCurrencyVND(this.surchargeData.value))
        );
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    // event filter customer
    onCustomerNameSelect(event) {
        if (event) {
            let customer = this.customers.find(
                (x) => x.code === event.split('|')[0].trim(),
            );
            if (!AppUtil.isEmpty(customer)) {
                this.billTab.data.customerId = customer.id;
                this.billTab.data.customerCode = customer.code;
                this.billTab.data.customerName = `${customer.code} | ${customer.name}`;
                this.billTab.data.customerAddress = customer.address;
                this.billTab.data.customerTaxCode = customer.taxCode;
                this.billTab.data.debitCode = customer.debitCode?.code;
                this.billTab.data.debitDetailCodeFirst =
                    customer.debitDetailFirst?.code;
                this.billTab.data.debitDetailCodeSecond =
                    customer.debitDetailSecond?.code;
                this.onChangeFilterCustomer.emit(customer);
            }
        } else {
            this.onChangeFilterCustomer.emit(null);
        }
    }

    onChangeCustomer(customer: any) {
        if (this.billTab && this.billTab.data && !AppUtil.isEmpty(customer)) {
            this.billTab.data.customerId = customer.id;
            this.billTab.data.customerCode = customer.code;
            this.billTab.data.customerName = `${customer.code} | ${customer.name}`;
            this.billTab.data.customerAddress = customer.address;
            this.billTab.data.customerTaxCode = customer.taxCode;
            this.billTab.data.debitCode = customer.debit?.code;
            this.billTab.data.debitDetailCodeFirst =
                customer.debitDetailFirst?.code;
            this.billTab.data.debitDetailCodeSecond =
                customer.debitDetailSecond?.code;
        }
    }

    // event filter customer
    filterCustomerName(event) {
        let filtered: any[] = [];
        for (let i = 0; i < this.customers.length; i++) {
            if (
                this.customers[i].name
                    .toLowerCase()
                    .includes(event.query.toLowerCase())
            ) {
                filtered.push(
                    `${this.customers[i].code} | ${this.customers[i].name}`,
                );
            }
        }
        this.filteredCustomers = filtered;
    }

    reloadTotalAmount() {
        if (this.billTab.data) {
            this.billTab.data.totalAmount = 0;
            this.billTab.data.totalQuantity = 0;
            this.billTab.data.totalAmount = this.billTab.data.products.reduce(
                (sum, current) => sum + current.totalAmount,
                0,
            );
        }
    }

    calculateTotalAmount(good) {
        if (good.isEditing) {
            return;
        }
        good.isEditing = true;
        good.totalAmount =
            good.billQuantity * this.getDiscountMoney(good, good.discountPrice);
        this.reloadTotalAmount();
        good.isEditing = false;
    }

    getDiscountMoney(product: ProductModel, discountTemp: number) {
        let realPrice = product.salePrice + product.taxVat;
        if (product.discountType === 'percent') {
            return realPrice - (realPrice / 100) * discountTemp;
        }
        return realPrice - discountTemp;
    }

    onPayment() {
        if (
            this.billTab.data.typePay === 'CN' &&
            (!this.billTab.data.debitCode ||
                !this.billTab.data.debitDetailCodeFirst)
        ) {
            this.messageService.add({
                severity: 'info',
                detail: AppUtil.translate(
                    this.translateService,
                    'info.fail_cn',
                ),
            });
            return;
        }
        this.onShowPayment.emit(this.billTab);
    }

    onSendCashier() {
        this.onSendToCashier.emit(this.billTab);
    }

    onSendChef() {
        this.onSendToChef.emit(this.billTab);
    }

    onTemp(type: string) {
        switch (type) {
            case 'XK':
                {
                    this.onSaveTempXK.emit(this.billTab);
                }
                break;
            case 'XD':
                {
                    this.onSaveTempXD.emit(this.billTab);
                }
                break;
            case 'saveTemp':
                {
                    this.onSaveTemp.emit(this.billTab);
                }
                break;
        }
    }

    setRealBill(bill) {
        this.billTab.data.id = bill.data.id;
        this.billTab.data.status = bill.data.status;
        this.billTab.data.createdDate = bill.data.createdDate;
        this.billTab.data.isRealId = true;
    }

    getCustomerName(customerId) {
        if (customerId > 0) {
            return this.customers.find((x) => x.id === customerId).name;
        }
        return '';
    }

    getTotalBill() {
        let realTotal = this.billTab.data.totalAmount;
        if (this.billTab.data.discountType === 'percent') {
            realTotal =
                realTotal - (realTotal / 100) * this.billTab.data.discountPrice;
        } else {
            realTotal = realTotal - this.billTab.data.discountPrice;
        }
        if (this.surchargeData && this.surchargeData.type === 'percent') {
            return this.appUtil.formatCurrencyVND(
                realTotal + (realTotal * this.surchargeData.value) / 100,
            );
        }
        return this.appUtil.formatCurrencyVND(
            realTotal +
                (this.billTab.data.surcharge ? this.billTab.data.surcharge : 0),
        );
    }

    isDisplayXuatKho = false;

    onPrintXuatKho() {
        this.isDisplayXuatKho = true;
        this.onPrintModal();
        this.getBillDetails();
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
            this.isDisplayXuatKho = false;
        }, 1000);
    }

    dataPrint: any = { floorName: '', deskName: '', goods: [] };

    getBillDetails(): void {
        this.billDetailService
            .getBillDetails(this.billTab.data.id)
            .pipe(
                mergeMap((response: TypeData<BillDetailPrint>) => {
                    this.dataPrint.goods = response.data;
                    this.dataPrint.discountPriceBill =
                        response.data[0]?.discountPriceBill;
                    this.dataPrint.surchargeBill =
                        response.data[0]?.surchargeBill;

                    if (this.billTab.data.customerId) {
                        return this.customerService.getCustomerDebit(
                            this.billTab.data.customerId,
                        );
                    }
                    return of([]);
                }),
            )
            .subscribe((res: any) => {
                this.dataPrint.floorName = this.billTab.floorName;
                this.dataPrint.deskName = this.billTab.deskName;
                this.dataPrint.username = this.users.find(
                    (x) => x.username === this.selectedUser,
                ).fullName;
                this.dataPrint.bill = this.billTab.data;
                this.dataPrint.debt = res.data;
            });
    }

    sendQuote(): void {
        const products = [];
        this.billTab.data?.products?.map((product) => {
            products.push({
                id: product.id || 0,
                billId: this.billTab.data?.id || 0,
                goodsId: product.id,
                quantity: product.quantity,
                unitPrice: product.price,
                discountPrice: product.discountPrice,
                taxVAT: product.taxVat,
                discountType: product.discountType,
                note: '',
                dateManufacture: product.dateManufacture,
                dateExpiration: product.dateExpiration,
            });
        });
        this.customerService
            .createQuoteCustomer(this.billTab.data.customerId, products)
            .subscribe(
                (res) => {
                    if (res) {
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Gửi báo giá thành công',
                        });
                        window.open(
                            `/view-file/${res.id}/${this.billTab.data.customerId}`,
                            '_blank',
                        );
                    }
                },
                (err) => {},
            );
    }

    recalculateSalePrice(product: any) {
        if (product.isEditing) {
            return;
        }

        product.isEditing = true;
        if (product.billQuantity == 0) {
            product.isEditing = false;
            return;
        }
        product.salePrice = product.totalAmount / product.billQuantity;
        product.isEditing = false;
    }
}
