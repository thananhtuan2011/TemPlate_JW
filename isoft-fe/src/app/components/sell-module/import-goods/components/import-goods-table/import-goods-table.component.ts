import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { Goods } from 'src/app/models/goods.model';
import { Product } from 'src/app/models/product';
import { GoodsService } from 'src/app/service/goods.service';
import AppUtil from 'src/app/utilities/app-util';
import { environment } from 'src/environments/environment';
import { MessageService } from 'primeng/api';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import { WarehouseService } from 'src/app/service/warehouse.service';
import { CategoryService } from 'src/app/service/category.service';
import AppConstant from 'src/app/utilities/app-constants';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/service/auth.service';
import { CustomerService } from '../../../../../service/customer.service';
import { CashierMediatorService } from '../../../../../service/mediators/cashier-mediator.service';
import {
    COAService,
    PageFilterRoomTable,
} from 'src/app/service/coa-filters.service';
import { ICashierImport } from 'src/app/models/cashier.model';
import { BillGoodsNotificationComponent } from '../bill-goods-notification/bill-goods-notification.component';

export enum CashierImportType {
    CT1CT2Code = 'CT1CT2Code',
    CT1CT2Name = 'CT1CT2Name',
    HHCode = 'HHCode',
    HHName = 'HHName',
}
@Component({
    selector: 'app-import-goods-table',
    templateUrl: './import-goods-table.component.html',
    styleUrls: ['./import-goods-table.component.scss'],
})
export class ImportGoodsTableComponent implements OnInit {
    appConstant = AppConstant;
    @Input('users') users: any[] = [];
    @Input('customers') customers: any[] = [];
    @Input('isSeller') isSeller: boolean = false;
    @Input('getParamsChartAccountFilter') getParamsChartAccountFilter!: any;
    @Input('billNotification') billNotification: BillGoodsNotificationComponent;
    @Output() onProductSelected = new EventEmitter();
    @Output() onChangeFilterCustomer = new EventEmitter();
    @Output() onFilterCustomerBySearchText = new EventEmitter();
    @Output() onChangeAccountDecs = new EventEmitter();
    @Output() onChangeImportBill = new EventEmitter();
    @ViewChild('uploadFile') uploadFile: ElementRef<HTMLInputElement>;
    products: Product[];
    sortOrder: number;
    sortField: string;
    @Input() selectedUser: any;

    public getParams: any;
    accountDesc!: any[];
    searchTypes: any[] = [
        { key: 'Mã CT1 - Mã CT2', value: 0 },
        { key: 'Mã CT1 - Tên CT2', value: 1 },
        { key: 'Tên CT1 - Tên CT2', value: 2 },
        { key: 'Mã HH', value: 3 },
        { key: 'Tên HH', value: 4 },
    ];
    public totalRecords = 0;
    public totalPages = 0;

    public isLoading: boolean = false;

    public goodsList: Goods[] = [];

    pendingRequest: any;

    loading: boolean = true;
    isSearchAdvanced: boolean = false;
    passWifi: string = '';
    layout: string = '';
    isPassWifi: boolean = false;
    first = 0;

    isQRScannerVisible: boolean = false;
    isMobile = screen.width <= 1199;

    types: any = {};
    sortFields: any[] = [];
    sortTypes: any[] = [];
    customerType = 1;
    private allGoodList: any;
    importType: string = '';
    items = [
        {
            label: 'Tải file mẫu',
            icon: 'pi pi-download',
            command: () => this.openFile(),
        },
        {
            id: CashierImportType.CT1CT2Code,
            label: 'Mã CT1 -Tên CT2',
            icon: 'pi pi-upload',
            command: (event: any) => this.importBillFunc(event),
        },
        {
            id: CashierImportType.CT1CT2Name,
            label: 'Tên CT1 -Tên CT2',
            icon: 'pi pi-upload',
            command: (event: any) => this.importBillFunc(event),
        },
        {
            id: CashierImportType.HHCode,
            label: 'Mã HH',
            icon: 'pi pi-upload',
            command: (event: any) => this.importBillFunc(event),
        },
        {
            id: CashierImportType.HHName,
            label: 'Tên HH',
            icon: 'pi pi-upload',
            command: (event: any) => this.importBillFunc(event),
        },
    ];

