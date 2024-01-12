import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TypeData } from 'src/app/models/common.model';
import { environment } from 'src/environments/environment';
import AppUtil from 'src/app/utilities/app-util';
import { TranslateService } from '@ngx-translate/core';
import AppConstant from 'src/app/utilities/app-constants';
import { DepartmentFormComponent } from './components/department-form/department-form.component';
import {
    DepartmentService,
    PageFilterDepartment,
} from 'src/app/service/department.service';
import { Department } from 'src/app/models/department.model';
import { Router } from '@angular/router';
import { BranchService } from 'src/app/service/branch.service';
import { concatMap, of } from 'rxjs';
import { tap } from 'lodash';

@Component({
    templateUrl: './department.component.html',
    providers: [MessageService, ConfirmationService],
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
        `,
    ],
})
export class DepartmentComponent implements OnInit {
    public appConstant = AppConstant;
    @ViewChild('departmentForm') departmentFormComponent:
        | DepartmentFormComponent
        | undefined;

    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    first = 0;
    listBranch = [];

    public getParams: PageFilterDepartment = {
        page: 1,
        pageSize: 5,
        sortField: 'id',
        isSort: true,
        searchText: '',
        branch: {},
        branchId: 0,
    };
    public totalRecords = 0;
    public totalPages = 0;

    public isLoading: boolean = false;
    public lstDepartments: Department[] = [];

    display: boolean = false;
    isMobile = screen.width <= 1199;

    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;

    pendingRequest: any;

    roles: any[] = [];

    constructor(
        private messageService: MessageService,
        private readonly departmentService: DepartmentService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private router: Router,
        private branchService: BranchService,
    ) {}

    ngOnInit() {
        AppUtil.getUserSortTypes(this.translateService).subscribe((res) => {
            this.sortFields = res;
        });
        AppUtil.getSortTypes(this.translateService).subscribe((res) => {
            this.sortTypes = res;
        });
        this.getListBranch();
    }

    getListBranch() {
        this.branchService.getAllBranch().subscribe((res: any) => {
            this.listBranch = res.data;
            let branch = this.listBranch.find((x) => x.code === 'HS');
            this.getParams.branch = {
                id: branch ? branch.id : 0,
                name: branch ? branch.name : '',
            };
            this.getDepartments();
        });
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getDepartments();
        }
    }

    getDepartments(event?: any, isExport: boolean = false): void {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        this.loading = true;
        if (event) {
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }
        if (isExport) {
            this.departmentService
                .getExcelReport(this.getParams)
                .subscribe((res: any) => {
                    AppUtil.scrollToTop();
                    this.openDownloadFile(res.data, 'excel');
                });
        }
        // remove undefined value
        Object.keys(this.getParams).forEach(
            (k) => this.getParams[k] == null && delete this.getParams[k],
        );

        this.getParams.branchId = this.getParams.branch
            ? this.getParams.branch.id
            : 0;
        if (!this.getParams.branchId) {
            delete this.getParams.branchId;
        }
        this.departmentService
            .getListDepartment(this.getParams)
            .subscribe((response: TypeData<Department>) => {
                AppUtil.scrollToTop();
                this.lstDepartments = response.data;
                this.lstDepartments?.map((item) => {
                    item.branch = this.listBranch?.find(
                        (branch) => branch.id === item.branchId,
                    )?.name;
                });
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    getDetail(departmentId) {
        this.departmentService
            .getDepartmentDetail(departmentId)
            .subscribe((response: Department) => {
                this.formData = response;
                this.isEdit = true;
                this.showDialog();
            });
    }

    onAddDepartment() {
        this.isEdit = false;
        this.showDialog();
    }

    private openDownloadFile(_fileName: string, _ft: string) {
        try {
            this.isLoading = false;
            var _l = this.departmentService.getFolderPathDownload(
                _fileName,
                _ft,
            );
            if (_l) window.open(_l);
        } catch (ex) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error Message',
                detail: 'File invalid',
            });
        }
    }

    onDelete(departmentId) {
        let message;
        this.translateService
            .get('question.delete_department_content')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                this.departmentService
                    .deleteDepartment(departmentId)
                    .subscribe((response: any) => {
                        this.getDepartments();
                    });
            },
        });
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    showDialog() {
        this.departmentFormComponent.onReset();
        this.display = true;
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddDepartment();
                break;
        }
    }
}
