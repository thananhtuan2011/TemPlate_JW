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
    selector: 'app-company-form',
    templateUrl: './company-form.component.html',
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
export class CompanyFormComponent implements OnInit {
    public appConstant = AppConstant;
    public appUtil = AppUtil;
    @Input('isEdit') isEdit: boolean = false;
    @Input('isDisplay') isDisplay: boolean = false;
    @Output() onCancel = new EventEmitter();
    title: string = '';

    companyForm: FormGroup = new FormGroup({});
    formData: any = {};

    optionCountries = AppData.COUNTRIES;
    countryCodes: any[] = [];

    isSubmitted = false;
    isInvalidForm = false;
    failPassword: boolean = false;

    invalidSignDate: boolean = false;

    serverURLImage = environment.serverURLImage;
    types: any = {};

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private companyService: CompanyService,
    ) {
        this.companyForm = this.fb.group({
            id: [''],
            name: ['', [Validators.required]],
            accordingAccountingRegime: [0, [Validators.required]],
            address: ['', [Validators.required]],
            assignPerson: ['', [Validators.required]],
            businessType: [0, [Validators.required]],
            charterCapital: [0, [Validators.required]],
            email: ['', [Validators.required]],
            fax: ['', [Validators.required]],
            fileLogo: ['', [Validators.required]],
            fileOfBusinessRegistrationCertificate: ['', [Validators.required]],
            methodCalcExportPrice: [0, [Validators.required]],
            mst: ['', [Validators.required]],
            nameOfCeo: ['', [Validators.required]],
            nameOfChiefAccountant: ['', [Validators.required]],
            nameOfChiefSupplier: ['', [Validators.required]],
            nameOfStorekeeper: ['', [Validators.required]],
            nameOfTreasurer: ['', [Validators.required]],
            noteOfCeo: ['', [Validators.required]],
            noteOfChiefAccountant: ['', [Validators.required]],
            noteOfChiefSupplier: ['', [Validators.required]],
            phone: ['', [Validators.required]],
            signDate: ['', [Validators.required]],
            userUpdated: [0, [Validators.required]],
            websiteName: ['', [Validators.required]],
            note: ['', [Validators.required]],
            quantity: [''],
            unitCost: [''],
            money: [''],
            currency: [''],
            decimalRate: [''],
            dayType: [''],
            decimalUnit: [''],
            thousandUnit: [''],
            linkOfBusiness: [''],
            isShowBarCode: [false],
        });
    }

    onReset() {
        this.isInvalidForm = false;
        this.companyForm.reset();
    }

    ngOnInit() {
        this.countryCodes = this.appUtil.getCountries();
        this.getLastInfo();
        this.types = this.appUtil.getCompanyTypes();
    }

    getLastInfo() {
        this.companyService.getLastCompanyInfo().subscribe((response: any) => {
            this.formData = response.data;
            this.companyForm.setValue({
                id: this.formData.id,
                name: this.formData.name,
                accordingAccountingRegime:
                    this.formData.accordingAccountingRegime,
                address: this.formData.address,
                assignPerson: this.formData.assignPerson,
                businessType: this.formData.businessType,
                charterCapital: this.formData.charterCapital,
                email: this.formData.email,
                fax: this.formData.fax,
                fileLogo: this.formData.fileLogo,
                fileOfBusinessRegistrationCertificate:
                    this.formData.fileOfBusinessRegistrationCertificate,
                methodCalcExportPrice: this.formData.methodCalcExportPrice,
                mst: this.formData.mst,
                nameOfCeo: this.formData.nameOfCeo,
                nameOfChiefAccountant: this.formData.nameOfChiefAccountant,
                nameOfChiefSupplier: this.formData.nameOfChiefSupplier,
                nameOfStorekeeper: this.formData.nameOfStorekeeper,
                nameOfTreasurer: this.formData.nameOfTreasurer,
                noteOfCeo: this.formData.noteOfCeo,
                noteOfChiefAccountant: this.formData.noteOfChiefAccountant,
                noteOfChiefSupplier: this.formData.noteOfChiefSupplier,
                phone: this.formData.phone,
                signDate: moment(this.formData.signDate).format(
                    this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                ),
                userUpdated: 0,
                websiteName: this.formData.websiteName,
                note: this.formData.note,
                quantity: this.formData.quantity,
                unitCost: this.formData.unitCost,
                money: this.formData.money,
                currency: this.formData.currency,
                decimalRate: this.formData.decimalRate,
                dayType: this.formData.dayType,
                decimalUnit: this.formData.decimalUnit,
                thousandUnit: this.formData.thousandUnit,
                linkOfBusiness: this.formData.linkOfBusiness,
                isShowBarCode: this.formData.isShowBarCode,
            });
            console.log(this.companyForm.value);
        });
    }

    getDetail(companyId) {
        this.companyService
            .getCompanyDetail(companyId)
            .subscribe((response: Company) => {
                this.formData = response;
                this.companyForm.setValue({
                    id: this.formData.id,
                    name: this.formData.name,
                    accordingAccountingRegime:
                        this.formData.accordingAccountingRegime,
                    address: this.formData.address,
                    assignPerson: this.formData.assignPerson,
                    businessType: this.formData.businessType,
                    charterCapital: this.formData.charterCapital,
                    email: this.formData.email,
                    fax: this.formData.fax,
                    fileLogo: this.formData.fileLogo,
                    fileOfBusinessRegistrationCertificate:
                        this.formData.fileOfBusinessRegistrationCertificate,
                    methodCalcExportPrice: this.formData.methodCalcExportPrice,
                    mst: this.formData.mst,
                    nameOfCeo: this.formData.nameOfCeo,
                    nameOfChiefAccountant: this.formData.nameOfChiefAccountant,
                    nameOfChiefSupplier: this.formData.nameOfChiefSupplier,
                    nameOfStorekeeper: this.formData.nameOfStorekeeper,
                    nameOfTreasurer: this.formData.nameOfTreasurer,
                    noteOfCeo: this.formData.noteOfCeo,
                    noteOfChiefAccountant: this.formData.noteOfChiefAccountant,
                    noteOfChiefSupplier: this.formData.noteOfChiefSupplier,
                    phone: this.formData.phone,
                    signDate: moment(this.formData.signDate).format(
                        this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                    ),
                    userUpdated: 0,
                    websiteName: this.formData.websiteName,
                    note: this.formData.note,
                    quantity: this.formData.quantity,
                    unitCost: this.formData.unitCost,
                    money: this.formData.money,
                    currency: this.formData.currency,
                    decimalRate: this.formData.decimalRate,
                    dayType: this.formData.dayType,
                    decimalUnit: this.formData.decimalUnit,
                    thousandUnit: this.formData.thousandUnit,

                    // Todo: Mapping new field later
                    linkOfBusiness: this.formData.linkOfBusiness ?? '',
                    isShowBarCode: this.formData.isShowBarCode,
                });
                console.log(this.companyForm.value);
            });
    }

    checkValidValidator(fieldName: string) {
        return ((this.companyForm.controls[fieldName].dirty ||
            this.companyForm.controls[fieldName].touched) &&
            this.companyForm.controls[fieldName].invalid) ||
            (this.isInvalidForm && this.companyForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.companyForm.controls[fieldNames[i]].dirty ||
                    this.companyForm.controls[fieldNames[i]].touched) &&
                    this.companyForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.companyForm.controls[fieldNames[i]].invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        this.invalidSignDate = false;
        if (this.companyForm.invalid) {
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
            AppUtil.cleanObject(this.companyForm.value),
        );

        if (this.invalidSignDate) {
            this.showMessfail();
            return;
        }
        console.log(newData);
        this.onCancel.emit({});
        if (this.isEdit) {
            this.companyService
                .updateCompany(newData, this.formData.id)
                .subscribe((res) => {
                    this.onCancel.emit({});
                    this.messageService.add({
                        severity: 'success',
                        detail: AppUtil.translate(
                            this.translateService,
                            'success.update',
                        ),
                    });
                });
        } else {
            this.companyService.createCompany(newData).subscribe((res) => {
                this.onCancel.emit({});
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.create',
                    ),
                });
            });
        }
    }

    showMessfail() {
        this.messageService.add({
            severity: 'error',
            detail: this.appUtil.translate(
                this.translateService,
                'info.please_check_again',
            ),
        });
        this.isInvalidForm = true;
        this.isSubmitted = false;
    }

    onChangeSignDate(event) {
        let signDate = this.appUtil.formatLocalTimezone(
            moment(
                event,
                this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ).format(this.appConstant.FORMAT_DATE.T_DATE),
        );
        this.invalidSignDate = signDate === 'Invalid date';
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
        newData.signDate = this.appUtil.formatLocalTimezone(
            moment(
                newData.signDate,
                this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ).format(this.appConstant.FORMAT_DATE.T_DATE),
        );
        newData.charterCapital = parseInt(newData.charterCapital);
        return newData;
    }

    getDayOfWeek(date: any) {
        return new Date(date.year, date.month, date.day).getDay();
    }

    doAttachFileBusiness(event: any): void {
        let image: FormData = new FormData();
        image.append('file', event.target?.files[0]);
        this.companyService.uploadFiles(image).subscribe((res) => {
            if (res.body) {
                this.companyForm.controls[
                    'fileOfBusinessRegistrationCertificate'
                ].setValue(res.body.imageUrl);
            }
        });
    }

    doAttachFileLogo(event: any): void {
        let image: FormData = new FormData();
        image.append('file', event.target?.files[0]);
        this.companyService.uploadFiles(image).subscribe((res) => {
            if (res.body) {
                this.companyForm.controls['fileLogo'].setValue(
                    res.body.imageUrl,
                );
            }
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
