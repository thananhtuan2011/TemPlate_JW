import {Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild,} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {MessageService} from 'primeng/api';
import {ICashierImport, ProductModel} from 'src/app/models/cashier.model';
import {Company} from 'src/app/models/company.model';
import {Goods} from 'src/app/models/goods.model';
import {BillDetailService} from 'src/app/service/bill-detail.service';
import {CompanyService} from 'src/app/service/company.service';
import AppUtil from 'src/app/utilities/app-util';
import {environment} from 'src/environments/environment';
import {AuthService} from 'src/app/service/auth.service';
import {BillStatus, DiscountTypeEnum, PaymentType,} from '../../../../../utilities/app-enum';
import {AppMainComponent} from '../../../../../layouts/app.main.component';
import {CustomerService} from '../../../../../service/customer.service';
import AppConstants from '../../../../../utilities/app-constants';
import AppConstant from '../../../../../utilities/app-constants';
import {ListOfTaxRatesComponent} from '../../../../../shared/components/list-of-tax-rates/list-of-tax-rates.component';
import * as moment from 'moment/moment';
import {ConfigAriseEnum} from '../../../../../models/config-arise.model';
import * as _ from 'lodash';
import {PayerService} from '../../../../../service/payer.service';
import {AutoComplete} from 'primeng/autocomplete';
import {InputMask} from 'primeng/inputmask';
import {InputNumber} from 'primeng/inputnumber';
import {Dropdown} from 'primeng/dropdown';
import {Router} from '@angular/router';

@Component({
    selector: 'app-bill-goods-table',
    templateUrl: './bill-goods-table.component.html',
    styleUrls: ['bill-goods-table.component.scss'],
})
export class BillGoodsTableComponent implements OnInit {
    appConstant = AppConstants;
    appUtil = AppUtil;
    configAriseEnum = ConfigAriseEnum;
    @Input('customers') customers: any[] = [];
    @Input('billTab') billTab: any = {};
    @Input() taxRates: any[] = [];
    @Input('selectedUser') selectedUser: string = '';
    @Input('users') users: any[] = [];
    emptyMessageAutoComplete: string = 'không tìm thấy dữ liệu';
    @ViewChild('taxRatesComponent') taxRatesComponent: ListOfTaxRatesComponent;
    @Input('payerList') payerList: any[];

    @ViewChild('productPriceRef') productPriceRef: InputNumber;
    @ViewChild('amountRef') amountRef: InputNumber;
    @ViewChild('billNecRef') billNecRef: InputNumber;
    @ViewChild('orginalCurrencyRef') orginalCurrencyRef: InputNumber;
    @ViewChild('exchangeRateRef') exchangeRateRef: InputNumber;
    @ViewChild('vatAmountInputRef') vatAmountInputRef: InputNumber;
    @ViewChild('taxRatesComponentBill') taxRatesComponentBill: ListOfTaxRatesComponent;
    @ViewChild('pDropdown') pDropdown: Dropdown;

    @Output() closeBillTab = new EventEmitter<any>();
    @Output() onShowSplitMerge = new EventEmitter();
    @Output() onShowPayment = new EventEmitter<any>();
    @Output() onSendToCashier = new EventEmitter<any>();
    @Output() onSendToChef = new EventEmitter<any>();
    @Output() onSaveTemp = new EventEmitter<any>();
    @Output() onSaveTempXK = new EventEmitter<any>();
    @Output() onSaveTempXD = new EventEmitter<any>();
    @Output() onSaveTempPX = new EventEmitter<any>();
    @Output() onChangeFilterCustomer = new EventEmitter<any>();
    @Output() onChangeBillTypeEmmiter = new EventEmitter<any>();
    @Output() onChangeTaxRate = new EventEmitter<any>();


