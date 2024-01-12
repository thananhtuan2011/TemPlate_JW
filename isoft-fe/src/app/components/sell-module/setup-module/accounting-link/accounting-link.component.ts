import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AccountLinkService } from 'src/app/service/account-link.service';
import {
    BranchService,
    PageFilterBranch,
} from 'src/app/service/branch.service';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import { EndOfTermEndingService } from 'src/app/service/end-of-term-ending.service';
import AppUtil from 'src/app/utilities/app-util';
import { environment } from 'src/environments/environment';
import { AccountLinkFormComponent } from './account-link-form/account-link-form.component';
@Component({
    selector: 'app-accounting-link',
    templateUrl: './accounting-link.component.html',
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
    providers: [MessageService, ConfirmationService],
})
export class AccountingLinkComponent implements OnInit {
    @ViewChild('accountLinkFormComponent') accountLinkFormComponent:
        | AccountLinkFormComponent
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
    display: boolean = false;

    isMobile = screen.width <= 1199;

    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;

    pendingRequest: any;
    listAccountLink: any[] = [];
    creditAccounts: any[] = [];

    constructor(
        private messageService: MessageService,
        private readonly branchService: BranchService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private chartOfAccountService: ChartOfAccountService,
        private accountLink: AccountLinkService,
    ) {}

    ngOnInit() {
        AppUtil.getUserSortTypes(this.translateService).subscribe((res) => {
            this.sortFields = res;
        });
        AppUtil.getSortTypes(this.translateService).subscribe((res) => {
            this.sortTypes = res;
        });
        this.getListCreditAccount();
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getAccountLink();
        }
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.getParams.isSort = event.value;
        }
        this.getAccountLink();
    }

    getAccountLink(event?: any, isExport: boolean = false): void {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        this.loading = true;
        if (event) {
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }
        Object.keys(this.getParams).forEach(
            (k) => this.getParams[k] == null && delete this.getParams[k],
        );
        this.pendingRequest = this.accountLink
            .getListAccount()
            .subscribe((response: any) => {
                AppUtil.scrollToTop();
                this.listAccountLink = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    getDetail(data) {
        this.formData = data;
        this.isEdit = true;
        this.onAddEndOfTermEnding();
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    onAddEndOfTermEnding() {
        this.accountLinkFormComponent.onReset();
        this.display = true;
    }

    getListCreditAccount() {
        this.chartOfAccountService
            .getAllByDisplayInsert()
            .subscribe((res: any) => {
                this.creditAccounts = res;
            });
    }
}
