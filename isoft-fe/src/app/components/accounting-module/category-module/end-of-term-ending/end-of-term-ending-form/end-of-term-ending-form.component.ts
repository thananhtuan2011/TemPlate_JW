import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { EndOfTermEnding } from 'src/app/models/end-of-term-ending';
import { BranchService } from 'src/app/service/branch.service';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import { EndOfTermEndingService } from 'src/app/service/end-of-term-ending.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';

@Component({
    selector: 'app-end-of-term-ending-form',
    templateUrl: './end-of-term-ending-form.component.html',
})
export class EndOfTermEndingFormComponent implements OnInit, OnChanges {
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean;
    @Input('display') display: boolean = false;
    @Output() onCancel = new EventEmitter();
    formData: any = {};
    title: string = '';

    endOfTermEndingForm: FormGroup;
    listType: any[] = [
        {
            value: 'debitToCredit',
            label: 'Kết chuyển Nợ qua Có',
        },
        {
            value: 'creditToDebit',
            label: 'Kết chuyển Có qua Nợ',
        },
    ];

    chartOfAccounts: any[] = [];
    listDebit = [];
    listCredit = [];

    isSubmitted = false;
    isInvalidForm = false;

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private endOfTermEndingService: EndOfTermEndingService,
        private chartOfAccountService: ChartOfAccountService,
    ) {}

    ngOnChanges(): void {
        if (
            this.isEdit &&
            this.formData &&
            Object.keys(this.formData).length > 0
        ) {
            this.title = AppUtil.translate(
                this.translateService,
                'label.edit_end_of_term_ending',
            );
        } else {
            this.title = AppUtil.translate(
                this.translateService,
                'label.add_end_of_term_ending',
            );
        }
    }

    initForm() {
        this.endOfTermEndingForm = this.fb.group({
            id: [0],
            creditCode: ['', [Validators.required]],
            debitCode: ['', [Validators.required]],
            isDelete: false,
            percentRatio: [null, [Validators.required]],
            type: ['debitToCredit', [Validators.required]],
        });
    }

    onReset() {
        this.isInvalidForm = false;
        this.initForm();
    }

    ngOnInit() {
        this.getChartOfAccounts();
        this.initForm();
    }

    getDetail(id) {
        this.initForm();
        this.endOfTermEndingService
            .getEndOfTermEndingByID(id)
            .subscribe((res: any) => {
                this.formData = res.data;
                this.endOfTermEndingForm.patchValue({
                    id: this.formData.id,
                    creditCode: this.formData.creditCode,
                    debitCode: this.formData.debitCode,
                    isDelete: this.formData.isDelete,
                    percentRatio: this.formData.percentRatio,
                    type: this.formData.type,
                });
            });
    }

    checkValidValidator(fieldName: string) {
        return ((this.endOfTermEndingForm.controls[fieldName].dirty ||
            this.endOfTermEndingForm.controls[fieldName].touched) &&
            this.endOfTermEndingForm.controls[fieldName].invalid) ||
            (this.isInvalidForm &&
                this.endOfTermEndingForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.endOfTermEndingForm.controls[fieldNames[i]].dirty ||
                    this.endOfTermEndingForm.controls[fieldNames[i]].touched) &&
                    this.endOfTermEndingForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.endOfTermEndingForm.controls[fieldNames[i]].invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.endOfTermEndingForm.invalid) {
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
            AppUtil.cleanObject(this.endOfTermEndingForm.value),
        );
        if (this.isEdit) {
            this.endOfTermEndingService
                .updateEndOfTermEnding(
                    this.endOfTermEndingForm.value.id,
                    newData,
                )
                .subscribe((res: any) => {
                    if (res?.code === 400) {
                        this.messageService.add({
                            severity: 'error',
                            detail: res?.msg || '',
                        });
                        return;
                    } else {
                        this.onCancel.emit({});
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Cập nhật thành công',
                        });
                    }
                });
        } else {
            this.endOfTermEndingService
                .createEndOfTermEnding(newData)
                .subscribe((res: any) => {
                    if (res?.code === 400) {
                        this.messageService.add({
                            severity: 'error',
                            detail: res?.msg || '',
                        });
                        return;
                    } else {
                        this.onCancel.emit({});
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Thêm mới thành công',
                        });
                    }
                });
        }
    }

    onBack() {
        this.onCancel.emit({});
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
        }
        return newData;
    }

    getChartOfAccounts() {
        this.chartOfAccountService
            .getAllByDisplayInsert()
            .subscribe((res: any) => {
                this.chartOfAccounts = res;
            });
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
