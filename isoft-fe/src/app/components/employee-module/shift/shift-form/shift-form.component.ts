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
import { SymbolService } from 'src/app/service/symbol.service';
import * as moment from 'moment';
import appUtil from 'src/app/utilities/app-util';

@Component({
    selector: 'app-shift-form',
    templateUrl: './shift-form.component.html',
    styles: [
        `
            :host ::ng-deep {
                #phonePrefix .p-dropdown {
                    width: 93px;
                }
                .p-calendar {
                    width: 100%;
                }
            }
        `,
    ],
})
export class ShiftFormComponent implements OnInit, OnChanges {
    public appConstant = AppConstant;
    public appUtil = appUtil;
    @Input('formData') formData: any = {};
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Output() onCancel = new EventEmitter();
    title: string = '';

    SymbolForm: FormGroup = new FormGroup({});

    optionCountries = AppData.COUNTRIES;
    countryCodes: any[] = [];

    isSubmitted = false;
    isInvalidForm = false;
    failPassword: boolean = false;

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private SymbolService: SymbolService,
    ) {
        this.SymbolForm = this.fb.group({
            id: [''],
            code: ['', [Validators.required]],
            name: ['', [Validators.required]],
            timeIn: [''],
            timeOut: [''],
            timeTotal: [''],
            note: [''],
            status: [true],
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
                'label.shift_update',
            );
            this.SymbolForm.setValue({
                id: this.formData.id,
                code: this.formData.code,
                name: this.formData.name,
                timeIn: new Date(
                    moment(this.formData.timeIn).format(
                        this.appConstant.FORMAT_DATE.T_DATE,
                    ),
                ),
                timeOut: new Date(
                    moment(this.formData.timeOut).format(
                        this.appConstant.FORMAT_DATE.T_DATE,
                    ),
                ),
                timeTotal: this.formData.timeTotal,
                note: this.formData.note,
                status: this.formData.status,
            });
        } else {
            this.title = AppUtil.translate(
                this.translateService,
                'label.shift_add',
            );
        }
    }

    onReset() {
        this.isInvalidForm = false;
        this.SymbolForm.reset();
    }

    ngOnInit() {}

    checkValidValidator(fieldName: string) {
        return ((this.SymbolForm.controls[fieldName].dirty ||
            this.SymbolForm.controls[fieldName].touched) &&
            this.SymbolForm.controls[fieldName].invalid) ||
            (this.isInvalidForm && this.SymbolForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.SymbolForm.controls[fieldNames[i]].dirty ||
                    this.SymbolForm.controls[fieldNames[i]].touched) &&
                    this.SymbolForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.SymbolForm.controls[fieldNames[i]].invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.SymbolForm.invalid) {
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
            AppUtil.cleanObject(this.SymbolForm.value),
        );
        this.onCancel.emit({});
        console.log(newData);
        if (this.isEdit) {
            this.SymbolService.updateSymbol(
                newData,
                this.formData.id,
            ).subscribe((res) => {
                this.onCancel.emit({});
            });
        } else {
            this.SymbolService.createSymbol(newData).subscribe((res) => {
                this.onCancel.emit({});
            });
        }
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
        }
        newData.timeIn =
            this.appUtil.formatLocalTimezone(
                moment(newData.timeIn).format(
                    this.appConstant.FORMAT_DATE.T_DATE,
                ),
            ) || null;
        newData.timeOut =
            this.appUtil.formatLocalTimezone(
                moment(newData.timeOut).format(
                    this.appConstant.FORMAT_DATE.T_DATE,
                ),
            ) || null;

        return newData;
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
