import {
    Component,
    OnInit,
    ViewChild,
    ChangeDetectorRef,
    HostListener,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { filter, find, pickBy } from 'lodash';
import * as moment from 'moment';
import { ConfirmationService, MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { Branch } from 'src/app/models/branch.model';
import { TypeData } from 'src/app/models/common.model';
import { SalaryAdvanceModel } from 'src/app/models/salary-advance.model';
import { UserRoleCRUD } from 'src/app/models/user-role.model';
import { BranchService } from 'src/app/service/branch.service';
import { DepartmentService } from 'src/app/service/department.service';
import { SalaryAdvanceService } from 'src/app/service/salary-advance.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import { SalaryAdvanceFormComponent } from './components/salary-advance-form/salary-advance-form.component';
import AppConstants from 'src/app/utilities/app-constants';

@Component({
    selector: 'app-salary-advance',
    templateUrl: './salary-advance.component.html',
    styleUrls: ['../../../../assets/demo/badges.scss'],
    styles: [
        `
            :host ::ng-deep .p-frozen-column {
                font-weight: bold;
            }

            :host ::ng-deep .p-datatable-frozen-tbody {
                font-weight: bold;
            }

            :host ::ng-deep .p-progressbar {
                height: 0.5rem;
            }
            .w-5rem {
                width: 5rem !important;
            }
            .w-15rem {
                width: 15rem !important;
            }
            .w-20rem {
                width: 20rem !important;
            }
            .w-10rem {
                width: 10rem !important;
            }
        `,
    ],
})
export class SalaryAdvanceComponent implements OnInit {
    appConstant = AppConstants;
    @ViewChild('decideForm') SalaryAdvanceFormComponent:
        | SalaryAdvanceFormComponent
        | undefined;
    display: boolean = false;
    loading: boolean = true;
    isMobile = screen.width <= 1199;
    first = 0;
    formData: any = {};
    isReset: boolean = false;
    isEdit: boolean = false;
    public lstAchi: Branch[] = [];
    cols: any[] = [
        {
            header: 'label.procedure_number',
            value: 'id',
            width: 'width: 20%;',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.procedure_name',
            value: 'name',
            width: 'width: 15%;',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.workflow_type_branch',
            value: 'branchId',
            width: 'width: 10%;',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.workflow_type_department',
            value: 'departmentId',
            width: 'width: 10%;',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.allowance_created_at',
            value: 'date',
            width: 'width: 15%;',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.sum_price',
            value: 'sumPrice',
            width: 'width: 15%;',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.status',
            value: 'status',
            width: 'width: 15%;',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
    ];
    listMonth: any[] = [
        { key: 'Tháng 1', value: 1 },
        { key: 'Tháng 2', value: 2 },
        { key: 'Tháng 3', value: 3 },
        { key: 'Tháng 4', value: 4 },
        { key: 'Tháng 5', value: 5 },
        { key: 'Tháng 6', value: 6 },
        { key: 'Tháng 7', value: 7 },
        { key: 'Tháng 8', value: 8 },
        { key: 'Tháng 9', value: 9 },
        { key: 'Tháng 10', value: 10 },
        { key: 'Tháng 11', value: 11 },
        { key: 'Tháng 12', value: 12 },
    ];
    action = '';
    pendingRequest: any;
    public totalRecords = 0;
    public totalPages = 0;
    public getParams = {
        page: 1,
        pageSize: 10,
        searchText: '',
        month: +moment().format(AppConstant.FORMAT_DATE.MONTH_ONLY),
    };
    listBranch = [];
    listDepartment = [];
    selectedListDepartment = [];
    listSalaryAdvance = [];
    selectedItem: SalaryAdvanceModel;

    constructor(
        private messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private branchService: BranchService,
        private departmentService: DepartmentService,
        private salaryAdvanceService: SalaryAdvanceService,
    ) {}

    ngOnInit(): void {
        const listBranch = this.branchService.getAllBranch();
        const listDepartment = this.departmentService.getAllDepartment();
        forkJoin(listBranch, listDepartment).subscribe(
            ([branch, department]) => {
                this.loading = false;
                this.listBranch = branch.data;
                this.listDepartment = department.data;
            },
        );
    }

    getSalaryAdvance(event?: any, isExport: boolean = false): void {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        this.loading = true;
        if (event) {
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }

        this.pendingRequest = this.salaryAdvanceService
            .getPagingSalaryAdvance(
                pickBy(this.getParams, function (value, key) {
                    return value != null;
                }),
            )
            .subscribe((response: TypeData<any>) => {
                AppUtil.scrollToTop();
                this.listSalaryAdvance = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    getBranchById(id: number) {
        return find(this.listBranch, ['id', id])?.name || '';
    }
    getDepartmentById(id: number) {
        return find(this.listDepartment, ['id', id])?.name || '';
    }

    getAllBranch() {
        return this.branchService.getAllBranch().subscribe((res: any) => {
            return res.data;
        });
    }

    showDialog() {
        this.display = true;
    }

    onFilterBranch(branchId: any) {
        this.selectedListDepartment = filter(this.listDepartment, [
            'branchId',
            branchId,
        ]);
        if (this.selectedListDepartment.length > 0) {
            this.getParams['departmentId'] = this.selectedListDepartment[0].id;
        }
    }

    getSalaryAdvanceForm(item) {
        this.salaryAdvanceService
            .getSalaryAdvanceDetail(item.id)
            .subscribe((response: any) => {
                this.selectedItem = response;
                this.showDialog();
            });
    }

    onEdit(item) {
        this.salaryAdvanceService
            .getSalaryAdvanceDetail(item.id)
            .subscribe((response: any) => {
                this.selectedItem = response;
                this.isEdit = true;
                this.showDialog();
            });
    }

    onAccept(item) {
        if (item.isFinish) {
            return;
        }
        this.confirmationService.confirm({
            header: AppUtil.translate(
                this.translateService,
                'question.accept_salary_advance',
            ),
            message: AppUtil.translate(
                this.translateService,
                'question.accept_salary_advance',
            ),
            accept: () => {
                const detail = this.salaryAdvanceService.getSalaryAdvanceDetail(
                    item.id,
                );
                forkJoin(detail).subscribe(([itemDetail]) => {
                    let newData = this.cleanObject(
                        AppUtil.cleanObject(itemDetail),
                    );
                    this.salaryAdvanceService
                        .updateSalaryAdvanceAccept(newData, item.id)
                        .subscribe(
                            (res) => {
                                this.messageService.add({
                                    severity: 'success',
                                    detail: AppUtil.translate(
                                        this.translateService,
                                        'success.update',
                                    ),
                                });
                                this.getSalaryAdvance();
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
                });
            },
        });
    }

    cleanObject(data) {
        let item = {
            ...data,
        };
        item['p_ProcedureStatusId'] = data.pProcedureStatusId;
        item['p_ProcedureStatusName'] = 'Đã duyệt';
        delete item['pProcedureStatusName'];
        delete item['pProcedureStatusId'];
        return item;
    }

    onDelete(item) {
        this.confirmationService.confirm({
            header: AppUtil.translate(
                this.translateService,
                'question.delete_confirm',
            ),
            message: AppUtil.translate(
                this.translateService,
                'question.delete_confirm',
            ),
            accept: () => {
                this.salaryAdvanceService
                    .deleteSalaryAdvance(item.id)
                    .subscribe(
                        (res) => {
                            this.messageService.add({
                                severity: 'success',
                                detail: AppUtil.translate(
                                    this.translateService,
                                    'success.update',
                                ),
                            });
                            this.getSalaryAdvance();
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
            },
        });
    }
    onAdd() {
        // this.action = 'add'
        this.isEdit = false;
        this.showDialog();
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAdd();
                break;
        }
    }

    UpdateSalaryToAccountant(isInternal: number): void {
        this.loading = true;
        this.pendingRequest = this.salaryAdvanceService
            .AddLedger(this.getParams.month, isInternal)
            .subscribe((data) => {
                this.loading = false;
            });
    }
}
