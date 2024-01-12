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
import { AutoComplete } from 'primeng/autocomplete';
import { CompanyService } from 'src/app/service/company.service';
import { SurchargesService } from 'src/app/service/surcharge.service';

@Component({
    selector: 'app-sur-charges-form',
    templateUrl: './sur-charges-form.component.html',
    styles: [
        `
            :host ::ng-deep {
                .p-calendar {
                    width: 100% !important;
                }

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
export class SurChargesFormComponent implements OnInit {
    public appConstant = AppConstant;
    public appUtil = AppUtil;
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Output() onCancel = new EventEmitter();

    serverURLImage = environment.serverURLImage;

    surchargeForm: FormGroup = new FormGroup({});

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
    company: any = {};
    typeSurcharges = [
        { name: '%', code: 'percent' },
        { name: 'VNĐ', code: 'money' },
    ];

    @ViewChild('debit') public vcDebit: AutoComplete;
    @ViewChild('debit1') vcDebit1: AutoComplete;
    @ViewChild('debit2') vcDebit2: AutoComplete;

    types: any = {};

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private readonly surchargesService: SurchargesService,
        private readonly companyService: CompanyService,
    ) {
        this.surchargeForm = this.fb.group({
            id: [''],
            code: ['', [Validators.required]],
            name: ['', [Validators.required]],
            fromDate: ['', [Validators.required]],
            toDate: ['', [Validators.required]],
            value: ['', [Validators.required]],
            type: ['', [Validators.required]],
            note: [''],
        });
    }

    onReset() {
        this.isInvalidForm = false;
        this.surchargeForm.reset();
    }

    getDetail(id) {
        this.surchargesService
            .getCustomerJobDetail(id)
            .subscribe((res: any) => {
                this.surchargeForm.setValue({
                    id: res.id,
                    code: res.code,
                    name: res.name,
                    fromDate: new Date(res.fromDate),
                    toDate: new Date(res.toDate),
                    value: res.value,
                    type: res.type,
                    note: res.note,
                });
                console.log('this.surchargeForm', this.surchargeForm);
            });
    }

    getLastInfo() {
        this.companyService.getLastCompanyInfo().subscribe((response: any) => {
            this.company = response.data;
        });
    }

    ngOnInit() {}

    checkValidValidator(fieldName: string) {
        return ((this.surchargeForm.controls[fieldName].dirty ||
            this.surchargeForm.controls[fieldName].touched) &&
            this.surchargeForm.controls[fieldName].invalid) ||
            (this.isInvalidForm &&
                this.surchargeForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.surchargeForm.controls[fieldNames[i]].dirty ||
                    this.surchargeForm.controls[fieldNames[i]].touched) &&
                    this.surchargeForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.surchargeForm.controls[fieldNames[i]].invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.surchargeForm.invalid) {
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
            AppUtil.cleanObject(this.surchargeForm.value),
        );
        newData.companyId = this.company.id;
        if (this.isEdit) {
            this.surchargesService
                .updateCustomerJob(newData, this.surchargeForm.value.id)
                .subscribe(() => {
                    this.onCancel.emit({});
                });
        } else {
            this.surchargesService.createCustomerJob(newData).subscribe(() => {
                this.onCancel.emit({});
            });
        }
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
        }
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
        this.surchargeForm.controls[columnName].setValue('');
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
