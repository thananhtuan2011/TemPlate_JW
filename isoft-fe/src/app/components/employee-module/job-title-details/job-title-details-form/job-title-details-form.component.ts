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
import { PositionDetailService } from 'src/app/service/position-detail.service';
import { Position } from '../../../../models/position.model';
import { TypeData } from '../../../../models/common.model';
import { PageFilterUser } from '../../../../service/user.service';
import { PositionService } from '../../../../service/position.service';

@Component({
    selector: 'app-job-title-details-form',
    templateUrl: './job-title-details-form.component.html',
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
export class JobTitleDetailsFormComponent implements OnInit, OnChanges {
    public appConstant = AppConstant;
    @Input('formData') formData: any = {};
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Output() onCancel = new EventEmitter();
    title: string = '';

    PositionDetailForm: FormGroup = new FormGroup({});

    optionCountries = AppData.COUNTRIES;
    countryCodes: any[] = [];

    isSubmitted = false;
    isInvalidForm = false;
    failPassword: boolean = false;
    pendingRequest: any;
    public getParams: PageFilterUser = {
        page: 1,
        pageSize: 100,
        sortField: 'id',
        isSort: true,
        searchText: '',
    };
    positions: Position[] = [];

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private PositionDetailService: PositionDetailService,
        private readonly positionService: PositionService,
    ) {
        this.PositionDetailForm = this.fb.group({
            id: [''],
            positionId: [0, [Validators.required]],
            name: ['', [Validators.required]],
            order: [null],
            isManager: [false],
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
                'label.edit_PositionDetail',
            );
            this.PositionDetailForm.setValue({
                id: this.formData.id,
                positionId: this.formData.positionId,
                name: this.formData.name,
                order: this.formData.order,
                isManager: this.formData.isManager,
            });
        } else {
            this.title = AppUtil.translate(
                this.translateService,
                'label.add_PositionDetail',
            );
        }
    }

    onReset() {
        this.isInvalidForm = false;
        this.PositionDetailForm.reset();
    }

    ngOnInit() {
        this.countryCodes = AppUtil.getCountries();
        this.getPosition();
    }

    checkValidValidator(fieldName: string) {
        return ((this.PositionDetailForm.controls[fieldName].dirty ||
            this.PositionDetailForm.controls[fieldName].touched) &&
            this.PositionDetailForm.controls[fieldName].invalid) ||
            (this.isInvalidForm &&
                this.PositionDetailForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.PositionDetailForm.controls[fieldNames[i]].dirty ||
                    this.PositionDetailForm.controls[fieldNames[i]].touched) &&
                    this.PositionDetailForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.PositionDetailForm.controls[fieldNames[i]].invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;

        if (this.PositionDetailForm.invalid) {
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
            AppUtil.cleanObject(this.PositionDetailForm.value),
        );

        if (this.isEdit) {
            this.PositionDetailService.updatePositionDetail(
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
                    this.messageService.add({
                        severity: 'success',
                        detail: 'Cập nhật thành công',
                    });
                    this.onCancel.emit({});
                }
            });
        } else {
            this.PositionDetailService.createPositionDetail(newData).subscribe(
                (res: any) => {
                    if (res?.code === 400) {
                        this.messageService.add({
                            severity: 'error',
                            detail: res?.msg || '',
                        });
                        return;
                    } else {
                        this.onCancel.emit({});
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Thêm mới thành công',
                        });
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

    getPosition(event?: any) {
        console.log('event', event);
        if (event) {
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }
        Object.keys(this.getParams).forEach(
            (k) => this.getParams[k] == null && delete this.getParams[k],
        );
        this.positionService
            .getListPosition(this.getParams)
            .subscribe((response: TypeData<Position>) => {
                this.positions = response.data;
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
