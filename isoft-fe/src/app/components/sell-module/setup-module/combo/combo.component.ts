import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Page } from 'src/app/models/common.model';
import { BranchService } from 'src/app/service/branch.service';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import { ComboService } from 'src/app/service/combo.service';
import { QuotaService } from 'src/app/service/quota.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import { environment } from 'src/environments/environment';

export interface PageCombo extends Page {
    goodType?: string;
}
@Component({
    selector: 'app-combo',
    templateUrl: './combo.component.html',
    styles: [``],
})
export class ComboComponent implements OnInit {
    constructor(
        private messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private chartOfAccount: ChartOfAccountService,
        private comboService: ComboService,
    ) {}
    public appConstant = AppConstant;
    @ViewChild('comboFormComponent') comboFormComponent:
        | ComboComponent
        | undefined;

    loading: boolean = true;
    sortFields: any[] = [];
    sortTypes: any[] = [];
    first = 0;
    public getParams: PageCombo = {
        page: 1,
        pageSize: 10,
        searchText: '',
        goodType: 'COMBO',
    };
    public totalRecords = 0;
    public totalPages = 0;
    public isLoading: boolean = false;
    listCombo: any[] = [];
    display: boolean = false;
    isMobile = screen.width <= 1199;
    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;
    pendingRequest: any;
    types: any = {};
    creditAccounts: any[] = [];
    dataParent: any;

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
            this.getCombo();
        }
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.getParams.isSort = event.value;
        }
        this.getCombo();
    }

    getCombo(event?: any, isExport: boolean = false): void {
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
        this.pendingRequest = this.comboService
            .getList(this.getParams)
            .subscribe((response) => {
                AppUtil.scrollToTop();
                this.listCombo = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    getDetail(data) {
        this.comboService.getByID(data?.id).subscribe((response) => {
            this.formData = response.data;
            this.isEdit = true;
            this.dataParent = data;
            this.showDialog();
        });
    }

    showDialog() {
        this.display = true;
    }

    getListCreditAccount() {
        this.chartOfAccount
            .getAllClassification({ classification: [2, 3] })
            .subscribe((res: any) => {
                this.creditAccounts = res;
            });
    }

    getDetail1(accountCode) {
        this.chartOfAccount.getDetail(accountCode).subscribe((res: any) => {
            this.types.detail1 = res.data;
        });
    }

    onChangeAccount(event) {
        if (event && event.value) {
            this.getDetail1(event.value);
            this.getListCreditAccount();
        } else {
            this.types.detail1 = [];
        }
    }

    getCode(item) {
        let dataDisplay = '';
        if (item?.account) {
            dataDisplay = item.account;
        }
        if (item?.detail1) {
            dataDisplay = item.detail1;
        }
        if (item?.detail2) {
            dataDisplay = item.detail2;
        }
        return dataDisplay;
    }

    getName(item) {
        let dataDisplay;
        if (item.accountName) {
            dataDisplay = item.accountName;
        }
        if (item?.detailName1) {
            dataDisplay = item.detailName1;
        }
        if (item?.detailName2) {
            dataDisplay = item.detailName2;
        }
        return dataDisplay;
    }
}
