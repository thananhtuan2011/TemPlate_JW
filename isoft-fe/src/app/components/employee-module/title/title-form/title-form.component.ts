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
import { PositionService } from 'src/app/service/position.service';

@Component({
    selector: 'app-title-form',
    templateUrl: './title-form.component.html',
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
export class TitleFormComponent implements OnInit, OnChanges {
    public appConstant = AppConstant;
    @Input('formData') formData: any = {};
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Output() onCancel = new EventEmitter();
    title: string = '';

    PositionForm: FormGroup = new FormGroup({});

    optionCountries = AppData.COUNTRIES;
    countryCodes: any[] = [];

    isSubmitted = false;
    isInvalidForm = false;
    failPassword: boolean = false;

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private PositionService: PositionService,
    ) {
        this.PositionForm = this.fb.group({
            id: [''],
            code: ['', [Validators.required]],
            name: ['', [Validators.required]],
            order: [''],
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
                'label.edit_Position',
            );
            this.PositionForm.setValue({
                id: this.formData.id,
                code: this.formData.code,
                name: this.formData.name,
                order: this.formData.order,
            });
        } else {
            this.title = AppUtil.translate(
                this.translateService,
                'label.add_Position',
            );
        }
    }

    onReset() {
        this.isInvalidForm = false;
        this.PositionForm.reset();
    }

    ngOnInit() {
        this.countryCodes = AppUtil.getCountries();
    }

    checkValidValidator(fieldName: string) {
        return ((this.PositionForm.controls[fieldName].dirty ||
            this.PositionForm.controls[fieldName].touched) &&
            this.PositionForm.controls[fieldName].invalid) ||
            (this.isInvalidForm &&
                this.PositionForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.PositionForm.controls[fieldNames[i]].dirty ||
                    this.PositionForm.controls[fieldNames[i]].touched) &&
                    this.PositionForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.PositionForm.controls[fieldNames[i]].invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.PositionForm.invalid) {
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
            AppUtil.cleanObject(this.PositionForm.value),
        );
        // console.log(newData);
        // this.onCancel.emit({});
        if (this.isEdit) {
            this.PositionService.updatePosition(
                newData,
                this.formData.id,
            ).subscribe((res: any) => {
                if (res?.code === 400) {
                    this.messageService.add({
                        severity: 'error',
                        detail: res?.msg || '',
                    });
                    return;
                } else {
                    this.onCancel.emit({});
                }
            });
        } else {
            this.PositionService.createPosition(newData).subscribe(
                (res: any) => {
                    if (res?.code === 400) {
                        this.messageService.add({
                            severity: 'error',
                            detail: res?.msg || '',
                        });
                        return;
                    } else {
                        this.onCancel.emit({});
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