    billTaxCode: any = {};
    typePays: any[] = [];
    types = AppUtil.getAriseTypes();
    invoiceTaxCodeFilter: any[] = [];
    items: any[] = [];
    displayDiscountPrice: boolean = false;
    displayVat: boolean = false;
    selectedProduct: any = {};
    vatAmountInput = 0;
    isMobile = screen.width <= 1199;
    constructor(
        private messageService: MessageService,
        private translateService: TranslateService,
        private billDetailService: BillDetailService,
        private customerService: CustomerService,
        private companyService: CompanyService,
        private payerService: PayerService,
        public appMain: AppMainComponent,
        private readonly authService: AuthService,
        private readonly router: Router,
    ) {}

    company: Company;
    isShowQuantityBoxNec: boolean = false;
    getLastInfo() {
        this.companyService.getLastCompanyInfo().subscribe((response: any) => {
            this.company = response.data;
        });
    }

    ngOnInit(): void {
        this.typePays = this.authService.getConfigurationViewTypePays;
        this.isShowQuantityBoxNec =
            this.authService.getConfigurationViewQuantityBoxNec;
        this.getPayers();
        this.getLastInfo();
        this.getItemPrint();
        console.log('billTab: ', this.billTab);
    }

    getProductCode(product: ICashierImport): string {
        const parentRef = product.parentRef;
        let code = product.code;
        if (parentRef === null || parentRef === '') {
            return code;
        } else if (!parentRef.includes(':')) {
            return `${parentRef} - ${code}`;
        }

        const listCode = parentRef.split(':');
        return `${listCode[listCode.length - 1]} - ${code}`;
    }

    private getItemPrint() {
        let dataPrints = this.authService.getConfigurationViewPrint;
        this.items = [];
        if (dataPrints.includes('ExporttBill')) {
            let item = {
                icon: 'pi pi-building',
                tooltipOptions: {
                    tooltipLabel: 'Phiếu xuất kho',
                    tooltipPosition: 'bottom',
                },
                command: () => {
                    this.onTemp('PX');
                },
            };
            this.items.push(item);
        }
        if (dataPrints.includes('DeliveryBill')) {
            let item = {
                icon: 'pi pi-building',
                tooltipOptions: {
                    tooltipLabel: 'Phiếu giao hàng',
                    tooltipPosition: 'bottom',
                },
                command: () => {
                    this.onTemp('XK');
                },
            };
            this.items.push(item);
        }
        if (dataPrints.includes('BillPrint')) {
            let item = {
                icon: 'pi pi-shopping-cart',
                tooltipOptions: {
                    tooltipLabel: 'In bill nhỏ',
                    tooltipPosition: 'bottom',
                },
                command: () => {
                    this.onTemp('XD');
                    this.messageService.add({
                        severity: 'info',
                        summary: 'In đơn',
                        detail: 'In đơn thành công',
                    });
                },
            };
            this.items.push(item);
        }
    }
    onRemoveProduct(product) {
        this.billTab.data.products = this.billTab.data.products.filter(
            (x) => x.id !== product.id,
        );
        this.vatAmountInput = this.vatAmount;
        if (this.billTab.data.products.length === 0) {
            this.closeBillTab.emit(this.billTab.tabId);
        }


    }

    onChangebillType(event: any) {
        this.onChangeBillTypeEmmiter.emit(event);
    }

    onVatRateChange(vat: number) {
        this.selectedProduct.taxVat = Math.floor(
            (this.selectedProduct.salePrice * vat) / 100,
        );
    }

    onNavigateGoodWarehouse() {
        this.router.navigate(['/uikit/good-warehouses']);
    }

