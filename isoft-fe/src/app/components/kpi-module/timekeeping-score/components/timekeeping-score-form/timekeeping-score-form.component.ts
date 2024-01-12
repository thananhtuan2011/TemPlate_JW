import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DecideService } from 'src/app/service/decide.service';
import { UserService } from 'src/app/service/user.service';
import AppUtil from 'src/app/utilities/app-util';
import { KPIScore } from '../../../../../utilities/app-enum';
import { KPIScoreService } from '../../../../../service/kpi-score.service';

@Component({
    selector: 'app-timekeeping-score-form',
    templateUrl: './timekeeping-score-form.component.html',
    styles: [
        `
            :host ::ng-deep {
            }
        `,
    ],
})
export class TimekeepingScoreFormComponent implements OnInit {
    @Input('formData') formData: any = {};
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Output() onCancel = new EventEmitter();

    isInvalidForm = false;
    timekeepingScoreForm!: FormGroup;
    isSubmitted = false;

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private decideService: DecideService,
        private readonly userService: UserService,
        private kpiScoreService: KPIScoreService, // private readonly achievementService: AchievementService,
    ) {
        this.timekeepingScoreForm = new FormGroup({
            code: new FormControl(null, Validators.required),
            name: new FormControl(null, Validators.required),
            fromScore: new FormControl(null),
            toScore: new FormControl(null),
            score: new FormControl(null),
            note: new FormControl(null),
        });
    }

    ngOnInit(): void {}

    onReset() {
        this.isInvalidForm = false;
        this.timekeepingScoreForm.reset();
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.timekeepingScoreForm.invalid) {
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
        const request = {
            id: this.formData?.id || 0,
            code: this.timekeepingScoreForm.value.code,
            name: this.timekeepingScoreForm.value.name,
            fromValue: Number(this.timekeepingScoreForm.value.fromScore || 0),
            toValue: Number(this.timekeepingScoreForm.value.toScore || 0),
            point: Number(this.timekeepingScoreForm.value.score || 0),
            note: this.timekeepingScoreForm.value.note,
            type: this.formData?.type || KPIScore.TimekeepingScore,
        };
        this.onCancel.emit({});
        if (this.isEdit) {
            this.kpiScoreService
                .updateKPIScore(request, this.formData.id)
                .subscribe(
                    (res) => {
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Cập nhật thành công',
                        });
                        this.onCancel.emit({});
                    },
                    (err) => {
                        this.messageService.add({
                            severity: 'error',
                            detail: err?.msg || '',
                        });
                    },
                );
        } else {
            this.kpiScoreService.submitKPIScore(request).subscribe(
                (res) => {
                    this.messageService.add({
                        severity: 'success',
                        detail: 'Thêm mới thành công',
                    });
                    this.onCancel.emit({});
                },
                (err) => {
                    this.messageService.add({
                        severity: 'error',
                        detail: err?.msg || '',
                    });
                },
            );
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.formData?.id)
            this.timekeepingScoreForm.patchValue({
                code: this.formData.code,
                name: this.formData.name,
                fromScore: this.formData.fromValue,
                toScore: this.formData.toValue,
                score: this.formData.point,
                note: this.formData.note,
            });
    }

    checkValidValidator(fieldName: string) {
        return ((this.timekeepingScoreForm.controls[fieldName].dirty ||
            this.timekeepingScoreForm.controls[fieldName].touched) &&
            this.timekeepingScoreForm.controls[fieldName].invalid) ||
            (this.isInvalidForm &&
                this.timekeepingScoreForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    onBack() {
        this.onCancel.emit({});
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        console.log(newData);
        if (true) {
            const { timeIn, timeOut, point } = this.timekeepingScoreForm.value;
            newData.timeIn = timeIn;
            newData.timeOut = timeOut;
            newData.point = point;
        }
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