    public getParamsAccount: PageFilterRoomTable = {
        page: 1,
        pageSize: 5,
        sortField: 'id',
        isSort: true,
        floorId: 0,
        isFloor: 'true',
        searchText: '',
    };

    constructor(
        private goodsService: GoodsService,
        public messageService: MessageService,
        private chartOfAccountService: ChartOfAccountService,
        private warehouseService: WarehouseService,
        private categoryService: CategoryService,
        private translateService: TranslateService,
        private customerService: CustomerService,
        private cashierMediator: CashierMediatorService,
        private readonly authService: AuthService,
        private readonly coaFiltersService: COAService,
    ) {}

    ngOnInit(): void {
        AppUtil.getRoomTableSortTypes(this.translateService).subscribe(
            (res) => {
                this.sortFields = res;
            },
        );
        AppUtil.getSortTypes(this.translateService).subscribe((res) => {
            this.sortTypes = res;
        });
        this.onResetParams();
        this.getCategories();
        this.getListCustomer();
        this.passWifi = AppUtil.getStorage(AppConstant.WIFI);
        this.layout = this.authService.getConfigurationViewLayout || 'list';
        // this.getCOAFilters();
    }

    // get list Account Desc
    getCOAFilters(): void {
        this.coaFiltersService
            .getList(this.getParamsAccount)
            .subscribe((response: any) => {
                this.accountDesc = response.data
                    .filter((item: any) => item.type === 'NHAPHANGHOA')
                    .map((account: any) => {
                        return {
                            key: account.name,
                            value: account.id,
                            documentCode: account.documentCode
                        };
                    });

                this.getParams.chartOfAccountFilterId =
                    this.accountDesc[0].value;
                this.onChangeAccountDecs.emit(this.accountDesc[0].documentCode);

                this.getGoodsForCashiers();
                this.getAllGoodsForCashiers();
            });
    }

    openFile() {
        let fileUrl = 'BillCreator_Template.xlsx';
        window.open(
            `${environment.serverURL}/api/ReportDownload/download-file-template?fileName=${fileUrl}`,
        );
    }

    importBillFunc(event: any) {
        this.importType = event.item.id;
        this.uploadFile.nativeElement.click();
    }

    importByType(event: any) {
        this.onChangeImportBill.emit({event, importType: this.importType})
    }

    getProductCode(product: ICashierImport): string {
        const parentRef = product.parentRef;
        let code = product.code;
        if (parentRef === null || parentRef === '') {
            return code;
        } else if (!parentRef.includes(':')) {
            return `${parentRef} - ${code}`;
        }

        const listCode = parentRef.split(':');
        return `${listCode[listCode.length - 1]} - ${code}`;
    }

    onChangeLayout(event?: any) {
        AppUtil.setStorage(AppConstant.LAYOUT_DATAVIEW, event.layout);
        this.layout = event.layout;
        console.log('this.layout: ', this.layout)
    }

    getGoodsForCashiers(event?: any, isRefresh: boolean = false): void {
        if (isRefresh) {
            this.onResetParams();
            this.getGoodsForCashiers();
            return;
        }
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        this.loading = true;
        if (event) {
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }
        let params = Object.assign({}, this.getParams);
        if (params.account === null || params.account === 0) {
            delete params.account;
        }
        if (isRefresh) {
            params = {};
        }
        params.chartOfAccountFilterId = this.getParamsChartAccountFilter.chartOfAccountFilterId;
        this.pendingRequest = this.goodsService
            .getListChartOfAccountForCashiser(AppUtil.cleanObject(params))
            .subscribe((response: any) => {
                AppUtil.scrollToTop();
                this.goodsList = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;

                // const chartOfAccountFilterId = this.getParams.chartOfAccountFilterId;
                // const documentCode = this.accountDesc.find(item => item.value === chartOfAccountFilterId)?.documentCode;
                // if (documentCode) {
                //     this.onChangeAccountDecs.emit(this.accountDesc[0].documentCode);
                // }
            });
    }

