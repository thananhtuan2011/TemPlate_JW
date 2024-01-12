import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    QueryList,
    Renderer2,
    ViewChild,
    ViewChildren,
} from '@angular/core';
import { AutoComplete } from 'primeng/autocomplete';
import { MenuItem, MessageService } from 'primeng/api';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { ConfiAriseService } from 'src/app/service/config-arise.service';
import AppUtil from 'src/app/utilities/app-util';
import * as moment from 'moment';
import AppConstant from 'src/app/utilities/app-constants';
import { LedgerService } from 'src/app/service/ledger.service';
import {
    ConfigAriseEnum,
    IConfigAriseDocumentBehaviourDto,
} from 'src/app/models/config-arise.model';
import { InputMask } from 'primeng/inputmask';
import { InputNumber } from 'primeng/inputnumber';
import { TieredMenu } from 'primeng/tieredmenu';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import { PayerService } from 'src/app/service/payer.service';
import { Table } from 'primeng/table';

@Component({
    selector: 'app-arise-crud-vat',
    templateUrl: './arise-crud-vat.component.html',
    styleUrls: ['./arise-crud-vat.component.scss'],
})
export class AriseCrudVatComponent implements OnInit {
    //#region Input - Output - Field Define
    debitCodeFilter: any[] = [];
    configAriseEnum = ConfigAriseEnum;
    ledgerTableForm: FormGroup;
    emptyMessageAutoComplete: string = 'không tìm thấy dữ liệu';
    dataTable: any;
    debitWarehouse: any;
    creditWarehouse: any;
    creditCodeFilter: any;
    creditDetailCodeSecondFilter: any = [];
    creditDetailCodeFirstFilter: any[] = [];
    debitDetailCodeFirstFilter: any[] = [];
    debitDetailCodeSecondFilter: any = [];
    creditDetailCodeSecondPage = {
        page: 1,
        pageSize: 20,
        parentCode: '',
        searchText: '',
        totalItems: -1,
        isLoadding: false,
    };
    debitDetailCodeSecondPage = {
        page: 1,
        pageSize: 20,
        parentCode: '',
        searchText: '',
        totalItems: -1,
        isLoadding: false,
    };
    creditDetailCodeFirstPage = {
        page: 1,
        pageSize: 20,
        parentCode: '',
        searchText: '',
        totalItems: -1,
        isLoadding: false,
    };
    debitDetailCodeFirstPage = {
        page: 1,
        pageSize: 20,
        parentCode: '',
        searchText: '',
        totalItems: -1,
        isLoadding: false,
    };

    @Input('chartOfAccounts') chartOfAccounts: any[];
    @ViewChild('ariseMulTableProduct') public ariseMulTableProduct: Table;
    @ViewChildren('debitCodeTmp')
    public debitCodeTmpComponents: QueryList<AutoComplete>;
    @ViewChildren('debitDetailCodeFirstTmp')
    public debitDetailCodeFirstTmpComponents: QueryList<AutoComplete>;
    @ViewChildren('debitDetailCodeSecondTmp')
    public debitDetailCodeSecondTmpComponents: QueryList<AutoComplete>;
    @ViewChildren('creditCodeTmp')
    public creditCodeTmpComponents: QueryList<AutoComplete>;
    @ViewChildren('creditDetailCodeFirstTmp')
    public creditDetailCodeFirstTmpComponents: QueryList<AutoComplete>;
    @ViewChildren('creditDetailCodeSecondTmp')
    public creditDetailCodeSecondTmpComponents: QueryList<AutoComplete>;

    tabs: MenuItem[] = [
        {
            id: '0',
            label: 'Nhập hàng',
            icon: 'pi pi-fw pi-table',
            command: (event) => this.onTabSelected(event),
        },
        {
            id: '1',
            label: 'VAT',
            icon: 'pi pi-fw pi-table',
            command: (event) => this.onTabSelected(event),
        },
        {
            id: '2',
            label: 'Thuế nhập khẩu',
            icon: 'pi pi-fw pi-table',
            command: (event) => this.onTabSelected(event),
        },
        {
            id: '3',
            label: 'Tiền vận chuyển',
            icon: 'pi pi-fw pi-table',
            command: (event) => this.onTabSelected(event),
        },
        {
            id: '4',
            label: 'Phân bổ phí hàng về kho',
            icon: 'pi pi-fw pi-table',
            command: (event) => this.onTabSelected(event),
        },
    ];

    items: MenuItem[] = [
        {
            label: 'Xóa',
            icon: 'pi pi-fw pi-trash',
            command: (event: any) => {
                if (this.selectedRowIndex && this.selectedRowIndex > 0) {
                    this.removeLedgerForm(this.selectedRowIndex);
                }
            },
        },
        {
            label: 'Làm mới',
            icon: 'pi pi-fw pi-refresh',
            command: (event: any) => {
                if (
                    this.selectedRowIndex != undefined &&
                    this.selectedRowIndex != null
                ) {
                    this.resetFormControl(this.selectedRowIndex);
                }
            },
        },
    ];
    selectedRowIndex: any;
    activeItem: MenuItem = this.tabs[0];

