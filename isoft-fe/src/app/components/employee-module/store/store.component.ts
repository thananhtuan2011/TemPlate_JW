import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TypeData } from 'src/app/models/common.model';
import { environment } from 'src/environments/environment';
import AppUtil from 'src/app/utilities/app-util';
import { TranslateService } from '@ngx-translate/core';
import AppConstant from 'src/app/utilities/app-constants';
import { StoreFormComponent } from './components/store-form/store-form.component';
import { PageFilterStore, StoreService } from 'src/app/service/store.service';
import { Store } from 'src/app/models/store.model';
import { Router } from '@angular/router';
import { BranchService } from 'src/app/service/branch.service';
import { concatMap } from 'rxjs';

@Component({
    templateUrl: './store.component.html',
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
export class StoreComponent implements OnInit {
    public appConstant = AppConstant;
    @ViewChild('storeForm') storeFormComponent: StoreFormComponent | undefined;

    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    first = 0;

    public getParams: PageFilterStore = {
        page: 1,
        pageSize: 10,
        searchText: '',
        branchId: null,
    };
    public totalRecords = 0;
    public totalPages = 0;

    public isLoading: boolean = false;

    public lstStores: Store[] = [];

    display: boolean = false;

    isMobile = screen.width <= 1199;

    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;

    pendingRequest: any;
    listBranch = [];

    constructor(
        private messageService: MessageService,
        private readonly storeService: StoreService,
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
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getStores();
        }
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.getParams.isSort = event.value;
        }
        this.getStores();
    }

    getStores(event?: any, isExport: boolean = false): void {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        this.loading = true;
        if (event) {
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }
        if (isExport) {
            this.storeService
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
        this.pendingRequest = this.branchService
            .getAllBranch()
            .pipe(
                concatMap((res) => {
                    this.listBranch = res.data;
                    return this.storeService.getListStore(this.getParams);
                }),
            )
            .subscribe((response: TypeData<Store>) => {
                AppUtil.scrollToTop();
                this.lstStores = response.data;
                this.lstStores?.map((item) => {
                    item.branch = this.listBranch?.find(
                        (branch) => branch.id === item.branchId,
                    )?.name;
                });
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    getDetail(storeId) {
        this.storeService
            .getStoreDetail(storeId)
            .subscribe((response: Store) => {
                this.formData = response;
                this.isEdit = true;
                this.showDialog();
            });
    }

    onAddStore() {
        this.isEdit = false;
        this.showDialog();
    }

    onDelete(storeId) {
        let message;
        let header;
        this.translateService
            .get('question.delete_store_content')
            .subscribe((res) => {
                message = res;
            });
        this.translateService
            .get('question.delete_store_header')
            .subscribe((res) => {
                header = res;
            });
        this.confirmationService.confirm({
            header: header,
            message: message,
            accept: () => {
                this.storeService
                    .deleteStore(storeId)
                    .subscribe((response: any) => {
                        this.getStores();
                    });
            },
        });
    }

    private openDownloadFile(_fileName: string, _ft: string) {
        try {
            this.isLoading = false;
            var _l = this.storeService.getFolderPathDownload(_fileName, _ft);
            if (_l) window.open(_l);
        } catch (ex) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error Message',
                detail: 'File invalid',
            });
        }
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    showDialog() {
        this.storeFormComponent.onReset();
        this.display = true;
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddStore();
                break;
        }
    }
}