    getAllGoodsForCashiers(): void {
        this.getParams.chartOfAccountFilterId = this.getParamsChartAccountFilter.chartOfAccountFilterId;
        this.goodsService
            .getListChartOfAccountForCashiser(
                AppUtil.cleanObject(this.getParams),
            )
            .subscribe((response: any) => {
                this.allGoodList = response.data;
            });
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getGoodsForCashiers();
        }
    }

    onResetParams() {
        this.getParams = {
            page: 1,
            pageSize: 8,
            sortField: 'id',
            isSort: true,
            searchText: '',
            chartOfAccountFilterId: null,
        };
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
                console.log('get detail', res.data);
            });
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.getParams.isSort = event.value;
        }
        this.getGoodsForCashiers();
    }

    onChangeAccount(event) {
        console.log('event ', event);
        if (event && event.value) {
            this.getDetail1(event.value);
            this.getGoodsForCashiers();
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
            console.log(res.data);
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
            this.types.status = [
                { value: 1, label: 'Đang kinh doanh' },
                { value: 0, label: 'Ngừng kinh doanh' },
            ];
            this.getWarehouses();
            console.log('type ', this.types);
        });
    }

    filteredCustomers: any[] = [];
    listCustomers: any[] = []
    // event filter customer
    onCustomerNameSelect(event) {
        if (event) {
            let customer = this.customers.find(
                (x) => x.code === event.split('|')[0].trim(),
            );
            if (customer) {
                this.getParams.customerId = customer.id;
                this.getParams.customerName = `${customer.code} | ${customer.name}`;

                this.getGoodsForCashiers();

                this.customerService
                    .getCustomerDetail(customer?.id)
                    .subscribe((res) => {
                        customer = res.data;
                        this.onChangeFilterCustomer.emit(customer);
                    });

                return;
            }
        }
        this.onChangeFilterCustomer.emit({});
    }

    onQRScanSuccess(goodCode: string) {
        let good = this.goodsList.find((item) =>
            item.qrCodes.find((qr) => qr == goodCode),
        );

        if (good == null) {
            this.messageService.add({
                severity: 'error',
                detail: `Không tìm thấy sản phẩm với mã ${goodCode}`,
            });
            return;
        }

        this.messageService.add({
            severity: 'success',
            detail: AppUtil.translate(
                this.translateService,
                `Đã tìm thấy sản phẩm ${good.detailName1 || good.detailName2}`,
            ),
        });
        this.onProductSelected.emit(good);
    }

    onChangeCustomer(customer) {
        if (customer && !AppUtil.isEmpty(customer)) {
            this.getParams.customerId = customer.id;
            this.getParams.customerName = `${customer.code} | ${customer.name}`;
        } else {
            delete this.getParams.customerId;
            delete this.getParams.customerName;
        }
    }

    onClearCustomer(event) {
        this.getGoodsForCashiers();
    }

    // event filter customer
    @Input() selectedBillTab: any = { data: { customerName: '' } };
    showCustomerFormDialog: boolean = false;

    filterCustomerName(event) {
        let keyword = event.query.toLowerCase();
        this.getListCustomer(keyword);
    }

    getListCustomer(searchText: string = '') {
        this.customerService
            .getAllCustomer(searchText, 1)
            .subscribe((res: any) => {
                this.listCustomers = res.data;
                this.filteredCustomers = this.listCustomers.map(
                    (item) => `${item.code} | ${item.name}`,
                );
                this.cashierMediator.notifyOnCustomerFiltered(
                    this.listCustomers
                );
            });
    }

    getCustomerName = (customerId: number) => {
        const customer = this.listCustomers.find(item => item.id === customerId);
        return customer ? `${customer.code} | ${customer.name}` : ''
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    onSavePassWifi() {
        AppUtil.setStorage(AppConstant.WIFI, this.passWifi);
        this.isPassWifi = false;
    }

    showAddCustomerDialog() {
        this.showCustomerFormDialog = true;
    }

    onAddCustomerSuccess($event) {
        this.selectedBillTab.data.customerName = $event.name;
    }
}