    get activeTabId(): string {
        return this.activeItem?.id || '';
    }

    //#endregion

    constructor(
        private readonly chartOfAccountService: ChartOfAccountService,
        private readonly renderer: Renderer2,
        private readonly fb: FormBuilder,
    ) {}

    ngOnInit(): void {
        //build form tabled
        this.buildFormTable();
    }

    //#region Create and action Form and action controls
    validateForm(): boolean {
        // nếu các giá trị cơ bản của form không có
        if (this.ledgerTableForm.invalid) return false;
        // duyển mảng
        for (let index = 0; index < this.ledgers.controls.length; index++) {
            // Nếu chi tiết 1 có con và chi tiết 2 có dữ liệu
            if (
                this.isDebitDetailCodeFirstHasDetails(index) &&
                !this.isDebitDetailCodeSecondHas(index)
            ) {
                return false;
            }
            if (
                this.isCreditDetailCodeFirstHasDetails(index) &&
                !this.isCreditDetailCodeSecondHas(index)
            )
                return false;
            // nếu tài khoản có/nợ có con và chi tiết 1 có dữ liệu
            if (
                this.isDebitCodeHasDetails(index) &&
                !this.isDebitDetailCodeFirstHas(index)
            )
                return false;
            if (
                this.isCreditCodeHasDetails(index) &&
                !this.isCreditDetailCodeFirstHas(index)
            )
                return false;
            // nếu tài khoản nợ/có không có dữ liệu
            if (
                [
                    this.isDebitCodeHas(index),
                    this.isCreditCodeHas(index),
                ].includes(false)
            )
                return false;
        }
        return true;
    }

    buildFormTable(data?: any[]) {
        this.ledgerTableForm = this.fb.group({
            ledgers: this.fb.array(this.buildFormArrayLadger(data)),
        });
        setTimeout(() => {
            this.setFlagCaculate(false, 0);
        }, 100);
    }

    buildFormArrayLadger(data?: any[]): FormGroup[] {
        let ledgerFormArray: any[] = [];
        if (data) {
            data.forEach((item) => {
                ledgerFormArray.push(this.buildLedgerGroup(item));
            });
        } else {
            ledgerFormArray.push(this.buildLedgerGroup());
        }

        return ledgerFormArray;
    }

    buildLedgerGroup(data?: any): FormGroup {
        let ledgerForm = this.fb.group({
            id: data?.id,
            type: [''],
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
            //payer
            orginalCompanyName: [''],
            //description
            orginalDescription: [''],
            projectCode: data ? data.projectCode : [''],
            depreciaMonth: data ? data.depreciaMonth : [''],
            orginalCurrency: data ? data.orginalCurrency : [''],
            exchangeRate: data
                ? data.exchangeRate == ''
                    ? 0
                    : data.exchangeRate
                : [''],
            quantity: data ? (data.quantity == '' ? 0 : data.quantity) : [''],
            unitPrice: data
                ? data.unitPrice == ''
                    ? 0
                    : data.unitPrice
                : [''],
            amount: data ? (data.amount == '' ? 0 : data.amount) : [''],
        });
        this.fillDataCreditDebit(data, ledgerForm);
        return ledgerForm;
    }

    isBlockTr() {
        let controls = this.getControlsByIndex(0);
        if (
            (controls['debitCode'].value == '' ||
                controls['debitCode'].value == null) &&
            (controls['creditCode'].value == '' ||
                controls['creditCode'].value == null)
        ) {
            return false;
        } else {
            return true;
        }
    }

    fillDataCreditDebit(data, ledgerForm) {
        if (data?.credit) {
            ledgerForm.patchValue({
                creditCode: data.credit,
            });
            this.creditCodeFilter = [data.credit];
        }
        if (data?.creditDetailFirst) {
            ledgerForm.patchValue({
                creditDetailCodeFirst: data.creditDetailFirst,
            });
            this.creditDetailCodeFirstFilter = [data.creditDetailFirst];
        }
        if (data?.creditDetailSecond) {
            ledgerForm.patchValue({
                creditDetailCodeSecond: data.creditDetailSecond,
            });
            this.creditDetailCodeSecondFilter = [data.creditDetailSecond];
        }
        if (data?.debit) {
            ledgerForm.patchValue({
                debitCode: data.debit,
            });
            this.debitCodeFilter = [data.debit];
        }
        if (data?.debitDetailFirst) {
            ledgerForm.patchValue({
                debitDetailCodeFirst: data.debitDetailFirst,
            });
            this.debitDetailCodeFirstFilter = [data.debitDetailFirst];
        }
        if (data?.debitDetailSecond) {
            ledgerForm.patchValue({
                debitDetailCodeSecond: data.debitDetailSecond,
            });
            this.debitDetailCodeSecondFilter = [data.debitDetailSecond];
        }
        if (data?.amount) {
            ledgerForm.patchValue({
                amount: data.amount,
            });
        }
    }

