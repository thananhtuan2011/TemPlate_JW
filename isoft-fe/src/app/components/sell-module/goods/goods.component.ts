import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import AppConstant from '../../../utilities/app-constants';
import {GoodsFormComponent} from '../list-of-goods/goods-form/goods-form.component';
import {AddPriceListComponent} from '../setup-module/menu-of-goods/component/add-price-list/add-price-list.component';
import {ComparePricesComponent} from '../setup-module/menu-of-goods/component/compare-prices/compare-prices.component';
import {Goods} from '../../../models/goods.model';
import {PrintItemGoods} from '../../../models/print-item.goods.model';
import {TranslateService} from '@ngx-translate/core';
import {ConfirmationService, MessageService} from 'primeng/api';
import {GoodsService} from '../../../service/goods.service';
import {CategoryService} from '../../../service/category.service';
import {WarehouseService} from '../../../service/warehouse.service';
import {ChartOfAccountService} from '../../../service/chart-of-account.service';
import {Router} from '@angular/router';
import {AppMainComponent} from '../../../layouts/app.main.component';
import AppUtil from '../../../utilities/app-util';
import {environment} from '../../../../environments/environment';
import * as XLSX from 'xlsx';
import {StoreService} from '../../../service/store.service';
import {TaxRatesService} from 'src/app/service/tax-rates.service';
import {TaxRates} from 'src/app/models/tax_rates.model';

@Component({
    selector: 'app-goods',
    templateUrl: './goods.component.html',
    styles: [
        `
            .row-mobile {
                padding: 6px 2px;
            }
            @media screen and (max-width: 768px) {
                :host ::ng-deep .p-panel.p-panel-toggleable .p-panel-header {
                    padding: 8px;
                    min-height: 30px;
                }
            }

            ::ng-deep tr.p-selectable-row.stock-warning {
                background: #bfffe2;
            }
        `,
    ],
})
export class GoodsComponent implements OnInit {
    appConstant = AppConstant;
    @ViewChild('goodsForm') goodsForm: GoodsFormComponent;
    @ViewChild('addPriceListComponent', {static: false})
    addPriceListComponent: AddPriceListComponent;
    @ViewChild('addCompareComponent', {static: false})
    addCompareComponent: ComparePricesComponent;
    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    first = 0;

    printOptions: any = [
        {label: 'Mã vạch', value: 1},
        {label: 'Mã QR', value: 2},
    ];

    printDisplayOption: number;

    public getParams: any = {
        page: 1,
        pageSize: 5,
        sortField: 'id',
        isSort: true,
        account: 0,
        searchText: '',
        status: 1,
        priceCode: 'BGC',
        isManage: true,
        minStockType: 0,
    };
    public totalRecords = 0;
    public totalPages = 0;

    public isLoading: boolean = false;

    public goodsList: Goods[] = [];
    selectedGoods: Goods[] = [];

    public isVisiblePrintPopup: boolean = false;

    public listPrintItem: PrintItemGoods[] = [];

    chartOfAccounts: any[] = [];

    types: any = {};

    display: boolean = false;
    selectedGoodSalary: Goods;

    isMobile = screen.width <= 1199;

    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;
    pendingRequest: any;
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
    minStockTypes = [
        {
            value: 0,
            label: 'Tất cả',
        },
        {
            value: 1,
            label: 'Tồn tối thiểu',
        },
    ];
    taxRates: TaxRates[] = [];

    constructor(
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly goodsServices: GoodsService,
        private readonly categoryService: CategoryService,
        private readonly warehouseService: WarehouseService,
        private readonly chartOfAccountService: ChartOfAccountService,
        private readonly storeService: StoreService,
        private messageService: MessageService,
        private router: Router,
        public appMain: AppMainComponent,
        private readonly taxRatesService: TaxRatesService,
    ) {
    }

    ngOnInit() {
        AppUtil.getRoomTableSortTypes(this.translateService).subscribe(
            (res) => {
                this.sortFields = res;
            },
        );
        AppUtil.getSortTypes(this.translateService).subscribe((res) => {
            this.sortTypes = res;
        });

        this.getCategories();
        this.goodsSync();
        this.getStore();
        this.getTaxRate();
    }