    get isPaid(): boolean {
        return this.billTab?.data?.status?.includes(BillStatus.Paid);
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

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
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

    getDiscountMoney(product: ProductModel, discountTemp: number) {
        let realPrice = product.salePrice + product.taxVat;
        if (product.discountType === 'percent') {
            return realPrice - (realPrice / 100) * discountTemp;
        }
        return realPrice - discountTemp;
    }

    onPayment(isRedirect: boolean = false) {
        if (
            this.billTab.data.typePay === PaymentType.Debt &&
            !this.billTab.data.debitCode
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

        // Update bill include: vat, discount, surcharge ,total amount
        this.billTab.data.totalQuantity = this.totalQuantity;
        this.billTab.data.originalAmount = this.originalAmount;
        this.billTab.data.vatAmount = this.vatAmount;
        this.billTab.data.totalAmount = this.totalAmount;
        this.onShowPayment.emit(this.billTab);
        if (isRedirect) {
            this.onNavigateGoodWarehouse();
        }
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
            case 'PX':
                {
                    this.onSaveTempPX.emit(this.billTab);
                }
                break;
        }
    }

    isDisplayXuatKho = false;

    pdfBillingData: any = { floorName: '', deskName: '', goods: [] };

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
            .subscribe((res) => {
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
            });
    }

    // Amount getter
    get vatAmount() {
        let billVatRate = this.billTab.data.vat;

        if (billVatRate > 0) {
            let amount = this.originalAmount;
            return (amount * billVatRate) / 100;
        }


        const vat =  this.billTab.data.products.reduce((sum, product) => {
            console.log('product.taxVat: ', product.taxVat)
            let vatAmount = product.cashierRequest.quantity * billVatRate;
            return sum + vatAmount;
        }, 0);

        // this.billTab.data.vat = vat;

        return vat;
    }

    get originalAmount() {
        return this.billTab.data.products.reduce(
            (sum: number, product: any) => {
                let priceIncludeDiscount =
                    product.salePrice - this.calculateDiscountPrice(product);
                if (priceIncludeDiscount < 0) {
                    priceIncludeDiscount = 0;
                }
                return sum + product.cashierRequest.amount;
            },
            0,
        );
    }

    get totalQuantity() {
        return this.billTab.data.products.reduce(
            (sum: number, product: any) => {
                return sum + product.cashierRequest.quantity;
            },
            0,
        );
    }

    get totalAmount() {
        return this.originalAmount + this.vatAmountInput;
    }

    onTaxRateChange($event: any) {
        let taxCode = $event.value || '';
        let taxRate = this.taxRates.find((x) => x.code == taxCode);
        if (taxRate) {
            if (!this.displayVat) {
                this.displayVat = true;
            }
            this.taxRatesComponent.writeValue(taxRate.code);
            this.billTab.data.invoiceDate = moment(new Date()).format(
                AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            );
            this.billTab.data.vat = taxRate?.percent;
            this.vatAmountInput = this.vatAmount;
        } else {
            this.billTab.data.vat = 0;
            this.vatAmountInput = 0;
        }

        this.billTaxCode = taxRate.code;

        this.onChangeTaxRate.emit(taxRate);
    }

    clearValue = () => {
        this.billTaxCode = null;
        this.pDropdown.updateSelectedOption(null)
    }

    onClear = (event: any) => {
        this.clearValue();
    }

    filterInvoiceTaxCode(event) {
        if (!event) {
            this.invoiceTaxCodeFilter = [];
            return;
        }
        event.query = event.query || '';
        if (this.billTab.data.invoiceTaxCode instanceof String) {
            event.query = this.billTab.data.invoiceTaxCode || '';
        } else if (this.billTab.data.invoiceTaxCode instanceof Object) {
            this.invoiceTaxCodeFilter = [this.billTab.data.invoiceTaxCode];
            return;
        }

        const list = _.filter(this.payerList, (item) => {
            return (
                item.taxCode &&
                item.taxCode
                    .toLowerCase()
                    .startsWith(event.query.toLowerCase()) &&
                item.taxCode?.length
            );
        });
        this.invoiceTaxCodeFilter = _.cloneDeep(list);
    }

