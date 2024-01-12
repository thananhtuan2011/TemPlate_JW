import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { MessageService } from 'primeng/api';
import { TypeData } from 'src/app/models/common.model';
import { Position } from 'src/app/models/document.model';
import { PositionService } from 'src/app/service/position.service';
import { SalaryLevelService } from 'src/app/service/salary-level.service';
import AppUtil from 'src/app/utilities/app-util';
import { SalaryAdvanceService } from '../../../../../service/salary-advance.service';
import { AuthService } from '../../../../../service/auth.service';

@Component({
    selector: 'app-salary-advance-request-form',
    templateUrl: './salary-advance-request-form.component.html',
    styles: [
        `
            :host ::ng-deep {
            }
            .p-dropdown .p-dropdown-panel {
                max-width: 100%;
                left: 0px;
            }
        `,
    ],
})
export class SalaryAdvanceRequestFormComponent implements OnInit {
    @Input('formData') formData: any = {};
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Output() onCancel = new EventEmitter();
    salaryAdvanceRequestForm: FormGroup = new FormGroup({});
    isInvalidForm = false;
    date: Date;
    public lstPositions: Position[] = [];
    isSubmitted = false;

    constructor(
        private fb: FormBuilder,
        private readonly PositionService: PositionService,
        private messageService: MessageService,
        private translateService: TranslateService,
        private readonly salaryAdvanceService: SalaryAdvanceService,
        private readonly authService: AuthService,
    ) {
        this.salaryAdvanceRequestForm = this.fb.group({
            id: [''],
            userId: [this.authService.user.id],
            value: ['', [Validators.required]],
            note: [''],
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (
            this.isEdit &&
            this.formData &&
            Object.keys(this.formData).length > 0
        ) {
            this.date = new Date(
                moment(this.formData.updateAt).format('MMMM DD YYYY h:mm'),
            );
            this.salaryAdvanceRequestForm.patchValue({
                value: this.formData.value,
                note: this.formData.note,
            });
        }
    }

    ngOnInit(): void {
        this.PositionService.getAllPosition().subscribe(
            (res: TypeData<Position>) => {
                this.lstPositions = res.data;
            },
        );
    }
    onReset() {
        this.isInvalidForm = false;
        this.salaryAdvanceRequestForm.reset();
        this.salaryAdvanceRequestForm.patchValue({
            id: 0,
            userId: this.authService.user.id,
        });
    }
    checkValidValidator(fieldName: string) {
        return ((this.salaryAdvanceRequestForm.controls[fieldName].dirty ||
            this.salaryAdvanceRequestForm.controls[fieldName].touched) &&
            this.salaryAdvanceRequestForm.controls[fieldName].invalid) ||
            (this.isInvalidForm &&
                this.salaryAdvanceRequestForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }
    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.salaryAdvanceRequestForm.invalid) {
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

        if (this.isEdit) {
            let newData = this.cleanObject(
                AppUtil.cleanObject(this.salaryAdvanceRequestForm.value),
            );
            this.salaryAdvanceService
                .updateSalaryAdvanceRequest(this.formData.id, newData)
                .subscribe((res) => {
                    this.onCancel.emit({});
                });
        } else {
            this.salaryAdvanceService
                .createSalaryAdvanceRequest(this.salaryAdvanceRequestForm.value)
                .subscribe((data) => {
                    this.onCancel.emit({});
                });
        }
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
        }
        newData.name = newData.name || '';
        newData.note = newData.note || '';
        return newData;
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