    getChartOfAccounts() {
        this.chartOfAccountService
            .getAllClassification({classification: [2, 3]})
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

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getGoods();
        }
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.getParams.isSort = event.value;
        }
        this.getGoods();
    }

    getGoods(event?: any, isExport: boolean = false): void {
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
        let params = Object.assign({}, this.getParams);
        if (params.account === 0) {
            delete params.account;
        }
        this.pendingRequest = this.goodsServices
            .getList(params)
            .subscribe((response: any) => {
                AppUtil.scrollToTop();
                console.log(response.data);
                this.goodsList = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    getDetail(id) {
        this.isEdit = true;
        this.goodsForm.getDetail(id);
        this.display = true;
    }

    onAddGoods() {
        this.isEdit = false;
        this.goodsForm.onReset();
        this.display = true;
    }

    onDelete(id) {
        let message;
        this.translateService
            .get('question.delete_goods_table')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            key: 'removeGoodTmp',
            accept: () => {
                this.goodsServices
                    .deleteGoods(id)
                    .subscribe((response: any) => {
                        this.getGoods();
                    });
            },
        });
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    getAccountCode(data: Goods) {
        if (!data) {
            return '';
        }
        if (data.detail2) {
            return data.detail2;
        }
        if (data.detail1) {
            return data.detail1.split('_')[0];
        }
        return data.account;
    }

    getAccountName(data: Goods) {
        if (!data) {
            return '';
        }
        if (data.detail2) {
            return data.detailName2;
        }
        if (data.detail1) {
            return data.detailName1;
        }
        return data.accountName;
    }

    getGroupName(data: Goods) {
        if (!data) {
            return '';
        }
        if (data.detail2) {
            return `${ data.account } - ${ data.detail1.split('_')[0] } - ${ data.detailName1 }`;
        }
        if (data.detail1) {
            return `${ data.account } - ${ data.accountName }`;
        }
        return '';
    }

    getCategoryName(code: string, type: number) {
        let category: any = {};
        switch (type) {
            case this.appConstant.CATEGORY_TYPE.GOODS_GROUP: {
                category = this.types.menuType.find((x) => x.code === code);
            }
                break;
            case this.appConstant.CATEGORY_TYPE.PRICE_LIST: {
                category = this.types.priceList.find(
                    (x) => x.code === code,
                );
            }
                break;
            case this.appConstant.CATEGORY_TYPE.GOODS_TYPE: {
                category = this.types.goodsType.find(
                    (x) => x.code === code,
                );
            }
                break;
            case this.appConstant.CATEGORY_TYPE.POSITION: {
                category = this.types.position.find((x) => x.code === code);
            }
                break;
            case this.appConstant.CATEGORY_TYPE.MENU_WEB: {
                category = this.types.menuWeb.find((x) => x.code === code);
            }
                break;
        }
        return category ? category.name : '';
    }

    printBarCode() {
        this.isVisiblePrintPopup = true;
    }

    addPriceList() {
        this.addPriceListComponent.show();
    }

    addComparePrices() {
        this.addCompareComponent.show();
    }

    comparePriceList() {
        this.router.navigate(['/uikit/setup/compare-price-list']).then();
    }

    goodsSync() {
        this.goodsServices.syncAccountGood().subscribe((res) => {
            this.getGoods();
        });
    }

    exportExcel() {
        Object.keys(this.getParams).forEach(
            (k) => this.getParams[k] == null && delete this.getParams[k],
        );
        let params = Object.assign({}, this.getParams);
        if (params.account === 0) {
            delete params.account;
        }
        this.goodsServices
            .exportExcelListOfGoods(params, true)
            .subscribe((res) => {
                this.openDownloadFile(res.data, `excel`);
            });
    }

    onDisplayOptionClick() {
        this.printDisplayOption = null;
    }

    openDownloadFile(_fileName: string, _ft: string) {
        try {
            var _l = this.goodsServices.getFolderPathDownload(_fileName, _ft);
            if (_l) window.open(_l);
        } catch (ex) {
        }
    }

    import(evt) {
        const objProps = [
            'image1', // mã tài khoản 3
            'account', // mã tài khoản 3
            'accountName', // tên tài khoản 4
            'detail1', //mã ct1 5
            'detailName1', // tên ct1 6
            'detail2', // mã ct2
            'detailName2', // tên ct2
            'warehouse', // mã kho 7
            'warehouseName', //tên kho 8
            'goodsType', //giá vốn 9
            'minStockLevel', //giá bán 10
            'maxStockLevel', // thuế VAT 11
            'net',
            'taxRateName', // giảm giá 12
            'status', // nhóm sản phẩm 13
        ];
        const target: DataTransfer = <DataTransfer>evt.target;
        if (target.files.length !== 1)
            throw new Error('Cannot use multiple files');
        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {
            let dataImport = [];
            /* read workbook */
            const bstr: string = e.target.result;
            const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary'});

            /* grab first sheet */
            const wsname: string = wb.SheetNames[0];
            const ws: XLSX.WorkSheet = wb.Sheets[wsname];

            /* save data */
            const datas = XLSX.utils.sheet_to_json(ws, {
                header: 1,
                blankrows: false,
                range: 6,
            }) as any;

            if (datas && datas?.length > 0) {
                datas.forEach((element) => {
                    const objItem = {};
                    objProps.forEach((item, index) => {
                        if (item == 'status') {
                            objItem[item] =
                                element[index] == 'Đang kinh doanh' ? 1 : 0;
                        } else {
                            objItem[item] = element[index];
                        }
                    });
                    dataImport.push(objItem);
                });
            }
            this.goodsServices
                .importExcelListOfGoods(dataImport, true)
                .subscribe(
                    (res) => {
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.create',
                            ),
                        });
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
        };
        reader.readAsBinaryString(target.files[0]);
        (document.getElementById('fileInput') as HTMLInputElement).value = null;
    }

    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddGoods();
                break;
        }
    }

    getTaxRate() {
        this.taxRatesService.getAllTaxRateForRs().subscribe((res) => {
            this.taxRates = res.data;
        });
    }
}
