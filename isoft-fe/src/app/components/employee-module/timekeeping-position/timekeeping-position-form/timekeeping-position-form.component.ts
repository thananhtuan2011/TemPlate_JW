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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import AppConstant from 'src/app/utilities/app-constants';
import AppData from 'src/app/utilities/app-data';
import AppUtil from 'src/app/utilities/app-util';
import { TargetService } from 'src/app/service/target.service';
import * as moment from 'moment';

@Component({
    selector: 'app-timekeeping-position-form',
    templateUrl: './timekeeping-position-form.component.html',
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
export class TimekeepingPositionFormComponent implements OnInit, OnChanges {
    public appConstant = AppConstant;
    public appUtil = AppUtil;
    @Input('formData') formData: any = {};
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Output() onCancel = new EventEmitter();
    title: string = '';

    TargetForm: FormGroup = new FormGroup({});

    optionCountries = AppData.COUNTRIES;
    countryCodes: any[] = [];

    isSubmitted = false;
    isInvalidForm = false;
    failPassword: boolean = false;

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private TargetService: TargetService,
    ) {
        this.TargetForm = this.fb.group({
            id: 0,
            name: ['', [Validators.required]],
            code: ['', [Validators.required]],
            address: [''],
            armyNumber: [0],
            present: [0],
            nameContact: [''],
            dateInvoice: [''],
            unitPrice: [0],
            total: [0],
            startDate: [''],
            endDate: [''],
            phone: [''],
            identityCode: [''],
            note: [''],
            status: true,
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
                'label.edit_Target',
            );
            this.TargetForm.setValue({
                name: this.formData.name,
                code: this.formData.code,
                address: this.formData.address,
                armyNumber: this.formData.armyNumber,
                present: this.formData.present,
                nameContact: this.formData.nameContact,
                id: this.formData.id,
                dateInvoice: moment(this.formData.dateInvoice).format(
                    this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                ),
                unitPrice: this.formData.unitPrice,
                total: this.formData.total,
                startDate: moment(this.formData.startDate).format(
                    this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                ),
                endDate: moment(this.formData.endDate).format(
                    this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                ),
                phone: this.formData.phone,
                identityCode: this.formData.identityCode,
                note: this.formData.note,
                status: this.formData.status,
            });
        } else {
            this.title = AppUtil.translate(
                this.translateService,
                'label.add_Target',
            );
        }
    }

    onReset() {
        this.isInvalidForm = false;
        this.TargetForm.reset();
    }

    ngOnInit() {
        this.countryCodes = AppUtil.getCountries();
    }

    checkValidValidator(fieldName: string) {
        return ((this.TargetForm.controls[fieldName].dirty ||
            this.TargetForm.controls[fieldName].touched) &&
            this.TargetForm.controls[fieldName].invalid) ||
            (this.isInvalidForm && this.TargetForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.TargetForm.controls[fieldNames[i]].dirty ||
                    this.TargetForm.controls[fieldNames[i]].touched) &&
                    this.TargetForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.TargetForm.controls[fieldNames[i]].invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.TargetForm.invalid) {
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
            AppUtil.cleanObject(this.TargetForm.value),
        );
        console.log(newData);
        this.onCancel.emit({});
        if (this.isEdit) {
            this.TargetService.updateTarget(
                newData,
                this.formData.id,
            ).subscribe((res) => {
                this.onCancel.emit({});
            });
        } else {
            this.TargetService.createTarget(newData).subscribe((res) => {
                this.onCancel.emit({});
            });
        }
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
        }
        newData.dateInvoice = this.appUtil.formatLocalTimezone(
            moment(
                newData.dateInvoice,
                this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ).format(this.appConstant.FORMAT_DATE.T_DATE),
        );
        newData.startDate = this.appUtil.formatLocalTimezone(
            moment(
                newData.startDate,
                this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ).format(this.appConstant.FORMAT_DATE.T_DATE),
        );
        newData.endDate = this.appUtil.formatLocalTimezone(
            moment(
                newData.endDate,
                this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ).format(this.appConstant.FORMAT_DATE.T_DATE),
        );
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
