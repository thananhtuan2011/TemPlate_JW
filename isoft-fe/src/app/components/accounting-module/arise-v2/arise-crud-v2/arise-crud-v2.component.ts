import {
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    Renderer2,
    Input,
    Output,
    EventEmitter,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import * as moment from 'moment';
import { MessageService } from 'primeng/api';
import { AutoComplete } from 'primeng/autocomplete';
import { InputMask } from 'primeng/inputmask';
import { InputNumber } from 'primeng/inputnumber';
import { TieredMenu } from 'primeng/tieredmenu';
import { Subscription } from 'rxjs';
import {
    ConfigAriseEnum,
    ConfigButtonAriseEnum,
    IConfigAriseDocumentBehaviourDto,
} from 'src/app/models/config-arise.model';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import { ConfiAriseService } from 'src/app/service/config-arise.service';
import { InvoiceService } from 'src/app/service/invoice.service';
import { LedgerService } from 'src/app/service/ledger.service';
import { PayerService } from 'src/app/service/payer.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import AppConstants from 'src/app/utilities/app-constants';

@Component({
    selector: 'app-arise-crud-v2',
    templateUrl: './arise-crud-v2.component.html',
    styleUrls: ['./arise-crud-v2.component.scss'],
})
export class AriseCrudV2Component implements OnInit, OnDestroy {
    appConstant = AppConstants;
    listConfig: IConfigAriseDocumentBehaviourDto[] = [];
    types = AppUtil.getAriseTypes();
    emptyMessageAutoComplete: string = 'không tìm thấy dữ liệu';
    configAriseEnum = ConfigAriseEnum;
    arisingForOriginVoucherNumber: any;

    @Input('buttonMenus') buttonMenus: any[] = [];
    @Input('chartOfAccounts') chartOfAccounts: any[];
    @Input('orginalDescriptionList') orginalDescriptionList: any[];
    @Input('payerList') payerList: any[];
    @Input('projectList') projectList: any[];
    @Input('invoiceCodeList') invoiceCodeList: any[];
    @Input('debitButtonsTmp') debitButtonsTmp: TieredMenu;
    @Output('onReloadTableAfterCrud') onReloadTableAfterCrud =
        new EventEmitter<any>();
    @Output('onResetTableViewDetail') onResetTableViewDetail =
        new EventEmitter();
    @Output('onDisplayCURSAccount') onDisplayCURSAccount =
        new EventEmitter<any>();
    @Output('onDisplayCURSAccountDetailFirst') onDisplayCURSAccountDetailFirst =
        new EventEmitter<any>();
    @Output('onDisplayCURSAccountDetailSecond')
    onDisplayCURSAccountDetailSecond = new EventEmitter<any>();
    @Output('onDisplayCrudProject') onDisplayCrudProject =
        new EventEmitter<any>();

    @Output('onSavePayerName') onSavePayerName = new EventEmitter<any>();
    @Output('onSaveTaxCode') onSaveTaxCode = new EventEmitter<any>();
    @Output('onSaveDescription') onSaveDescription = new EventEmitter<any>();

    @ViewChild('projectCodeTmp') projectCodeTmp: AutoComplete;
    @ViewChild('invoiceTaxCodeTmp') invoiceTaxCodeTmp: AutoComplete;
    @ViewChild('orginalDescriptionTmp') orginalDescriptionTmp: AutoComplete;
    @ViewChild('invoiceCodeTmp') public invoiceCodeTmp: AutoComplete;
    @ViewChild('debitCodeTmp') public debitCodeTmp: AutoComplete;
    @ViewChild('debitDetailCodeFirstTmp') debitDetailCodeFirstTmp: AutoComplete;
    @ViewChild('debitDetailCodeSecondTmp')
    debitDetailCodeSecondTmp: AutoComplete;
    @ViewChild('creditCodeTmp') creditCodeTmp: AutoComplete;
    @ViewChild('creditDetailCodeFirstTmp')
    creditDetailCodeFirstTmp: AutoComplete;
    @ViewChild('creditDetailCodeSecondTmp')
    creditDetailCodeSecondTmp: AutoComplete;
    @ViewChild('orginalCompanyNameTmp') orginalCompanyNameTmp: AutoComplete;
    @ViewChild('amountTmp') amountTmp: InputNumber;
    @ViewChild('unitPriceTmp') unitPriceTmp: InputNumber;
    @ViewChild('quantityTmp') quantityTmp: InputNumber;
    @ViewChild('exchangeRateTmp') exchangeRateTmp: InputNumber;
    @ViewChild('orginalCurrencyTmp') orginalCurrencyTmp: InputNumber;
    @ViewChild('depreciaMonthTmp') depreciaMonthTmp: InputNumber;
    @ViewChild('orginalBookDateTmp') orginalBookDateTmp: InputMask;
    @ViewChild('invoiceDateTmp') invoiceDateTmp: InputMask;
    @ViewChild('referenceBookDateTmp') referenceBookDateTmp: InputMask;
    @ViewChild('orginalVoucherNumberTmp') orginalVoucherNumberTmp: ElementRef;
    @ViewChild('referenceVoucherNumberTmp')
    referenceVoucherNumberTmp: ElementRef;
    @ViewChild('referenceFullNameTmp') referenceFullNameTmp: ElementRef;
    @ViewChild('referenceAddressTmp') referenceAddressTmp: ElementRef;
    @ViewChild('attachVoucherTmp') attachVoucherTmp: ElementRef;
    @ViewChild('invoiceNameTmp') invoiceNameTmp: ElementRef;
    @ViewChild('invoiceAddressTmp') invoiceAddressTmp: ElementRef;
    @ViewChild('invoiceProductItemTmp') invoiceProductItemTmp: ElementRef;
    @ViewChild('invoiceNumberTmp') invoiceNumberTmp: ElementRef;
    @ViewChild('invoiceSerialTmp') invoiceSerialTmp: ElementRef;
    @ViewChild('invoiceAdditionalDeclarationCodeTmp')
    invoiceAdditionalDeclarationCodeTmp: ElementRef;
    @ViewChild('tieredMenuTmp') tieredMenuTmp: TieredMenu;
    @ViewChild('f7BtnTmp') f7BtnTmp: ElementRef<HTMLElement>;

    config$: Subscription;
    private ledgerForm: FormGroup;
    orginalCompanyNameLabel = 'Người nộp';

    invoiceCodeFilter: any[] = [];
    projectCodeFilter: any[] = [];

    orginalDescriptionFilter: any[] = [];

    orginalCompanyNameFilter: any[] = [];
    invoiceTaxCodeFilter: any[] = [];

    debitCodeFilter: any[] = [];
    debitDetailCodeFirstFilter: any[] = [];
    debitDetailCodeFirstPage = {
        page: 1,
        pageSize: 20,
        parentCode: '',
        searchText: '',
        totalItems: -1,
        isLoadding: false,
    };

    creditCodeFilter: any;
    debitDetailCodeSecondFilter: any = [];
    debitDetailCodeSecondPage = {
        page: 1,
        pageSize: 20,
        parentCode: '',
        searchText: '',
        totalItems: -1,
        isLoadding: false,
    };

    creditDetailCodeFirstFilter: any[] = [];
    creditDetailCodeFirstPage = {
        page: 1,
        pageSize: 20,
        parentCode: '',
        searchText: '',
        totalItems: -1,
        isLoadding: false,
    };
    creditDetailCodeSecondFilter: any = [];
    creditDetailCodeSecondPage = {
        page: 1,
        pageSize: 20,
        parentCode: '',
        searchText: '',
        totalItems: -1,
        isLoadding: false,
    };
    invoiceTaxCodePage = {
        page: 1,
        pageSize: 20,
        parentCode: '',
        searchText: '',
        totalItems: -1,
        payerType: 2,
        isLoadding: false,
    };

    isShowPhieuNhap: boolean = false;
    dataTable: any;

    isAllowDepreciaMonth = true;
    isForeignCurrency = false;
    isAllowInputQuantityAndUnitPrice = false;
    isAllowProjectCode = false;
    debitWarehouse: any;
    creditWarehouse: any;
    endPointInvoice = '';
    constructor(
        private readonly confiAriseService: ConfiAriseService,
        private readonly messageService: MessageService,
        private readonly ledgerService: LedgerService,
        private readonly chartOfAccountService: ChartOfAccountService,
        private readonly renderer: Renderer2,
        private readonly payerService: PayerService,
        private readonly fb: FormBuilder,
        private readonly invoiceService: InvoiceService,
    ) {}

    ngOnInit(): void {
        this.linkInvoice();
    }

    // Thêm định khoản thuế
    onF10() {
        if (!this.isInvoiceCodeHasValue) return;
        if (!this.validateForm()) {
            this.messageService.add({
                severity: 'error',
                detail: 'Dữ liệu nhập chưa chính xác',
            });
            return;
        }
        let callBack = () => {
            this.fc['id'].setValue(0);
            const payload = {
                orginalVoucherNumber: this.fc['orginalVoucherNumber'].value,
                orginalBookDate: new Date(
                    AppUtil.convertStringToDate(
                        this.fc['orginalBookDate'].value,
                    ),
                )?.toISOString(),
                invoiceNumber: this.fc['invoiceNumber'].value || null,
                isInternal: this.dataTable.isInternal,
                invoiceTaxCode:
                    this.fc['invoiceTaxCode'].value?.taxCode ||
                    this.fc['invoiceTaxCode'].value ||
                    null,
            };
            return this.ledgerService
                .getTotalAmountTax(payload)
                .subscribe((res) => {
                    const invoiceCode = this.fc['invoiceCode']?.value;
                    if (invoiceCode?.debit) {
                        this.onClearDebitCode(false);
                        this.f.patchValue({
                            debitCode: invoiceCode.debit,
                        });
                        this.debitCodeFilter = [invoiceCode.debit];
                    }
                    if (invoiceCode?.credit) {
                        this.onClearCreditCode(false);
                        this.f.patchValue({
                            creditCode: invoiceCode.credit,
                        });
                        this.creditCodeFilter = [invoiceCode.credit];
                    }
                    const amount =
                        (Number(res || 0) * Number(invoiceCode?.percent || 0)) /
                        100;
                    this.f.patchValue({
                        orginalDescription: {
                            name: invoiceCode?.description
                                ? invoiceCode?.description
                                : 'Thuế GTGT đầu vào',
                            id: -1,
                        },
                        quantity: 0,
                        unitPrice: 0,
                        amount: amount,
                    });
                    this.focusInput(this.amountTmp);
                    this.setFlagCaculate();
                    this.onReloadTableAfterCrud.emit(-1);
                });
        };
        this.saveData(_.cloneDeep(this.f.value), callBack);
    }

    onF9() {
        if (!this.allowWorkForm) return;
        this.onResetTableViewDetail.emit();
        this.buildNewForm({
            dataTable: this.dataTable,
        });
        this.focusInput(this.orginalVoucherNumberTmp);
    }

    onF8() {
        if (!this.validateForm()) {
            this.messageService.add({
                severity: 'error',
                detail: 'Dữ liệu nhập chưa chính xác',
            });
            return;
        }
        let callBack = () => {
            this.fc['id'].setValue(0);
            const data = this.onAutoRemoveValueInputByConfig(
                ConfigButtonAriseEnum.nokeepDataTax,
                this.f.value,
            );
            this.f.patchValue(data);
            this.focusInput(this.orginalVoucherNumberTmp);
            this.onReloadTableAfterCrud.emit(
                ConfigButtonAriseEnum.nokeepDataTax,
            );
        };
        this.saveData(_.cloneDeep(this.f.value), callBack);
    }

    onF2() {
        if (!this.validateForm()) {
            this.messageService.add({
                severity: 'error',
                detail: 'Dữ liệu nhập chưa chính xác',
            });
            return;
        }
        let callBack = () => {
            this.fc['id'].setValue(0);
            const data = this.onAutoRemoveValueInputByConfig(
                ConfigButtonAriseEnum.nokeepDataChartOfAccount,
                this.f.value,
            );
            this.f.patchValue(data);
            this.autoFocusAfterSave();
            this.onReloadTableAfterCrud.emit(
                ConfigButtonAriseEnum.nokeepDataChartOfAccount,
            );
        };
        this.saveData(_.cloneDeep(this.f.value), callBack);
    }

    onF4() {
        if (!this.validateForm()) {
            this.messageService.add({
                severity: 'error',
                detail: 'Dữ liệu nhập chưa chính xác',
            });
            return;
        }
        let callBack = () => {
            this.fc['id'].setValue(0);
            const data = this.onAutoRemoveValueInputByConfig(
                ConfigButtonAriseEnum.nokeepDataBill,
                this.f.value,
            );
            this.f.patchValue(data);
            this.focusInput(this.orginalDescriptionTmp);
            this.onReloadTableAfterCrud.emit(
                ConfigButtonAriseEnum.nokeepDataBill,
            );
        };
        this.saveData(_.cloneDeep(this.f.value), callBack);
    }

    private saveData(data: any, callBack): Subscription {
        if (!data) {
            this.messageService.add({
                severity: 'error',
                detail: 'Lỗi hệ thống',
            });
            throw new Error('Lỗi hệ thống');
        }
        const input = Object.assign(
            {},
            {
                ...data,
                projectCode: data['projectCode']?.code || '',
                isInternal: this.dataTable.isInternal,
                // Tài khoản/chi tiết bắc buộc kiểu object
                debitCode: data['debitCode'].code,
                debitDetailCodeFirst: data['debitDetailCodeFirst'].code,
                debitDetailCodeSecond: data['debitDetailCodeSecond'].code,
                creditCode: data['creditCode'].code,
                creditDetailCodeFirst: data['creditDetailCodeFirst'].code,
                creditDetailCodeSecond: data['creditDetailCodeSecond'].code,
                // Có thể kiểu object hoặc kiểu string
                orginalCompanyName:
                    data['orginalCompanyName']?.name ||
                    data['orginalCompanyName'] ||
                    '',
                orginalDescription:
                    data['orginalDescription']?.name ||
                    data['orginalDescription'] ||
                    '',
                invoiceCode:
                    data['invoiceCode']?.code || data['invoiceTaxCode'] || '',
                invoiceTaxCode:
                    data['invoiceTaxCode']?.taxCode ||
                    data['invoiceTaxCode'] ||
                    '',
                depreciaMonth: Number(data['depreciaMonth']) || 0,
                orginalCurrency: Number(data['orginalCurrency']) || 0,
                bookDate: AppUtil.formatLocalTimezone(
                    moment(
                        data['bookDate'] ? data['bookDate'] : new Date(),
                        AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                    ).format(AppConstant.FORMAT_DATE.T_DATE),
                ),
                orginalBookDate: AppUtil.formatLocalTimezone(
                    moment(
                        data['orginalBookDate']
                            ? data['orginalBookDate']
                            : new Date(),
                        AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                    ).format(AppConstant.FORMAT_DATE.T_DATE),
                ),
                referenceBookDate: AppUtil.formatLocalTimezone(
                    moment(
                        data['referenceBookDate']
                            ? data['referenceBookDate']
                            : new Date(),
                        AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                    ).format(AppConstant.FORMAT_DATE.T_DATE),
                ),
                invoiceDate: !data['invoiceDate']
                    ? null
                    : AppUtil.formatLocalTimezone(
                          moment(
                              data['invoiceDate'],
                              AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                          ).format(AppConstant.FORMAT_DATE.T_DATE),
                      ),
            },
        );
        return this.ledgerService.createLedgerV2(input).subscribe((res) => {
            this.messageService.add({
                severity: 'success',
                detail: input.id
                    ? 'Cập nhật thành công'
                    : 'Thêm mới thành công',
            });
            callBack();
        });
    }

    onChangeAmount(event) {
        const amount = isNaN(Number(event?.target?.ariaValueNow))
            ? 0
            : Number(event?.target?.ariaValueNow || 0);
        const quantity = Number(this.fc['quantity'].value || 0);
        const unitPrice = Number(this.fc['unitPrice'].value || 0);
        const orginalCurrency = Number(this.fc['orginalCurrency'].value || 0);
        const exchangeRate = Number(this.fc['exchangeRate'].value || 0);
        if (quantity != 0 && unitPrice == 0) {
            this.fc['unitPrice'].setValue(amount / quantity);
        }
        if (orginalCurrency != 0 && exchangeRate == 0) {
            this.fc['exchangeRate'].setValue(amount / (orginalCurrency || 1));
        }
        this.fc['amount'].setValue(amount);
    }

    onChangeUnitPrice(event) {
        if (event.code == 'Tab') return;
        const unitPrice = isNaN(Number(event?.target?.ariaValueNow))
            ? 0
            : Number(event?.target?.ariaValueNow || 0);
        const quantity = this.fc['quantity'].value || 0;
        // số lượng nhân đơn giá
        const amount = Number(quantity || 0) * unitPrice;
        this.f.patchValue({
            unitPrice: unitPrice,
            amount: amount,
        });
    }

    onChangeQuantity(event) {
        const quantity = isNaN(Number(event?.target?.ariaValueNow))
            ? 0
            : Number(event?.target?.ariaValueNow || 0);
        const unitPrice = Number(this.fc['unitPrice'].value || 0);
        // số lượng nhân đơn giá
        const amount = Number(quantity || 0) * unitPrice;
        const orginalCurrency = Number(this.fc['orginalCurrency'].value || 0);
        const exchangeRate = Number(this.fc['exchangeRate'].value || 0);

        this.f.patchValue({
            quantity: quantity,
            amount: amount,
        });

        if (orginalCurrency != 0 && exchangeRate == 0) {
            this.f.patchValue({
                exchangeRate: amount / (orginalCurrency || 1),
            });
        }
    }

    onChangeExchangeRate(event) {
        if (event.code == 'Tab') return;
        const orginalCurrency = Number(this.fc['orginalCurrency'].value || 0);
        const exchangeRate = isNaN(Number(event.target?.ariaValueNow))
            ? 0
            : Number(event.target?.ariaValueNow || 0);
        // ngoại tệ nhân tỉ giá
        this.f.patchValue({
            amount: orginalCurrency * exchangeRate,
            exchangeRate: exchangeRate,
        });
    }

    onSelectInvoiceTaxCode($event) {
        this.f.patchValue({
            invoiceTaxCode: $event,
            invoiceName: $event?.name || '',
            invoiceAddress: $event?.address || '',
            invoiceProductItem: $event?.product || '',
        });
    }

    onClearInvoiceTaxCode() {
        this.f.patchValue({
            invoiceTaxCode: '',
            invoiceName: '',
            invoiceAddress: '',
            invoiceProductItem: '',
        });
        this.focusInput(this.invoiceTaxCodeTmp);
    }

    filterInvoiceTaxCode(event) {
        if (!event) {
            this.invoiceTaxCodeFilter = [];
            return;
        }

        event.query = event.query || '';
        if (this.fc['invoiceTaxCode'].value instanceof String) {
            event.query = this.fc['invoiceTaxCode'].value || '';
        } else if (this.fc['invoiceTaxCode'].value instanceof Object) {
            this.invoiceTaxCodeFilter = [
                _.cloneDeep(this.fc['invoiceTaxCode'].value),
            ];
            return;
        }

        this.invoiceTaxCodePage = {
            ...this.invoiceTaxCodePage,
            searchText: event.query,
            page: 1,
            totalItems: -1,
        };
        var callBack = () => {
            setTimeout(() => {
                const autocompletePanel =
                    this.invoiceTaxCodeTmp.el.nativeElement.querySelector(
                        '.p-autocomplete-panel',
                    );
                if (
                    autocompletePanel &&
                    this.invoiceTaxCodeFilter?.length > 0
                ) {
                    this.renderer.listen(
                        autocompletePanel,
                        'scroll',
                        (event) => {
                            if (
                                event.target.scrollHeight -
                                    event.target.clientHeight -
                                    10 <=
                                event.target.scrollTop
                            ) {
                                this.getInvoiceTaxCode(null);
                            }
                        },
                    );
                }
            }, 1000);
        };
        this.getInvoiceTaxCode(callBack);
    }

    private getInvoiceTaxCode(callBack) {
        if (
            this.invoiceTaxCodePage.isLoadding ||
            this.invoiceTaxCodePage.totalItems ===
                this.invoiceTaxCodeFilter?.length
        ) {
            return;
        }
        this.invoiceTaxCodePage.isLoadding = true;
        let params = _.cloneDeep(this.invoiceTaxCodePage);
        delete params.isLoadding;
        delete params.totalItems;
        this.payerService.payerCustomerTaxs(params).subscribe((res: any) => {
            if (this.invoiceTaxCodePage.page === 1) {
                this.invoiceTaxCodeFilter = [];
            }
            this.invoiceTaxCodeFilter = this.invoiceTaxCodeFilter.concat(
                res.data,
            );
            this.invoiceTaxCodePage.page++;
            this.invoiceTaxCodePage = {
                ...this.invoiceTaxCodePage,
                totalItems: res.totalItems,
                isLoadding: false,
            };
            if (callBack) {
                callBack();
            }
        });
    }

    filterOrginalCompanyName(event) {
        if (!event) {
            this.orginalCompanyNameFilter = [];
            return;
        }
        event.query = event.query || '';
        if (this.fc['orginalCompanyName'].value instanceof String) {
            event.query = this.fc['orginalCompanyName'].value || '';
        } else if (this.fc['orginalCompanyName'].value instanceof Object) {
            event.query = this.fc['orginalCompanyName'].value.name || '';
        }
        let keyword = event.query.toLowerCase();

        this.getPayers(keyword);
    }

    private getPayers(keyword) {
        this.payerService.getPayerCustomers(keyword).subscribe((res) => {
            this.orginalCompanyNameFilter = res.data;
        });
    }
    onSelectOrginalCompanyName($event) {
        this.f.patchValue({
            orginalCompanyName: {
                name: $event.name,
                id: $event.id,
            },
            orginalAddress: $event?.address || '',
        });
    }

    onClearOrginalCompanyName() {
        this.f.patchValue({
            orginalCompanyName: '',
            orginalAddress: '',
        });
        this.focusInput(this.orginalCompanyNameTmp);
    }

    filterOrginalDescription(event) {
        if (!event) {
            this.orginalDescriptionFilter = [];
            return;
        }
        event.query = event.query || '';
        if (this.fc['orginalDescription'].value instanceof String) {
            event.query = this.fc['orginalDescription'].value || '';
        } else if (this.fc['orginalCompanyName'].value instanceof Object) {
            event.query = this.fc['orginalDescription'].value.name || '';
        }

        const list = _.filter(this.orginalDescriptionList, (item) => {
            return (
                item.name &&
                item.name != '' &&
                item.name.toLowerCase().includes(event.query.toLowerCase())
            );
        });
        this.orginalDescriptionFilter = _.cloneDeep(list);
    }

    onClearOrginalDescription() {
        this.f.patchValue({
            orginalDescription: '',
            // attachVoucher: ''
        });
        this.focusInput(this.orginalDescriptionTmp);
    }

    onSelectOrginalDescription($event) {
        if (
            this.fc['orginalDescription'].value instanceof Object &&
            $event.id === this.fc['orginalDescription'].value.id
        )
            return;
        this.f.patchValue({
            orginalDescription: {
                name: $event.name,
                id: $event.id,
            },
            creditCode: '',
            creditDetailCodeFirst: '',
            creditDetailCodeSecond: '',
            debitCode: '',
            debitDetailCodeFirst: '',
            debitDetailCodeSecond: '',
        });
        if ($event.credit) {
            this.f.patchValue({
                creditCode: $event.credit,
            });
            this.creditCodeFilter = [$event.credit];

            if ($event.creditDetailFirst && $event.credit.hasDetails) {
                this.f.patchValue({
                    creditDetailCodeFirst: $event.creditDetailFirst,
                });
                this.creditDetailCodeFirstFilter = [$event.creditDetailFirst];

                if (
                    $event.creditDetailSecond &&
                    $event.creditDetailFirst.hasDetails
                ) {
                    this.f.patchValue({
                        creditDetailCodeSecond: $event.creditDetailSecond,
                    });
                    this.creditDetailCodeSecondFilter = [
                        $event.creditDetailSecond,
                    ];
                }
            }
        }

        if ($event.debit) {
            this.f.patchValue({
                debitCode: $event.debit,
            });
            this.debitCodeFilter = [$event.debit];

            if ($event.debitDetailFirst && $event.debit.hasDetails) {
                this.f.patchValue({
                    debitDetailCodeFirst: $event.debitDetailFirst,
                });
                this.debitDetailCodeFirstFilter = [$event.debitDetailFirst];

                if (
                    $event.debitDetailSecond &&
                    $event.debitDetailFirst.hasDetails
                ) {
                    this.f.patchValue({
                        debitDetailCodeSecond: $event.debitDetailSecond,
                    });
                    this.debitDetailCodeSecondFilter = [
                        $event.debitDetailSecond,
                    ];
                }
            }
        }
        this.setFlagCaculate();
    }

    filterProjectCode(event) {
        if (!event) {
            this.projectCodeFilter = [];
            return;
        }
        event.query = event.query || '';
        if (this.fc['projectCode'].value instanceof String) {
            event.query = this.fc['projectCode'].value || '';
        } else if (this.fc['projectCode'].value instanceof Object) {
            this.projectCodeFilter = [this.fc['projectCode'].value];
            return;
        }
        const list = _.filter(this.projectList, (item) => {
            return (
                item.name &&
                item.name != '' &&
                (item.code
                    .toLowerCase()
                    .startsWith(event.query.toLowerCase()) ||
                    item.name
                        .toLowerCase()
                        .startsWith(event.query.toLowerCase()))
            );
        });
        this.projectCodeFilter = _.cloneDeep(list);
    }

    filterInvoiceCode(event) {
        if (!event) {
            this.invoiceCodeFilter = [];
            return;
        }
        event.query = event.query || '';
        if (this.fc['invoiceCode'].value instanceof String) {
            event.query = this.fc['invoiceCode'].value || '';
        } else if (this.fc['invoiceCode'].value instanceof Object) {
            this.invoiceCodeFilter = [this.fc['invoiceCode'].value];
            return;
        }
        const list = _.filter(this.invoiceCodeList, (item) => {
            return (
                item.name &&
                item.name != '' &&
                (item.code
                    .toLowerCase()
                    .startsWith(event.query.toLowerCase()) ||
                    item.name
                        .toLowerCase()
                        .startsWith(event.query.toLowerCase()))
            );
        });
        this.invoiceCodeFilter = _.cloneDeep(list);
    }

    onChangeOrginalBookDate() {
        if (this.isInvoiceCodeHasValue) {
            this.fc['invoiceDate'].setValue(this.fc['orginalBookDate'].value);
        }
    }

    onClearInvoiceCode() {
        this.f.patchValue({
            invoiceCode: '',
            invoiceDate: null,
        });
        this.setAllowInputInvoiceInfomation();
        this.focusInput(this.invoiceCodeTmp);
    }

    onSelectInvoiceCode($event) {
        if (
            this.fc['invoiceCode'].value instanceof Object &&
            $event.id === this.fc['invoiceCode'].value.id
        )
            return;
        const dataSelect = {
            ..._.cloneDeep($event),
            name: $event.code,
        };
        this.f.patchValue({
            invoiceCode: dataSelect,
            invoiceDate:
                this.fc['orginalBookDate'].value ||
                moment(new Date()).format(
                    AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                ),
        });
        this.setAllowInputInvoiceInfomation();
        this.setTabIndexRelatedInputInvoiceCode();
    }

    onSelectProjectCode($event) {
        if (
            this.fc['projectCode'].value instanceof Object &&
            $event.id === this.fc['projectCode'].value.id
        )
            return;
        this.f.patchValue({
            projectCode: $event,
        });
    }

    // tai khoan no
    filterDebitCode(event) {
        if (!event) {
            this.debitCodeFilter = [];
            return;
        }
        event.query = event.query || '';
        if (this.fc['debitCode'].value instanceof String) {
            event.query = this.fc['debitCode'].value || '';
        } else if (this.fc['debitCode'].value instanceof Object) {
            event.query = this.fc['debitCode'].value.code || '';
            this.debitCodeFilter = [_.cloneDeep(this.fc['debitCode'].value)];
            return;
        }

        const list = _.filter(this.chartOfAccounts, (item) => {
            return (
                item.name &&
                item.name != '' &&
                item.code.toLowerCase().startsWith(event.query.toLowerCase())
            );
        });
        this.debitCodeFilter = list;
    }

    onSelectDebitCode($event, focusInput: boolean = true) {
        if (
            !(
                this.fc['debitCode'].value instanceof Object &&
                $event.code === this.fc['debitCode'].value.code
            )
        ) {
            this.f.patchValue({
                debitCode: $event,
                debitDetailCodeFirst: '',
                debitDetailCodeSecond: '',
            });
        }
        this.setFlagCaculate();
        if (focusInput) {
            if (this.isDebitCodeHas && this.isDebitCodeHasDetails) {
                this.focusInput(this.debitDetailCodeFirstTmp);
            } else {
                this.focusInput(this.creditCodeTmp);
            }
        }
    }

    onClearDebitCode(focusInput: boolean = true) {
        this.f.patchValue({
            debitCode: '',
            debitDetailCodeFirst: '',
            debitDetailCodeSecond: '',
        });
        this.setFlagCaculate();
        if (focusInput) {
            this.focusInput(this.debitCodeTmp);
        }
    }

    // chi tiet no 1
    filterDebitDetailCodeFirst(event) {
        if (!event) {
            this.debitDetailCodeFirstFilter = [];
            return;
        }
        if (!this.isDebitCodeHas) {
            console.log('Chưa chọn tài khoản nợ');
            this.debitDetailCodeFirstFilter = [];
            return;
        }

        event.query = event.query || '';
        if (this.fc['debitDetailCodeFirst'].value instanceof String) {
            event.query = this.fc['debitDetailCodeFirst'].value || '';
        } else if (this.fc['debitDetailCodeFirst'].value instanceof Object) {
            this.debitDetailCodeFirstFilter = [
                _.cloneDeep(this.fc['debitDetailCodeFirst'].value),
            ];
            return;
        }

        this.debitDetailCodeFirstPage = {
            ...this.debitDetailCodeFirstPage,
            searchText: event.query,
            parentCode: this.fc['debitCode'].value.code,
            page: 1,
            totalItems: -1,
        };
        var callBack = () => {
            setTimeout(() => {
                const autocompletePanel =
                    this.debitDetailCodeFirstTmp.el.nativeElement.querySelector(
                        '.p-autocomplete-panel',
                    );
                if (
                    autocompletePanel &&
                    this.debitDetailCodeFirstFilter?.length > 0
                ) {
                    this.renderer.listen(
                        autocompletePanel,
                        'scroll',
                        (event) => {
                            if (
                                event.target.scrollHeight -
                                    event.target.clientHeight -
                                    10 <=
                                event.target.scrollTop
                            ) {
                                this.getDebitDetailCodeFirst(null);
                            }
                        },
                    );
                }
            }, 1000);
        };
        this.getDebitDetailCodeFirst(callBack);
    }

    onClearDebitDetailCodeFirst() {
        this.f.patchValue({
            debitDetailCodeFirst: '',
            debitDetailCodeSecond: '',
        });
        this.focusInput(this.debitDetailCodeFirstTmp);
        this.setFlagCaculate();
    }

    onSelectDebitDetailCodeFirst($event) {
        if (
            !(
                this.fc['debitDetailCodeFirst'].value instanceof Object &&
                $event.code === this.fc['debitDetailCodeFirst'].value.code
            )
        ) {
            this.f.patchValue({
                debitDetailCodeFirst: $event,
                debitDetailCodeSecond: '',
            });
        }
        if (
            this.isDebitDetailCodeFirstHas &&
            this.isDebitDetailCodeFirstHasDetails
        ) {
            this.focusInput(this.debitDetailCodeSecondTmp);
        } else {
            this.focusInput(this.creditCodeTmp);
        }
        this.setFlagCaculate();
    }

    // chi tiet no 2
    filterDebitDetailCodeSecond(event) {
        if (!event) {
            this.debitDetailCodeSecondFilter = [];
            return;
        }
        if (!this.isDebitDetailCodeFirstHas) {
            console.log('Chưa chọn chi tiết nợ 1');
            this.debitDetailCodeSecondFilter = [];
            return;
        }
        event.query = event.query || '';
        if (this.fc['debitDetailCodeSecond'].value instanceof String) {
            event.query = this.fc['debitDetailCodeSecond'].value || '';
        } else if (this.fc['debitDetailCodeSecond'].value instanceof Object) {
            this.debitDetailCodeSecondFilter = [
                this.fc['debitDetailCodeSecond'].value,
            ];
            return;
        }
        this.debitDetailCodeSecondPage = {
            ...this.debitDetailCodeSecondPage,
            searchText: event.query,
            parentCode: `${this.fc['debitCode'].value.code}:${this.fc['debitDetailCodeFirst'].value.code}`,
            page: 1,
            totalItems: -1,
        };
        var callBack = () => {
            setTimeout(() => {
                const autocompletePanel =
                    this.debitDetailCodeSecondTmp.el.nativeElement.querySelector(
                        '.p-autocomplete-panel',
                    );
                if (
                    autocompletePanel &&
                    this.debitDetailCodeSecondFilter?.length > 0
                ) {
                    this.renderer.listen(
                        autocompletePanel,
                        'scroll',
                        (event) => {
                            if (
                                event.target.scrollHeight -
                                    event.target.clientHeight -
                                    10 <=
                                event.target.scrollTop
                            ) {
                                this.getDebitDetailCodeSecond(null);
                            }
                        },
                    );
                }
            }, 1000);
        };
        this.getDebitDetailCodeSecond(callBack);
    }

    onSelectDebitDetailCodeSecond($event) {
        if (
            !(
                this.fc['debitDetailCodeSecond'].value instanceof Object &&
                $event.code === this.fc['debitDetailCodeSecond'].value.code
            )
        ) {
            this.f.patchValue({
                debitDetailCodeSecond: $event,
            });
        }
        this.focusInput(this.creditCodeTmp);
        this.setFlagCaculate();
    }

    onClearDebitDetailCodeSecond() {
        this.f.patchValue({
            debitDetailCodeSecond: '',
        });
        this.focusInput(this.debitDetailCodeSecondTmp);
        this.setFlagCaculate();
    }

    // tai khoan no
    filterCreditCode(event) {
        if (!event) {
            this.creditCodeFilter = [];
            return;
        }
        event.query = event.query || '';
        if (this.fc['creditCode'].value instanceof String) {
            event.query = this.fc['creditCode'].value || '';
        } else if (this.fc['creditCode'].value instanceof Object) {
            this.creditCodeFilter = [
                (event.query = this.fc['creditCode'].value),
            ];
            return;
        }

        const list = _.filter(this.chartOfAccounts, (item) => {
            return (
                item.name &&
                item.name != '' &&
                item.code.toLowerCase().startsWith(event.query.toLowerCase())
            );
        });
        this.creditCodeFilter = list;
    }

    onSelectCreditCode($event, focusInput: boolean = true) {
        if (
            !(
                this.fc['creditCode'].value instanceof Object &&
                $event.code === this.fc['creditCode'].value.code
            )
        ) {
            this.f.patchValue({
                creditCode: $event,
                creditDetailCodeFirst: '',
                creditDetailCodeSecond: '',
            });
        }
        if (this.isCreditCodeHas && this.isCreditCodeHasDetails && focusInput) {
            this.focusInput(this.creditDetailCodeFirstTmp);
        }
        this.setFlagCaculate();
    }

    onClearCreditCode(focusInput: boolean = true) {
        this.f.patchValue({
            creditCode: '',
            creditDetailCodeFirst: '',
            creditDetailCodeSecond: '',
        });
        if (focusInput) {
            this.focusInput(this.creditCodeTmp);
        }
        this.setFlagCaculate();
    }

    // chi tiet có 1
    filterCreditDetailCodeFirst(event) {
        if (!event) {
            this.creditDetailCodeFirstFilter = [];
            return;
        }
        if (!this.isCreditCodeHas) {
            console.log('Chưa chọn tài khoản có');
            this.creditDetailCodeFirstFilter = [];
            return;
        }

        event.query = event.query || '';
        if (this.fc['creditDetailCodeFirst'].value instanceof String) {
            event.query = this.fc['creditDetailCodeFirst'].value || '';
        } else if (this.fc['creditDetailCodeFirst'].value instanceof Object) {
            this.creditDetailCodeFirstFilter = [
                this.fc['creditDetailCodeFirst'].value,
            ];
            return;
        }

        this.creditDetailCodeFirstPage = {
            ...this.creditDetailCodeFirstPage,
            searchText: event.query,
            parentCode: this.fc['creditCode'].value.code,
            page: 1,
            totalItems: -1,
        };
        var callBack = () => {
            setTimeout(() => {
                const autocompletePanel =
                    this.creditDetailCodeFirstTmp.el.nativeElement.querySelector(
                        '.p-autocomplete-panel',
                    );
                if (
                    autocompletePanel &&
                    this.creditDetailCodeFirstFilter?.length > 0
                ) {
                    this.renderer.listen(
                        autocompletePanel,
                        'scroll',
                        (event) => {
                            if (
                                event.target.scrollHeight -
                                    event.target.clientHeight -
                                    10 <=
                                event.target.scrollTop
                            ) {
                                this.getCreditDetailCodeFirst(null);
                            }
                        },
                    );
                }
            }, 1000);
        };
        this.getCreditDetailCodeFirst(callBack);
    }

    onClearCreditDetailCodeFirst() {
        this.f.patchValue({
            creditDetailCodeFirst: '',
            creditDetailCodeSecond: '',
        });
        this.focusInput(this.creditDetailCodeFirstTmp);
        this.setFlagCaculate();
    }

    onSelectCreditDetailCodeFirst($event) {
        if (
            !(
                this.fc['creditDetailCodeFirst'].value instanceof Object &&
                $event.code === this.fc['creditDetailCodeFirst'].value.code
            )
        ) {
            this.f.patchValue({
                creditDetailCodeFirst: $event,
                creditDetailCodeSecond: '',
            });
        }
        if (
            this.isCreditDetailCodeFirstHas &&
            this.isCreditDetailCodeFirstHasDetails
        ) {
            this.focusInput(this.creditDetailCodeSecondTmp);
        }
        this.setFlagCaculate();
    }

    // chi tiet no 2
    filterCreditDetailCodeSecond(event) {
        if (!event) {
            this.creditDetailCodeSecondFilter = [];
            return;
        }
        if (!this.isCreditDetailCodeFirstHas) {
            console.log('Chưa chọn chi tiết có 1');
            this.creditDetailCodeSecondFilter = [];
            return;
        }
        event.query = event.query || '';
        if (this.fc['creditDetailCodeSecond'].value instanceof String) {
            event.query = this.fc['creditDetailCodeSecond'].value || '';
        } else if (this.fc['creditDetailCodeSecond'].value instanceof Object) {
            this.creditDetailCodeFirstFilter = [
                this.fc['creditDetailCodeSecond'].value,
            ];
            return;
        }
        this.creditDetailCodeSecondPage = {
            ...this.creditDetailCodeSecondPage,
            searchText: event.query,
            parentCode: `${this.fc['creditCode'].value.code}:${this.fc['creditDetailCodeFirst'].value.code}`,
            page: 1,
            totalItems: -1,
        };
        var callBack = () => {
            setTimeout(() => {
                const autocompletePanel =
                    this.creditDetailCodeSecondTmp.el.nativeElement.querySelector(
                        '.p-autocomplete-panel',
                    );
                if (
                    autocompletePanel &&
                    this.creditDetailCodeSecondFilter?.length > 0
                ) {
                    this.renderer.listen(
                        autocompletePanel,
                        'scroll',
                        (event) => {
                            if (
                                event.target.scrollHeight -
                                    event.target.clientHeight -
                                    10 <=
                                event.target.scrollTop
                            ) {
                                this.getCreditDetailCodeSecond(null);
                            }
                        },
                    );
                }
            }, 1000);
        };
        this.getCreditDetailCodeSecond(callBack);
    }

    onSelectCreditDetailCodeSecond($event) {
        if (
            !(
                this.fc['creditDetailCodeSecond'].value instanceof Object &&
                $event.code === this.fc['creditDetailCodeSecond'].value.code
            )
        ) {
            this.f.patchValue({
                creditDetailCodeSecond: $event,
            });
        }
        // this.focusInput(this.creditDetailCodeSecondTmp);
        this.setFlagCaculate();
    }

    onClearCreditDetailCodeSecond(focusInput: boolean = true) {
        this.f.patchValue({
            creditDetailCodeSecond: '',
        });
        if (focusInput) {
            this.focusInput(this.creditDetailCodeSecondTmp);
        }
        this.setFlagCaculate();
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
                this[`${ConfigAriseEnum[key]}Filter`]?.length > 0
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

    onBlurInputAutoCompleteInvoiceCode(allowAutoFocus: boolean) {
        this.onChangeInputAutoCompleteInvoiceCode(allowAutoFocus);
    }

    onChangeInputAutoCompleteInvoiceCode(allowAutoFocus: boolean) {
        const invoiceCode = this.fc['invoiceCode'].value || '';
        if (invoiceCode instanceof Object) {
            this.setTabIndexRelatedInputInvoiceCode();
            return;
        }
        // Nếu loại hóa đơn không chọn dữ liệu mà chỉ nhập
        // Kiểm tra nếu khớp thì chọn
        // Nếu không sẽ ở yên
        if (invoiceCode !== '') {
            const invoice = _.find(this.invoiceCodeList, (item) => {
                return item.code.toLowerCase() === invoiceCode.toLowerCase();
            });
            if (invoice) {
                this.onSelectInvoiceCode(invoice);
                this.invoiceCodeFilter = [_.cloneDeep(invoice)];
                this.setTabIndexRelatedInputInvoiceCode();
            } else {
                this.invoiceCodeFilter = [];
                this.setTabIndexRelatedInputInvoiceCode();
                if (allowAutoFocus) {
                    this.invoiceSerialTmp.nativeElement?.setAttribute(
                        'tabIndex',
                        0,
                    );
                    this.focusInput(this.invoiceCodeTmp);
                }
            }
        }
        // Nếu loại hóa đơn không nhập
        else {
            this.setTabIndexRelatedInputInvoiceCode();
            this.invoiceSerialTmp.nativeElement?.setAttribute('tabIndex', -1);
        }
    }

    // chỉnh lại tabindex cho các tab liên quan đế loại hóa đơn đang ở trạng thái readlonly
    // không cho focus vào các ô input đó
    private setTabIndexRelatedInputInvoiceCode() {
        try {
            _.each(
                [
                    ConfigAriseEnum.invoiceSerial,
                    ConfigAriseEnum.invoiceNumber,
                    ConfigAriseEnum.invoiceDate,
                    ConfigAriseEnum.invoiceTaxCode,
                    ConfigAriseEnum.invoiceName,
                    ConfigAriseEnum.invoiceAddress,
                    ConfigAriseEnum.invoiceProductItem,
                ],
                (key) => {
                    if (
                        this[`${ConfigAriseEnum[key]}Tmp`] instanceof InputMask
                    ) {
                        (
                            this[`${ConfigAriseEnum[key]}Tmp`] as InputMask
                        )?.el?.nativeElement?.children[0]?.setAttribute(
                            'tabIndex',
                            !this.isInvoiceCodeHasValue ? -1 : 0,
                        );
                        (
                            this[`${ConfigAriseEnum[key]}Tmp`] as InputMask
                        )?.el?.nativeElement?.input?.setAttribute(
                            'tabIndex',
                            !this.isInvoiceCodeHasValue ? -1 : 0,
                        );
                    } else if (
                        this[`${ConfigAriseEnum[key]}Tmp`] instanceof
                        InputNumber
                    ) {
                        (
                            this[`${ConfigAriseEnum[key]}Tmp`] as InputNumber
                        )?.input?.nativeElement?.setAttribute(
                            'tabIndex',
                            !this.isInvoiceCodeHasValue ? -1 : 0,
                        );
                    } else if (
                        this[`${ConfigAriseEnum[key]}Tmp`] instanceof ElementRef
                    ) {
                        (
                            this[`${ConfigAriseEnum[key]}Tmp`] as ElementRef
                        )?.nativeElement?.setAttribute(
                            'tabIndex',
                            !this.isInvoiceCodeHasValue ? -1 : 0,
                        );
                    } else if (
                        this[`${ConfigAriseEnum[key]}Tmp`] instanceof
                        AutoComplete
                    ) {
                        if (this.isInvoiceCodeHasValue) {
                            (
                                this[
                                    `${ConfigAriseEnum[key]}Tmp`
                                ] as AutoComplete
                            )?.el?.nativeElement?.removeAttribute('tabIndex');
                        } else {
                            (
                                this[
                                    `${ConfigAriseEnum[key]}Tmp`
                                ] as AutoComplete
                            )?.el?.nativeElement?.setAttribute('tabIndex', -1);
                        }
                    }
                },
            );
        } catch {}
    }

    public setFlagCaculate(isNewForm?: boolean) {
        this.setAllowDepreciaMonth(isNewForm);
        this.setAllowForeignCurrency(isNewForm);
        this.setAllowInputQuantityAndUnitPrice(isNewForm);
        this.setAllowProjectCode(isNewForm);
        this.setAllowInputInvoiceInfomation(isNewForm);
        this.setWareHouseCode();
    }

    private setAllowProjectCode(isNewForm: boolean) {
        this.isAllowProjectCode = this.checkChildrenAccountAllowInputByKey(
            [6],
            'classification',
        );
        if (!this.isAllowProjectCode && !isNewForm) {
            this.fc['projectCode'].setValue('');
        }
    }

    private setWareHouseCode() {
        this.debitWarehouse = this.getWarehouse('debit');
        this.creditWarehouse = this.getWarehouse('credit');
    }

    private setAllowForeignCurrency(isNewForm: boolean) {
        this.isForeignCurrency = this.checkChildrenAccountAllowInputByKey(
            [true],
            'isForeignCurrency',
        );
        if (!this.isForeignCurrency && !isNewForm) {
            this.fc['orginalCurrency'].setValue(0);
            this.fc['exchangeRate'].setValue(0);
        }
    }

    private setAllowInputQuantityAndUnitPrice(isNewForm: boolean) {
        this.isAllowInputQuantityAndUnitPrice =
            this.checkChildrenAccountAllowInputByKey([3, 4], 'accGroup');
        if (!this.isAllowInputQuantityAndUnitPrice) {
            this.isAllowInputQuantityAndUnitPrice = false;
            if (!isNewForm) {
                this.f.patchValue({
                    quantity: 0,
                    unitPrice: 0,
                });
            }
        }
    }

    private getWarehouse(key: string = 'credit' || 'debit'): any {
        if (key === 'debit') {
            // Nếu tài khoản có chi tiết 1
            // Nếu chi tiết 1 có chi tiết 2
            // Chi tiết 2 có dữ liệu
            if (
                this.isDebitCodeHasDetails &&
                this.isDebitDetailCodeFirstHasDetails &&
                this.isDebitDetailCodeSecondHas
            ) {
                return {
                    code: this.fc['debitDetailCodeSecond'].value.warehouseCode,
                    name: this.fc['debitDetailCodeSecond'].value.warehouseName,
                };
            }
            // Nếu tài khoản có chi tiết 1
            // Nếu chi tiết 1 không có chi tiết 2
            // Chi tiết 1 có dữ liệu
            else if (
                this.isDebitCodeHasDetails &&
                !this.isDebitDetailCodeFirstHasDetails
            ) {
                return {
                    code: this.fc['debitDetailCodeFirst'].value.warehouseCode,
                    name: this.fc['debitDetailCodeFirst'].value.warehouseName,
                };
            }
            // Nếu tài khoản không có chi tiết 1
            // Tài khoản có dữ liệu
            else if (!this.isDebitCodeHasDetails) {
                return {
                    code: this.fc['debitCode'].value.warehouseCode,
                    name: this.fc['debitCode'].value.warehouseName,
                };
            }
        } else if (key === 'credit') {
            // Nếu tài khoản có chi tiết 1
            // Nếu chi tiết 1 có chi tiết 2
            // Chi tiết 2 có dữ liệu
            if (
                this.isCreditCodeHasDetails &&
                this.isCreditDetailCodeFirstHasDetails &&
                this.isCreditDetailCodeSecondHas
            ) {
                return {
                    code: this.fc['creditDetailCodeSecond'].value.warehouseCode,
                    name: this.fc['creditDetailCodeSecond'].value.warehouseName,
                };
            }
            // Nếu tài khoản có chi tiết 1
            // Nếu chi tiết 1 không có chi tiết 2
            // Chi tiết 1 có dữ liệu
            else if (
                this.isCreditCodeHasDetails &&
                !this.isCreditDetailCodeFirstHasDetails
            ) {
                return {
                    code: this.fc['creditDetailCodeFirst'].value.warehouseCode,
                    name: this.fc['creditDetailCodeFirst'].value.warehouseName,
                };
            }
            // Nếu tài khoản không có chi tiết 1
            // Tài khoản có dữ liệu
            else if (!this.isCreditCodeHasDetails) {
                return {
                    code: this.fc['creditCode'].value.warehouseCode,
                    name: this.fc['creditCode'].value.warehouseName,
                };
            }
        }
        return {
            code: '',
            name: '',
        };
    }

    private checkChildrenAccountAllowInputByKey(
        arr: any[],
        key: string,
    ): boolean {
        let checkDebit = false;
        let checkCredit = false;
        // Nếu tài khoản có chi tiết 1
        // Nếu chi tiết 1 có chi tiết 2
        // Chi tiết 2 có dữ liệu
        if (
            this.isDebitCodeHasDetails &&
            this.isDebitDetailCodeFirstHasDetails &&
            this.isDebitDetailCodeSecondHas &&
            arr.includes(this.fc['debitDetailCodeSecond'].value[key])
        ) {
            checkDebit = true;
        }
        // Nếu tài khoản có chi tiết 1
        // Nếu chi tiết 1 không có chi tiết 2
        // Chi tiết 1 có dữ liệu
        else if (
            this.isDebitCodeHasDetails &&
            !this.isDebitDetailCodeFirstHasDetails &&
            arr.includes(this.fc['debitDetailCodeFirst'].value[key])
        ) {
            checkDebit = true;
        }
        // Nếu tài khoản không có chi tiết 1
        // Tài khoản có dữ liệu
        else if (
            !this.isDebitCodeHasDetails &&
            arr.includes(this.fc['debitCode'].value[key])
        ) {
            checkDebit = true;
        }
        // Nếu tài khoản có chi tiết 1
        // Nếu chi tiết 1 có chi tiết 2
        // Chi tiết 2 có dữ liệu
        if (
            this.isCreditCodeHasDetails &&
            this.isCreditDetailCodeFirstHasDetails &&
            this.isCreditDetailCodeSecondHas &&
            arr.includes(this.fc['creditDetailCodeSecond'].value[key])
        ) {
            checkCredit = true;
        }
        // Nếu tài khoản có chi tiết 1
        // Nếu chi tiết 1 không có chi tiết 2
        // Chi tiết 1 có dữ liệu
        else if (
            this.isCreditCodeHasDetails &&
            !this.isCreditDetailCodeFirstHasDetails &&
            arr.includes(this.fc['creditDetailCodeFirst'].value[key])
        ) {
            checkCredit = true;
        }
        // Nếu tài khoản không có chi tiết 1
        // Tài khoản có dữ liệu
        else if (
            !this.isCreditCodeHasDetails &&
            arr.includes(this.fc['creditCode'].value[key])
        ) {
            checkCredit = true;
        }
        return !checkCredit && !checkDebit ? false : true;
    }

    private setAllowDepreciaMonth(isNewForm: boolean) {
        this.isAllowDepreciaMonth = this.checkChildrenAccountAllowInputByKey(
            [4, 5, 7],
            'classification',
        );
        if (!this.isAllowDepreciaMonth && !isNewForm) {
            this.fc['depreciaMonth'].setValue(0);
        }
    }

    private setAllowInputInvoiceInfomation(isNewForm?: boolean): void {
        const invoiceCode = this.fc['invoiceCode'].value || '';
        if (invoiceCode === '' && !isNewForm) {
            this.f.patchValue({
                invoiceSerial: '',
                invoiceNumber: '',
                invoiceDate: null,
                invoiceTaxCode: '',
                invoiceName: '',
                invoiceAddress: '',
                invoiceProductItem: '',
            });
        }
    }

    onChangeInvoiceTaxCode() {
        if (this.fc['invoiceTaxCode'].value instanceof Object) {
            const value = _.cloneDeep(this.fc['invoiceTaxCode'].value);
            this.fc['invoiceTaxCode'].setValue({
                ...value,
                temporaty: true,
            });
        }
    }

    onChangeOrginalAddress() {
        if (this.fc['orginalCompanyName'].value instanceof Object) {
            const value = _.cloneDeep(this.fc['orginalCompanyName'].value);
            this.fc['orginalCompanyName'].setValue({
                ...value,
                temporaty: true,
            });
        }
    }

    // nếu trên table cho phép xem hết loại chứng từ, form nhập chỉ cho phép chỉnh sửa
    get allowWorkForm() {
        return this.dataTable?.showAllDocument && this.isNewForm ? false : true;
    }

    get isNewForm() {
        return this.fc['id']?.value === 0;
    }

    // closing
    get debitCodeClosing() {
        return !this.isDebitCodeHas
            ? null
            : this.fc['debitCode'].value.closingAmount || 0;
    }
    get debitDetailCodeFirstClosing() {
        return !this.isDebitDetailCodeFirstHas
            ? null
            : this.fc['debitDetailCodeFirst'].value.closingAmount || 0;
    }
    get debitDetailCodeSecondClosing() {
        return !this.isDebitDetailCodeSecondHas
            ? null
            : this.fc['debitDetailCodeSecond'].value.closingAmount || 0;
    }

    get debitCodeClosingStockQuantity() {
        return !this.isDebitCodeHas
            ? null
            : this.fc['debitCode'].value.accGroup || 0;
    }
    get debitDetailCodeFirstClosingStockQuantity() {
        return !this.isDebitDetailCodeFirstHas
            ? null
            : this.fc['debitDetailCodeFirst'].value.closingStockQuantity || 0;
    }
    get debitDetailCodeSecondClosingStockQuantity() {
        return !this.isDebitDetailCodeSecondHas
            ? null
            : this.fc['debitDetailCodeSecond'].value.closingStockQuantity || 0;
    }

    get creditCodeClosing() {
        return !this.isCreditCodeHas
            ? null
            : this.fc['creditCode'].value.closingAmount || 0;
    }
    get creditDetailCodeFirstClosing() {
        return !this.isCreditDetailCodeFirstHas
            ? null
            : this.fc['creditDetailCodeFirst'].value.closingAmount || 0;
    }
    get creditDetailCodeSecondClosing() {
        return !this.isCreditDetailCodeSecondHas
            ? null
            : this.fc['creditDetailCodeSecond'].value.closingAmount || 0;
    }

    get creditCodeClosingStockQuantity() {
        return !this.isCreditCodeHas
            ? null
            : this.fc['creditCode'].value.accGroup || 0;
    }
    get creditDetailCodeFirstClosingStockQuantity() {
        return !this.isCreditDetailCodeFirstHas
            ? null
            : this.fc['creditDetailCodeFirst'].value.closingStockQuantity || 0;
    }
    get creditDetailCodeSecondClosingStockQuantity() {
        return !this.isCreditDetailCodeSecondHas
            ? null
            : this.fc['creditDetailCodeSecond'].value.closingStockQuantity || 0;
    }

    get isSaveDescription() {
        return (
            this.isDebitCodeHas &&
            this.isCreditCodeHas &&
            ((this.fc['orginalDescription'].value instanceof Object &&
                this.fc['orginalDescription'].value.temporaty) ||
                (!(this.fc['orginalDescription'].value instanceof Object) &&
                    this.fc['orginalDescription'].value !== ''))
        );
    }

    get isSaveTaxCode() {
        return (
            this.isInvoiceCodeHasValue &&
            this.fc['invoiceName'].value !== '' &&
            this.fc['invoiceAddress'].value !== '' &&
            ((this.fc['invoiceTaxCode'].value instanceof Object &&
                this.fc['invoiceTaxCode'].value.temporaty) ||
                (!(this.fc['invoiceTaxCode'].value instanceof Object) &&
                    this.fc['invoiceTaxCode'].value !== ''))
        );
    }

    get isSavePayerName() {
        return (
            this.fc['orginalAddress'].value !== '' &&
            ((this.fc['orginalCompanyName'].value instanceof Object &&
                this.fc['orginalCompanyName'].value.temporaty) ||
                (!(this.fc['orginalCompanyName'].value instanceof Object) &&
                    this.fc['orginalCompanyName'].value !== ''))
        );
    }

    get isValidationInvoiceCode() {
        return (
            this.isInvoiceCodeHasValue || this.fc['invoiceCode'].value === ''
        );
    }

    get isInvoiceCodeHasValue() {
        return this.fc['invoiceCode']?.value instanceof Object;
    }

    get isHiddenAutoCompleteInvoiceTaxCode() {
        return (
            this.fc['invoiceTaxCode']?.value instanceof Object &&
            this.invoiceTaxCodeFilter?.length
        );
    }

    get isHiddenAutoCompleteCreditDetailCodeSecond() {
        return (
            this.fc['creditDetailCodeSecond'].value instanceof Object &&
            this.creditDetailCodeSecondFilter?.length
        );
    }

    get isHiddenAutoCompleteCreditDetailCodeFirst() {
        return (
            this.fc['creditDetailCodeFirst'].value instanceof Object &&
            this.creditDetailCodeFirstFilter?.length
        );
    }

    get isHiddenAutoCompleteCreditCode() {
        return (
            this.fc['creditCode'].value instanceof Object &&
            this.creditCodeFilter?.length
        );
    }

    get isHiddenAutoCompleteDebitDetailCodeSecond() {
        return (
            this.fc['debitDetailCodeSecond'].value instanceof Object &&
            this.debitDetailCodeSecondFilter?.length
        );
    }

    get isHiddenAutoCompleteDebitDetailCodeFirst() {
        return (
            this.fc['debitDetailCodeFirst'].value instanceof Object &&
            this.debitDetailCodeFirstFilter?.length
        );
    }

    get isHiddenAutoCompleteDebitCode() {
        return (
            this.fc['debitCode'].value instanceof Object &&
            this.debitCodeFilter.length
        );
    }

    get isHiddenAutoCompleteInvoiceCode() {
        return (
            this.fc['invoiceCode'].value instanceof Object &&
            this.invoiceCodeFilter?.length
        );
    }

    get isHiddenAutoCompleteProjectCode() {
        return (
            this.fc['projectCode'].value instanceof Object &&
            this.projectCodeFilter?.length
        );
    }

    get isHiddenAutoCompleteOrginalDescription() {
        return (
            this.fc['orginalDescription'].value instanceof Object &&
            this.orginalDescriptionFilter.length
        );
    }

    get isHiddenAutoCompleteOrginalCompanyName() {
        return (
            this.fc['orginalCompanyName'].value instanceof Object &&
            this.orginalCompanyNameFilter?.length
        );
    }

    get isCreditCodeHasDetails() {
        return this.fc['creditCode'].value?.hasDetails;
    }

    get isCreditCodeHas() {
        return this.fc['creditCode'].value instanceof Object;
    }

    get isCreditDetailCodeFirstHas() {
        return this.fc['creditDetailCodeFirst'].value instanceof Object;
    }

    get isCreditDetailCodeFirstHasDetails() {
        return this.fc['creditDetailCodeFirst'].value?.hasDetails;
    }

    get isDebitCodeHasDetails() {
        return this.fc['debitCode'].value?.hasDetails;
    }

    get isDebitCodeHas() {
        return this.fc['debitCode'].value instanceof Object;
    }

    get isDebitDetailCodeFirstHas() {
        return this.fc['debitDetailCodeFirst'].value instanceof Object;
    }

    get isDebitDetailCodeFirstHasDetails() {
        return this.fc['debitDetailCodeFirst'].value?.hasDetails;
    }

    get isDebitDetailCodeSecondHas() {
        return this.fc['debitDetailCodeSecond'].value instanceof Object;
    }

    get isCreditDetailCodeSecondHas() {
        return this.fc['creditDetailCodeSecond'].value instanceof Object;
    }

    get f() {
        return this.ledgerForm;
    }

    get fc() {
        return this.ledgerForm.controls;
    }

    getArisingForOriginVoucherNumber() {
        this.arisingForOriginVoucherNumber = null;
        const orginalVoucherNumber: string =
            this.fc['orginalVoucherNumber'].value;
        const isInternal: number = this.fc['isInternal'].value;
        if (!orginalVoucherNumber) {
            return;
        }
        this.ledgerService
            .getArisingForOriginVoucherNumber(orginalVoucherNumber, isInternal)
            .subscribe((res: any) => {
                if (!this.isNewForm) {
                    res.totalAmount -= this.fc['amount'].value;
                }
                this.arisingForOriginVoucherNumber = res;
            });
    }

    buildFormAfterCrud($event: any) {
        if (!$event) {
            throw new Error('Dữ liệu binding không có');
        }
        if (!$event.dataTable?.document) {
            throw new Error('Dữ liệu document binding không có');
        }
        const dataTable = $event.dataTable;
        const buttonClick = $event.buttonClick;
        this.dataTable = $event.dataTable;
        this.setFlagCaculate();
        if (!this.allowWorkForm) {
            return;
        }
        if (buttonClick == -1) {
            this.getArisingForOriginVoucherNumber();
            return;
        }
        // Nếu trong config của mỗi button có cấu hình xóa orginalVoucherNumber
        // Khi lưu sẽ tự tạo lại orginalVoucherNumber và voucherNumber
        const config = _.find(this.listConfig, (item) => {
            return (
                item[ConfigButtonAriseEnum[buttonClick]] === true &&
                item.configAriseBehaviour.codeData ==
                    ConfigAriseEnum[ConfigAriseEnum.orginalVoucherNumber]
            );
        });
        if (config) {
            const orginalVoucherNumber = `${
                dataTable.document.code
            }${AppUtil.addLeadingZeros(
                dataTable?.filterMonth || new Date().getMonth() + 1,
                2,
            )}-${
                dataTable.selectedYear ||
                new Date().getFullYear().toString().substring(2, 4)
            }-${AppUtil.addLeadingZeros(dataTable.nextStt, 3)}`.replace(
                ' ',
                '',
            );
            const voucherNumber = `${AppUtil.addLeadingZeros(
                dataTable?.filterMonth || new Date().getMonth() + 1,
                2,
            ).toString()}/${dataTable.document.code}`;
            this.f.patchValue({
                orginalVoucherNumber: orginalVoucherNumber,
                voucherNumber: voucherNumber,
            });
        }
        this.getArisingForOriginVoucherNumber();
    }

    buildNewForm($event: any) {
        if (!$event) {
            throw new Error('Dữ liệu binding không có');
        }
        if (!$event.dataTable?.document) {
            throw new Error('Dữ liệu document binding không có');
        }
        const data = $event.itemDetail;
        const dataTable = $event.dataTable;
        this.ledgerForm = this.fb.group({
            id: [0],
            type: [],
            month: [0],
            voucherNumber: [''],
            orginalAddress: [''],
            orginalVoucherNumber: [''],
            orginalBookDate: [],
            referenceVoucherNumber: [''],
            referenceBookDate: [],
            referenceFullName: [''],
            referenceAddress: [''],
            isInternal: [0],
            attachVoucher: [''],
            invoiceCode: [''],
            invoiceName: [''],
            invoiceTaxCode: [''],
            invoiceAddress: [''],
            invoiceProductItem: [''],
            invoiceAdditionalDeclarationCode: [''],
            invoiceSerial: [''],
            invoiceNumber: [''],
            invoiceDate: [],
            debitCode: [''],
            debitDetailCodeFirst: [''],
            debitDetailCodeSecond: [''],
            creditCode: [''],
            creditDetailCodeFirst: [''],
            creditDetailCodeSecond: [''],
            debitWarehouse: [''],
            creditWarehouse: [''],
            projectCode: [''],
            depreciaMonth: [''],
            orginalCurrency: [''],
            exchangeRate: [0],
            quantity: [0],
            unitPrice: [0],
            amount: [0],
            //payer
            orginalCompanyName: [''],
            //description
            orginalDescription: [''],
        });
        this.isShowPhieuNhap = dataTable.document.code === 'PC';
        this.orginalCompanyNameLabel = dataTable.document?.title || 'Người nộp';
        if (!data) {
            if (dataTable?.showAllDocument) {
                this.dataTable = dataTable;
                this.setFlagCaculate();
                setTimeout(() => {
                    this.focusInput(this.orginalVoucherNumberTmp);
                }, 500);
                return;
            }
            this.preparationDocuments(dataTable?.document?.id);
            this.dataTable = dataTable;
            const orginalVoucherNumber = `${
                dataTable.document.code
            }${AppUtil.addLeadingZeros(
                dataTable?.filterMonth || new Date().getMonth() + 1,
                2,
            )}-${
                dataTable.selectedYear ||
                new Date().getFullYear().toString().substring(2, 4)
            }-${AppUtil.addLeadingZeros(dataTable.nextStt, 3)}`.replace(
                ' ',
                '',
            );
            const voucherNumber = `${AppUtil.addLeadingZeros(
                dataTable?.filterMonth || new Date().getMonth() + 1,
                2,
            ).toString()}/${dataTable.document.code}`;
            this.f.patchValue({
                debitCode: dataTable.document?.debit || '',
                debitDetailCodeFirst:
                    dataTable.document?.debitDetailFirst || '',
                debitDetailCodeSecond:
                    dataTable.document?.debitDetailSecond || '',
                creditCode: dataTable.document?.credit || '',
                creditDetailCodeFirst:
                    dataTable.document?.creditDetailFirst || '',
                creditDetailCodeSecond:
                    dataTable.document?.creditDetailSecond || '',
                orginalVoucherNumber: orginalVoucherNumber,
                voucherNumber: voucherNumber,
                orginalBookDate: moment().format(
                    AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                ),
                referenceBookDate: moment().format(
                    AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                ),
                invoiceDate: moment().format(
                    AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                ),
                isInternal: Number(dataTable.isInternal) || 0,
                month: Number(dataTable.filterMonth) || 0,
                type: dataTable.document.code,
                invoiceAdditionalDeclarationCode: 'BT',
            });
            this.setFlagCaculate();
            this.getArisingForOriginVoucherNumber();
            setTimeout(() => {
                this.focusInput(this.orginalVoucherNumberTmp);
            }, 500);
            return;
        }
        this.preparationDocuments(dataTable?.document?.id);
        this.dataTable = dataTable;
        this.f.patchValue({
            id: data.id,
            type: data.type,
            month: data.month,
            voucherNumber: data.voucherNumber,
            orginalAddress: data.orginalAddress,
            orginalVoucherNumber: data.orginalVoucherNumber,
            orginalBookDate: moment(data.orginalBookDate).format(
                AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ),
            referenceVoucherNumber: data.referenceVoucherNumber,
            referenceBookDate: moment(data.referenceBookDate).format(
                AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ),
            referenceFullName: data.referenceFullName,
            isInternal: data.isInternal,
            referenceAddress: data.referenceAddress,
            attachVoucher: data.attachVoucher,
            invoiceCode:
                data.invoiceCode && data.invoiceCode !== ''
                    ? _.find(this.invoiceCodeList, {
                          code: data.invoiceCode,
                      }) || ''
                    : '',
            invoiceName: data.invoiceName || '',
            invoiceTaxCode:
                data.invoiceTaxCode && data.invoiceTaxCode !== ''
                    ? {
                          taxCode: data.invoiceTaxCode,
                          name: data.invoiceTaxCode,
                      }
                    : '',
            invoiceAddress: data.invoiceAddress || '',
            invoiceProductItem: data.invoiceProductItem || '',
            invoiceAdditionalDeclarationCode:
                data.invoiceAdditionalDeclarationCode,
            invoiceSerial: data.invoiceSerial,
            invoiceNumber: data.invoiceNumber,
            invoiceDate: data.invoiceDate ? moment(data.invoiceDate).format(
                AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ) : null,
            debitWarehouse: data.debitWarehouse,
            creditWarehouse: data.creditWarehouse,
            projectCode: '',
            depreciaMonth: data.depreciaMonth,
            orginalCurrency: data.orginalCurrency,
            exchangeRate: data.exchangeRate == '' ? 0 : data.exchangeRate,
            quantity: data.quantity == '' ? 0 : data.quantity,
            unitPrice: data.unitPrice == '' ? 0 : data.unitPrice,
            amount: data.amount == '' ? 0 : data.amount,
            orginalCompanyName:
                data.orginalCompanyName && data.orginalCompanyName !== ''
                    ? {
                          code: data.orginalCompanyName,
                          name: data.orginalCompanyName,
                      }
                    : '',
            orginalDescription:
                data.orginalDescription && data.orginalDescription !== ''
                    ? {
                          code: data.orginalDescription,
                          name: data.orginalDescription,
                      }
                    : '',
        });
        if (data.project) {
            this.f.patchValue({
                projectCode: data.project,
            });
            this.projectCodeFilter = [data.project];
        }
        if (data.credit) {
            this.f.patchValue({
                creditCode: data.credit,
            });
            this.creditCodeFilter = [data.credit];
        }
        if (data.creditDetailFirst) {
            this.f.patchValue({
                creditDetailCodeFirst: data.creditDetailFirst,
            });
            this.creditDetailCodeFirstFilter = [data.creditDetailFirst];
        }
        if (data.creditDetailSecond) {
            this.f.patchValue({
                creditDetailCodeSecond: data.creditDetailSecond,
            });
            this.creditDetailCodeSecondFilter = [data.creditDetailSecond];
        }

        if (data.debit) {
            this.f.patchValue({
                debitCode: data.debit,
            });
            this.debitCodeFilter = [data.debit];
        }
        if (data.debitDetailFirst) {
            this.f.patchValue({
                debitDetailCodeFirst: data.debitDetailFirst,
            });
            this.debitDetailCodeFirstFilter = [data.debitDetailFirst];
        }
        if (data.debitDetailSecond) {
            this.f.patchValue({
                debitDetailCodeSecond: data.debitDetailSecond,
            });
            this.debitDetailCodeSecondFilter = [data.debitDetailSecond];
        }
        this.setFlagCaculate(true);
        this.getArisingForOriginVoucherNumber();
        setTimeout(() => {
            this.focusInput(this.orginalVoucherNumberTmp);
        }, 500);
    }

    validateForm(): boolean {
        if (!this.allowWorkForm) return false;
        // nếu các giá trị cơ bản của form không có
        if (this.f.invalid) return false;
        // Nếu loại hóa đơn nhập sai
        if (!this.isValidationInvoiceCode) return false;
        // Nếu chi tiết 1 có con và chi tiết 2 có dữ liệu
        if (
            this.isDebitDetailCodeFirstHasDetails &&
            !this.isDebitDetailCodeSecondHas
        )
            return false;
        if (
            this.isCreditDetailCodeFirstHasDetails &&
            !this.isCreditDetailCodeSecondHas
        )
            return false;
        // nếu tài khoản có/nợ có con và chi tiết 1 có dữ liệu
        if (this.isDebitCodeHasDetails && !this.isDebitDetailCodeFirstHas)
            return false;
        if (this.isCreditCodeHasDetails && !this.isCreditDetailCodeFirstHas)
            return false;
        // nếu tài khoản nợ/có không có dữ liệu
        if ([this.isDebitCodeHas, this.isCreditCodeHas].includes(false))
            return false;
        return true;
    }

    private getDebitDetailCodeFirst(callBack) {
        if (
            this.debitDetailCodeFirstPage.isLoadding ||
            this.debitDetailCodeFirstPage.totalItems ===
                this.debitDetailCodeFirstFilter?.length
        ) {
            return;
        }
        this.debitDetailCodeFirstPage.isLoadding = true;
        let params = _.cloneDeep(this.debitDetailCodeFirstPage);
        delete params.isLoadding;
        delete params.totalItems;
        this.chartOfAccountService
            .getDetailV2(params.parentCode, params)
            .subscribe((res) => {
                if (this.debitDetailCodeFirstPage.page === 1) {
                    this.debitDetailCodeFirstFilter = [];
                }
                this.debitDetailCodeFirstFilter =
                    this.debitDetailCodeFirstFilter.concat(res.data);
                this.debitDetailCodeFirstPage.page++;
                this.debitDetailCodeFirstPage = {
                    ...this.debitDetailCodeFirstPage,
                    totalItems: res.totalItems,
                    isLoadding: false,
                };
                if (callBack) {
                    callBack();
                }
            });
    }

    private getDebitDetailCodeSecond(callBack) {
        if (
            this.debitDetailCodeSecondPage.isLoadding ||
            this.debitDetailCodeSecondPage.totalItems ===
                this.debitDetailCodeSecondFilter?.length
        ) {
            return;
        }
        this.debitDetailCodeSecondPage.isLoadding = true;
        let params = _.cloneDeep(this.debitDetailCodeSecondPage);
        delete params.isLoadding;
        delete params.totalItems;
        this.chartOfAccountService
            .getDetailV2(params.parentCode, params)
            .subscribe((res) => {
                if (this.debitDetailCodeSecondPage.page === 1) {
                    this.debitDetailCodeSecondFilter = [];
                }
                this.debitDetailCodeSecondFilter =
                    this.debitDetailCodeSecondFilter.concat(res.data);
                this.debitDetailCodeSecondPage.page++;
                this.debitDetailCodeSecondPage = {
                    ...this.debitDetailCodeSecondPage,
                    totalItems: res.totalItems,
                    isLoadding: false,
                };
                if (callBack) {
                    callBack();
                }
            });
    }

    private getCreditDetailCodeFirst(callBack) {
        if (
            this.creditDetailCodeFirstPage.isLoadding ||
            this.creditDetailCodeFirstPage.totalItems ===
                this.creditDetailCodeFirstFilter.length
        ) {
            return;
        }
        this.creditDetailCodeFirstPage.isLoadding = true;
        let params = _.cloneDeep(this.creditDetailCodeFirstPage);
        delete params.isLoadding;
        delete params.totalItems;
        this.chartOfAccountService
            .getDetailV2(params.parentCode, params)
            .subscribe((res) => {
                if (this.creditDetailCodeFirstPage.page === 1) {
                    this.creditDetailCodeFirstFilter = [];
                }
                this.creditDetailCodeFirstFilter =
                    this.creditDetailCodeFirstFilter.concat(res.data);
                this.creditDetailCodeFirstPage.page++;
                this.creditDetailCodeFirstPage = {
                    ...this.creditDetailCodeFirstPage,
                    totalItems: res.totalItems,
                    isLoadding: false,
                };
                if (callBack) {
                    callBack();
                }
            });
    }

    private getCreditDetailCodeSecond(callBack) {
        if (
            this.creditDetailCodeSecondPage.isLoadding ||
            this.creditDetailCodeSecondPage.totalItems ===
                this.creditDetailCodeSecondFilter?.length
        ) {
            return;
        }
        this.creditDetailCodeSecondPage.isLoadding = true;
        let params = _.cloneDeep(this.creditDetailCodeSecondPage);
        delete params.isLoadding;
        delete params.totalItems;
        this.chartOfAccountService
            .getDetailV2(params.parentCode, params)
            .subscribe((res) => {
                if (this.creditDetailCodeSecondPage.page === 1) {
                    this.creditDetailCodeSecondFilter = [];
                }
                this.creditDetailCodeSecondFilter =
                    this.creditDetailCodeSecondFilter.concat(res.data);
                this.creditDetailCodeSecondPage.page++;
                this.creditDetailCodeSecondPage = {
                    ...this.creditDetailCodeSecondPage,
                    totalItems: res.totalItems,
                    isLoadding: false,
                };
                if (callBack) {
                    callBack();
                }
            });
    }

    public focusInput(
        input: InputMask | InputNumber | AutoComplete | ElementRef,
    ) {
        if (!this.allowWorkForm) return;
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

    // Tự động xóa các ô input nếu có cấu hình các nút lưu
    private onAutoRemoveValueInputByConfig(
        button: ConfigButtonAriseEnum,
        data: any,
    ): any {
        let result = _.cloneDeep(data);
        _.each(this.listConfig, (config) => {
            if (
                config[ConfigButtonAriseEnum[button]] === true ||
                this.checkConfigParentRemove(config, button)
            ) {
                if (
                    this[`${config.configAriseBehaviour.codeData}Tmp`] &&
                    this[
                        `${config.configAriseBehaviour.codeData}Tmp`
                    ] instanceof InputNumber
                ) {
                    result[config.configAriseBehaviour.codeData] = 0;
                } else if (
                    this[`${config.configAriseBehaviour.codeData}Tmp`] &&
                    this[
                        `${config.configAriseBehaviour.codeData}Tmp`
                    ] instanceof InputMask
                ) {
                    result[config.configAriseBehaviour.codeData] =
                        moment().format(
                            AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                        );
                } else {
                    result[config.configAriseBehaviour.codeData] = '';
                }
            }
        });
        return result;
    }

    // Nếu input cha có cấu hình nhưng input hiện tại (con) không được cấu hình xóa
    // inpu hiện tại (con) sẽ xóa theo
    private checkConfigParentRemove(
        config: IConfigAriseDocumentBehaviourDto,
        button: ConfigButtonAriseEnum,
    ): boolean {
        let codes = config.configAriseBehaviour.code.split('.');

        if (codes.length == 1) {
            return false;
        }

        let parentCode = codes[0];
        for (let i = 1; i < codes.length - 1; i++) {
            parentCode += `.${codes[i]}`;
        }

        const parent = _.find(this.listConfig, (item) => {
            return item.configAriseBehaviour.code == parentCode;
        });

        if (!parent) return true;

        return parent[ConfigButtonAriseEnum[button]];
    }

    // Tự động focus sau khi lưu
    private autoFocusAfterSave() {
        const config = _.find(this.listConfig, (item) => {
            return item['focusLedger'] === true;
        });

        if (config) {
            if (
                this[`${config.configAriseBehaviour.codeData}Tmp`] &&
                this[`${config.configAriseBehaviour.codeData}Tmp`] instanceof
                    AutoComplete
            ) {
                this.focusInput(
                    this[
                        `${config.configAriseBehaviour.codeData}Tmp`
                    ] as AutoComplete,
                );
            } else if (
                this[`${config.configAriseBehaviour.codeData}Tmp`] &&
                !(
                    this[
                        `${config.configAriseBehaviour.codeData}Tmp`
                    ] instanceof InputMask
                )
            ) {
                this.focusInput(
                    this[
                        `${config.configAriseBehaviour.codeData}Tmp`
                    ] as InputMask,
                );
            } else if (
                this[`${config.configAriseBehaviour.codeData}Tmp`] &&
                !(
                    this[
                        `${config.configAriseBehaviour.codeData}Tmp`
                    ] instanceof InputNumber
                )
            ) {
                this.focusInput(
                    this[
                        `${config.configAriseBehaviour.codeData}Tmp`
                    ] as InputNumber,
                );
            } else {
                this.focusInput(this.orginalVoucherNumberTmp);
            }
        } else {
            this.focusInput(this.orginalVoucherNumberTmp);
        }
    }

    private preparationDocuments(documentId: number) {
        if (documentId == this.dataTable?.document?.id) {
            return;
        }
        this.config$ = this.confiAriseService
            .preparationDocuments(documentId)
            .subscribe((res) => {
                this.listConfig = res;
            });
    }

    ngOnDestroy(): void {
        if (this.config$) this.config$.unsubscribe();
    }

    linkInvoice() {
        this.invoiceService.getEndPoint().subscribe((res) => {
            this.endPointInvoice = res.data;
        });
    }
}
