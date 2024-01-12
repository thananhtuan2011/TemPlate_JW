import {Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild,} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {MessageService} from 'primeng/api';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import {environment} from 'src/environments/environment';
import {AutoComplete} from 'primeng/autocomplete';
import {CompanyService} from 'src/app/service/company.service';
import {TillService} from 'src/app/service/till.service';

@Component({
    selector: 'app-till-form',
    templateUrl: './till-form.component.html',
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
export class TillFormComponent implements OnInit {
    public appConstant = AppConstant;
    public appUtil = AppUtil;
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Input('isFinish') isFinish: boolean = true;
    @Output() onCancel = new EventEmitter();
    @Output() onSuccess = new EventEmitter();

    serverURLImage = environment.serverURLImage;

    tillForm: FormGroup = new FormGroup({});

    isSubmitted = false;
    isInvalidForm = false;

    chartOfAccounts: any[] = [];
    filteredDebitNames: any[] = [];
    debits1: any[] = [];
    filteredDebit1Names: any[] = [];
    debits2: any[] = [];
    filteredDebit2Names: any[] = [];

    company: any = {};

    @ViewChild('debit') public vcDebit: AutoComplete;
    @ViewChild('debit1') vcDebit1: AutoComplete;
    @ViewChild('debit2') vcDebit2: AutoComplete;

    types: any = {};

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private readonly tillService: TillService,
        private readonly companyService: CompanyService,
    ) {
        this.tillForm = this.fb.group({
            id: [''],
            fromAmount: ['0', [Validators.required]],
            toAt: ['', [Validators.required]],
            isDifferentMoney: [''],
            amountDifferent: [''],
            isFinish: [''],
            moneyAfterEndOfShift: [''],
            toAmountAuto: [''],
        });
    }

    onReset() {
        this.isInvalidForm = false;
        this.tillForm.reset();
    }

    getDetail(id) {
        if (id) {
            this.tillService.getTillDetail(id).subscribe((res: any) => {
                this.tillForm.patchValue({
                    id: res.id,
                    fromAmount: res.fromAmount,
                    toAt: res.toAt != null ? new Date(res.toAt) : new Date(),
                    isDifferentMoney: res.isDifferentMoney,
                    amountDifferent: res.amountDifferent,
                    toAmountAuto: res.toAmountAuto,
                    moneyAfterEndOfShift:
                        (res.fromAmount || 0) +
                        (res.toAmountAuto || 0) -
                        (res.amountDifferent || 0),
                });
            });
        }
        else {
            this.tillForm.patchValue({
                toAt: new Date(),
            });
        }
    }

    setFinishStatus(isFinish: boolean) {
        this.tillForm.patchValue({
            isFinish: isFinish,
        });
    }

    getLastInfo() {
        this.companyService.getLastCompanyInfo().subscribe((response: any) => {
            this.company = response.data;
        });
    }

    calculateDifferenceAmount(moneyAfterEndOfShift) {
        this.tillForm.patchValue({
            amountDifferent:
                (this.tillForm.value.fromAmount || 0) +
                (this.tillForm.value.toAmountAuto || 0) -
                (moneyAfterEndOfShift || 0),
        });
    }

    ngOnInit() {}

    checkValidValidator(fieldName: string) {
        return ((this.tillForm.controls[fieldName].dirty ||
            this.tillForm.controls[fieldName].touched) &&
            this.tillForm.controls[fieldName].invalid) ||
            (this.isInvalidForm && this.tillForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.tillForm.controls[fieldNames[i]].dirty ||
                    this.tillForm.controls[fieldNames[i]].touched) &&
                    this.tillForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.tillForm.controls[fieldNames[i]].invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    onSubmit() {
        this.isSubmitted = true;
        if (!this.isFinish) {
            this.tillService.startOfShift({ fromAmount : this.tillForm.value.fromAmount }).subscribe((res) => {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'Bắt đầu vào ca',
                    ),
                });
                this.onSuccess.emit({ isFinish : this.isFinish });
            });
            return;
        }
        this.isInvalidForm = false;
        if (this.tillForm.invalid) {
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
            AppUtil.cleanObject(this.tillForm.value),
        );
        newData.companyId = this.company.id;
        if (this.isEdit) {
            this.tillService
                .updateTill(newData, this.tillForm.value.id)
                .subscribe(() => {
                    this.messageService.add({
                        severity: 'success',
                        detail: AppUtil.translate(
                            this.translateService,
                            'Kết thúc ca thành công',
                        ),
                    });
                    this.onSuccess.emit({ isFinish : this.isFinish });
                });
        } else {
            this.tillService.createTill(newData).subscribe(() => {
                this.onSuccess.emit({ isFinish : this.isFinish });
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
        this.tillForm.controls[columnName].setValue('');
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
