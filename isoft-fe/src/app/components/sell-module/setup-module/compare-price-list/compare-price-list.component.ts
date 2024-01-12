import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ColumnFilter, Table } from 'primeng/table';
import { CategoryService } from 'src/app/service/category.service';
import { GoodsService } from 'src/app/service/goods.service';
import { PageFilterUser } from 'src/app/service/user.service';
import AppConstant from 'src/app/utilities/app-constants';
import { environment } from 'src/environments/environment';
import { TypeData } from 'src/app/models/common.model';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import { WarehouseService } from 'src/app/service/warehouse.service';
import { StoreService } from 'src/app/service/store.service';

@Component({
    selector: 'app-compare-price-list',
    templateUrl: './compare-price-list.component.html',
    providers: [MessageService, ConfirmationService],
    styles: [
        `
            :host ::ng-deep .p-datatable-scrollable .p-datatable-thead {
                display: block !important;
            }
            :host ::ng-deep .p-datatable-thead .col-custom {
                width: 200px;
            }
        `,
    ],
})
export class ComparePriceListComponent implements OnInit {
    public appConstant = AppConstant;
    loading: boolean = true;
    first = 0;
    public getParams: PageFilterUser = {
        page: 1,
        pageSize: 10,
        priceLists: [],
    };
    public totalRecords = 0;
    public totalPages = 0;
    public isLoading: boolean = false;
    display: boolean = false;
    isMobile = screen.width <= 1199;
    pendingRequest: any;

    listCompare: any[] = [];
    listSelected: any[] = [];
    existCompare: boolean = false;
    result: TypeData<any> = {
        data: [],
        currentPage: 0,
        nextStt: 0,
        pageSize: 10,
        totalItems: 0,
    };
    types: any = {};
    statuses = [
        {
            value: 1,
            label: 'Đang kinh doanh',
        },
        {
            value: 0,
            label: 'Ngừng kinh doanh',
        },
    ];
    constructor(
        private categoryService: CategoryService,
        private goodService: GoodsService,
        private readonly chartOfAccountService: ChartOfAccountService,
        private readonly warehouseService: WarehouseService,
        private readonly storeService: StoreService,
    ) {}

    ngOnInit() {
        this.getCategories();
        this.getStore();
    }

    getdata(event?: any) {
        this.getParams.page =
            Math.floor(Number(event?.first || 0) / Number(event?.rows || 1)) +
            1;
        this.getParams.pageSize = Number(event?.rows || 20);

        this.goodService
            .compareGoodPrice(this.getParams)
            .subscribe((response) => {
                this.loading = false;
                this.result = response;
            });
    }

    clearFilter(columnFilter: ColumnFilter, field: string) {
        columnFilter.clearFilter();
    }

    getReligions() {
        this.goodService
            .exportExcelCompareGoodPrice(this.getParams)
            .subscribe((res) => {
                this.openDownloadFile(res.data, 'excel');
            });
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    preview() {
        this.loading = true;
        this.goodService.compareGoodPrice(this.getParams).subscribe((res) => {
            this.loading = false;
            this.listCompare = res.data;
            if (this.getParams.priceLists.length > 0) {
                this.listSelected = this.getParams.priceLists;
                this.existCompare = true;
                for (let item of this.listCompare) {
                    // this.listSelected = item.
                }
            } else {
                this.existCompare = false;
            }
        });
    }

    getNameColspan(code): string {
        return this.types.priceList.find((item) => item.code === code)?.name;
    }

    openDownloadFile(_fileName: string, _ft: string) {
        try {
            var _l = this.goodService.getFolderPathDownload(_fileName, _ft);
            if (_l) window.open(_l);
        } catch (ex) {}
    }
    getChartOfAccounts() {
        this.chartOfAccountService
            .getAllClassification({ classification: [2, 3] })
            .subscribe((res: any) => {
                this.types.chartOfAccount = res;
            });
    }

    getDetail1(accountCode) {
        this.chartOfAccountService
            .getDetail(accountCode)
            .subscribe((res: any) => {
                this.types.detail1 = res.data;
            });
    }

    getStore() {
        this.storeService.getAllStore().subscribe((res: any) => {
            this.types.lstStore = res.data;
        });
    }

    onChangeAccount(event) {
        if (event && event.value) {
            this.getDetail1(event.value);
            this.getdata();
        } else {
            this.types.detail1 = [];
        }
    }

    getWarehouses() {
        this.warehouseService.getAll().subscribe((res) => {
            this.types.warehouse = res.data;
        });
    }

    getCategories() {
        this.categoryService.getAll().subscribe((res) => {
            this.getChartOfAccounts();
            this.types.menuType = res.data.filter(
                (x) => x.type === this.appConstant.CATEGORY_TYPE.GOODS_GROUP,
            );
            this.types.goodsType = res.data.filter(
                (x) => x.type === this.appConstant.CATEGORY_TYPE.GOODS_TYPE,
            );
            this.types.position = res.data.filter(
                (x) => x.type === this.appConstant.CATEGORY_TYPE.POSITION,
            );
            this.types.priceList = res.data.filter(
                (x) => x.type === this.appConstant.CATEGORY_TYPE.PRICE_LIST,
            );
            this.types.menuWeb = res.data.filter(
                (x) => x.type === this.appConstant.CATEGORY_TYPE.MENU_WEB,
            );
            this.types.status = this.statuses;
            this.getWarehouses();
        });
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.getParams.isSort = event.value;
        }
        this.preview();
    }
}
