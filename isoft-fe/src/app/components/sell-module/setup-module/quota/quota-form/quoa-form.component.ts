import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Dropdown } from 'primeng/dropdown';
import { Table } from 'primeng/table';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import { QuotaService } from 'src/app/service/quota.service';
import AppConstant from 'src/app/utilities/app-constants';

interface quotaFormModal {
    id?: number;
    account?: string;
    accountName?: string;
    detail1?: string;
    detailName1?: string;
    detail2?: string;
    detailName2?: string;
    warehouse?: string;
    quantity?: number;
    unitPrice?: number;
    amount?: number;
    accountParent?: string;
    accountNameParent?: string;
    detail1Parent?: string;
    detailName1Parent?: string;
    detail2Parent?: string;
    detailName2Parent?: string;
    warehouseParent?: string;
    isDeleted?: boolean;
    goodID?: number;
}

@Component({
    selector: 'app-quota-form',
    templateUrl: './quota-form.component.html',
    styles: [
        `
            :host ::ng-deep {
                .p-dropdown-label.p-inputtext {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    width: 100%;
                }

                .p-dropdown {
                    width: auto;
                }

                .p-dropdown.p-component.p-dropdown-clearable {
                    width: 100%;
                }

                .p-dropdown.p-component.p-disabled {
                    width: 100%;
                }

                #phonePrefix .p-dropdown {
                    width: 93px;
                }

                .p-calendar {
                    width: 100%;
                }
            }
        `,
    ],
})
export class QuotaFormComponent implements OnInit, OnChanges {
    public appConstant = AppConstant;
    loading: boolean = true;
    sortFields: any[] = [];
    sortTypes: any[] = [];
    first = 0;

    PositionDetailForm: FormGroup = new FormGroup({});
    isInvalidForm = false;

    @Input('formData') formData: any = {};
    @Input('isEdit') isEdit: boolean = false;
    @Input('isReset') isReset: boolean = false;
    @Input('display') display: boolean = false;
    @Input('creditAccounts') creditAccounts: any = {};
    @Input('dataParent') dataParent: any;
    @Output() onCancel = new EventEmitter();

    @ViewChild('dt') table: Table;
    @ViewChild('filter') filter: ElementRef;
    public isLoading: boolean = false;
    public listQuota = [];

