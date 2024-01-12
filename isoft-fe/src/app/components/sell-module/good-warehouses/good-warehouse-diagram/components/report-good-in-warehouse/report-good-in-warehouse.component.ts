import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { TaxRates } from 'src/app/models/tax_rates.model';
import AppConstant from '../../../../../../utilities/app-constants';
import { Goods } from '../../../../../../models/goods.model';
import { GoodsService } from '../../../../../../service/goods.service';
import { CategoryService } from '../../../../../../service/category.service';
import { WarehouseService } from '../../../../../../service/warehouse.service';
import { ChartOfAccountService } from '../../../../../../service/chart-of-account.service';
import { AppMainComponent } from '../../../../../../layouts/app.main.component';
import { GoodWarehouseService } from '../../../../../../service/good-warehouse.service';

@Component({
    selector: 'app-report-good-in-warehouse',
    templateUrl: './report-good-in-warehouse.component.html',
})
export class ReportGoodInWarehouseComponent implements OnInit {
    appConstant = AppConstant;
    loading: boolean = true;
    sortFields: any[] = [];
    sortTypes: any[] = [];

    first = 0;

    printDisplayOption: number;

    public getParams: any = {
        page: 1,
        pageSize: 5,
        accountCode: '',
        detail1Code: '',
    };

    public totalRecords = 0;
    public totalPages = 0;

    public isLoading: boolean = false;

    public goodsList: Goods[] = [];
    selectedGoods: Goods[] = [];

    public isVisiblePrintPopup: boolean = false;

    chartOfAccounts: any[] = [];

    types: any = {};

    display: boolean = false;
    isMobile = screen.width <= 1199;

    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;
    pendingRequest: any;

    taxRates: TaxRates[] = [];
    constructor(
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly goodsServices: GoodsService,
        private readonly categoryService: CategoryService,
        private readonly warehouseService: WarehouseService,
        private readonly chartOfAccountService: ChartOfAccountService,
        public appMain: AppMainComponent,
    ) {}

    ngOnInit() {
        this.getCategories();
    }

    getChartOfAccounts() {
        this.chartOfAccountService
            .getAllClassification({ classification: [2, 3] })
            .subscribe((res: any) => {
                this.types.chartOfAccount = res;
            });
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getGoods();
        }
    }

    getDetail1(accountCode) {
        this.chartOfAccountService
            .getDetail(accountCode)
            .subscribe((res: any) => {
                this.types.detail1 = res.data;
            });
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
            this.getWarehouses();
        });
    }

    getGoods(event?: any): void {
        if (event) {
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }
        Object.keys(this.getParams).forEach(
            (k) => this.getParams[k] == null && delete this.getParams[k],
        );
        let params = Object.assign({}, this.getParams);
        if (params.account === 0) {
            delete params.account;
        }

        this.goodsServices.ReportGoodInWarehouse(params).subscribe((res) => {
            this.goodsList = res.data;
            this.totalRecords = res.totalItems || 0;
            this.totalPages = res.totalItems / res.pageSize + 1;
            this.loading = false;
        });
    }

    onChangeAccount(event) {
        if (event && event.value) {
            this.getDetail1(event.value);
            this.getGoods();
        } else {
            this.types.detail1 = [];
        }
    }
}
