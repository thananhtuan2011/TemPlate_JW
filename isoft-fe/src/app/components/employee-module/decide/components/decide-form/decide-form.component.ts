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
import { MessageService } from 'primeng/api';
import { DecideService } from 'src/app/service/decide.service';
import { UserService } from 'src/app/service/user.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import * as moment from 'moment';
@Component({
    selector: 'app-decide-form',
    templateUrl: './decide-form.component.html',
    styles: [
        `
            :host ::ng-deep {
            }
        `,
    ],
})
export class DecideFormComponent implements OnInit {
    public appConstant = AppConstant;
    @Input('formData') formData: any = {};
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Output() onCancel = new EventEmitter();
    title: string = '';
    selectedFile: any;
    fileName: string = '';
    decideForm: FormGroup = new FormGroup({});

    isSubmitted = false;
    isInvalidForm = false;
    failPassword: boolean = false;
    employees: any[] = [];
    decideTypes: any[] = [];

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private decideService: DecideService,
        private readonly userService: UserService,
    ) {
        this.decideForm = this.fb.group({
            id: [''],
            code: [''],
            type: [''],
            decideTypeId: ['', [Validators.required]],
            employeesId: ['', [Validators.required]],
            date: ['', [Validators.required]],
            description: [''],
            note: [''],
            fileUrl: [''],
            file: [''],
        });
    }
    ngOnChanges(changes: SimpleChanges): void {
        if (
            this.isEdit &&
            this.formData &&
            Object.keys(this.formData).length > 0
        ) {
            this.decideForm.patchValue({
                id: this.formData.id,
                code: this.formData.code,
                decideTypeId: this.formData.decideTypeId,
                employeesId: this.formData.employeesId,
                description: this.formData.description,
                note: this.formData.note,
                date: moment(this.formData.date).format(
                    AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                ),
                fileName: this.formData.fileName,
            });
            this.fileName = this.formData.fileName ?? '';
        }
    }

    onReset() {
        this.isInvalidForm = false;
        this.decideForm.reset();
    }

    ngOnInit() {
        this.getListTypes();
        this.getAllUserActive();
    }

    getListTypes() {
        this.decideService.getSelectList().subscribe((data) => {
            this.decideTypes = data.data;
        });
    }
    getAllUserActive() {
        this.userService.getAllUserActive().subscribe((res: any) => {
            this.employees = res.data;
        });
    }

    checkValidValidator(fieldName: string) {
        return ((this.decideForm.controls[fieldName].dirty ||
            this.decideForm.controls[fieldName].touched) &&
            this.decideForm.controls[fieldName].invalid) ||
            (this.isInvalidForm && this.decideForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.decideForm.invalid) {
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
        let date = moment(
            AppUtil.adjustDateOffset(this.decideForm.value.date),
        ).format('YYYY-MM-DD');
        this.decideForm.value.date =
            date == 'Invalid date'
                ? moment(
                    this.decideForm.value.date,
                    AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                ).format(AppConstant.FORMAT_DATE.T_DATE)
                : date;
        let newData = this.cleanObject(
            AppUtil.cleanObject(this.decideForm.value),
        );
        this.onCancel.emit({});
        if (this.isEdit) {
            this.decideService
                .updateDecide(newData, this.decideForm.value.id)
                .subscribe((res: any) => {
                    if (res?.code === 400) {
                        this.messageService.add({
                            severity: 'error',
                            detail: 'Cập nhất thất bại',
                        });
                        return;
                    } else {
                        this.onCancel.emit({});
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Cập nhật thành công',
                        });
                    }
                });
        } else {
            this.decideService.createDecide(newData).subscribe(
                (res: any) => {
                    if (res?.code === 400) {
                        this.messageService.add({
                            severity: 'error',
                            detail: 'Thêm mới thất bại',
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
                (err) => {
                    console.log('err', err);
                },
            );
        }
    }

    onBack() {
        this.onCancel.emit({});
    }
    doAttachFile(event: any): void {
        if (event) {
            this.selectedFile = event.target?.files[0];
        }
    }
    cleanObject(data) {
        const formData = new FormData();
        if (data.id) {
            formData.append('id', String(data.id));
        }
        if (data.date && data.date != 'Invalid date') {
            formData.append('date', data.date);
        }
        if (data.code) {
            formData.append('code', data.code);
        }
        if (data.employeesId) {
            formData.append('employeesId', data.employeesId);
        }
        if (data.decideTypeId) {
            formData.append('decideTypeId', data.decideTypeId);
        }
        if (data.description) {
            formData.append('description', data.description);
        }
        if (data.note) {
            formData.append('note', String(data.note));
        }
        if (data.recipient) {
            formData.append('recipient', String(data.recipient));
        }
        if (this.selectedFile) {
            formData.append('file', this.selectedFile);
        }
        return formData;
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