    resetFormArray(data?: any[]) {
        this.buildFormTable(data);
    }

    resetFormControl(index) {
        this.ledgers.controls[index].reset();
    }

    addNewFormLedger(data?: any) {
        let ledgerForm = this.fb.group({
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
        this.ledgers.push(ledgerForm);
        this.fillDataCreditDebit(data, ledgerForm);
        if (!data) {
            setTimeout(() => {
                let lastAutoComplete = this.debitCodeTmpComponents.last;
                this.focusInput(lastAutoComplete, this.ledgers.length - 1);
            }, 100);
        }
    }

    removeLedgerForm(index) {
        this.ledgers.removeAt(index);
    }

    getControlsByIndex(index) {
        let formGroup = this.ledgers.controls[index] as FormGroup;
        let controls = formGroup.controls;
        return controls;
    }

    public focusInput(
        input: InputMask | InputNumber | AutoComplete | ElementRef,
        index,
    ) {
        if (!this.allowWorkForm(index)) return;
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

    get ledgers() {
        return this.ledgerTableForm.controls['ledgers'] as FormArray;
    }

    isDebitCodeHas(index) {
        let controls = this.getControlsByIndex(index);
        return controls['debitCode'].value instanceof Object;
    }

    isDebitDetailCodeFirstHas(index) {
        let controls = this.getControlsByIndex(index);
        return controls['debitDetailCodeFirst'].value instanceof Object;
    }

    isDebitDetailCodeFirstHasDetails(index) {
        let controls = this.getControlsByIndex(index);
        return controls['debitDetailCodeFirst'].value?.hasDetails;
    }

    isDebitDetailCodeSecondHas(index) {
        let controls = this.getControlsByIndex(index);
        return controls['debitDetailCodeSecond'].value instanceof Object;
    }

    isCreditDetailCodeSecondHas(index) {
        let controls = this.getControlsByIndex(index);
        return controls['creditDetailCodeSecond'].value instanceof Object;
    }

    isNewForm(index) {
        let controls = this.getControlsByIndex(index);
        return controls['id']?.value === 0;
    }

    // nếu trên table cho phép xem hết loại chứng từ, form nhập chỉ cho phép chỉnh sửa
    allowWorkForm(index) {
        return this.dataTable?.showAllDocument && this.isNewForm(index)
            ? false
            : true;
    }
    //#endregion

    //#region Debit column
    onSelectDebitCode($event, focusInput: boolean = true, index) {
        let controls = this.getControlsByIndex(index);
        let group = this.ledgers.controls[index] as FormGroup;
        if (
            !(
                controls['debitCode'].value instanceof Object &&
                $event.code === controls['debitCode'].value.code
            )
        ) {
            group.patchValue({
                debitCode: $event,
                debitDetailCodeFirst: '',
                debitDetailCodeSecond: '',
            });
        }
        this.setFlagCaculate(null, index);

        let creditCodeTmpElm = this.creditCodeTmpComponents['_results'][index];
        let debitDetailCodeFirstTmpElm =
            this.debitDetailCodeFirstTmpComponents['_results'][index];

        if (focusInput) {
            if (
                this.isDebitCodeHas(index) &&
                this.isDebitCodeHasDetails(index)
            ) {
                this.focusInput(debitDetailCodeFirstTmpElm, index);
            } else {
                this.focusInput(creditCodeTmpElm, index);
            }
        }
    }

    filterDebitCode(event, index) {
        let controls = this.getControlsByIndex(index);
        if (!event) {
            this.debitCodeFilter = [];
            return;
        }
        event.query = event.query || '';
        if (controls['debitCode'].value instanceof String) {
            event.query = controls['debitCode'].value || '';
        } else if (controls['debitCode'].value instanceof Object) {
            event.query = controls['debitCode'].value.code || '';
            this.debitCodeFilter = [_.cloneDeep(controls['debitCode'].value)];
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

    onClearDebitCode(focusInput: boolean = true, index) {
        let group = this.ledgers.controls[index] as FormGroup;
        group.patchValue({
            debitCode: '',
            debitDetailCodeFirst: '',
            debitDetailCodeSecond: '',
        });
        this.setFlagCaculate(null, index);
        if (focusInput) {
            let debitCodeTmpElm =
                this.debitCodeTmpComponents['_results'][index];
            this.focusInput(debitCodeTmpElm, index);
        }
    }

    isHiddenAutoCompleteDebitCode(index) {
        let controls = this.getControlsByIndex(index);
        return (
            controls['debitCode'].value instanceof Object &&
            this.debitCodeFilter.length
        );
    }
    //#endregion

    //#region Debit 1 column
    filterDebitDetailCodeFirst(event, index) {
        let controls = this.getControlsByIndex(index);
        if (!event) {
            this.debitDetailCodeFirstFilter = [];
            return;
        }
        if (!this.isDebitCodeHas(index)) {
            console.log('Chưa chọn tài khoản nợ');
            this.debitDetailCodeFirstFilter = [];
            return;
        }

        event.query = event.query || '';
        if (controls['debitDetailCodeFirst'].value instanceof String) {
            event.query = controls['debitDetailCodeFirst'].value || '';
        } else if (controls['debitDetailCodeFirst'].value instanceof Object) {
            this.debitDetailCodeFirstFilter = [
                _.cloneDeep(controls['debitDetailCodeFirst'].value),
            ];
            return;
        }

        this.debitDetailCodeFirstPage = {
            ...this.debitDetailCodeFirstPage,
            searchText: event.query,
            parentCode: controls['debitCode'].value.code,
            page: 1,
            totalItems: -1,
        };
        var callBack = () => {
            setTimeout(() => {
                const autocompletePanel =
                    this.debitDetailCodeFirstTmpComponents['_results'][
                        index
                    ].el.nativeElement.querySelector('.p-autocomplete-panel');
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

    onClearDebitDetailCodeFirst(index) {
        let group = this.ledgers.controls[index] as FormGroup;
        group.patchValue({
            debitDetailCodeFirst: '',
            debitDetailCodeSecond: '',
        });
        let debitDetailCodeFirstTmp =
            this.debitDetailCodeFirstTmpComponents['_results'][index];
        this.focusInput(debitDetailCodeFirstTmp, index);
        this.setFlagCaculate(null, index);
    }

    onSelectDebitDetailCodeFirst($event, index) {
        let controls = this.getControlsByIndex(index);
        const group = this.ledgers.controls[index] as FormGroup;
        if (
            !(
                controls['debitDetailCodeFirst'].value instanceof Object &&
                $event.code === controls['debitDetailCodeFirst'].value.code
            )
        ) {
            group.patchValue({
                debitDetailCodeFirst: $event,
                debitDetailCodeSecond: '',
            });
        }
        let debitDetailCodeSecondTmp =
            this.debitDetailCodeSecondTmpComponents['_results'][index];
        let creditCodeTmpElm = this.creditCodeTmpComponents['_results'][index];

        if (
            this.isDebitDetailCodeFirstHas(index) &&
            this.isDebitDetailCodeFirstHasDetails(index)
        ) {
            this.focusInput(debitDetailCodeSecondTmp, index);
        } else {
            this.focusInput(creditCodeTmpElm, index);
        }
        this.setFlagCaculate(null, index);
    }

    isDebitCodeHasDetails(index) {
        let controls = this.getControlsByIndex(index);
        return controls['debitCode'].value?.hasDetails;
    }

    isHiddenAutoCompleteDebitDetailCodeFirst(index) {
        let controls = this.getControlsByIndex(index);
        return (
            controls['debitDetailCodeFirst'].value instanceof Object &&
            this.debitDetailCodeFirstFilter?.length
        );
    }
    //#endregion

    //#region Debit 2 column
    filterDebitDetailCodeSecond(event, index) {
        let controls = this.getControlsByIndex(index);
        if (!event) {
            this.debitDetailCodeSecondFilter = [];
            return;
        }
        if (!this.isDebitDetailCodeFirstHas(index)) {
            console.log('Chưa chọn chi tiết nợ 1');
            this.debitDetailCodeSecondFilter = [];
            return;
        }
        event.query = event.query || '';
        if (controls['debitDetailCodeSecond'].value instanceof String) {
            event.query = controls['debitDetailCodeSecond'].value || '';
        } else if (controls['debitDetailCodeSecond'].value instanceof Object) {
            this.debitDetailCodeSecondFilter = [
                controls['debitDetailCodeSecond'].value,
            ];
            return;
        }
        this.debitDetailCodeSecondPage = {
            ...this.debitDetailCodeSecondPage,
            searchText: event.query,
            parentCode: `${controls['debitCode'].value.code}:${controls['debitDetailCodeFirst'].value.code}`,
            page: 1,
            totalItems: -1,
        };
        var callBack = () => {
            setTimeout(() => {
                const autocompletePanel =
                    this.debitDetailCodeSecondTmpComponents['_results'][
                        index
                    ].el.nativeElement.querySelector('.p-autocomplete-panel');
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

    onClearDebitDetailCodeSecond(index) {
        let group = this.ledgers.controls[index];
        group.patchValue({
            debitDetailCodeSecond: '',
        });
        this.focusInput(
            this.debitDetailCodeSecondTmpComponents['_results'][index],
            index,
        );
        this.setFlagCaculate(null, index);
    }

    onSelectDebitDetailCodeSecond($event, index) {
        let controls = this.getControlsByIndex(index);
        let group = this.ledgers.controls[index];
        if (
            !(
                controls['debitDetailCodeSecond'].value instanceof Object &&
                $event.code === controls['debitDetailCodeSecond'].value.code
            )
        ) {
            group.patchValue({
                debitDetailCodeSecond: $event,
            });
        }
        this.focusInput(this.creditCodeTmpComponents['_results'][index], index);
        this.setFlagCaculate(null, index);
    }

    isHiddenAutoCompleteDebitDetailCodeSecond(index) {
        let controls = this.getControlsByIndex(index);
        return (
            controls['debitDetailCodeSecond'].value instanceof Object &&
            this.debitDetailCodeSecondFilter?.length
        );
    }
    //#endregion

    //#region Credit column
    onClearCreditCode(focusInput: boolean = true, index) {
        let group = this.ledgers.controls[index] as FormGroup;
        group.patchValue({
            creditCode: '',
            creditDetailCodeFirst: '',
            creditDetailCodeSecond: '',
        });
        const creditCodeTmpElm =
            this.creditCodeTmpComponents['_results'][index];
        if (focusInput) {
            this.focusInput(creditCodeTmpElm, index);
        }
        this.setFlagCaculate(null, index);
    }

    filterCreditCode(event, index) {
        let controls = this.getControlsByIndex(index);
        if (!event) {
            this.creditCodeFilter = [];
            return;
        }
        event.query = event.query || '';
        if (controls['creditCode'].value instanceof String) {
            event.query = controls['creditCode'].value || '';
        } else if (controls['creditCode'].value instanceof Object) {
            this.creditCodeFilter = [
                (event.query = controls['creditCode'].value),
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

    onSelectCreditCode($event, focusInput: boolean = true, index) {
        let controls = this.getControlsByIndex(index);
        let group = this.ledgers.controls[index];
        if (
            !(
                controls['creditCode'].value instanceof Object &&
                $event.code === controls['creditCode'].value.code
            )
        ) {
            group.patchValue({
                creditCode: $event,
                creditDetailCodeFirst: '',
                creditDetailCodeSecond: '',
            });
        }
        let creditDetailCodeFirstTmpElm =
            this.creditDetailCodeFirstTmpComponents['_results'][index];
        if (this.isCreditCodeHas && this.isCreditCodeHasDetails && focusInput) {
            this.focusInput(creditDetailCodeFirstTmpElm, index);
        }
        this.setFlagCaculate(null, index);
    }

    isHiddenAutoCompleteCreditCode(index) {
        let controls = this.getControlsByIndex(index);
        return (
            controls['creditCode'].value instanceof Object &&
            this.creditCodeFilter?.length
        );
    }
    //#endregion

    //#region Credit 1 column
    filterCreditDetailCodeFirst(event, index) {
        let controls = this.getControlsByIndex(index);
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
        if (controls['creditDetailCodeFirst'].value instanceof String) {
            event.query = controls['creditDetailCodeFirst'].value || '';
        } else if (controls['creditDetailCodeFirst'].value instanceof Object) {
            this.creditDetailCodeFirstFilter = [
                controls['creditDetailCodeFirst'].value,
            ];
            return;
        }

        this.creditDetailCodeFirstPage = {
            ...this.creditDetailCodeFirstPage,
            searchText: event.query,
            parentCode: controls['creditCode'].value.code,
            page: 1,
            totalItems: -1,
        };
        var callBack = () => {
            setTimeout(() => {
                const autocompletePanel =
                    this.creditDetailCodeFirstTmpComponents['_results'][
                        index
                    ].el.nativeElement.querySelector('.p-autocomplete-panel');
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

    onSelectCreditDetailCodeFirst($event, index) {
        let controls = this.getControlsByIndex(index);
        let group = this.ledgers.controls[index];

        if (
            !(
                controls['creditDetailCodeFirst'].value instanceof Object &&
                $event.code === controls['creditDetailCodeFirst'].value.code
            )
        ) {
            group.patchValue({
                creditDetailCodeFirst: $event,
                creditDetailCodeSecond: '',
            });
        }
        if (
            this.isCreditDetailCodeFirstHas &&
            this.isCreditDetailCodeFirstHasDetails
        ) {
            this.focusInput(
                this.creditDetailCodeSecondTmpComponents['_results'][index],
                index,
            );
        }
        this.setFlagCaculate(null, index);
    }

    onClearCreditDetailCodeFirst(index) {
        let group = this.ledgers.controls[index];
        group.patchValue({
            creditDetailCodeFirst: '',
            creditDetailCodeSecond: '',
        });
        this.focusInput(
            this.creditDetailCodeFirstTmpComponents['_results'][index],
            index,
        );
        this.setFlagCaculate(null, index);
    }

    isCreditCodeHasDetails(index) {
        let controls = this.getControlsByIndex(index);
        return controls['creditCode'].value?.hasDetails;
    }

    isHiddenAutoCompleteCreditDetailCodeFirst(index: any) {
        let controls = this.getControlsByIndex(index);
        return (
            controls['creditDetailCodeFirst'].value instanceof Object &&
            this.creditDetailCodeFirstFilter?.length
        );
    }

    isCreditCodeHas(index) {
        let controls = this.getControlsByIndex(index);
        return controls['creditCode'].value instanceof Object;
    }
    //#endregion

    //#region Credit 2 column
    filterCreditDetailCodeSecond(event, index) {
        let controls = this.getControlsByIndex(index);
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
        if (controls['creditDetailCodeSecond'].value instanceof String) {
            event.query = controls['creditDetailCodeSecond'].value || '';
        } else if (controls['creditDetailCodeSecond'].value instanceof Object) {
            this.creditDetailCodeFirstFilter = [
                controls['creditDetailCodeSecond'].value,
            ];
            return;
        }
        this.creditDetailCodeSecondPage = {
            ...this.creditDetailCodeSecondPage,
            searchText: event.query,
            parentCode: `${controls['creditCode'].value.code}:${controls['creditDetailCodeFirst'].value.code}`,
            page: 1,
            totalItems: -1,
        };
        var callBack = () => {
            setTimeout(() => {
                const autocompletePanel =
                    this.creditDetailCodeSecondTmpComponents['_results'][
                        index
                    ].el.nativeElement.querySelector('.p-autocomplete-panel');
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

    onSelectCreditDetailCodeSecond($event, index) {
        let controls = this.getControlsByIndex(index);
        let group = this.ledgers.controls[index];

        if (
            !(
                controls['creditDetailCodeSecond'].value instanceof Object &&
                $event.code === controls['creditDetailCodeSecond'].value.code
            )
        ) {
            group.patchValue({
                creditDetailCodeSecond: $event,
            });
        }
        this.focusInput(
            this.creditDetailCodeSecondTmpComponents['_results'][index],
            index,
        );
        this.setFlagCaculate(null, index);
    }

    onClearCreditDetailCodeSecond(focusInput: boolean = true, index) {
        let group = this.ledgers.controls[index];

        group.patchValue({
            creditDetailCodeSecond: '',
        });
        if (focusInput) {
            this.focusInput(
                this.creditDetailCodeSecondTmpComponents['_results'][index],
                index,
            );
        }
        this.setFlagCaculate(null, index);
    }

    isHiddenAutoCompleteCreditDetailCodeSecond(index) {
        let controls = this.getControlsByIndex(index);
        return (
            controls['creditDetailCodeSecond'].value instanceof Object &&
            this.creditDetailCodeSecondFilter?.length
        );
    }

    isCreditDetailCodeFirstHasDetails(index) {
        let controls = this.getControlsByIndex(index);
        return controls['creditDetailCodeFirst'].value?.hasDetails;
    }

    isCreditDetailCodeFirstHas(index) {
        let controls = this.getControlsByIndex(index);
        return controls['creditDetailCodeFirst'].value instanceof Object;
    }
    //#endregion

    //#region Project column
    public setAllowProjectCode(isNewForm: boolean, index) {
        const controls = this.getControlsByIndex(index);
        let isAllowProjectCode = this.checkChildrenAccountAllowInputByKey(
            [6],
            'classification',
            controls,
            index,
        );
        if (!isAllowProjectCode && !isNewForm) {
            controls['projectCode'].setValue('');
        }
        return isAllowProjectCode;
    }
    //#endregion

    //#region Deprecia Month column
    public setAllowDepreciaMonth(isNewForm: boolean, index) {
        const controls = this.getControlsByIndex(index);
        let isAllowDepreciaMonth = this.checkChildrenAccountAllowInputByKey(
            [4, 5, 7],
            'classification',
            controls,
            index,
        );
        if (!isAllowDepreciaMonth && !isNewForm) {
            controls['depreciaMonth'].setValue(0);
        }
        return isAllowDepreciaMonth;
    }
    //#endregion

    //#region Orginal Currency - Exchange Rate Columns
    public setAllowForeignCurrency(isNewForm: boolean, index) {
        let controls = this.getControlsByIndex(index);
        let isForeignCurrency = this.checkChildrenAccountAllowInputByKey(
            [true],
            'isForeignCurrency',
            controls,
            index,
        );
        if (!isForeignCurrency && !isNewForm) {
            controls['orginalCurrency'].setValue(0);
            controls['exchangeRate'].setValue(0);
        }
        return isForeignCurrency;
    }

    onChangeExchangeRate(event, index) {
        let controls = this.getControlsByIndex(index);
        let group = this.ledgers.controls[index];

        if (event.code == 'Tab') return;
        const orginalCurrency = Number(controls['orginalCurrency'].value || 0);
        const exchangeRate = isNaN(Number(event.target?.ariaValueNow))
            ? 0
            : Number(event.target?.ariaValueNow || 0);
        // ngoại tệ nhân tỉ giá
        group.patchValue({
            amount: orginalCurrency * exchangeRate,
            exchangeRate: exchangeRate,
        });
    }
    //#endregion

    //#region Quantity Column
    public setAllowInputQuantityAndUnitPrice(isNewForm: boolean, index) {
        let formGroup = this.ledgers.controls[index] as FormGroup;
        const controls = this.getControlsByIndex(index);
        let isAllowInputQuantityAndUnitPrice =
            this.checkChildrenAccountAllowInputByKey(
                [3, 4],
                'accGroup',
                controls,
                index,
            );
        if (!isAllowInputQuantityAndUnitPrice) {
            isAllowInputQuantityAndUnitPrice = false;
            if (!isNewForm) {
                formGroup.patchValue({
                    quantity: 0,
                    unitPrice: 0,
                });
            }
        }
        return isAllowInputQuantityAndUnitPrice;
    }

    onChangeQuantity(event, index) {
        let controls = this.getControlsByIndex(index);
        let group = this.ledgers.controls[index];

        const quantity = isNaN(Number(event?.target?.ariaValueNow))
            ? 0
            : Number(event?.target?.ariaValueNow || 0);
        const unitPrice = Number(controls['unitPrice'].value || 0);
        // số lượng nhân đơn giá
        const amount = Number(quantity || 0) * unitPrice;
        const orginalCurrency = Number(controls['orginalCurrency'].value || 0);
        const exchangeRate = Number(controls['exchangeRate'].value || 0);

        group.patchValue({
            quantity: quantity,
            amount: amount,
        });

        if (orginalCurrency != 0 && exchangeRate == 0) {
            group.patchValue({
                exchangeRate: amount / (orginalCurrency || 1),
            });
        }
    }
    //#endregion

    //#region Unit price column
    onChangeUnitPrice(event, index) {
        let controls = this.getControlsByIndex(index);
        let group = this.ledgers.controls[index];

        if (event.code == 'Tab') return;
        const unitPrice = isNaN(Number(event?.target?.ariaValueNow))
            ? 0
            : Number(event?.target?.ariaValueNow || 0);
        const quantity = controls['quantity'].value || 0;
        // số lượng nhân đơn giá
        const amount = Number(quantity || 0) * unitPrice;
        group.patchValue({
            unitPrice: unitPrice,
            amount: amount,
        });
    }
    //#endregion

    //#region Amount Column
    onChangeAmount(event, index) {
        let controls = this.getControlsByIndex(index);

        const amount = isNaN(Number(event?.target?.ariaValueNow))
            ? 0
            : Number(event?.target?.ariaValueNow || 0);
        const quantity = Number(controls['quantity'].value || 0);
        const unitPrice = Number(controls['unitPrice'].value || 0);
        const orginalCurrency = Number(controls['orginalCurrency'].value || 0);
        const exchangeRate = Number(controls['exchangeRate'].value || 0);
        if (quantity != 0 && unitPrice == 0) {
            controls['unitPrice'].setValue(amount / quantity);
        }
        if (orginalCurrency != 0 && exchangeRate == 0) {
            controls['exchangeRate'].setValue(amount / (orginalCurrency || 1));
        }
        controls['amount'].setValue(amount);
    }
    //#endregion

    //#region Call Api to Get Debit - Credit
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
    //#endregion

    //#region handle common event
    public setFlagCaculate(isNewForm?: boolean, index?: any) {
        if (this.ledgers.length > 0) {
            this.setAllowDepreciaMonth(isNewForm, index);
            this.setAllowForeignCurrency(isNewForm, index);
            this.setAllowInputQuantityAndUnitPrice(isNewForm, index);
            this.setAllowProjectCode(isNewForm, index);
            this.setAllowInputInvoiceInfomation(isNewForm, index);
            this.setWareHouseCode(index);
        }
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

    private checkChildrenAccountAllowInputByKey(
        arr: any[],
        key: string,
        controls: any,
        index,
    ): boolean {
        let checkDebit = false;
        let checkCredit = false;
        // Nếu tài khoản có chi tiết 1
        // Nếu chi tiết 1 có chi tiết 2
        // Chi tiết 2 có dữ liệu
        if (
            this.isDebitCodeHasDetails(index) &&
            this.isDebitDetailCodeFirstHasDetails(index) &&
            this.isDebitDetailCodeSecondHas(index) &&
            arr.includes(controls['debitDetailCodeSecond'].value[key])
        ) {
            checkDebit = true;
        }
        // Nếu tài khoản có chi tiết 1
        // Nếu chi tiết 1 không có chi tiết 2
        // Chi tiết 1 có dữ liệu
        else if (
            this.isDebitCodeHasDetails(index) &&
            !this.isDebitDetailCodeFirstHasDetails(index) &&
            arr.includes(controls['debitDetailCodeFirst'].value[key])
        ) {
            checkDebit = true;
        }
        // Nếu tài khoản không có chi tiết 1
        // Tài khoản có dữ liệu
        else if (
            !this.isDebitCodeHasDetails(index) &&
            arr.includes(controls['debitCode'].value[key])
        ) {
            checkDebit = true;
        }
        // Nếu tài khoản có chi tiết 1
        // Nếu chi tiết 1 có chi tiết 2
        // Chi tiết 2 có dữ liệu
        if (
            this.isCreditCodeHasDetails(index) &&
            this.isCreditDetailCodeFirstHasDetails(index) &&
            this.isCreditDetailCodeSecondHas(index) &&
            arr.includes(controls['creditDetailCodeSecond'].value[key])
        ) {
            checkCredit = true;
        }
        // Nếu tài khoản có chi tiết 1
        // Nếu chi tiết 1 không có chi tiết 2
        // Chi tiết 1 có dữ liệu
        else if (
            this.isCreditCodeHasDetails(index) &&
            !this.isCreditDetailCodeFirstHasDetails(index) &&
            arr.includes(controls['creditDetailCodeFirst'].value[key])
        ) {
            checkCredit = true;
        }
        // Nếu tài khoản không có chi tiết 1
        // Tài khoản có dữ liệu
        else if (
            !this.isCreditCodeHasDetails(index) &&
            arr.includes(controls['creditCode'].value[key])
        ) {
            checkCredit = true;
        }
        return !checkCredit && !checkDebit ? false : true;
    }

    checkAllowInputColumn(arr: any[], type: string): boolean {
        let listBool = [];
        if (this.ledgers && this.ledgers.controls) {
            this.ledgers.controls.forEach((group: any, index: number) => {
                let isAllow = this.checkChildrenAccountAllowInputByKey(
                    arr,
                    type,
                    group.controls,
                    index,
                );
                listBool.push(isAllow);
            });
        }
        return listBool.some((x) => x);
    }

    private setWareHouseCode(index) {
        this.debitWarehouse = this.getWarehouse('debit', index);
        this.creditWarehouse = this.getWarehouse('credit', index);
    }

    public setAllowInputInvoiceInfomation(
        isNewForm?: boolean,
        index?: number,
    ): void {
        let controls = this.getControlsByIndex(index);
        let group = this.ledgers.controls[index] as FormGroup;
        const invoiceCode = controls['invoiceCode'].value || '';
        if (invoiceCode === '' && !isNewForm) {
            group.patchValue({
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

    private getWarehouse(key: string = 'credit' || 'debit', index): any {
        let controls = this.getControlsByIndex(index);
        if (key === 'debit') {
            // Nếu tài khoản có chi tiết 1
            // Nếu chi tiết 1 có chi tiết 2
            // Chi tiết 2 có dữ liệu
            if (
                this.isDebitCodeHasDetails(index) &&
                this.isDebitDetailCodeFirstHasDetails(index) &&
                this.isDebitDetailCodeSecondHas(index)
            ) {
                return {
                    code: controls['debitDetailCodeSecond'].value.warehouseCode,
                    name: controls['debitDetailCodeSecond'].value.warehouseName,
                };
            }
            // Nếu tài khoản có chi tiết 1
            // Nếu chi tiết 1 không có chi tiết 2
            // Chi tiết 1 có dữ liệu
            else if (
                this.isDebitCodeHasDetails(index) &&
                !this.isDebitDetailCodeFirstHasDetails(index)
            ) {
                return {
                    code: controls['debitDetailCodeFirst'].value.warehouseCode,
                    name: controls['debitDetailCodeFirst'].value.warehouseName,
                };
            }
            // Nếu tài khoản không có chi tiết 1
            // Tài khoản có dữ liệu
            else if (!this.isDebitCodeHasDetails(index)) {
                return {
                    code: controls['debitCode'].value.warehouseCode,
                    name: controls['debitCode'].value.warehouseName,
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
                    code: controls['creditDetailCodeSecond'].value
                        .warehouseCode,
                    name: controls['creditDetailCodeSecond'].value
                        .warehouseName,
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
                    code: controls['creditDetailCodeFirst'].value.warehouseCode,
                    name: controls['creditDetailCodeFirst'].value.warehouseName,
                };
            }
            // Nếu tài khoản không có chi tiết 1
            // Tài khoản có dữ liệu
            else if (!this.isCreditCodeHasDetails) {
                return {
                    code: controls['creditCode'].value.warehouseCode,
                    name: controls['creditCode'].value.warehouseName,
                };
            }
        }
        return {
            code: '',
            name: '',
        };
    }

    private onTabSelected(event: any) {
        this.activeItem = event?.item;
    }
    //#endregion
}
