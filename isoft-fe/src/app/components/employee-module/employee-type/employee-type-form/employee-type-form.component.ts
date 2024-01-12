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
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import AppConstant from 'src/app/utilities/app-constants';
import AppData from 'src/app/utilities/app-data';
import AppUtil from 'src/app/utilities/app-util';
import { ContractTypeService } from 'src/app/service/contract-type.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-employee-type-form',
    templateUrl: './employee-type-form.component.html',
    styles: [
        `
            :host ::ng-deep {
                #phonePrefix .p-dropdown {
                    width: 93px;
                }
            }
        `,
    ],
})
export class EmployeeTypeFormComponent implements OnInit {
    public appConstant = AppConstant;
    @Input('formData') formData: any = {};
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Output() onCancel = new EventEmitter();
    title: string = '';

    ContractTypeForm: FormGroup = new FormGroup({});

    optionCountries = AppData.COUNTRIES;
    countryCodes: any[] = [];

    isSubmitted = false;
    isInvalidForm = false;
    failPassword: boolean = false;

    typeContracts : any = [ { value: 0, label: 'Nhân sự' },
    { value: 1, label: 'Khách hàng' },];

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private ContractTypeService: ContractTypeService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        this.ContractTypeForm = this.fb.group({
            id: [''],
            code: ['', [Validators.required]],
            name: ['', [Validators.required]],
            typeContract: ['']
        });
    }
    ngOnChanges(changes: SimpleChanges): void {
        if (
            this.isEdit &&
            this.formData &&
            Object.keys(this.formData).length > 0
        ) {
            this.title = AppUtil.translate(
                this.translateService,
                'label.edit_ContractType',
            );
            this.ContractTypeForm.setValue({
                id: this.formData.id,
                code: this.formData.code,
                name: this.formData.name,
                typeContract: this.formData.typeContract
            });
        } else {
            this.title = AppUtil.translate(
                this.translateService,
                'label.add_ContractType',
            );
        }
    }

    onReset() {
        this.isInvalidForm = false;
        this.ContractTypeForm.reset();
    }

    ngOnInit() {}

    checkValidValidator(fieldName: string) {
        return ((this.ContractTypeForm.controls[fieldName].dirty ||
            this.ContractTypeForm.controls[fieldName].touched) &&
            this.ContractTypeForm.controls[fieldName].invalid) ||
            (this.isInvalidForm &&
                this.ContractTypeForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.ContractTypeForm.controls[fieldNames[i]].dirty ||
                    this.ContractTypeForm.controls[fieldNames[i]].touched) &&
                    this.ContractTypeForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.ContractTypeForm.controls[fieldNames[i]].invalid)
            ) {
                return true;
            }
        }
        return false;
    }
    getContractTypeDetail(id) {
        this.ContractTypeService.getContractTypeDetail(id).subscribe(
            (res) => {
                this.ContractTypeForm.setValue({
                    id: res?.id,
                    code: res?.code,
                    name: res?.name,
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
        if (this.ContractTypeForm.invalid) {
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
            AppUtil.cleanObject(this.ContractTypeForm.value),
        );
        if (this.isEdit) {
            this.ContractTypeService.updateContractType(
                newData,
                this.ContractTypeForm.value.id,
            ).subscribe((res) => {
                var result = res as any;
                if (result && !result.succeeded) {
                    this.messageService.add({
                        severity: 'error',
                        detail: result?.message || '',
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
            this.ContractTypeService.createContractType(newData).subscribe(
                (res) => {
                    var result = res as any;
                    if (result && !result.succeeded) {
                        this.messageService.add({
                            severity: 'error',
                            detail: result?.message || '',
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
            );
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

    onBack() {
        this.onCancel.emit({});
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
