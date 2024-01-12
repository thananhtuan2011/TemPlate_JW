import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import AppConstant from '../../../../utilities/app-constants';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { BranchService } from '../../../../service/branch.service';
import { ActivatedRoute, Router } from '@angular/router';
import AppUtil from '../../../../utilities/app-util';

@Component({
    selector: 'app-branch-web-edit',
    templateUrl: './branch-web-edit.component.html',
    styleUrls: [],
})
export class BranchWebEditComponent implements OnInit {
    public appConstant = AppConstant;
    @Input('formData') formData: any = {};
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Output() onCancel = new EventEmitter();
    title: string = '';

    branchForm: FormGroup = new FormGroup({});

    isSubmitted = false;
    isInvalidForm = false;
    failPassword: boolean = false;

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private branchService: BranchService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        this.branchForm = this.fb.group({
            id: [''],
            code: ['', [Validators.required]],
            name: ['', [Validators.required]],
            managerName: ['', [Validators.required]],
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
                'label.edit_branch',
            );
            this.branchForm.setValue({
                id: this.formData.id,
                code: this.formData.code,
                name: this.formData.name,
                managerName: this.formData.managerName,
            });
            console.log('this.branchForm', this.branchForm);
        } else {
            this.title = AppUtil.translate(
                this.translateService,
                'label.add_branch',
            );
        }
    }

    onReset() {
        this.isInvalidForm = false;
        this.branchForm.reset();
    }

    ngOnInit() {
        // const param = this.route.snapshot.paramMap.get('id');
        // switch (param) {
        //     case 'create':
        //         this.isEdit = false;
        //         break;
        //     default:
        //         this.isEdit = true;
        //         this.getBranchDetail(param);
        //         break;
        // }
    }

    checkValidValidator(fieldName: string) {
        return ((this.branchForm.controls[fieldName].dirty ||
            this.branchForm.controls[fieldName].touched) &&
            this.branchForm.controls[fieldName].invalid) ||
            (this.isInvalidForm && this.branchForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.branchForm.controls[fieldNames[i]].dirty ||
                    this.branchForm.controls[fieldNames[i]].touched) &&
                    this.branchForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.branchForm.controls[fieldNames[i]].invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    getBranchDetail(id) {
        this.branchService.getBranchDetail(id).subscribe(
            (res) => {
                this.branchForm.setValue({
                    id: res?.id,
                    code: res?.code,
                    name: res?.name,
                    managerName: res?.managerName,
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
        if (this.branchForm.invalid) {
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
            AppUtil.cleanObject(this.branchForm.value),
        );
        // this.onCancel.emit({});
        if (this.isEdit) {
            this.branchService
                .updateBranch(newData, this.branchForm.value.id)
                .subscribe((res: any) => {
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
                            detail: 'Cập nhật thành công',
                        });
                    }
                });
        } else {
            this.branchService.createBranch(newData).subscribe((res: any) => {
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
            });
        }
    }

    onBack() {
        this.onCancel.emit({});
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
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
