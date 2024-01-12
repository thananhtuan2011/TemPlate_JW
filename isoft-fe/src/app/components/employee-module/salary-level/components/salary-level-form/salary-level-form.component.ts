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

@Component({
    selector: 'app-salary-level-form',
    templateUrl: './salary-level-form.component.html',
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
export class SalaryLevelFormComponent implements OnInit {
    @Input('formData') formData: any = {};
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Output() onCancel = new EventEmitter();
    salaryLevelForm: FormGroup = new FormGroup({});
    isInvalidForm = false;
    date: Date;
    public lstPositions: Position[] = [];
    isSubmitted = false;

    constructor(
        private fb: FormBuilder,
        private readonly PositionService: PositionService,
        private messageService: MessageService,
        private translateService: TranslateService,
        private readonly salaryLevelServiice: SalaryLevelService,
    ) {
        this.salaryLevelForm = this.fb.group({
            name: [''],
            updateAt: [''],
            positionid: [''],
            positionName: ['', [Validators.required]],
            salaryCost: ['', [Validators.required]],
            value: ['', [Validators.required]],
            coefficient: ['', [Validators.required]],
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
            this.salaryLevelForm.patchValue({
                positionid: this.formData.id,
                positionName: { name: this.formData.positionName },
                updateAt: this.formData.updateAt,
                salaryCost: this.formData.salaryCost,
                coefficient: this.formData.coefficient,
                amount: this.formData.amount,
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
        this.salaryLevelForm.reset();
    }
    checkValidValidator(fieldName: string) {
        return ((this.salaryLevelForm.controls[fieldName].dirty ||
            this.salaryLevelForm.controls[fieldName].touched) &&
            this.salaryLevelForm.controls[fieldName].invalid) ||
            (this.isInvalidForm &&
                this.salaryLevelForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }
    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.salaryLevelForm.invalid) {
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
                AppUtil.cleanObject(this.salaryLevelForm.value),
            );
            this.salaryLevelServiice
                .putSalaryLevel(this.formData.id, newData)
                .subscribe((res) => {
                    this.onCancel.emit({});
                });
        } else {
            let newData = this.cleanObject(
                AppUtil.cleanObject(this.salaryLevelForm.value),
            );
            this.postSalaryLevel(newData);
        }
    }
    postSalaryLevel(param) {
        this.salaryLevelServiice.postSalaryLevel(param).subscribe((data) => {
            this.onCancel.emit({});
        });
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
        }
        newData.positionid = parseInt(newData.positionName.id) || 0;
        newData.positionName = newData.positionName.name || '';
        newData.amount = parseInt(newData.amount) || 0;
        newData.coefficient = parseInt(newData.coefficient) || 0;
        newData.salaryCost = parseInt(newData.salaryCost) || 0;
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
