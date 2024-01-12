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
import { MessageService } from 'primeng/api';
import AppConstant from 'src/app/utilities/app-constants';
import AppData from 'src/app/utilities/app-data';
import AppUtil from 'src/app/utilities/app-util';
import { Province } from 'src/app/models/province.model';
import { District } from 'src/app/models/district.model';
import { Ward } from 'src/app/models/ward.model';
import { UserService } from 'src/app/service/user.service';
import { DepartmentService } from 'src/app/service/department.service';
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

@Component({
    selector: 'app-user-form',
    templateUrl: './user-form.component.html',
    styles: [
        `
            :host ::ng-deep {
                .p-dropdown.p-dropdown-clearable .p-dropdown-label {
                    min-height: 37px;
                }

                .p-dropdown {
                    min-height: 39px;
                }
            }
        `,
    ],
})
export class UserFormComponent implements OnInit, OnChanges {
    public appConstant = AppConstant;
    public appUtil = AppUtil;
    @Input('formData') formData: any = {};
    @Input('provinces') provinces: Province[] = [];
    @Input('nativeProvinces') nativeProvinces: Province[] = [];
    @Input('branches')
    branches: Branch[] = [];
    @Input('majors') majors: Major[] = [];
    @Input('warehouses') warehouses: Store[] = [];
    @Input('positionDetails') positionDetails: PositionDetail[] = [];
    @Input('targets') targets: Target[] = [];
    @Input('symbols') symbols: Symbol[] = [];
    @Input('contractTypes') contractTypes: ContractType[] = [];
    @Input('roles') roles: any[] = [];
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Output() onCancel = new EventEmitter();

    serverURLImage = environment.serverURLImage;

    optionCountries = AppData.COUNTRIES;
    title: string = '';

    districts: District[] = [];
    wards: Ward[] = [];
    nativeDistricts: District[] = [];
    nativeWards: Ward[] = [];
    userForm: FormGroup = new FormGroup({});

    countryCodes: any[] = [];

    isSubmitted = false;
    isInvalidForm = false;

    departments: any[] = [];

