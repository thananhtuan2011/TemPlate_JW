import {
    Component,
    EventEmitter,
    HostListener,
    Injector,
    Input,
    OnChanges,
    OnInit,
    Output,
    Renderer2,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import {
    FormArray,
    FormBuilder,
    FormGroup,
    NgForm,
    Validators,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { MessageService } from 'primeng/api';
import AppConstant from 'src/app/utilities/app-constants';
import AppData from 'src/app/utilities/app-data';
import AppUtil from 'src/app/utilities/app-util';
import { Province } from 'src/app/models/province.model';
import { District } from 'src/app/models/district.model';
import { Ward } from 'src/app/models/ward.model';
import { UserService } from 'src/app/service/user.service';
import { DistrictService } from 'src/app/service/district.service';
import { WardService } from 'src/app/service/ward.service';
import { Branch } from 'src/app/models/branch.model';
import * as moment from 'moment';
import { Major } from 'src/app/models/major.model';
import { Store } from 'src/app/models/store.model';
import { PositionDetail } from 'src/app/models/position-detail.model';
import { Target } from 'src/app/models/target.model';
import { ContractType } from 'src/app/models/contract-type.model';
import { environment } from 'src/environments/environment';
import { CustomerService } from 'src/app/service/customer.service';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import { ChartOfAccount } from 'src/app/models/case.model';
import { TypeData } from 'src/app/models/common.model';
import { CustomerTaxService } from 'src/app/service/customer-tax.service';
import { CustomerTax } from 'src/app/models/customer-tax.model';
import { AutoComplete } from 'primeng/autocomplete';
import { CustomerClassification } from 'src/app/models/customer-classification.model';
import { CategoryService } from 'src/app/service/category.service';
import {
    AccountType,
    AddAccountDetailType,
} from '../../../../accounting-module/account-v2/account.model';
import { AddEditAccountDetailsComponent } from 'src/app/components/accounting-module/account-v2/dialogs/add-edit-account-details/add-edit-account-details.component';
import { AddEditAccountComponent } from 'src/app/components/accounting-module/account-v2/dialogs/add-edit-account/add-edit-account.component';
import { BaseAccountComponent } from 'src/app/shared/components/BaseAccountComponent';
import { any } from 'codelyzer/util/function';
import {Router} from "@angular/router";
import { el } from 'date-fns/locale';

@Component({
    selector: 'app-customers-form',
    templateUrl: './customers-form.component.html',
    styleUrls: ['customers-form.component.scss'],
})
export class CustomersFormComponent
    extends BaseAccountComponent
    implements OnInit, OnChanges
{
    @Input('formData') formData: any = {};
    @Input('formCustomerTaxData') formCustomerTaxData: any = {};
    @Input('provinces') provinces: Province[] = [];
    @Input('nativeProvinces') nativeProvinces: Province[] = [];
    @Input('branches') branches: Branch[] = [];
    @Input('majors') majors: Major[] = [];
    @Input('warehouses') warehouses: Store[] = [];
    @Input('positionDetails') positionDetails: PositionDetail[] = [];
    @Input('targets') targets: Target[] = [];
    @Input('symbols') symbols: Symbol[] = [];
    @Input('contractTypes') contractTypes: ContractType[] = [];
    @Input('customerTypes') customerTypes: CustomerClassification[] = [];
    @Input('roles') roles: any[] = [];
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Input('type') type: number = 0;
    @Input('showAccountingConnection') showAccountingConnection: boolean =
        false;
    @ViewChild('addEditAccount', { static: false })
    addEditAccount: AddEditAccountComponent;
    @ViewChild('addEditAccountDetail', { static: false })
    addEditAccountDetail: AddEditAccountDetailsComponent;
    @ViewChild('debitCodeTmp') debitCodeTmp: AutoComplete;
    @ViewChild('debitDetailCodeFirstTmp') debitDetailCodeFirstTmp: AutoComplete;
    @ViewChild('debitDetailCodeSecondTmp')
    debitDetailCodeSecondTmp: AutoComplete;
    @Output() onCancel = new EventEmitter();
    @Output() onSuccess = new EventEmitter();

    appConstant = AppConstant;
    appUtil = AppUtil;
    serverURLImage = environment.serverURLImage;
    optionCountries = AppData.COUNTRIES;
    title: string = '';
    districts: District[] = [];
    wards: Ward[] = [];
    nativeDistricts: District[] = [];
    nativeWards: Ward[] = [];
    customerForm: FormGroup = new FormGroup({});
    employees: any[];
    countryCodes: any[] = [];
    isSubmitted = false;
    isInvalidForm = false;
    types: any = {};
    currentAccountType: AccountType = AccountType.HT;

    constructor(
        private readonly translateService: TranslateService,
        private readonly messageService: MessageService,
        private readonly userService: UserService,
        private readonly districtService: DistrictService,
        private readonly wardService: WardService,
        private readonly customerService: CustomerService,
        private readonly customerTaxService: CustomerTaxService,
        private readonly categoryService: CategoryService,
        public router: Router,
        fb: FormBuilder,
        chartOfAccountService: ChartOfAccountService,
        renderer: Renderer2,
        injector: Injector,
    ) {
        super(fb, chartOfAccountService, renderer, injector);
        this.form = this.fb.group({
            debitCode: [''],
            debitDetailCodeFirst: [''],
            debitDetailCodeSecond: [''],
        });
        this.customerForm = this.fb.group({
            id: [''],
            code: ['', [Validators.required]],
            name: ['', [Validators.required]],
            avatar: [''],
            birthday: [''],
            gender: [''],
            phone: [''],
            provinceId: [''],
            districtId: [''],
            wardId: [''],
            email: ['', [Validators.required]],
            sendEmail: [false],
            facebook: [''],
            address: [''],
            identityCardNo: [''],
            identityCardIssueDate: [''],
            identityCardIssuePlace: [''],
            identityCardValidUntil: [''],
            identityCardProvinceId: [''],
            identityCardDistrictId: [''],
            identityCardWardId: [''],
            identityCardPlaceOfPermanent: [''],
            identityCardAddressInCard: [''],
            userCreated: [''],
            userUpdated: [''],
            password: [''],
            customerClassficationId: [''],
            priceList: [''],
            taxId: [''],
            customerId: [''],
            companyNameTax: [''],
            addressTax: [''],
            taxCode: [''],
            accountNumberTax: [''],
            bankTax: [''],
            phoneTax: [''],
            accountants: this.fb.array([]),
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (
            this.isEdit &&
            !this.appUtil.isEmpty(this.formData) &&
            !this.appUtil.isEmpty(this.formCustomerTaxData) &&
            Object.keys(this.formData).length > 0
        ) {
            this.buildFormAccount(this.formData);
            this.customerForm.setValue({
                id: this.formData.id,
                code: this.formData.code,
                name: this.formData.name,
                avatar: this.formData.avatar,
                birthday: moment(this.formData.birthday).format(
                    this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                ),
                gender: this.formData.gender.toString(),
                phone: this.formData.phone,
                provinceId: this.formData.provinceId,
                districtId: this.formData.districtId,
                wardId: this.formData.wardId,
                email: this.formData.email,
                sendEmail: this.formData.sendEmail,
                facebook: this.formData.facebook,
                address: this.formData.address,
                identityCardNo: this.formData.identityCardNo,
                identityCardIssueDate: moment(
                    this.formData.identityCardIssueDate || new Date(),
                ).format(this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE),
                identityCardIssuePlace: this.formData.identityCardIssuePlace,

                identityCardValidUntil: moment(
                    this.formData.identityCardValidUntil,
                ).format(this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE),
                identityCardProvinceId: this.formData.identityCardProvinceId,
                identityCardDistrictId: this.formData.identityCardDistrictId,

                identityCardWardId: this.formData.identityCardWardId,

                identityCardPlaceOfPermanent:
                    this.formData.identityCardPlaceOfPermanent,
                identityCardAddressInCard:
                    this.formData.identityCardAddressInCard,
                userCreated: this.formData.userCreated,
                userUpdated: this.formData.userUpdated,
                password: this.formData.password,
                customerClassficationId: this.formData.customerClassficationId,
                priceList: this.formData.priceList,

                taxId: this.formCustomerTaxData.id,
                customerId: this.formCustomerTaxData.customerId,

                companyNameTax: this.formCustomerTaxData.companyName,
                addressTax: this.formCustomerTaxData.address,
                taxCode: this.formCustomerTaxData.taxCode,
                accountNumberTax: this.formCustomerTaxData.accountNumber,
                bankTax: this.formCustomerTaxData.bank,
                phoneTax: this.formCustomerTaxData.phone,
                accountants: [],
            });

            (this.formCustomerTaxData.accountants || []).forEach((item) => {
                this.addAccountant(item);
            });

            if (this.formData.provinceId > 0) {
                this.getDistrict({
                    value: this.formData.provinceId,
                });
            }
            if (this.formData.identityCardProvinceId > 0) {
                this.getNativeDistrict({
                    value: this.formData.identityCardProvinceId,
                });
            }
        } else {
            this.customerService.getCode(this.type).subscribe((res) => {
                this.customerForm.patchValue({
                    code: res?.data || '',
                });
            });
        }
    }

    private getDetail(id: any, callBack) {
        this.customerService.getCustomerDetail(id).subscribe((res) => {
            callBack(res);
        });
    }

    private buildFormAccount(data: any) {
        if (!data || !this.form) {
            return;
        }
        this.getDetail(data.id, (res) => {
            this.form.patchValue({
                debitCode: res.data.debit,
                debitDetailCodeFirst: res.data.debitDetailFirst,
                debitDetailCodeSecond: res.data.debitDetailSecond,
            });
        });
    }

    createAccountant(item: any = null): FormGroup {
        return this.fb.group({
            name: item?.name || [''],
            phone: item?.phone || [''],
            position: item?.position || [''],
        });
    }

    get accountants(): FormArray {
        return this.customerForm.get('accountants') as FormArray;
    }

    addAccountant(item: any = null): void {
        this.accountants.push(this.createAccountant(item));
    }

    removeAccountant(index: number): void {
        this.accountants.removeAt(index);
    }

    onReset() {
        this.isInvalidForm = false;
        this.customerForm.reset();
    }

    ngOnInit() {
        this.countryCodes = AppUtil.getCountries();
        this.types = this.appUtil.getUserTypes();
        this.getChartOfAccounts();
        this.getCategories();
        this.getAllUserActive();
    }

    getAllUserActive() {
        this.userService.getAllUserActive().subscribe((res: any) => {
            this.employees = res.data;
        });
    }

    getCategories() {
        this.categoryService.getAll().subscribe((res) => {
            this.types.priceList = res.data.filter(
                (x) => x.type === this.appConstant.CATEGORY_TYPE.PRICE_LIST,
            );
        });
    }

    checkValidValidator(fieldName: string) {
        return ((this.customerForm.controls[fieldName].dirty ||
            this.customerForm.controls[fieldName].touched) &&
            this.customerForm.controls[fieldName].invalid) ||
            (this.isInvalidForm &&
                this.customerForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.customerForm.controls[fieldNames[i]].dirty ||
                    this.customerForm.controls[fieldNames[i]].touched) &&
                    this.customerForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.customerForm.controls[fieldNames[i]].invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    get validation() {
        if (
            this.isDebitDetailCodeFirstHasDetails &&
            !this.isDebitDetailCodeSecondHas
        )
            return false;
        if (this.isDebitCodeHasDetails && !this.isDebitDetailCodeFirstHas)
            return false;
        return this.customerForm.valid;
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (!this.validation) {
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
        this.customerForm.value.type = this.type;
        let cusRequest = this.cleanObject(
            AppUtil.cleanObject(this.customerForm.value),
        );

        const customerApiAction = this.isEdit
            ? this.customerService.updateCustomer(cusRequest, this.formData.id)
            : this.customerService.createCustomer(cusRequest);
debugger
        let taxRequest: any = {
            id: cusRequest.taxId || 0,
            customerId: this.formData.id,
            companyName: cusRequest.companyNameTax,
            address: cusRequest.addressTax,
            taxCode: cusRequest.taxCode,
            accountNumber: cusRequest.accountNumberTax,
            bank: cusRequest.bankTax,
            phone: cusRequest.phoneTax,
            accountants: cusRequest.accountants,
        };
       
        // Trigger store customer api
        customerApiAction.subscribe((cusResponse: any) => {
            if (cusResponse.status == 400) {
                this.messageService.add({
                    severity: 'error',
                    detail: cusResponse.message,
                });
                return;
            }
            this.onSuccess.emit(cusResponse.data);
            // Trigger store tax api
            if(this.isEdit){
                this.customerTaxService.updateCustomerTax(
                    taxRequest,
                    this.formData.id,
                ).subscribe((_) => {
                    this.onCancel.emit({});
                })
            }
            else{
                taxRequest.customerId = cusResponse.data.id
                this.customerTaxService.createCustomerTax(taxRequest).subscribe((_) => {
                    this.onCancel.emit({});
                })
            }
        });
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
        }
        newData.districtId = parseInt(newData.districtId) || 0;
        newData.provinceId = parseInt(newData.provinceId) || 0;
        newData.wardId = parseInt(newData.wardId) || 0;
        newData.avatar = newData.avatar || '';
        newData.gender = parseInt(newData.gender) || 0;
        newData.sendEmail = newData.sendEmail || false;
        newData.identityCardProvinceId =
            parseInt(newData.identityCardProvinceId) || 0;
        newData.identityCardDistrictId =
            parseInt(newData.identityCardDistrictId) || 0;
        newData.identityCardWardId = parseInt(newData.identityCardWardId) || 0;

        newData.userCreated = parseInt(newData.userCreated) || 0;
        newData.userUpdated = parseInt(newData.userUpdated) || 0;
        newData.customerClassficationId =
            parseInt(newData.customerClassficationId) || 0;
        newData.birthday = this.appUtil.formatLocalTimezone(
            moment(
                newData.birthday && newData.birthday !== 'Invalid date'
                    ? newData.birthday
                    : new Date(),
                this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ).format(this.appConstant.FORMAT_DATE.T_DATE),
        );
        newData.identityCardIssueDate = this.appUtil.formatLocalTimezone(
            moment(
                newData.identityCardIssueDate &&
                    newData.identityCardIssueDate !== 'Invalid date'
                    ? newData.identityCardIssueDate
                    : new Date(),
                this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ).format(this.appConstant.FORMAT_DATE.T_DATE),
        );
        newData.identityCardValidUntil = this.appUtil.formatLocalTimezone(
            moment(
                newData.identityCardValidUntil &&
                    newData.identityCardValidUntil !== 'Invalid date'
                    ? newData.identityCardValidUntil
                    : new Date(),
                this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ).format(this.appConstant.FORMAT_DATE.T_DATE),
        );

        return {
            ...newData,
            debitCode: this.fc['debitCode']?.value?.code || '',
            debitDetailCodeFirst:
                this.fc['debitDetailCodeFirst'].value?.code || '',
            debitDetailCodeSecond:
                this.fc['debitDetailCodeSecond']?.value?.code || '',
        };
    }

    getDayOfWeek(date: any) {
        return new Date(date.year, date.month, date.day).getDay();
    }

    getDistrict(id) {
        this.districts = [];
        this.wards = [];
        if (id.value > 0) {
            this.districtService
                .getDistrictForProvince(id.value)
                .subscribe((response: District[]) => {
                    this.districts = response;
                    if (
                        this.districts !== undefined &&
                        this.districts.length > 0
                    ) {
                        this.getWard({
                            value: this.customerForm.value.districtId,
                        });
                    }
                });
        }
    }

    getNativeDistrict(id) {
        this.nativeDistricts = [];
        this.nativeWards = [];
        if (id.value > 0) {
            this.districtService
                .getDistrictForProvince(id.value)
                .subscribe((response: District[]) => {
                    this.nativeDistricts = response;
                    if (
                        this.nativeDistricts !== undefined &&
                        this.nativeDistricts.length > 0
                    ) {
                        this.getNativeWard({
                            value: this.customerForm.value
                                .identityCardDistrictId,
                        });
                    }
                });
        }
    }

    getWard(id) {
        this.wards = [];
        if (id.value > 0) {
            this.wardService
                .getWardForDistrict(id.value)
                .subscribe((response: Ward[]) => {
                    this.wards = response;
                });
        }
    }

    getNativeWard(id) {
        this.nativeWards = [];
        if (id.value > 0) {
            this.wardService
                .getWardForDistrict(id.value)
                .subscribe((response: Ward[]) => {
                    this.nativeWards = response;
                });
        }
    }

    getChartOfAccounts() {
        this.chartOfAccountService.getAllCustomer().subscribe((res: any) => {
            this.chartOfAccounts = res.data;
        });
    }

    doAttachFile(event: any): void {
        let image: FormData = new FormData();
        image.append('file', event.target?.files[0]);
        this.userService.uploadFiles(image).subscribe((res) => {
            if (res && res.body) {
                this.customerForm.controls['avatar'].setValue(
                    res.body.imageUrl,
                );
            }
        });
    }

    setEmptyData(columnName) {
        this.customerForm.controls[columnName].setValue('');
    }

    onAddEditAccountDetail(isDebit1?: boolean) {
        this.addEditAccountDetail.tabIndex = -1;
        if (isDebit1) {
            this.addEditAccountDetail.show(
                AddAccountDetailType.CT1,
                this.fc['debitCode'].value,
            );
        } else {
            this.addEditAccountDetail.show(
                AddAccountDetailType.CT2,
                this.fc['debitDetailCodeFirst'].value,
            );
        }
    }

    onAddEditAccountSuccess() {
        this.getChartOfAccounts();
    }

    onAddEditFirstChildAccountSuccess() {}
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
