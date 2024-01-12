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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DepartmentService } from 'src/app/service/department.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import { ActivatedRoute, Router } from '@angular/router';
import { BranchService } from 'src/app/service/branch.service';

@Component({
    selector: 'app-department-form',
    templateUrl: './department-form.component.html',
    styles: [
        `
            :host ::ng-deep {
            }
        `,
    ],
})
export class DepartmentFormComponent implements OnInit, OnChanges {
    public appConstant = AppConstant;
    @Input('formData') formData: any = {};
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Input('listBranch') listBranch = [];
    @Output() onCancel = new EventEmitter();
    title: string = '';

    departmentForm: FormGroup = new FormGroup({});

    isSubmitted = false;
    isInvalidForm = false;
    existCode: boolean = false;

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private departmentService: DepartmentService,
        private router: Router,
        private route: ActivatedRoute,
        private branchService: BranchService,
    ) {
        this.departmentForm = this.fb.group({
            id: [''],
            code: ['', [Validators.required]],
            name: ['', [Validators.required]],
            branchId: [''],
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.departmentForm.get('branchId').patchValue(this.listBranch[0]?.id);

        if (
            this.isEdit &&
            this.formData &&
            Object.keys(this.formData).length > 0
        ) {
            this.title = AppUtil.translate(
                this.translateService,
                'label.edit_department',
            );
            this.departmentForm.setValue({
                id: this.formData.id,
                code: this.formData.code,
                name: this.formData.name,
                branchId: this.formData.branchId,
            });
            this.formData.branch = this.listBranch?.find(
                (item) => item.id === this.formData.branchId,
            )?.name;
        } else {
            this.title = AppUtil.translate(
                this.translateService,
                'label.add_department',
            );
        }
    }

    onReset() {
        this.isInvalidForm = false;
        this.departmentForm.reset();
    }

    ngOnInit() {
        // this.branchService
        //     .getAllBranch()
        //     .subscribe((res) => (this.listBranch = res.data));
    }

    checkValidValidator(fieldName: string) {
        return ((this.departmentForm.controls[fieldName].dirty ||
            this.departmentForm.controls[fieldName].touched) &&
            this.departmentForm.controls[fieldName].invalid) ||
            (this.isInvalidForm &&
                this.departmentForm.controls[fieldName].invalid) ||
            (fieldName === 'code' && this.existCode)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.departmentForm.controls[fieldNames[i]].dirty ||
                    this.departmentForm.controls[fieldNames[i]].touched) &&
                    this.departmentForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.departmentForm.controls[fieldNames[i]].invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    getDepartmentDetail(id) {
        this.departmentService.getDepartmentDetail(id).subscribe(
            (res) => {
                this.departmentForm.setValue({
                    id: res?.id,
                    code: res?.code,
                    name: res?.name,
                });
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    detail: 'Lỗi lấy dữ liệu',
                });
            },
        );
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.departmentForm.invalid) {
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
            AppUtil.cleanObject(this.departmentForm.value),
        );
        console.log(newData);
        if (this.isEdit) {
            this.departmentService
                .updateDepartment(newData, this.departmentForm.value.id)
                .subscribe((res: any) => {
                    if (res.status != 603) {
                        this.onCancel.emit({});
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Cập nhật thành công',
                        });
                    } else this.existCode = true;
                });
        } else {
            this.departmentService
                .createDepartment(newData)
                .subscribe((res: any) => {
                    console.log(res);
                    if (res.status != 603) {
                        this.onCancel.emit({});
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Thêm mới thành công',
                        });
                    } else this.existCode = true;
                });
        }
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
        }
        return newData;
    }

    onChangeCode() {
        if (this.existCode) {
            this.existCode = false;
        }
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