    // nhận sự kiện khi click mũi tên đi xuống sẽ tự động lấy dữ liệu
    // chỉ dành cho chi tiết 1 và 2
    onKeyUpAutoCompleteLazyLoadding($event: any) {
        if ($event.event.key !== 'ArrowDown') return;
        const key = $event.key;
        try {
            const autocompletePanel = this[
                `${ConfigAriseEnum[key]}Tmp`
            ].el.nativeElement.querySelector('.p-autocomplete-panel');
            if (
                autocompletePanel &&
                this[`${ConfigAriseEnum[key]}Filter`].length > 0
            ) {
                if (
                    autocompletePanel.scrollHeight -
                        autocompletePanel.clientHeight -
                        10 <=
                    autocompletePanel.scrollTop
                ) {
                    const str =
                        ConfigAriseEnum[key].charAt(0).toUpperCase() +
                        ConfigAriseEnum[key].slice(1);
                    this[`get${str}`](null);
                }
            }
        } catch {}
    }
    @ViewChild('invoiceTaxCodeTmp') invoiceTaxCodeTmp: AutoComplete;

    onClearInvoiceTaxCode() {
        this.billTab.data.invoiceTaxCode = '';
        this.billTab.data.invoiceName = '';
        this.billTab.data.invoiceAddress = '';
        this.billTab.data.invoiceProductItem = '';
        this.focusInput(this.invoiceTaxCodeTmp);
    }

    onSelectInvoiceTaxCode($event) {
        this.billTab.data.invoiceTaxCode = $event;
        this.billTab.data.invoiceName = $event?.name || '';
        this.billTab.data.invoiceAddress = $event?.address || '';
        this.billTab.data.invoiceProductItem = $event?.product || '';
    }

    public focusInput(
        input: InputMask | InputNumber | AutoComplete | ElementRef,
    ) {
        setTimeout(() => {
            if (input instanceof InputMask) {
                (input as InputMask)?.focus();
            } else if (input instanceof InputNumber) {
                (input as InputNumber)?.input?.nativeElement?.focus();
            } else if (input instanceof ElementRef) {
                (input as ElementRef)?.nativeElement?.focus();
            } else if (input instanceof AutoComplete) {
                (input as AutoComplete)?.focusInput();
            }
        }, 150);
    }

    private getPayers() {
        this.payerService.getList().subscribe((res) => {
            this.payerList = res.data;
        });
    }

    calculateDiscountPrice(product: any) {
        // Percent discount
        if (product.discountType == DiscountTypeEnum.Percent) {
            return (product.cashierRequest.salePrice * product.cashierRequest.discountPrice) / 100;
        }
        return product.cashierRequest.discountPrice;
    }

    onChangeBillQuantity = (event: any, product: ICashierImport) => {
        const quantity = isNaN(Number(event?.target?.ariaValueNow))
            ? 0
            : Number(event?.target?.ariaValueNow || 0);
            const unitPrice = Number(product.cashierRequest.unitPrice || 0);

        product.cashierRequest.amount = Number(quantity || 0) * unitPrice;

        if (this.billTab.data.vat !== undefined && this.billTab.data.vat !== 0) {
            this.vatAmountInput = this.vatAmount;
        }
    }

    onChangeBillBox = (event: any, product: ICashierImport) => {
        const billBox = isNaN(Number(event?.target?.ariaValueNow))
            ? 0
            : Number(event?.target?.ariaValueNow || 0);
            const billNec = Number(product.cashierRequest.billNec || 0);

        product.cashierRequest.quantity = Number(billBox || 0) * billNec;

        const unitPrice = Number(product.cashierRequest.unitPrice || 0);
        product.cashierRequest.amount = Number(product.cashierRequest.quantity || 0) * unitPrice;

        if (this.billTab.data.vat !== undefined && this.billTab.data.vat !== 0) {
            this.vatAmountInput = this.vatAmount;
        }
    }

    onChangeBillNec = (event: any, product: ICashierImport) => {
        const billNec = isNaN(Number(event?.target?.ariaValueNow))
            ? 0
            : Number(event?.target?.ariaValueNow || 0);
            const billBox = Number(product.cashierRequest.billBox || 0);

        product.cashierRequest.quantity = Number(billNec || 0) * billBox;

        const unitPrice = Number(product.cashierRequest.unitPrice || 0);
        product.cashierRequest.amount = Number(product.cashierRequest.quantity || 0) * unitPrice;

        if (this.billTab.data.vat !== undefined && this.billTab.data.vat !== 0) {
            this.vatAmountInput = this.vatAmount;
        }
    }

