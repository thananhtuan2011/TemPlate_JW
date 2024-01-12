import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { MessageService } from 'primeng/api';
import { Company } from 'src/app/models/company.model';
import { CompanyService } from 'src/app/service/company.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppData from 'src/app/utilities/app-data';
import AppUtil from 'src/app/utilities/app-util';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-begin-declare-form',
    templateUrl: './begin-declare-form.component.html',
    styles: [
        `
            :host ::ng-deep {
                .p-fluid .p-button {
                    width: auto;
                }
            }
        `,
    ],
})
export class BeginDeclareFormComponent implements OnInit {
    public appConstant = AppConstant;
    public appUtil = AppUtil;
    @Input('isEdit') isEdit: boolean = false;
    @Output() onCancel = new EventEmitter();
    title: string = '';

    companyForm: FormGroup = new FormGroup({});
    formData: any = {};

    optionCountries = AppData.COUNTRIES;
    countryCodes: any[] = [];

    isSubmitted = false;

    serverURLImage = environment.serverURLImage;
    types: any = {};
    unitType: any = {};

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private companyService: CompanyService,
        private router: Router,
    ) {
        this.companyForm = this.fb.group({
            id: [''],
            quantity: ['', [Validators.required]],
            unitCost: ['', [Validators.required]],
            money: ['', [Validators.required]],
            currency: ['', [Validators.required]],
            decimalRate: ['', [Validators.required]],
            dayType: ['', [Validators.required]],
            decimalUnit: ['', [Validators.required]],
            thousandUnit: ['', [Validators.required]],
            // others params
            mst: ['', [Validators.required]],
        });
    }

    onReset() {
        this.companyForm.reset();
    }

    ngOnInit() {
        this.countryCodes = this.appUtil.getCountries();
        this.getLastInfo();
        this.types = this.appUtil.getBeginDeclareTypes();
    }

    getLastInfo() {
        this.companyService.getLastCompanyInfo().subscribe((response: any) => {
            if (response.data) {
                this.formData = response.data;
                this.companyForm.setValue({
                    id: this.formData.id,
                    quantity: this.formData.quantity,
                    unitCost: this.formData.unitCost,
                    money: this.formData.money,
                    currency: this.formData.currency,
                    decimalRate: this.formData.decimalRate,
                    dayType: this.formData.dayType,
                    decimalUnit: this.formData.decimalUnit,
                    thousandUnit: this.formData.thousandUnit,
                    mst: this.formData.mst,
                });
                this.unitType =
                    this.companyForm.value.decimalUnit === ',' &&
                    this.companyForm.value.thousandUnit === '.'
                        ? 'en'
                        : 'vn';
            } else {
                this.router.navigate(['/uikit/company-info']);
            }
        });
    }

    checkValidValidator(fieldName: string) {
        return (this.companyForm.controls[fieldName].dirty ||
            this.companyForm.controls[fieldName].touched) &&
            this.companyForm.controls[fieldName].invalid
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                (this.companyForm.controls[fieldNames[i]].dirty ||
                    this.companyForm.controls[fieldNames[i]].touched) &&
                this.companyForm.controls[fieldNames[i]].invalid
            ) {
                return true;
            }
        }
        return false;
    }

    onSubmit() {
        this.isSubmitted = true;
        if (this.companyForm.invalid) {
            this.messageService.add({
                severity: 'error',
                detail: AppUtil.translate(
                    this.translateService,
                    'info.please_check_again',
                ),
            });
            this.isSubmitted = false;
            return;
        }

        let newData = this.cleanObject(
            AppUtil.cleanObject(this.companyForm.value),
        );

        this.companyService
            .updateCompany(newData, this.formData.id)
            .subscribe((res) => {
                this.messageService.add({
                    severity: 'success',
                    detail: this.appUtil.translate(
                        this.translateService,
                        'success.update',
                    ),
                });
                this.onCancel.emit({});
            });
    }

    showMessfail() {
        this.messageService.add({
            severity: 'error',
            detail: this.appUtil.translate(
                this.translateService,
                'info.please_check_again',
            ),
        });
        this.isSubmitted = false;
    }

    onReloadCompanyInfo() {
        this.getLastInfo();
        this.onCancel.emit({});
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
        }

        return newData;
    }

    onChangeUnit(type) {
        switch (type) {
            case 'vn':
                {
                    this.companyForm.controls['decimalUnit'].setValue('.');
                    this.companyForm.controls['thousandUnit'].setValue(',');
                }
                break;
            case 'en':
                {
                    this.companyForm.controls['decimalUnit'].setValue(',');
                    this.companyForm.controls['thousandUnit'].setValue('.');
                }
                break;
        }
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