    constructor(
        private messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private fb: FormBuilder,
        private chartOfAccount: ChartOfAccountService,
        private quotaService: QuotaService,
    ) {
        this.PositionDetailForm = this.fb.group({
            creditCode: [null, Validators.required],
            creditDetailCodeFirst: [null],
            creditDetailCodeSecond: [null],
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.isEdit && this.formData) {
            this.listQuota = this.formData;
        }
    }

    ngOnInit() {}

    dataInit: quotaFormModal = {
        id: 0,
        account: '',
        accountName: '',
        detail1: '',
        detailName1: '',
        detail2: '',
        detailName2: '',
        warehouse: '',
        quantity: 0,
        unitPrice: 0,
        amount: 0,
        accountParent: '',
        accountNameParent: '',
        detail1Parent: '',
        detailName1Parent: '',
        detail2Parent: '',
        detailName2Parent: '',
        warehouseParent: '',
        isDeleted: false,
        goodID: 0,
    };
    creditCode: any;
    detail1: any;
    detail2: any;
    listDetail1: any[] = [];
    listDetail2: any[] = [];
    @ViewChild('creditDetailCodeFirst') creditDetailCodeFirst: Dropdown;
    @ViewChild('creditDetailCodeSecond') creditDetailCodeSecond: Dropdown;

    chooseCreditCode(event) {
        if (!event.value) {
            return;
        }
        this.dataInit;
        const item = this.creditAccounts.find((item) => {
            if (item.code == event.value) {
                return true;
            }
            return false;
        });
        this.dataInit.account = item?.code;
        this.dataInit.accountName = item?.name;
        const id = this.PositionDetailForm.get('creditCode').value;
        this.chartOfAccount.getDetail(id).subscribe((res) => {
            this.listDetail1 = res.data;
            if (this.listDetail1.length > 0) {
                setTimeout(() => {
                    this.creditDetailCodeFirst.focus();
                    this.creditDetailCodeFirst.show();
                }, 100);
            }
        });
    }

    clearCreditCode(event) {
        this.PositionDetailForm.patchValue({
            creditDetailCodeFirst: null,
            creditDetailCodeSecond: null,
        });
        this.listDetail1 = [];
        this.listDetail2 = [];
    }

    chooseDetail1(event) {
        if (!event.value) {
            return;
        }
        const item = this.listDetail1.find((item) => item.code == event.value);
        this.dataInit.detail1 = item?.code;
        this.dataInit.detailName1 = item?.name;
        const id =
            this.PositionDetailForm.get('creditCode').value +
            ':' +
            this.PositionDetailForm.get('creditDetailCodeFirst').value;
        this.chartOfAccount.getDetail(id).subscribe((res) => {
            this.listDetail2 = res.data;
            if (this.listDetail2.length > 0) {
                setTimeout(() => {
                    this.creditDetailCodeSecond.focus();
                    this.creditDetailCodeSecond.show();
                }, 100);
            }
        });
    }

    clearDetail1(event) {
        this.PositionDetailForm.patchValue({
            creditDetailCodeFirst: null,
        });
        this.listDetail2 = [];
    }

    chooseDetail2(event) {
        if (!event.value) {
            return;
        }
        const item = this.detail2.find((item) => item.code == event.value);
        this.dataInit.detail2 = item?.code;
        this.dataInit.detailName2 = item?.name;
    }

    addAccount() {
        if (!this.dataInit.account && !this.dataInit.detail1) {
            return;
        }

        this.dataInit.accountParent = this.dataParent.account;
        this.dataInit.accountNameParent = this.dataParent.accountName;
        this.dataInit.detail1Parent = this.dataParent.detail1;
        this.dataInit.detailName1Parent = this.dataParent.detailName1;
        this.dataInit.detail2Parent = this.dataParent.detail2;
        this.dataInit.detailName2Parent = this.dataParent.detailName2;
        this.dataInit.goodID = this.dataParent.id;
        this.dataInit['quantity'] = 0;
        this.dataInit['unitPrice'] = 0;
        this.dataInit['amount'] = 0;

        this.listQuota.push(Object.assign({}, this.dataInit));
        this.listDetail1 = [];
        this.listDetail2 = [];
        this.PositionDetailForm.reset();
    }

    getCode(item): string {
        let dataDisplay;
        if (item?.detail2) {
            dataDisplay = item.detail2;
        }
        if (item?.detail1) {
            dataDisplay = item.detail1;
        }
        return dataDisplay;
    }

    getName(item): string {
        let dataDisplay;
        if (item?.detail2) {
            dataDisplay = item.detailName2;
        }
        if (item?.detail1) {
            dataDisplay = item.detailName1;
        }
        return dataDisplay;
    }

    deleteRow(i, id) {
        this.quotaService.deteteRow(id).subscribe((res) => {
            this.listQuota.splice(i, 1);
        });
    }

    closeModal() {
        this.dataInit = {
            id: 0,
            account: '',
            accountName: '',
            detail1: '',
            detailName1: '',
            detail2: '',
            detailName2: '',
            warehouse: '',
            quantity: 0,
            unitPrice: 0,
            amount: 0,
            accountParent: '',
            accountNameParent: '',
            detail1Parent: '',
            detailName1Parent: '',
            detail2Parent: '',
            detailName2Parent: '',
            warehouseParent: '',
            isDeleted: false,
            goodID: 0,
        };
        this.listQuota = [];
        this.onCancel.emit({});
    }

    inputChange(e, type, data) {
        if (type === 'quantity') {
            data[type] = e.value;
            data['amount'] = data['quantity'] * data['unitPrice'];
        }
        if (type === 'unitPrice') {
            data[type] = e.value;
            data['amount'] = data['unitPrice'] * data['quantity'];
        }
    }

    getTotalCost() {
        let sum = 0;
        for (let item of this.listQuota) {
            sum += item.amount;
        }
        return sum;
    }

    get stateButtonDisable(): boolean {
        return !this.PositionDetailForm.get('creditDetailCodeFirst').value;
    }

    onSubmit() {
        this.quotaService.save(this.listQuota).subscribe((res) => {
            if (res?.code === 400) {
                this.messageService.add({
                    severity: 'error',
                    detail: res?.msg || '',
                });
                return;
            }
            this.closeModal();
            this.onCancel.emit({});
        });
    }
}
