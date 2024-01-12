import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Page, TypeData } from '../../../models/common.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { GoodsService } from '../../../service/goods.service';
import AppUtil from '../../../utilities/app-util';
import { Goods } from '../../../models/goods.model';
import AppConstant from '../../../utilities/app-constants';
import { ChartOfAccountService } from '../../../service/chart-of-account.service';
import { WarehouseService } from '../../../service/warehouse.service';
import { CategoryService } from '../../../service/category.service';

@Component({
    selector: 'app-product-web',
    templateUrl: './product-web.component.html',
    styles: [``],
})
export class ProductWebComponent implements OnInit {
    serverImage = `${environment.serverURLImage}/`;
    display: boolean = false;
    formData = {};
    loading: boolean = false;
    result: TypeData<Goods> = {
        data: [],
        currentPage: 0,
        nextStt: 0,
        pageSize: 20,
        totalItems: 0,
    };

    getParams = {
        page: 1,
        pageSize: 20,
        priceCode: 'BGC',
    };
    appConstant = AppConstant;
    types: any = {};
    sortFields: any = {};
    sortTypes: any = {};
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
    isMobile = screen.width <= 1199;
    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly goodsService: GoodsService,
        private readonly chartOfAccountService: ChartOfAccountService,
        private readonly warehouseService: WarehouseService,
        private readonly categoryService: CategoryService,
    ) { }

    ngOnInit(): void {
        this.getGoods();
        this.getCategories();
    }

    getGoods(event?: any) {
        if (event) {
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }
        this.goodsService.getList(this.getParams).subscribe(
            (res) => {
                AppUtil.scrollToTop();
                this.result = res;
                console.log(res);
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    detail: 'Lỗi lấy dữ liệu',
                });
            },
        );
    }

    onAddGood() {
        this.display = true;
        this.formData = {};
    }

    getGoodDetail(item) {
        this.goodsService.getDetail(item.id).subscribe(res => {
            this.display = true;
            this.formData = res || {};
        });
    }

    onDeleteGood(item) {
        let message;
        this.translateService
            .get('question.delete_web_slider_content')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                this.goodsService.deleteGoods(item?.id).subscribe(
                    (res) => {
                        AppUtil.scrollToTop();
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.delete',
                            ),
                        });
                        this.getGoods();
                    },
                    (error) => {
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

    onCancelForm(event) {
        this.display = false;
        this.formData = {};
        this.getGoods();
    }

    baseUrlImage(image) {
        return image ? `${this.serverImage}${image}` : '';
    }

    getAccountCode(data: Goods) {
        if (data.detail2) {
            return data.detail2;
        }
        if (data.detail1) {
            return data.detail1.split('_')[0];
        }
        return data.account;
    }

    getAccountName(data: Goods) {
        if (data.detail2) {
            return data.detailName2;
        }
        if (data.detail1) {
            return data.detailName1;
        }
        return data.accountName;
    }

    // filter categories

    getCategories() {
        this.categoryService.getAll().subscribe((res) => {
            console.log("category", res);
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
                (x) =>
                    x.type === this.appConstant.CATEGORY_TYPE.PRICE_LIST &&
                    x.code == 'BGC',
            );
            this.types.menuWeb = res.data.filter(
                (x) =>
                    x.type === this.appConstant.CATEGORY_TYPE.MENU_WEB ||
                    x.type === 6 || x.type === 7,
            );
            this.types.status = this.statuses;
            this.getWarehouses();
            AppUtil.getRoomTableSortTypes(this.translateService).subscribe(
                (res) => {
                    this.sortFields = res;
                },
            );
            AppUtil.getSortTypes(this.translateService).subscribe((res) => {
                this.sortTypes = res;
            });
        });
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

    onChangeAccount(event) {
        if (event && event.value) {
            this.getDetail1(event.value);
            this.getGoods();
        } else {
            this.types.detail1 = [];
        }
    }

    getWarehouses() {
        this.warehouseService.getAll().subscribe((res) => {
            this.types.warehouse = res.data;
        });
    }
}
