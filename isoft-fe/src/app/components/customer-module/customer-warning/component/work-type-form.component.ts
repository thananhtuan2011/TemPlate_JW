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
import { WorkTypeModel } from '../../../../models/work-type.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { DepartmentService } from '../../../../service/department.service';
import { Page } from '../../../../models/common.model';
import { Department } from '../../../../models/department.model';
import { debounceTime, Subject } from 'rxjs';
import { Branch } from '../../../../models/branch.model';
import { BranchService } from '../../../../service/branch.service';
import AppUtil from '../../../../utilities/app-util';
import { WorkTypeService } from '../../../../service/work-type.service';

@Component({
    selector: 'app-work-type-form',
    templateUrl: './work-type-form.component.html',
    styles: [
        `
            :host ::ng-deep {
                .p-colorpicker-preview,
                .p-fluid .p-colorpicker-preview.p-inputtext {
                    opacity: 1;
                    border: none;
                }
            }
        `,
    ],
})
export class WorkTypeFormComponent implements OnInit, OnChanges {
    @Input() display = false;

    @Input() set formData(value) {
        if (value?.id) {
            this.isEdit = true;
            this.workTypeModel = {
                id: value?.id,
                code: value?.code,
                name: value?.name,
                departmentId: value?.departmentId,
                branchId: value?.branchId,
                point: value?.point || 0,
                color: value?.color,
            };
        } else {
            this.isEdit = false;
            this.workTypeModel = {};
        }
    }

    @Output() onCancel = new EventEmitter();

    isEdit = false;
    workTypeModel: WorkTypeModel = {};

    param: Page = {
        page: 1,
        pageSize: 20,
    };

    departments: Department[] = [];
    subjectDept = new Subject<string>();

    branches: Branch[] = [];
    subjectBranch = new Subject<string>();

    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly departmentService: DepartmentService,
        private readonly branchService: BranchService,
        private readonly workTypeService: WorkTypeService,
    ) {}

    ngOnInit(): void {
        this.subjectDept.pipe(debounceTime(400)).subscribe((value) => {
            this.getDepartments(value);
        });
        this.subjectBranch.pipe(debounceTime(400)).subscribe((value) => {
            this.getBranches(value);
        });
        this.getBranches();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.workTypeModel?.branchId)
            this.getBranchDetail(this.workTypeModel.branchId);
        if (this.workTypeModel?.departmentId)
            this.getDepartmentDetail(this.workTypeModel.departmentId);
    }

    getDepartments(keyword?: string) {
        if (this.workTypeModel?.branchId) {
            const param = {
                branchId: this.workTypeModel.branchId,
                page: 1,
                pageSize: 20,
                keyword: keyword,
            };
            this.departmentService.getListDepartment(param).subscribe(
                (res) => {
                    this.departments = res?.data || [];
                },
                (error) => {
                    this.departments = [];
                },
            );
        }
    }

    getDepartmentDetail(id) {
        this.departmentService.getDepartmentDetail(id).subscribe((res) => {
            this.departments.push(res);
        });
    }

    getBranches(keyword?: string) {
        this.param.searchText = keyword || '';
        this.branchService.getListBranch(this.param).subscribe(
            (res) => {
                this.branches = res?.data || [];
            },
            (error) => {
                this.branches = [];
            },
        );
    }

    getBranchDetail(id) {
        this.branchService.getBranchDetail(id).subscribe((res) => {
            this.branches.push(res);
        });
    }

    onSave() {
        if (this.isEdit)
            this.workTypeService
                .updateWorkTYpe(this.workTypeModel, this.workTypeModel.id)
                .subscribe(
                    (res) => {
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.update',
                            ),
                        });
                        this.onCancel.emit({});
                    },
                    (err) => {
                        this.messageService.add({
                            severity: 'error',
                            detail: AppUtil.translate(
                                this.translateService,
                                'error.0',
                            ),
                        });
                    },
                );
        else
            this.workTypeService.createWorkTYpe(this.workTypeModel).subscribe(
                (res) => {
                    this.messageService.add({
                        severity: 'success',
                        detail: AppUtil.translate(
                            this.translateService,
                            'success.create',
                        ),
                    });
                    this.onCancel.emit({});
                },
                (err) => {
                    this.messageService.add({
                        severity: 'error',
                        detail: AppUtil.translate(
                            this.translateService,
                            'error.0',
                        ),
                    });
                },
            );
    }

    onBack() {
        this.onCancel.emit({});
    }

    onFilterDepartment(event: any) {
        if (event) this.subjectDept.next(event.filter);
    }

    onFilterBranch(event: any) {
        if (event) this.subjectBranch.next(event.filter);
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F8':
                event.preventDefault();
                await this.onSave();
                break;
            case 'F6':
                event.preventDefault();
                this.onCancel.emit({});
                break;
        }
    }
}