    types: any = {};

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private departmentService: DepartmentService,
        private userService: UserService,
        private readonly districtService: DistrictService,
        private readonly wardService: WardService,
    ) {
        this.userForm = this.fb.group(
            {
                id: [''],
                quit: ['', [Validators.required]],
                username: ['', [Validators.required]],
                password: [''],
                confirmPassword: [''],
                fullName: [''],
                phone: [''],
                birthDay: [''],
                provinceId: [''],
                districtId: [''],
                wardId: [''],
                branchId: [''],
                userRoleIds: [''],
                warehouseId: [''],
                avatar: [''],
                departmentId: [''],
                positionDetailId: [''],
                targetId: [''],
                symbolId: [''],
                language: [''],
                gender: [''],
                note: [''],
                email: [''],
                facebook: [''],
                address: [''],
                bankAccount: [''],
                bank: [''],
                shareHolderCode: [''],
                noOfLeaveDate: [''],
                sendSalaryDate: [''],
                contractTypeId: [''],
                salary: [''],
                socialInsuranceSalary: [''],
                numberWorkdays: [''],
                dayOff: [''],
                identify: [''],
                identifyCreatedDate: [''],
                identifyCreatedPlace: [''],
                identifyExpiredDate: [''],
                nativeProvinceId: [''],
                nativeDistrictId: [''],
                nativeWardId: [''],
                placeOfPermanent: [''],
                ethnicGroup: [''],
                nation: [''],
                religion: [''],
                licensePlates: [''],
                unionMember: [''],
                isDemobilized: [''],
                literacy: [''],
                literacyDetail: [''],
                majorId: [''],
                certificateOther: [''],
                personalTaxCode: [''],
                socialInsuranceCreated: [''],
                socialInsuranceCode: [''],
            },
            {
                validators: this.validateConfirmPassword.bind(this),
            },
        );
    }
    ngOnChanges(changes: SimpleChanges): void {
        if (
            this.isEdit &&
            this.formData &&
            Object.keys(this.formData).length > 0
        ) {
            this.title = AppUtil.translate(
                this.translateService,
                'label.edit_user',
            );
            this.userForm.setValue({
                id: this.formData.id,
                quit: this.formData.quit,
                username: this.formData.username,
                password: '',
                confirmPassword: '',
                fullName: this.formData.fullName,
                phone: this.formData.phone,
                birthDay: moment(this.formData.birthDay).format(
                    this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                ),
                provinceId: this.formData.provinceId,
                districtId: this.formData.districtId,
                wardId: this.formData.wardId,
                branchId: this.formData.branchId,
                warehouseId: this.formData.warehouseId,
                positionDetailId: this.formData.positionDetailId,
                targetId: this.formData.targetId,
                symbolId: this.formData.symbolId,
                language: this.formData.language,
                gender: this.formData.gender,
                note: this.formData.note,
                email: this.formData.email,
                facebook: this.formData.facebook,
                address: this.formData.address,
                bankAccount: this.formData.bankAccount,
                bank: this.formData.bank,
                shareHolderCode: this.formData.shareHolderCode,
                noOfLeaveDate: this.formData.noOfLeaveDate,
                sendSalaryDate: moment(this.formData.sendSalaryDate).format(
                    this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                ),
                contractTypeId: this.formData.contractTypeId,
                salary: this.formData.salary,
                socialInsuranceSalary: this.formData.socialInsuranceSalary,
                numberWorkdays: this.formData.numberWorkdays,
                dayOff: this.formData.dayOff,
                identify: this.formData.identify,
                identifyCreatedDate: moment(
                    this.formData.identifyCreatedDate,
                ).format(this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE),
                identifyCreatedPlace: this.formData.identifyCreatedPlace,
                identifyExpiredDate: moment(
                    this.formData.identifyExpiredDate,
                ).format(this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE),
                nativeProvinceId: this.formData.nativeProvinceId,
                nativeDistrictId: this.formData.nativeDistrictId,
                nativeWardId: this.formData.nativeWardId,
                placeOfPermanent: this.formData.placeOfPermanent,
                ethnicGroup: this.formData.ethnicGroup,
                nation: this.formData.nation,
                religion: this.formData.religion,
                licensePlates: this.formData.licensePlates,
                unionMember: this.formData.unionMember,
                isDemobilized: this.formData.isDemobilized,
                userRoleIds: this.getRoleIds(this.formData.userRoleIds),
                departmentId: this.formData.departmentId,
                literacy: this.formData.literacy,
                literacyDetail: this.formData.literacyDetail,
                majorId: this.formData.majorId,
                certificateOther: this.formData.certificateOther,
                avatar: this.formData.avatar,
                // tax code
                personalTaxCode: this.formData.personalTaxCode,
                socialInsuranceCreated: moment(
                    this.formData.socialInsuranceCreated,
                ).format(this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE),
                socialInsuranceCode: this.formData.socialInsuranceCode,
            });
            if (this.formData.provinceId > 0) {
                this.getDistrict({
                    value: this.formData.provinceId,
                });
            }
            if (this.formData.nativeProvinceId > 0) {
                this.getNativeDistrict({
                    value: this.formData.nativeProvinceId,
                });
            }
        } else {
            this.userForm.controls['quit'].setValue(false);
            this.onDefaultPassword();
            this.title = AppUtil.translate(
                this.translateService,
                'label.add_user',
            );
        }
    }

    getLastUsername() {
        this.userService.getLastUsername().subscribe((res) => {
            this.userForm.controls['username'].setValue(res.data);
        });
    }

    getRoleIds(ids) {
        let idArr = Array.from(ids.split(',')).map((x: string) => {
            return parseInt(x);
        });
        return idArr;
    }

    onDefaultPassword() {
        this.userForm.controls['password'].setValue('123456');
        this.userForm.controls['confirmPassword'].setValue('123456');
    }

    onReset() {
        this.isInvalidForm = false;
        this.userForm.reset();
    }

    ngOnInit() {
        this.countryCodes = AppUtil.getCountries();
        this.getDepartmentList();
        this.types = this.appUtil.getUserTypes();
    }

    validateConfirmPassword(formGroup: FormGroup) {
        // @ts-ignore
        const password = formGroup.get('password').value;
        // @ts-ignore
        const confirmPassword = formGroup.get('confirmPassword').value;
        return password && password !== confirmPassword
            ? { passwordNotMatch: true }
            : null;
    }

    checkValidValidator(fieldName: string) {
        return ((this.userForm.controls[fieldName].dirty ||
            this.userForm.controls[fieldName].touched) &&
            this.userForm.controls[fieldName].invalid) ||
            (this.isInvalidForm && this.userForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.userForm.controls[fieldNames[i]].dirty ||
                    this.userForm.controls[fieldNames[i]].touched) &&
                    this.userForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.userForm.controls[fieldNames[i]].invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    getDepartmentList() {
        this.departmentService.getAllDepartment().subscribe((response: any) => {
            this.departments = response.data;
        });
    }

    onSubmit() {
        console.log(this.userForm);
        this.isSubmitted = true;
        this.isInvalidForm = false;
        console.log(this.userForm.invalid);
        if (this.userForm.invalid) {
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
            AppUtil.cleanObject(this.userForm.value),
        );
        console.log(newData);
        this.onCancel.emit({});
        if (this.isEdit) {
            this.userService
                .updateUser(newData, this.formData.id)
                .subscribe((res) => {
                    console.log('res', res);
                    this.onCancel.emit({});
                });
        } else {
            this.userService.createUser(newData).subscribe((res) => {
                console.log('res', res);
                this.onCancel.emit({});
            });
        }
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
        }
        newData.districtId = parseInt(newData.districtId) || 0;
        newData.provinceId = parseInt(newData.provinceId) || 0;
        newData.wardId = parseInt(newData.wardId) || 0;
        newData.branchId = parseInt(newData.branchId) || 0;
        newData.avatar = newData.avatar || '';
        newData.personalTaxCode = newData.personalTaxCode || '';
        newData.socialInsuranceCode = newData.socialInsuranceCode || '';
        newData.userRoleIds = newData.userRoleIds
            ? [...new Set(newData.userRoleIds)].filter((x) => x).join(',')
            : '';
        newData.salary = parseInt(newData.salary) || 0;
        newData.socialInsuranceSalary =
            parseInt(newData.socialInsuranceSalary) || 0;
        newData.gender = parseInt(newData.gender) || 0;
        newData.numberWorkdays = parseInt(newData.numberWorkdays) || 0;
        newData.unionMember = parseInt(newData.unionMember) || 0;
        newData.isDemobilized = newData.isDemobilized == true;

        // delete params form
        delete newData.confirmPassword;

        console.log(newData.birthDay, newData.birthDay !== 'Invalid date');

        newData.birthDay = this.appUtil.formatLocalTimezone(
            moment(
                newData.birthDay && newData.birthDay !== 'Invalid date'
                    ? newData.birthDay
                    : new Date(),
                this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ).format(this.appConstant.FORMAT_DATE.T_DATE),
        );
        newData.socialInsuranceCreated = this.appUtil.formatLocalTimezone(
            moment(
                newData.socialInsuranceCreated &&
                    newData.socialInsuranceCreated !== 'Invalid date'
                    ? newData.socialInsuranceCreated
                    : new Date(),
                this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ).format(this.appConstant.FORMAT_DATE.T_DATE),
        );
        newData.sendSalaryDate = this.appUtil.formatLocalTimezone(
            moment(
                newData.sendSalaryDate &&
                    newData.sendSalaryDate !== 'Invalid date'
                    ? newData.sendSalaryDate
                    : new Date(),
                this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ).format(this.appConstant.FORMAT_DATE.T_DATE),
        );
        newData.identifyCreatedDate = this.appUtil.formatLocalTimezone(
            moment(
                newData.identifyCreatedDate &&
                    newData.identifyCreatedDate !== 'Invalid date'
                    ? newData.identifyCreatedDate
                    : new Date(),
                this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ).format(this.appConstant.FORMAT_DATE.T_DATE),
        );
        newData.identifyExpiredDate = this.appUtil.formatLocalTimezone(
            moment(
                newData.identifyExpiredDate &&
                    newData.identifyExpiredDate !== 'Invalid date'
                    ? newData.identifyExpiredDate
                    : new Date(),
                this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ).format(this.appConstant.FORMAT_DATE.T_DATE),
        );
        return newData;
    }

    getDayOfWeek(date: any) {
        return new Date(date.year, date.month, date.day).getDay();
    }

    getDistrict(id) {
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
                            value: this.userForm.value.districtId,
                        });
                    }
                });
        } else {
            this.districts = [];
            this.wards = [];
        }
    }
    getNativeDistrict(id) {
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
                            value: this.userForm.value.nativeDistrictId,
                        });
                    }
                });
        } else {
            this.nativeDistricts = [];
            this.nativeWards = [];
        }
    }
    getWard(id) {
        if (id.value > 0) {
            this.wardService
                .getWardForDistrict(id.value)
                .subscribe((response: Ward[]) => {
                    this.wards = response;
                });
        } else {
            this.wards = [];
        }
    }

    getNativeWard(id) {
        if (id.value > 0) {
            this.wardService
                .getWardForDistrict(id.value)
                .subscribe((response: Ward[]) => {
                    this.nativeWards = response;
                });
        } else {
            this.nativeWards = [];
        }
    }

    doAttachFile(event: any): void {
        let image: FormData = new FormData();
        image.append('file', event.target?.files[0]);
        this.userService.uploadFiles(image).subscribe((res) => {
            console.log(res);
            if (res && res.body) {
                this.userForm.controls['avatar'].setValue(res.body.imageUrl);
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
