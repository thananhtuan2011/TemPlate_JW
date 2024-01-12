import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { MessageService } from 'primeng/api';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import { Province } from 'src/app/models/province.model';
import { Branch } from 'src/app/models/branch.model';
import { Major } from 'src/app/models/major.model';
import { Store } from 'src/app/models/store.model';
import { PositionDetail } from 'src/app/models/position-detail.model';
import { Target } from 'src/app/models/target.model';
import { ContractType } from 'src/app/models/contract-type.model';
import { environment } from 'src/environments/environment';
import { CustomerService } from 'src/app/service/customer.service';
import { AutoComplete } from 'primeng/autocomplete';
import { CustomerClassificationService } from 'src/app/service/customer-classification.service';

@Component({
    selector: 'app-customer-type-form',
    templateUrl: './customer-type-form.component.html',
    styles: [
        `
            :host ::ng-deep {
                .p-inputtext {
                    height: 40px;
                }

                .p-colorpicker-preview {
                    opacity: 1;
                    height: 40px;
                    width: 40px;
                    border: 1px solid #ced4da;
                    border-radius: 0 5px 5px 0;
                }

                .boder-radius {
                    border-radius: 5px 0 0 5px;
                }
            }
        `,
    ],
})
export class CustomerTypeFormComponent implements OnInit {
    public appConstant = AppConstant;
    public appUtil = AppUtil;
    @Input('provinces') provinces: Province[] = [];
    @Input('nativeProvinces') nativeProvinces: Province[] = [];
    @Input('branches')
    branches: Branch[] = [];
    @Input('majors') majors: Major[] = [];
    @Input('warehouses') warehouses: Store[] = [];
    @Input('positionDetails') positionDetails: PositionDetail[] = [];
    @Input('targets') targets: Target[] = [];
    @Input('symbols') symbols: Symbol[] = [];
    @Input('contractTypes') contractTypes: ContractType[] = [];
    @Input('roles')
    roles: any[] = [];
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Output() onCancel = new EventEmitter();

    serverURLImage = environment.serverURLImage;

    customerTypeForm: FormGroup = new FormGroup({});

    isSubmitted = false;
    isInvalidForm = false;

    chartOfAccounts: any[] = [];
    filteredDebitNames: any[] = [];
    debits1: any[] = [];
    filteredDebit1Names: any[] = [];
    debits2: any[] = [];
    filteredDebit2Names: any[] = [];

    selectedDebit: any = {};
    selectedDebit1: any = {};
    selectedDebit2: any = {};

    @ViewChild('debit') public vcDebit: AutoComplete;
    @ViewChild('debit1') vcDebit1: AutoComplete;
    @ViewChild('debit2') vcDebit2: AutoComplete;

    types: any = {};

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private readonly customerService: CustomerService,
        private readonly customerClassificationService: CustomerClassificationService,
    ) {
        this.customerTypeForm = this.fb.group({
            id: [''],
            name: ['', [Validators.required]],
            purchase: ['', [Validators.required]],
            color: ['', [Validators.required]],
            note: [''],
        });
    }

    onReset() {
        this.isInvalidForm = false;
        this.customerTypeForm.reset();
    }

    getDetail(id) {
        this.customerClassificationService
            .getCustomerClassificationDetail(id)
            .subscribe((res: any) => {
                this.customerTypeForm.setValue({
                    id: res.id,
                    name: res.name,
                    purchase: res.purchase,
                    color: res.color,
                    note: res.note,
                });
            });
    }

    ngOnInit() {}

    checkValidValidator(fieldName: string) {
        return ((this.customerTypeForm.controls[fieldName].dirty ||
            this.customerTypeForm.controls[fieldName].touched) &&
            this.customerTypeForm.controls[fieldName].invalid) ||
            (this.isInvalidForm &&
                this.customerTypeForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.customerTypeForm.controls[fieldNames[i]].dirty ||
                    this.customerTypeForm.controls[fieldNames[i]].touched) &&
                    this.customerTypeForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.customerTypeForm.controls[fieldNames[i]].invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.customerTypeForm.invalid) {
            this.messageService.add({
                severity: 'error',
                detail: AppUtil.translate(
                    this.translateService,
                    'info.please_check_again',
                ),
            });
            this.isInvalidForm = true;
            this.isSubmitted = false;
            return;
        }

        let newData = this.cleanObject(
            AppUtil.cleanObject(this.customerTypeForm.value),
        );
        if (this.isEdit) {
            this.customerClassificationService
                .updateCustomerClassification(
                    newData,
                    this.customerTypeForm.value.id,
                )
                .subscribe(() => {
                    this.onCancel.emit({});
                });
        } else {
            this.customerClassificationService
                .createCustomerClassification(newData)
                .subscribe(() => {
                    this.onCancel.emit({});
                });
        }
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
        }

        newData.purchase = parseInt(newData.purchase) || 0;
        newData.note = newData.note || '';
        return newData;
    }

    getDayOfWeek(date: any) {
        return new Date(date.year, date.month, date.day).getDay();
    }

    onFocus(dataBinding) {
        setTimeout(() => {
            dataBinding.focusInput();
        }, 200);
    }

    setEmptyData(columnName) {
        this.customerTypeForm.controls[columnName].setValue('');
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F8':
                event.preventDefault();
                await this.onSubmit();
                break;
            case 'F6':
                event.preventDefault();
                this.onCancel.emit({});
                break;
        }
    }
}
