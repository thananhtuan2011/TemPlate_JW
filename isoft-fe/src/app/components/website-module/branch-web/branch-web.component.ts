import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import AppConstant from '../../../utilities/app-constants';
import { BranchFormComponent } from '../../employee-module/branch/components/branch-form/branch-form.component';
import {
    BranchService,
    PageFilterBranch,
} from '../../../service/branch.service';
import { Branch } from '../../../models/branch.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DecideService } from '../../../service/decide.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import AppUtil from '../../../utilities/app-util';
import { TypeData } from '../../../models/common.model';
import { environment } from '../../../../environments/environment';
@Component({
    selector: 'app-branch-web',
    templateUrl: './branch-web.component.html',
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
export class BranchWebComponent implements OnInit {
    public appConstant = AppConstant;
    @ViewChild('branchForm') branchFormComponent:
        | BranchFormComponent
        | undefined;

    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    first = 0;

    public getParams: PageFilterBranch = {
        page: 1,
        pageSize: 10,
        searchText: '',
    };
    public totalRecords = 0;
    public totalPages = 0;

    public isLoading: boolean = false;

    public lstBranchs: Branch[] = [];

    display: boolean = false;

    isMobile = screen.width <= 1199;

    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;

    pendingRequest: any;

    constructor(
        private messageService: MessageService,
        private readonly branchService: BranchService,
        private readonly decideService: DecideService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private router: Router,
    ) {}

    ngOnInit() {
        AppUtil.getUserSortTypes(this.translateService).subscribe((res) => {
            this.sortFields = res;
        });
        AppUtil.getSortTypes(this.translateService).subscribe((res) => {
            this.sortTypes = res;
        });
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getBranchs();
        }
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.getParams.isSort = event.value;
        }
        this.getBranchs();
    }

    getBranchs(event?: any, isExport: boolean = false): void {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        this.loading = true;
        if (event) {
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }
        if (isExport) {
            this.branchService
                .getExcelReport(this.getParams)
                .subscribe((res: any) => {
                    AppUtil.scrollToTop();
                    AppUtil.openDownloadFile(res.data, 'excel');
                });
        }
        // remove undefined value
        Object.keys(this.getParams).forEach(
            (k) => this.getParams[k] == null && delete this.getParams[k],
        );
        this.pendingRequest = this.branchService
            .getListBranch(this.getParams)
            .subscribe((response: TypeData<Branch>) => {
                AppUtil.scrollToTop();
                this.lstBranchs = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    getDetail(branchId) {
        this.branchService
            .getBranchDetail(branchId)
            .subscribe((response: Branch) => {
                this.formData = response;
                this.isEdit = true;
                this.showDialog();
            });
    }

    onAddBranch() {
        this.isEdit = false;
        this.showDialog();
    }

    onDelete(decideId) {
        let message;
        let header;
        this.translateService
            .get('question.delete_branch_content')
            .subscribe((res) => {
                message = res;
            });
        this.translateService
            .get('question.delete_branch_header')
            .subscribe((res) => {
                header = res;
            });
        this.confirmationService.confirm({
            header: header,
            message: message,
            accept: () => {
                this.branchService
                    .deleteBranch(decideId)
                    .subscribe((response: any) => {
                        this.getBranchs();
                    });
            },
        });
    }

    showDialog() {
        this.branchFormComponent.onReset();
        this.display = true;
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddBranch();
                break;
        }
    }
}
