import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import { COAService } from '../../../../../../service/coa-filters.service';

@Component({
    selector: 'app-chart-of-account-filters-form',
    templateUrl: './chart-of-account-filters-form.component.html',
    styles: [
        `
            :host ::ng-deep {
                .p-multiselect-clear-icon {
                    right: 50px;
                }

                .p-inputnumber-input {
                    text-align: left;
                }

                .p-inputtext-sm .p-inputtext {
                    font-size: inherit;
                }
            }
        `,
    ],
})
export class ChartOfAccountFiltersFormComponent implements OnInit {
    public appConstant = AppConstant;
    @Input('formData') formData: any = {};
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Input('documents') documents: any[] = [];
    @Input('chartOfAccounts') chartOfAccounts: any[] = [];
    @Output() onCancel = new EventEmitter();
    title: string = '';

    COAFilterForm: FormGroup = new FormGroup({});

    isSubmitted = false;
    isInvalidForm = false;
    failPassword: boolean = false;
    dataDropdown: any[];

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private router: Router,
        private readonly coaFiltersService: COAService,
    ) {
        this.COAFilterForm = this.fb.group({
            id: 0,
            name: ['', [Validators.required]],
            accounts: ['', [Validators.required]],
            documentCode: [''],
            type: [''],
            order: [''],
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (
            this.isEdit &&
            this.formData &&
            Object.keys(this.formData).length > 0
        ) {
            this.COAFilterForm.setValue({
                name: this.formData.name,
                accounts: this.formData.accounts,
                documentCode: this.formData.documentCode,
                type: this.formData.type,
                order: this.formData.numberOrdinal,
            });
        }
    }

    onReset() {
        this.isInvalidForm = false;
        this.COAFilterForm.reset();
    }

    ngOnInit() {}

    checkValidValidator(fieldName: string) {
        return ((this.COAFilterForm.controls[fieldName]?.dirty ||
            this.COAFilterForm.controls[fieldName]?.touched) &&
            this.COAFilterForm.controls[fieldName]?.invalid) ||
            (this.isInvalidForm &&
                this.COAFilterForm.controls[fieldName]?.invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.COAFilterForm.controls[fieldNames[i]]?.dirty ||
                    this.COAFilterForm.controls[fieldNames[i]]?.touched) &&
                    this.COAFilterForm.controls[fieldNames[i]]?.invalid) ||
                (this.isInvalidForm &&
                    this.COAFilterForm.controls[fieldNames[i]]?.invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    getDetail(id) {
        this.coaFiltersService.getDetail(id).subscribe(
            (res: any) => {
                console.log(res);
                this.COAFilterForm.setValue({
                    id: res.id,
                    name: res?.name,
                    accounts: res?.accounts.split(';'),
                    documentCode: res?.documentCode,
                    type: res?.type,
                    order: res?.order,
                });
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    detail: 'Lỗi lấy dữ liệu',
                });
            },
        );
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.COAFilterForm.invalid) {
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
            AppUtil.cleanObject(this.COAFilterForm.value),
        );
        newData.accounts = newData.accounts.join(';');
        if (this.isEdit) {
            this.coaFiltersService
                .update(newData, this.COAFilterForm.value.id)
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
            this.coaFiltersService.create(newData).subscribe(
                (res: any) => {
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
                },
                (err) => {
                    // console.log('err', err);
                },
            );
        }
    }

    onBack() {
        this.router.navigate([`/uikit/setup/room-table`]).then();
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
        }
        return newData;
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
