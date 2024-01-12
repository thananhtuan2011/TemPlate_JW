import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { AppMainComponent } from 'src/app/layouts/app.main.component';
import { InventoryService } from '../../../../service/inventory.service';
import { AuthService } from '../../../../service/auth.service';
import { ChartOfAccountService } from '../../../../service/chart-of-account.service';
import AppUtil from '../../../../utilities/app-util';
import { CategoryWebService } from '../../../../service/category-web.service';
import { GoodsService } from '../../../../service/goods.service';
import * as moment from 'moment/moment';
import AppConstant from '../../../../utilities/app-constants';
import appUtil from '../../../../utilities/app-util';
import { CategoryService } from '../../../../service/category.service';
import { WarehouseService } from '../../../../service/warehouse.service';

@Component({
    selector: 'app-promotion-form',
    templateUrl: './promotion-form.component.html',
    styleUrls: [],
    styles: [``],
})
export class PromotionFormComponent implements OnInit {
    appConstant = AppConstant;
    @Input() display = false;
    @Input() formData;
    promotionForm: FormGroup;
    @Output() onCancel = new EventEmitter();
    items: FormArray;

    filter = {
        page: 1,
        pageSize: 20,
        priceCode: 'BGC',
    };

    types: any = {};
    sortTypes: any = {};
    sortFields: any = {};

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

    categories: any = [];

    goodInventories: any = [];
    visibleGoodTable = false;
    isQRScannerVisible = false;
    checkAll = false;
    goods: any = [];
    chartOfAccounts: any = [];
    detail1s: any = [];
    isMobile = this.appMain.isMobile();

    constructor(
        private readonly appMain: AppMainComponent,
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly authService: AuthService,
        private readonly inventoryService: InventoryService,
        private readonly chartOfAccountService: ChartOfAccountService,
        private readonly categoryWebService: CategoryWebService,
        private readonly goodsService: GoodsService,
        private readonly categoryService: CategoryService,
        private readonly warehouseService: WarehouseService,
    ) {}

    ngOnInit(): void {
        this.getChartOfAccount();
        this.getCategories();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.formData?.id || this.formData?.isCache) {
            this.promotionForm = new FormGroup({
                id: new FormControl(this.formData.id),
                categoryId: new FormControl(this.formData.categoryId),
                fromAt: new FormControl(
                    moment(this.formData.fromAt).format(
                        AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                    ),
                ),
                toAt: new FormControl(
                    moment(this.formData.toAt).format(
                        AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                    ),
                ),
                items: new FormArray([]),
            });
        } else
            this.promotionForm = new FormGroup({
                categoryId: new FormControl(null),
                fromAt: new FormControl(null),
                toAt: new FormControl(null),
                items: new FormArray([
                    new FormGroup({
                        warehouse: new FormControl(null),
                        good: new FormControl(null),
                        inputQuantity: new FormControl(null),
                        outputQuantity: new FormControl(null),
                        closeQuantity: new FormControl(null),
                        closeQuantityReal: new FormControl(null),
                    }),
                ]),
            });
        this.items = this.promotionForm.get('items') as FormArray;
        this.goodInventories = this.formData?.items || [];
    }
    getCategories() {
        this.categoryWebService.getCategory().subscribe((res) => {
            this.categories = res.data;
        });
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
                (x) =>
                    x.type === this.appConstant.CATEGORY_TYPE.PRICE_LIST &&
                    x.code == 'BGC',
            );
            this.types.menuWeb = res.data.filter(
                (x) =>
                    x.type === this.appConstant.CATEGORY_TYPE.MENU_WEB ||
                    x.type === 6,
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

    getWarehouses() {
        this.warehouseService.getAll().subscribe((res) => {
            this.types.warehouse = res.data;
        });
    }

    getChartOfAccounts() {
        this.chartOfAccountService
            .getAllClassification({ classification: [2, 3] })
            .subscribe((res: any) => {
                this.types.chartOfAccount = res;
            });
    }

    getPromotionGoodList(event?: any) {
        let params = {};
        Object.keys(this.filter).forEach((key) => {
            if (this.filter[key] !== null) {
                params[key] = this.filter[key];
            }
        });

        this.goodsService.getList(params).subscribe(
            (res) => {
                this.goods =
                    res.data.map((good) => {
                        return {
                            code: good.detail2 || good.detail1,
                            name: good.detailName2 || good.detailName1,
                            ...good,
                            checked: false,
                            goodId: good.id,
                        };
                    }) || [];
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    detail: 'Lỗi lấy dữ liệu',
                });
            },
        );
    }

    getChartOfAccount(): void {
        this.chartOfAccountService
            .getAllClassification({ classification: [2, 3] })
            .subscribe((res: any) => {
                this.chartOfAccounts = res;
            });
    }

    onChangeAccount(event) {
        if (event && event.value) {
            this.getAccountDetail1(event.value);
            this.getPromotionGoodList();
        } else {
            this.detail1s = [];
        }
    }

    getAccountDetail1(accountCode) {
        this.chartOfAccountService
            .getDetail(accountCode)
            .subscribe((res: any) => {
                this.types.detail1 = res.data;
            });
    }

    onCheckAll(): void {
        this.goods?.map((good) => {
            good.checked = this.checkAll;
        });
    }

    onAddGoods(): void {
        this.visibleGoodTable = true;
        this.goods = [];
    }

    onAddGoodToInventory(): void {
        const goodsSelected = this.goods?.filter((good) => good.checked);
        if (goodsSelected.length === 0) {
            return;
        }
        goodsSelected?.map((goodsSelected) => {
            if (!this.goodInventories?.includes(goodsSelected))
                this.goodInventories.push(goodsSelected);

            console.log(this.goodInventories);
        });
        this.visibleGoodTable = false;
    }

    onRemoveGood(good: any): void {
        const index = this.goodInventories.indexOf(good);
        if (index > -1) this.goodInventories?.splice(index, 1);
    }

    onDelete(): void {}

    onSave(): void {
        let request = {
            ...this.promotionForm.value,
            items: this.goodInventories,
        };

        request.fromAt = appUtil.formatLocalTimezone(
            moment(
                request.fromAt && request.fromAt !== 'Invalid date'
                    ? request.fromAt
                    : new Date(),
                AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ).format(AppConstant.FORMAT_DATE.T_DATE),
        );

        request.toAt = appUtil.formatLocalTimezone(
            moment(
                request.toAt && request.toAt !== 'Invalid date'
                    ? request.toAt
                    : new Date(),
                AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ).format(AppConstant.FORMAT_DATE.T_DATE),
        );

        let action = this.formData?.id
            ? this.categoryWebService.updatePromotion(request, request.id)
            : this.categoryWebService.createPromotion(request);

        action.subscribe(
            (res) => {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        this.formData?.id ? 'success.update' : 'success.create',
                    ),
                });
                this.onCancel.emit({});
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    detail: AppUtil.translate(this.translateService, 'error.0'),
                });
            },
        );
        this.inventoryService.removeInventoryCache();
    }

    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddGoodToInventory();
                break;
            case 'F8':
                event.preventDefault();
                await this.onSave();
                break;
            case 'F6':
                event.preventDefault();
                this.onCancel.emit({});
                break;
            case 'F9':
                event.preventDefault();
                this.onDelete();
                break;
        }
    }
}
