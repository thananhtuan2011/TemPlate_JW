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
import AppUtil, { cleanData, cleanDataForm } from 'src/app/utilities/app-util';
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
import { MajorService } from 'src/app/service/major.service';
import { RelativeService } from 'src/app/service/relative.service';
@Component({
    selector: 'app-relatives-form',
    templateUrl: './relatives-form.component.html',
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
export class RelativesFormComponent {
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
    @Input('roles')
    roles: any[] = [];
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
    relativeForm: FormGroup = new FormGroup({});

    countryCodes: any[] = [];

    isSubmitted = false;
    isInvalidForm = false;

    departments: any[] = [];

    types: any = {};
    listMajors = [];
    listUser = [];

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private departmentService: DepartmentService,
        private userService: UserService,
        private readonly districtService: DistrictService,
        private readonly wardService: WardService,
        private readonly majobService: MajorService,
        private readonly relativeService: RelativeService,
    ) {
        this.relativeForm = this.fb.group({
            id: [''],
            avatar: [''],
            status: [true],
            fullName: ['', [Validators.required]],
            phone: [''],
            gender: [''],
            birthday: [''],
            provinceId: [''],
            districtId: [''],
            wardId: [''],
            email: [''],
            address: [''],
            identify: [''],
            identifyCreatedDate: [''],
            identifyCreatedPlace: [''],
            identifyExpiredDate: [''],
            unionMember: [0],
            nativeProvinceId: [''],
            nativeDistrictId: [''],
            nativeWardId: [''],
            placeOfPermanent: [''],
            ethnicGroup: [''],
            nation: [''],
            religion: [''],
            literacy: [''],
            literacyDetail: [''],
            // majorId: [''],
            certificate: [''],
            specialize: [''],
            nativePlace: [''],
            code: [''],
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
                'label.relative_update',
            );
            // this.formData.majorId = this.majors.find(
            //     (item) => item.name === this.formData.specialize
            // )?.id;
            this.relativeForm.patchValue({
                id: this.formData.id,
                status: this.formData.status,
                fullName: this.formData.fullName,
                phone: this.formData.phone,
                birthday: moment(this.formData.birthday).format(
                    this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                ),
                // code: this.formData.code,
                provinceId: this.formData.provinceId,
                districtId: this.formData.districtId,
                wardId: this.formData.wardId,
                gender: this.formData.gender,
                email: this.formData.email,
                address: this.formData.address,
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
                unionMember: this.formData.unionMember,
                literacy: this.formData.literacy,
                literacyDetail: this.formData.literacyDetail,
                // majorId: this.formData.majorId,
                certificate: this.formData.certificate,
                avatar: this.formData.avatar,
                specialize: this.formData.specialize,
                nativePlace: this.formData.nativePlace,
                code: this.formData.code,
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
            this.relativeForm.controls['status'].setValue(true);
        }
    }

    onReset() {
        this.isInvalidForm = false;
        this.relativeForm.reset();
    }

    ngOnInit() {
        this.countryCodes = AppUtil.getCountries();
        this.getDepartmentList();
        this.getMajobList();
        this.types.status = this.appUtil.getStatusRelatives();
        this.types.unionMember = this.appUtil.getUnionMember();
    }

    checkValidValidator(fieldName: string) {
        return ((this.relativeForm.controls[fieldName].dirty ||
            this.relativeForm.controls[fieldName].touched) &&
            this.relativeForm.controls[fieldName].invalid) ||
            (this.isInvalidForm &&
                this.relativeForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.relativeForm.controls[fieldNames[i]].dirty ||
                    this.relativeForm.controls[fieldNames[i]].touched) &&
                    this.relativeForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.relativeForm.controls[fieldNames[i]].invalid)
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

    getMajobList() {
        this.majobService.getAllMajor().subscribe((res) => {
            this.listMajors = res.data;
        });
    }

    onSubmit() {
        console.log(this.relativeForm);
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.relativeForm.invalid) {
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
            cleanData(this.relativeForm.getRawValue()),
        );
        this.onCancel.emit({});
        if (this.isEdit) {
            this.relativeService
                .updateRelative(newData, this.formData.id)
                .subscribe((res) => {
                    this.onCancel.emit({});
                });
        } else {
            this.relativeService.createRelative(newData).subscribe((res) => {
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
        newData.avatar = newData.avatar || '';
        newData.gender = parseInt(newData.gender) || 0;
        // newData.specialized =
        //     this.listMajors.find((item) => item.id === newData.majorId)?.name ||
        //     '';
        newData.nativePlace =
            this.nativeProvinces.find(
                (item) => item.id === newData.nativeProvinceId,
            )?.name || '';
        newData.birthday = newData.birthday
            ? this.appUtil.formatLocalTimezone(
                  moment(
                      newData.birthday,
                      this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                  ).format(this.appConstant.FORMAT_DATE.T_DATE),
              )
            : null;
        newData.identifyCreatedDate = newData.identifyCreatedDate
            ? this.appUtil.formatLocalTimezone(
                  moment(
                      newData.identifyCreatedDate,
                      this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                  ).format(this.appConstant.FORMAT_DATE.T_DATE),
              )
            : null;
        newData.identifyExpiredDate = newData.identifyExpiredDate
            ? this.appUtil.formatLocalTimezone(
                  moment(
                      newData.identifyExpiredDate,
                      this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                  ).format(this.appConstant.FORMAT_DATE.T_DATE),
              )
            : null;

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
                            value: this.relativeForm.value.districtId,
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
                            value: this.relativeForm.value.nativeDistrictId,
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
                this.relativeForm.controls['avatar'].setValue(
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
