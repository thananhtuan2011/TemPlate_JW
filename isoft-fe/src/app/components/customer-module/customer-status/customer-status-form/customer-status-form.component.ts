import {Component, EventEmitter, HostListener, Input, OnInit, Output,} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {MessageService} from 'primeng/api';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import {environment} from 'src/environments/environment';
import {CustomerStatusService} from 'src/app/service/customer-status.service';
import {CompanyService} from 'src/app/service/company.service';

@Component({
    selector: 'app-customer-status-form',
    templateUrl: './customer-status-form.component.html',
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
export class CustomerStatusFormComponent implements OnInit {
    public appConstant = AppConstant;
    public appUtil = AppUtil;
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Input('hiddenTitle') hiddenTitle: boolean = false;
    @Input('type') type = 0;
    @Output() onCancel = new EventEmitter();

    serverURLImage = environment.serverURLImage;

    customerStatusForm: FormGroup = new FormGroup({});

    isSubmitted = false;
    isInvalidForm = false;
    company: any = {};

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private readonly customerStatusService: CustomerStatusService,
        private readonly companyService: CompanyService,
    ) {
        this.customerStatusForm = this.fb.group({
            id: [''],
            order: [0, [Validators.required]],
            name: ['', [Validators.required]],
            description: [''],
            color: ['', [Validators.required]],
            companyId: [''],
            statusDetect: [''],
        });
    }

    onReset() {
        this.isInvalidForm = false;
        this.customerStatusForm.reset();
    }

    getDetail(id) {
        this.customerStatusService
            .getCustomerStatusDetail(id)
            .subscribe((res: any) => {
                this.customerStatusForm.setValue({
                    id: res.id,
                    order: res.order,
                    name: res.name,
                    description: res.description,
                    color: res.color,
                    companyId: res.companyId,
                    statusDetect: res.statusDetect,
                });
            });
    }

    getLastInfo() {
        this.companyService.getLastCompanyInfo().subscribe((response: any) => {
            this.company = response.data;
        });
    }

    ngOnInit() {}

    checkValidValidator(fieldName: string) {
        return ((this.customerStatusForm.controls[fieldName].dirty ||
            this.customerStatusForm.controls[fieldName].touched) &&
            this.customerStatusForm.controls[fieldName].invalid) ||
            (this.isInvalidForm &&
                this.customerStatusForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.customerStatusForm.controls[fieldNames[i]].dirty ||
                    this.customerStatusForm.controls[fieldNames[i]].touched) &&
                    this.customerStatusForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.customerStatusForm.controls[fieldNames[i]].invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    onSubmit() {
        this.isSubmitted = true;
        if (this.customerStatusForm.invalid) {
            return;
        }
        this.isInvalidForm = false;
        let newData = this.cleanObject(
            AppUtil.cleanObject(this.customerStatusForm.value),
        );
        newData.companyId = this.company.id;
        newData.type = this.type;
        if (this.isEdit) {
            this.customerStatusService
                .updateCustomerStatus(newData, this.customerStatusForm.value.id)
                .subscribe(() => {
                    this.onCancel.emit({});
                });
        } else {
            this.customerStatusService
                .createCustomerStatus(newData)
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

        newData.statusDetect = newData.statusDetect == 'true';
        // newData.note = newData.note || '';
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
        this.customerStatusForm.controls[columnName].setValue('');
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
