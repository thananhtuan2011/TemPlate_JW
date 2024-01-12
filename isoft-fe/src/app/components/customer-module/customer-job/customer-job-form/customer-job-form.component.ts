import {Component, EventEmitter, HostListener, Input, OnInit, Output,} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {MessageService} from 'primeng/api';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import {environment} from 'src/environments/environment';
import {CustomerJobService} from 'src/app/service/customer-job.service';
import {CompanyService} from 'src/app/service/company.service';

@Component({
    selector: 'app-customer-job-form',
    templateUrl: './customer-job-form.component.html',
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
export class CustomerJobFormComponent implements OnInit {
    public appConstant = AppConstant;
    public appUtil = AppUtil;
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Input('hiddenTitle') hiddenTitle: boolean = false;
    @Output() onCancel = new EventEmitter();

    serverURLImage = environment.serverURLImage;

    customerJobForm: FormGroup = new FormGroup({});

    isSubmitted = false;
    isInvalidForm = false;

    company: any = {};

    types: any = {};

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private readonly customerJobService: CustomerJobService,
        private readonly companyService: CompanyService,
    ) {
        this.customerJobForm = this.fb.group({
            id: [''],
            name: ['', [Validators.required]],
            description: [''],
            color: ['', [Validators.required]],
            companyId: [''],
            status: [''],
        });
    }

    onReset() {
        this.isInvalidForm = false;
        this.customerJobForm.reset();
    }

    getDetail(id) {
        this.customerJobService
            .getCustomerJobDetail(id)
            .subscribe((res: any) => {
                this.customerJobForm.setValue({
                    id: res.id,
                    name: res.name,
                    description: res.description,
                    color: res.color,
                    companyId: res.companyId,
                    status: res.status,
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
        return ((this.customerJobForm.controls[fieldName].dirty ||
            this.customerJobForm.controls[fieldName].touched) &&
            this.customerJobForm.controls[fieldName].invalid) ||
            (this.isInvalidForm &&
                this.customerJobForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.customerJobForm.controls[fieldNames[i]].dirty ||
                    this.customerJobForm.controls[fieldNames[i]].touched) &&
                    this.customerJobForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.customerJobForm.controls[fieldNames[i]].invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    onSubmit() {
        this.isSubmitted = true;
        if (this.customerJobForm.invalid) {
            return;
        }
        this.isInvalidForm = false;

        let newData = this.cleanObject(
            AppUtil.cleanObject(this.customerJobForm.value),
        );
        newData.companyId = this.company.id;
        if (this.isEdit) {
            this.customerJobService
                .updateCustomerJob(newData, this.customerJobForm.value.id)
                .subscribe(() => {
                    this.onCancel.emit({});
                });
        } else {
            this.customerJobService.createCustomerJob(newData).subscribe(() => {
                this.onCancel.emit({});
            });
        }
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
        }

        newData.status = newData.statusDetect == 'false';
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
        this.customerJobForm.controls[columnName].setValue('');
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