    onChangeUnitPrice = (event: any, product: ICashierImport) => {
        const unitPrice = isNaN(Number(event?.target?.ariaValueNow))
            ? 0
            : Number(event?.target?.ariaValueNow || 0);
            const quantity = Number(product.cashierRequest.quantity || 0);

        product.cashierRequest.amount = Number(unitPrice || 0) * quantity;

        if (this.billTab.data.vat !== undefined && this.billTab.data.vat !== 0) {
            this.vatAmountInput = this.vatAmount;
        }
    }

    onChangeOrginalCurrency = (event: any, product: ICashierImport) => {
        const orginalCurrency = isNaN(Number(event?.target?.ariaValueNow))
            ? 0
            : Number(event?.target?.ariaValueNow || 0);
            const exchangeRate = Number(product.cashierRequest.exchangeRate || 0);

        product.cashierRequest.amount = Number(orginalCurrency || 0) * exchangeRate;

        if (this.billTab.data.vat !== undefined && this.billTab.data.vat !== 0) {
            this.vatAmountInput = this.vatAmount;
        }
    }

    onChangeExchangeRate = (event: any, product: ICashierImport) => {
        const exchangeRate = isNaN(Number(event?.target?.ariaValueNow))
            ? 0
            : Number(event?.target?.ariaValueNow || 0);
            const orginalCurrency = Number(product.cashierRequest.orginalCurrency || 0);

        product.cashierRequest.amount = Number(exchangeRate || 0) * orginalCurrency;

        if (this.billTab.data.vat !== undefined && this.billTab.data.vat !== 0) {
            this.vatAmountInput = this.vatAmount;
        }
    }

    onChangeAmount = (event: any, product: ICashierImport) => {
        if (this.billTab.data.vat !== undefined && this.billTab.data.vat !== 0) {
            this.vatAmountInput = this.vatAmount;
        }
    }

    getMessage = () => {
        let message = 'Chứng từ này hiện tại chưa có <strong>Hóa Đơn </strong>!'
        if (this.billTab.data.vat !== undefined && this.billTab.data.vat !== 0) {
            message = '';
            if (this.billTab.data.invoiceNumber) {
                message = `${this.billTab.data.invoiceNumber}`
            }

            if (this.billTab.data.invoiceDate) {
                message = `${message ? `${message} - ` : ''}${this.billTab.data.invoiceDate}`
            }

            if (this.billTab.data.invoiceTaxCode) {
                message = `${message ? `${message} - ` : ''}${this.billTab.data.invoiceTaxCode?.taxCode ||this.billTab.data.invoiceTaxCode}`
            }

            if (this.billTab.data.invoiceName) {
                message = `${message ? `${message} - ` : ''}${this.billTab.data.invoiceName}`
            }

            if (this.billTab.data.invoiceAddress) {
                message = `${message ? `${message} - ` : ''}${this.billTab.data.invoiceAddress}`
            }
        }

        return message;
    }

    cancleVat = (event: any = null) => {
        this.clearValue()
        this.displayVat = false;
        this.billTab.data.vat = 0;
        this.vatAmountInput = 0;
        this.billTab.data.invoiceNumber = '';
        this.billTab.data.invoiceSerial = '';
        this.billTab.data.invoiceTaxCode = '';
        this.billTab.data.invoiceName = '';
        this.billTab.data.invoiceAddress = '';
        this.billTab.data.invoiceProductItem = '';
        setTimeout(() => {
            this.billTab.data.taxCode = null;
        })
        // this.taxRatesComponentBill.clearValue();
        this.onClearInvoiceTaxCode();
        this.onChangeTaxRate.emit({});
    }

    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F8':
                event.preventDefault();
                this.onPayment();
                break;
            case 'F4':
                event.preventDefault();
                await this.onNavigateGoodWarehouse();
                break;
            case 'F2':
                event.preventDefault();
                this.onPayment(true);
                break;
        }
    }
}
