import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import {
    Bill,
    BillDetail,
    ChangeStatusResult,
    ICashierRequest,
} from 'src/app/models/cashier.model';
import { Goods } from 'src/app/models/goods.model';
import { RoomTable } from 'src/app/models/room-table.model';
import { BillDetailService } from 'src/app/service/bill-detail.service';
import { BillService } from 'src/app/service/bill.service';
import { CustomerService } from 'src/app/service/customer.service';
import { PageFilterRoomTable, RoomTableService } from 'src/app/service/room-table.service';
import AppUtil from 'src/app/utilities/app-util';
import { BillTableComponent } from '../components/bill-table/bill-table.component';
import { AuthService } from 'src/app/service/auth.service';
import { CompanyService } from 'src/app/service/company.service';
import { AppMainComponent } from 'src/app/layouts/app.main.component';
import { UserService } from 'src/app/service/user.service';
import { User } from 'src/app/models/user.model';
import { SurchargesService } from 'src/app/service/surcharge.service';
import { TillService } from '../../../service/till.service';
import { TillFormComponent } from '../till/till-form/till-form.component';
import { NewestBillNumberModel } from '../../../models/newest-bill-number';
import { BillType, BillTypeNumber, DocumentCodeWithPaymentType, PaymentType } from '../../../utilities/app-enum';
import { CashierMediatorService } from '../../../service/mediators/cashier-mediator.service';
import { BillGoodsNotificationComponent } from './components/bill-goods-notification/bill-goods-notification.component';
import { PrintBillGoodsComponent } from './components/print-bill-goods/print-bill-goods.component';
import { environment } from 'src/environments/environment';
import { PTCSSForArise } from '../../accounting-module/arise/prints/const_css';
import * as moment from 'moment';
import AppConstant from 'src/app/utilities/app-constants';
import { LedgerService } from 'src/app/service/ledger.service';
import { COAService } from 'src/app/service/coa-filters.service';
import { ImportGoodsTableComponent } from './components/import-goods-table/import-goods-table.component';
import { DocumentService } from 'src/app/service/document.service';
import { Document } from 'src/app/models/document.model';
import { AccountLinkService } from 'src/app/service/account-link.service';
import { BillGoodsTableComponent } from './components/bill-goods-table/bill-goods-table.component';
import { TaxRatesService } from 'src/app/service/tax-rates.service';

@Component({
    selector: 'app-import-goods',
    templateUrl: './import-goods.component.html',
    styleUrls: ['./import-goods.component.scss'],
})
export class ImportGoodsComponent implements OnInit {
    appUtil = AppUtil;
    @ViewChild('appBillTable') appBillTable: BillGoodsTableComponent;
    @ViewChild('goodsTable') goodsTable: ImportGoodsTableComponent;
    @ViewChild('billNotification')
    billNotification: BillGoodsNotificationComponent;
    @ViewChild('printBillComponent')
    printBillComponent: PrintBillGoodsComponent;
    @ViewChild('tillForm') tillsForm: TillFormComponent | undefined;
    @ViewChild('uploadFile') uploadFile: ElementRef<HTMLInputElement>;

    floors: RoomTable[] = [];
    desks: RoomTable[] = [];
    desksTemp: RoomTable[] = [];
    isMobile = screen.width <= 1199;
    activeTableOrGoods: number = 0;
    selectedBillTabId = '';
    selectedBillTab: any = { data: { customerName: '' } };
    floorTabs: any[] = [];
    billTabs: any[] = [
        {
            deskId: 0,
            tabId: 0,
            floorId: 0,
            isDefault: true,
            title: 'label.default',
            content: `label.select_goods_to_continue`,
            data: {},
        },
    ];
    getParams: any = {};
    billTypeSelected: string = BillType.All;
    billTypePay: string = PaymentType.Debt;
    taxRate!: any;
    billTypes: any[] = [
        // {
        //     code: 'HĐ',
        //     name: BillType.HasBill
        // },
        // {
        //     code: 'KHĐ',
        //     name: BillType.NoBill
        // },
        { code: BillType.All, name: '1. Cả hai' },
        { code: BillType.HT, name: '2. HT' },
        { code: BillType.NB, name: '3. NB' },
        { code: BillType.LT, name: '4. LT' },
    ];
    mergeBillTab: any = {};

    newestBillNumberModel: NewestBillNumberModel = {
        billNumber: '',
        billOrder: 1,
    };
    customers: any[] = [];
    displayDiscountPrice: boolean = false;
    // notification params
    isPayment: boolean = false;
    typeSave: string = '';
    typePrint: string = '';
    moneys: any[] = [];
    authUser: any = {};
    company: any = {};
    isShowOnShiftDialog: boolean = false;
    currentTill: any = {};
    display: boolean = false;
    selectedCustomer: any = {};
    displaySplitMerge: boolean = false;
    mergeGoods: any[] = [];
    users: User[] = [];
    selectedUser: string = '';

    importType: string = '';
    documentCode: string = '';
    orginalVoucherNumber: string = '';
    voucherNumber: string = '';
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
    isDisplayXuatKho_Ledger: boolean = false;
    dataPrint: any = {};

    months: any[] = [];
    filterMonth: number;
    currentDate: any;

    accountDesc!: any[];
    public getParamsAccount: PageFilterRoomTable = {
        page: 1,
        pageSize: 5,
        sortField: 'id',
        isSort: true,
        floorId: 0,
        isFloor: 'true',
        searchText: '',
    };
    documentList: Document[] = [];
    document = null;
    nextStt!: number;
    oldNextStt!: number;
    payTypesList: any[] = [];
    ledgesForHistory: any[] = [];
    displayNotification = false;
    isCreate = true;
    isProductHistoryHasVat = false;
    productHistoryVatId: number = 0;
    taxRates: any[] = [];
    ledgersWarehouse: any[] = [];
    customerBillId: number;
    customerBillName: string;
    billTypeChartOfAccount: string;

    constructor(
        public appMain: AppMainComponent,
        private roomTableService: RoomTableService,
        private surchargesService: SurchargesService,
        private customerService: CustomerService,
        private messageService: MessageService,
        private translateService: TranslateService,
        private billService: BillService,
        private billDetailService: BillDetailService,
        private authService: AuthService,
        private companyService: CompanyService,
        private userService: UserService,
        private tillService: TillService,
        private cashierMediator: CashierMediatorService,
        private readonly ledgerService: LedgerService,
        private readonly coaFiltersService: COAService,
        private readonly documentService: DocumentService,
        private readonly accountLinkService: AccountLinkService,
        private readonly taxRatesService: TaxRatesService
    ) {
        this.cashierMediator.customerChanged.subscribe((filteredCustomers) => {
            this.customers = filteredCustomers;
        });
    }

    ngOnInit() {
        this.authUser = this.authService.user;
        this.getAllUserActive();
        this.getLastInfo();
        this.getFloors();
        this.getListCustomer();
        this.resetMoneys();
        this.getCurrentTill();
        this.getCOAFilters();
        this.getListAccount();
        this.getTaxList();
        this.getLedgersWarehouse();

        this.months = this.appUtil.getAriseTypes().month;
        this.filterMonth = new Date().getMonth() + 1;
        this.currentDate = moment().format(
            AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE
        );
    }

    getListAccount() {
        this.accountLinkService.getListAccount().subscribe((res: any) => {
            this.payTypesList = res.data;
        })
    }

    getTaxList = () => {
        this.taxRatesService.getAllTaxRatesV2().subscribe((res) => {
            if (res.data) {
                this.taxRates = res.data.filter(item => item.code.includes('V'))
            }
        });
    }

    getLedgers() {
        const payload = {
            searchText: '',
            documentType: this.document.code || '',
            filterMonth: this.filterMonth,
            isInternal: BillTypeNumber[this.billTypeSelected],
        };
        this.ledgerService.getListV2(payload).subscribe((resp) => {
            this.nextStt = resp.nextStt;
            this.ledgesForHistory = resp.data;
            this.setOriginalVoucherNumber();
        });
    }

    getLedgersWarehouse() {
        const payload = {};
        this.ledgerService.getListLedgerWarehouses(payload).subscribe((resp) => {
            this.ledgersWarehouse = resp.data.data;
        });
    }

    // get list Account Desc
    getCOAFilters(): void {
        this.coaFiltersService
            .getList(this.getParamsAccount)
            .subscribe((response: any) => {
                const accountDesc = response.data.sort((account1, account2) => account1.order < account2.order ? -1 : 1)
                this.accountDesc = accountDesc
                    .map((account: any) => {
                        return {
                            key: account.name,
                            value: account.id,
                            documentCode: account.documentCode,
                            type: account.type
                        };
                    });

                this.getParams.chartOfAccountFilterId =
                    this.accountDesc[0].value;
                this.billTypeChartOfAccount = this.accountDesc[0].type;
                this.documentCode = this.accountDesc[0].documentCode;
                console.log('billTypeChartOfAccount: ', this.billTypeChartOfAccount)

                this.goodsTable.getGoodsForCashiers();
                this.goodsTable.getAllGoodsForCashiers();
                this.getDocumentTypeList();
            });
    }

    openBillHistory = () => {
        this.displayNotification = true;
        this.isCreate = false;
    }

    getGoodsForCashiers() {
        const accountDesc = this.accountDesc.find(item => item.value === this.getParams.chartOfAccountFilterId);
        this.documentCode = accountDesc?.documentCode;
        this.billTypeChartOfAccount = accountDesc?.type;
        if (this.documentCode) {
            this.document = this.documentList.find(item => item.code === this.documentCode);
        } else {
            this.document = this.documentList.find(item => item.code === DocumentCodeWithPaymentType[this.billTypePay]);
        }

        this.setOriginalVoucherNumber();
        this.goodsTable.getGoodsForCashiers();
        this.getLedgers();
        this.billTabs = [
            {
                deskId: 0,
                tabId: 0,
                floorId: 0,
                isDefault: true,
                title: 'label.default',
                content: `label.select_goods_to_continue`,
                data: {},
            },
        ];
    }

    private getDocumentTypeList() {
        this.documentService.getAllActiveDocumentV2().subscribe((resp) => {
            if (resp?.data) {
                const sortedData = resp.data.sort((a, b) => a.stt - b.stt);
                this.documentList = [
                    {
                        code: null,
                        name: 'Xem tất cả loại chứng từ',
                    } as Document,
                ].concat(sortedData);

                setTimeout(() => {
                    this.document = this.documentList.find(item => item.code === this.documentCode);
                    this.getLedgers();
                }, 0)
            }
        });
    }

    onChangeBillType = (event: any) => {
        this.billTypePay = event.value;
        this.document = this.documentList.find(item => item.code === DocumentCodeWithPaymentType[this.billTypePay]);
        this.getLedgers();
    }

    setOriginalVoucherNumber = () => {
        if (this.billTabs.length === 1) {
            return
        }
        const date = this.currentDate.split('/');
        this.orginalVoucherNumber = `${
            this.document.code || DocumentCodeWithPaymentType[this.billTypePay]
        }${AppUtil.addLeadingZeros(
            this.filterMonth || new Date().getMonth() + 1,
            2,
        )}-${
            date[2].toString().substring(2, 4) ||
            new Date().getFullYear().toString().substring(2, 4)
        }-${AppUtil.addLeadingZeros(this.isCreate ? this.nextStt : this.oldNextStt, 3)}`.replace(
            ' ',
            '',
        );
        this.voucherNumber = `${AppUtil.addLeadingZeros(
            this.filterMonth || new Date().getMonth() + 1,
            2,
        ).toString()}/${this.document.code || DocumentCodeWithPaymentType[this.billTypePay]}`;

        this.billTabs[0].title = this.orginalVoucherNumber;
    }

    importBillFunc(event: any) {
        this.importType = event.item.id;
        this.uploadFile.nativeElement.click();
    }
    getLastInfo() {
        this.companyService.getLastCompanyInfo().subscribe((response: any) => {
            this.company = response.data;
        });
    }
    async getBillIdNewest() {
        this.newestBillNumberModel =
            await this.billService.getBillIdNewestByType(this.billTypeSelected);
    }
    getCurrentTill() {
        this.tillService.getCurrentTill().subscribe((res: any) => {
            this.currentTill = res?.data;
        });
    }
    onEndOfShiftSuccess() {
        this.isShowOnShiftDialog = false;
        this.messageService.add({
            severity: 'success',
            detail: AppUtil.translate(
                this.translateService,
                'Kết thúc ca thành công',
            ),
        });
    }

    getFloors() {
        this.roomTableService.getListNoQuery().subscribe((res) => {
            this.floors = res.data.filter((item) => item.floorId === 0) || [];
            this.desks = res.data.filter((item) => item.floorId !== 0) || [];
            this.floors.forEach((item) => {
                if (this.floorTabs.map((x) => x.id !== item.id)) {
                    this.floorTabs.push({
                        id: item.id,
                        title: `${item.name}`,
                    });
                }
            });
        });
    }

    getListCustomer(searchText: string = '') {
        this.customerService
            .getAllCustomer(searchText)
            .subscribe((res: any) => {
                this.customers = res.data;
            });
    }

    onChangeFilterCustomer(event) {
        if (this.goodsTable) {
            this.goodsTable.onChangeCustomer(event);
        }
        this.setUserSelected(event?.userCreated);
    }

    onChangeCustomer(event) {
        if (!event) {
            this.goodsTable.getGoodsForCashiers();
            return;
        }
        if (this.appBillTable) {
            this.appBillTable.onChangeCustomer(event);
        } else {
            this.setUserSelected(event?.userCreated);
        }
        this.selectedCustomer = event;
    }

    setUserSelected(userId) {
        if (userId == null) {
            return;
        }
        this.userService.getUserDetail(userId).subscribe((res) => {
            this.selectedUser = res.username;
        });
    }

    resetMoneys() {
        this.moneys = [
            { name: 0, count: 0 },
            { name: 1000, count: 0 },
            { name: 2000, count: 0 },
            { name: 5000, count: 0 },
            { name: 10000, count: 0 },
            { name: 20000, count: 0 },
            { name: 50000, count: 0 },
            { name: 100000, count: 0 },
            { name: 200000, count: 0 },
            { name: 500000, count: 0 },
            { name: 1000000, count: 0 },
            { name: 1000000, count: 0 },
        ];
    }

    onChangeSupportMoney(money) {
        if (money.name === 0) {
            this.selectedBillTab.data.amountReceivedByCus = 0;
            this.resetMoneys();
        } else {
            if (!this.selectedBillTab.data.amountReceivedByCus) {
                this.selectedBillTab.data.amountReceivedByCus = 0;
            }
            this.selectedBillTab.data.amountReceivedByCus += money.name;
            money.count++;
        }
    }

    addBill(roomTable) {
        let billTab = this.billTabs.find((x) => x.deskId === roomTable.id);
        if (billTab) {
            this.messageService.add({
                severity: 'info',
                detail: AppUtil.translate(
                    this.translateService,
                    'Bàn đã tồn tại',
                ),
            });
            this.setSelectedTab(billTab.tabId);
            this.activeTableOrGoods = 1;
            return;
        }
        let newBill = {
            isDefault: false,
            tabId: this.appUtil.makeRandomId(6),
            deskId: roomTable.id,
            deskName: roomTable.deskName,
            floorId: roomTable.floorId,
            floorName: this.floors.find((x) => x.id === roomTable.floorId).name,
            title: `Bill ${this.newestBillNumberModel.billNumber}`,
            data: {
                id: this.newestBillNumberModel.billOrder,
                isRealId: false,
                products: [],
                floorName: '',
                customerNumber: 1,
                customerId: !AppUtil.isEmpty(this.selectedCustomer)
                    ? this.selectedCustomer.id
                    : 0,
                customerName: !AppUtil.isEmpty(this.selectedCustomer)
                    ? `${this.selectedCustomer.code} | ${this.selectedCustomer.name}`
                    : '',
                customerNameOnly: !AppUtil.isEmpty(this.selectedCustomer)
                    ? `${this.selectedCustomer.name}`
                    : '',
                customerTaxCode: !AppUtil.isEmpty(this.selectedCustomer)
                    ? `${this.selectedCustomer.taxCode}`
                    : '',
                discountType: 'money',
                totalAmount: 0,
                discountPrice: 0,
                note: '',
                payPrice: 0,
                typePay: PaymentType.Debt,
                debitCode: !AppUtil.isEmpty(this.selectedCustomer)
                    ? this.selectedCustomer.debit?.code
                    : '',
                debitDetailCodeFirst: !AppUtil.isEmpty(this.selectedCustomer)
                    ? this.selectedCustomer.debitDetailFirst?.code
                    : '',
                debitDetailCodeSecond: !AppUtil.isEmpty(this.selectedCustomer)
                    ? this.selectedCustomer.debitDetailSecond?.code
                    : '',
            },
        };
        this.billTabs.unshift(newBill);
        this.setSelectedTab(newBill.tabId);
        this.activeTableOrGoods = 1;
    }

    async addProduct(event) {
        if (this.billTabs.length === 1) {
            await this.getBillIdNewest();
            let deskLive = this.desks.find((x) => x.code === 'Live');
            let floorLive = this.floors.find((x) => x.code === 'Floor');
            let newBill = {
                isDefault: false,
                tabId: this.appUtil.makeRandomId(6),
                deskId: deskLive ? deskLive.id : 0,
                deskName: deskLive ? deskLive.name : '',
                floorId: floorLive ? floorLive.id : 0,
                floorName: floorLive ? floorLive.name : '',
                title: `Bill ${this.newestBillNumberModel.billNumber}`,
                isPrintBill: this.billTypeSelected == BillType.HasBill,
                data: {
                    id: this.newestBillNumberModel.billOrder,
                    isRealId: false,
                    products: [],
                    floorName: '',
                    customerNumber: 1,
                    customerId: !AppUtil.isEmpty(this.selectedCustomer)
                        ? this.selectedCustomer.id
                        : 0,
                    customerName: !AppUtil.isEmpty(this.selectedCustomer)
                        ? `${this.selectedCustomer.code} | ${this.selectedCustomer.name}`
                        : '',
                    customerNameOnly: !AppUtil.isEmpty(this.selectedCustomer)
                        ? `${this.selectedCustomer.name}`
                        : '',
                    customerTaxCode: !AppUtil.isEmpty(this.selectedCustomer)
                        ? `${this.selectedCustomer.taxCode}`
                        : '',
                    discountType: 'money',
                    totalAmount: 0,
                    discountPrice: 0,
                    note: '',
                    payPrice: 0,
                    tabIndex: this.newestBillNumberModel.billOrder,
                    typePay: PaymentType.Debt,
                    billNumber: this.newestBillNumberModel.billNumber,
                    type: this.billTypeSelected,
                    vat: 0,
                    vatAmount: 0,
                    debitCode: !AppUtil.isEmpty(this.selectedCustomer)
                        ? this.selectedCustomer.debit?.code
                        : '',
                    debitDetailCodeFirst: !AppUtil.isEmpty(
                        this.selectedCustomer,
                    )
                        ? this.selectedCustomer.debitDetailFirst?.code
                        : '',
                    debitDetailCodeSecond: !AppUtil.isEmpty(
                        this.selectedCustomer,
                    )
                        ? this.selectedCustomer.debitDetailSecond?.code
                        : '',

                },
            };
            this.billTabs.unshift(newBill);
            this.setSelectedTab(newBill.tabId);
            this.activeTableOrGoods = 1;
        }
        if (this.billTabs.length > 1) {
            this.setOriginalVoucherNumber();
        }
        this.onAddProduct(event);
    }

    onAddProduct(product) {
        console.log('onAddProduct: ', product)
        //check exist in products
        this.checkSetSelectedBillTab();
        let products = this.selectedBillTab.data.products || [];
        // check exist in has bill
        let productTemp =
            products.find((x) =>
                x.goodsId ? x.goodsId === product.id : x.id === product.id,
            ) || {};
        if (!this.appUtil.isEmpty(productTemp)) {
            productTemp.billQuantity++;
            return;
        }
        product.billQuantity = 1;
        product.billBox = 0;
        product.billNec = 0;
        product.discountPrice = 0;
        product.discountType = 'money';
        product.cashierRequest = {
            id: product.id,
            type: product.type,
            month: 0,
            voucherNumber: '',
            orginalAddress: '',
            orginalVoucherNumber: '',
            orginalBookDate: '',
            referenceVoucherNumber: '',
            referenceBookDate: '',
            referenceFullName: '',
            referenceAddress: '',
            isInternal: null,
            attachVoucher: '',
            invoiceCode: '',
            invoiceName: '',
            invoiceTaxCode: '',
            invoiceAddress: '',
            invoiceProductItem: '',
            invoiceAdditionalDeclarationCode: '',
            invoiceSerial: '',
            invoiceNumber: '',
            invoiceDate: '',
            debitCode: '',
            debitDetailCodeFirst: '',
            debitDetailCodeSecond: '',
            creditCode: '',
            creditDetailCodeFirst: '',
            creditDetailCodeSecond: '',
            debitWarehouse: '',
            creditWarehouse: '',
            orginalCompanyName: '',
            orginalDescription: '',
            projectCode: '',
            depreciaMonth: null,
            orginalCurrency: null,
            exchangeRate: null,
            quantity: 1,
            unitPrice: 0,
            amount: 0,
            tab: null,
            billBox: 1,
            billNec: 1,
            percentTransport: null,
            amountTransport: null,
            amountImportWarehouse: null,
            percentImportTax: null,
            bookDate: '',
        } as ICashierRequest
        this.selectedBillTab.data.products = [
            ...products,
            Object.assign({}, product),
        ];
    }

    closeBill(tabId) {
        this.billTabs = this.billTabs.filter((x) => x.tabId !== tabId);
        this.setSelectedTab(this.billTabs[0].tabId);
        this.activeTableOrGoods = 0;
        this.isCreate = true;
    }

    onChangeTab(event) {
        this.setSelectedTab(this.billTabs[event.index].tabId);
    }

    async onShowSplitMerge(billTabId) {
        let products = this.billTabs.find((x) => x.tabId === billTabId).data
            .products;
        if (products && products.length > 0) {
            await this.getFloors();
            this.mergeBillTab.splitMergeType = 'split';
            this.mergeGoods = products.map((a) => Object.assign({}, a));
            this.mergeGoods.forEach((goods) => {
                goods.checked = false;
                goods.mergeQuantity = null;
            });
            this.displaySplitMerge = true;
        }
    }

    onEditSplitMerge() {
        // check exist bill
        if (
            this.desks.find(
                (x) => x.id === this.mergeBillTab.mergeDeskId && x.isChoose,
            )
        ) {
            this.messageService.add({
                severity: 'info',
                detail: AppUtil.translate(
                    this.translateService,
                    'Bàn đã tạo hóa đơn',
                ),
            });
            return;
        }
        // check info merge type
        if (
            !this.mergeBillTab.splitMergeType ||
            !this.mergeBillTab.mergeFloorId ||
            !this.mergeBillTab.mergeDeskId
        ) {
            this.messageService.add({
                severity: 'info',
                detail: AppUtil.translate(
                    this.translateService,
                    'Thông tin lầu bàn chưa được chọn',
                ),
            });
            return;
        }
        // check split exist desk
        if (
            this.mergeBillTab.splitMergeType === 'split' &&
            this.billTabs.find(
                (x) => x.deskId === this.mergeBillTab.mergeDeskId,
            )
        ) {
            this.messageService.add({
                severity: 'info',
                detail: AppUtil.translate(
                    this.translateService,
                    'Bàn đã được chọn trong hệ thống hoặc ds hóa đơn',
                ),
            });
            return;
        }
        // check selected merge goods
        if (this.mergeGoods.filter((x) => x.checked).length === 0) {
            this.messageService.add({
                severity: 'info',
                detail: AppUtil.translate(
                    this.translateService,
                    'Không có hàng hóa nào được chọn',
                ),
            });
            return;
        }
        // check quantity merge goods
        if (
            this.mergeGoods.filter((x) => x.checked && !x.mergeQuantity)
                .length > 0
        ) {
            this.messageService.add({
                severity: 'info',
                detail: AppUtil.translate(
                    this.translateService,
                    'Số lượng hàng hóa không trống',
                ),
            });
            return;
        }

        if (this.mergeBillTab.splitMergeType === 'split') {
            let tempGoods = [];
            this.mergeGoods.forEach((goods) => {
                if (goods.mergeQuantity > 0) {
                    goods.billQuantity = goods.mergeQuantity;
                    goods.mergeQuantity = null;
                    tempGoods.push(goods);
                }
            });
            let newBill = {
                isDefault: false,
                tabId: this.appUtil.makeRandomId(6),
                deskId: this.mergeBillTab.mergeDeskId,
                deskName: this.desks.find(
                    (x) => x.id === this.mergeBillTab.mergeDeskId,
                ).name,
                floorId: this.mergeBillTab.mergeFloorId,
                floorName: this.floors.find(
                    (x) => x.id === this.mergeBillTab.mergeFloorId,
                ).name,
                title: `Bill ${this.newestBillNumberModel.billNumber}`,
                data: {
                    id: this.newestBillNumberModel.billOrder,
                    isRealId: false,
                    products: tempGoods,
                    customerNumber: 1,
                    customerId: 0,
                    customerName: '',
                    discountType: 'money',
                    totalAmount: 0,
                    discountPrice: 0,
                    note: 0,
                    payPrice: 0,
                    typePay: 'CM',
                },
            };
            this.billTabs.unshift(newBill);

            tempGoods.forEach((tempGoods) => {
                let oldGoods = this.selectedBillTab.data.products.find(
                    (x) => x.id === tempGoods.id,
                );
                oldGoods.billQuantity =
                    oldGoods.billQuantity - tempGoods.billQuantity;
            });
            if (
                !this.selectedBillTab.data.products.find(
                    (x) => x.billQuantity > 0,
                )
            ) {
                this.closeBill(this.selectedBillTab.tabId);
            }
            this.setSelectedTab(newBill.tabId);
        } else {
            let tempGoods = [];
            this.mergeGoods.forEach((goods) => {
                if (goods.mergeQuantity > 0) {
                    goods.billQuantity = goods.mergeQuantity;
                    goods.mergeQuantity = null;
                    tempGoods.push(goods);
                }
            });
            let oldProducts = this.billTabs.find(
                (x) => x.tabId === this.selectedBillTabId,
            ).data.products;
            let newProducts = this.billTabs.find(
                (x) => x.deskId === this.mergeBillTab.mergeDeskId,
            ).data.products;
            let oldGoods, newGoods;
            tempGoods.forEach((tempGoods) => {
                // add quantity to old goods
                oldGoods = oldProducts.find((x) => x.id === tempGoods.id);
                oldGoods.billQuantity =
                    oldGoods.billQuantity - tempGoods.billQuantity;

                // add quantity to new goods
                newGoods = newProducts.find((x) => x.id === tempGoods.id);
                if (newGoods) {
                    newGoods.billQuantity =
                        newGoods.billQuantity + tempGoods.billQuantity;
                } else {
                    newProducts.push(tempGoods);
                }
            });
            if (!oldProducts.find((x) => x.billQuantity > 0)) {
                this.closeBill(this.selectedBillTabId);
            }
            this.setSelectedTab(
                this.billTabs.find(
                    (x) => x.deskId === this.mergeBillTab.mergeDeskId,
                ).tabId,
            );
        }
        this.mergeGoods = [];
        this.displaySplitMerge = false;
    }

    setSelectedTab(tabId) {
        this.selectedBillTabId = tabId;
        this.checkSetSelectedBillTab(tabId);
    }

    switchMergeGoods(goods, value) {
        goods.mergeQuantity = value ? 1 : null;
    }

    onChangeAccountDecs = (event: any) => {
        this.documentCode = event;
    }

    onChangeTaxRate = (taxRate: any) => {
        this.taxRate = taxRate;
    }

    getInvoiceTaxCode = (billTab: any) => {
        if (billTab.data.invoiceTaxCode instanceof String) {
            return billTab.data.invoiceTaxCode || ""
        } else if (billTab.data.invoiceTaxCode instanceof Object) {
            return billTab.data.invoiceTaxCode.code
        }

        return ''
    }
    async onShowPayment(billTab, isPayment, typeSave, typePrint: string = '') {
        const cashierRequest = {
            id: 0,
            type: this.document,
            ...this.buildCreditCode(billTab),
            userCreated: this.authService.user.id,
            invoiceNumber: billTab.data.invoiceNumber,
            invoiceName: billTab.data.invoiceName,
            invoiceTaxCode: this.getInvoiceTaxCode(billTab),
            invoiceAddress: billTab.data.invoiceAddress,
            invoiceSerial: billTab.data.invoiceSerial,
            invoiceProductItem: billTab.data.invoiceProductItem,
            depreciaMonth: Number(billTab.data['depreciaMonth']) || 0,
            month: new Date().getMonth() + 1,
            orginalDescription: billTab.data.warehouseDesc,
            orginalVoucherNumber: this.orginalVoucherNumber,
            voucherNumber: this.voucherNumber,
            percentImportTax: 0,
            percentTransport: 0,
            tab: 0,
            customerId: !AppUtil.isEmpty(this.selectedCustomer)
                    ? this.selectedCustomer.id
                    : 0,
            customerName: !AppUtil.isEmpty(this.selectedCustomer)
                    ? `${this.selectedCustomer.code} | ${this.selectedCustomer.name}`
                    : '',
            invoiceAdditionalDeclarationCode: billTab.data.invoiceAdditionalDeclarationCode,
            bookDate: AppUtil.formatLocalTimezone(
                moment(
                    billTab.data['bookDate'] ? billTab.data['bookDate'] : new Date(),
                    AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                ).format(AppConstant.FORMAT_DATE.T_DATE),
            ),
            orginalBookDate: AppUtil.formatLocalTimezone(
                moment(
                    billTab.data['orginalBookDate']
                        ? billTab.data['orginalBookDate']
                        : new Date(),
                    AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                ).format(AppConstant.FORMAT_DATE.T_DATE),
            ),
            referenceBookDate: AppUtil.formatLocalTimezone(
                moment(
                    billTab.data['referenceBookDate']
                        ? billTab.data['referenceBookDate']
                        : new Date(),
                    AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                ).format(AppConstant.FORMAT_DATE.T_DATE),
            ),
            invoiceDate: !billTab.data['invoiceDate'] ? null
            : AppUtil.formatLocalTimezone(
                  moment(
                    billTab.data['invoiceDate'],
                      AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                  ).format(AppConstant.FORMAT_DATE.T_DATE),
                ),
            createdDate: moment(new Date(), AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE).format(AppConstant.FORMAT_DATE.T_DATE),
            createAt: moment(new Date(), AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE).format(AppConstant.FORMAT_DATE.T_DATE)
        }
        billTab.data.products = billTab.data.products.map((item: any) => {
            return {
                ...item,
                cashierRequest: {
                    ...item.cashierRequest,
                    ...cashierRequest,
                    id: !this.isCreate ? item.id : 0,
                    invoiceCode: this.taxRate?.code || '',
                    isInternal: BillTypeNumber[this.billTypeSelected],
                    ledgerInternalId: BillTypeNumber[this.billTypeSelected],
                    orginalCurrency: item.orginalCurrency ? item.orginalCurrency : 0,
                    exchangeRate: item.exchangeRate ? item.exchangeRate : 0,
                    type: this.document.code,
                    ...this.builDebitCode(item)
                }
            }
        })

        if (billTab.data.vat !== 0 && this.taxRate?.code) {
            billTab.data.products.push({
                ...billTab.data.products[0],
                cashierRequest: {
                    ...billTab.data.products[0].cashierRequest,
                    amount: billTab.data.vatAmount,
                    quantity: 0,
                    unitPrice: 0,
                    id: this.isProductHistoryHasVat ? this.productHistoryVatId : 0,
                    type: this.document.code,
                    orginalDescription: this.taxRate?.description,
                    debitCode: this.taxRate?.debit?.code || '',
                    debitDetailCodeFirst: this.taxRate?.debitFirst?.code || '',
                    debitDetailCodeSecond: this.taxRate?.debitSecond?.code || ''
                }
            })
        }

        // return;
        let typePay = '';
        if (billTab != null && billTab.data != null) {
            typePay = billTab.data.typePay;
        }

        if (!this.selectedUser) {
            this.messageService.add({
                severity: 'info',
                detail: AppUtil.translate(this.translateService, 'info.name'),
            });
            return;
        }

        this.isPayment = isPayment;
        this.typeSave = typeSave;
        this.typePrint = typePrint;

        this.checkSetSelectedBillTab();

        await this.onSaveBillCashiersConfirm(billTab);

    }

    buildCreditCode(billTab: any) {
        if (billTab.data.typePay === PaymentType.Debt) {
            if (this.billTypeChartOfAccount === AppConstant.MENU_TYPE.NHAPHANGHOA) {
                return {
                    creditCode: billTab.data.debitCode,
                    creditDetailCodeFirst: billTab.data.debitDetailCodeFirst,
                    creditDetailCodeSecond: billTab.data.debitDetailCodeSecond,
                }
            }
            return {
                debitCode: billTab.data.debitCode,
                debitDetailCodeFirst: billTab.data.debitDetailCodeFirst,
                debitDetailCodeSecond: billTab.data.debitDetailCodeSecond,
            }
        }

        const payAccount = this.payTypesList.find(item => item.code === billTab.data.typePay);
        if (this.billTypeChartOfAccount === AppConstant.MENU_TYPE.NHAPHANGHOA) {
            return {
                creditCode: payAccount.account,
                creditDetailCodeFirst: payAccount.detail1,
                creditDetailCodeSecond: payAccount.detail2,
            }
        }

        return {
            debitCode: payAccount.account,
            debitDetailCodeFirst: payAccount.detail1,
            debitDetailCodeSecond: payAccount.detail2,
        }
    }

    builDebitCode = (item: any) => {
        if (this.billTypeChartOfAccount === AppConstant.MENU_TYPE.NHAPHANGHOA) {
            return {
                debitCode: item.parentRef.split(':')[0] || null,
                debitDetailCodeFirst: item.parentRef.split(':')[1] || item.code,
                debitDetailCodeSecond: item.code || null,
            }
        }

        return {
            creditCode: item.parentRef.split(':')[0] || null,
            creditDetailCodeFirst: item.parentRef.split(':')[1] || item.code,
            creditDetailCodeSecond: item.code || null,
        }
    }

    async onSaveBillCashiersConfirm(billTab: any) {
        await this.doSendBillCashiers(billTab);
        this.resetMoneys();
        this.displayDiscountPrice = false;
    }

    private async saveBillCashiers(param: any) {
        this.ledgerService.createLedgerV3(param).subscribe((res) => {
            this.messageService.add({
                severity: 'success',
                detail: 'Thao tác thành công',
            });
            this.billTabs = [
                {
                    deskId: 0,
                    tabId: 0,
                    floorId: 0,
                    isDefault: true,
                    title: 'label.default',
                    content: `label.select_goods_to_continue`,
                    data: {},
                },
            ];

            this.goodsTable.selectedBillTab.data.customerName = ""
            this.getLedgers();
            this.getLedgersWarehouse();
        });

            // this.billService.createBill(params).subscribe((res: any) => {
            //     this.messageService.add({
            //         severity: 'success',
            //         detail: AppUtil.translate(
            //             this.translateService,
            //             'success.create',
            //         ),
            //     });
            //     this.selectedBillTab.data.id = res.data.id;
            //     this.selectedBillTab.data.status = res.data.status;
            //     this.selectedBillTab.data.createdDate = res.data.createdDate;
            //     this.onSaveBillDetail(res.data.id);
            // });
    }


    changeStatusSendToChef(billId: number = 0) {
        let changeParams: ChangeStatusResult = {
            id: this.selectedBillTab.msgId,
            billId: billId,
            currentTranType: 'SendToCashier',
        };
        this.billService.changeStatus(changeParams).subscribe(() => {
            this.billNotification.getNotificationMessage();
            this.messageService.add({
                severity: 'success',
                detail: AppUtil.translate(
                    this.translateService,
                    'success.update',
                ),
            });
        });
    }

    async doSendBillCashiers(billTab: any) {
        let billReq = this.getBillCashiersReq(billTab);
        if (
            this.selectedBillTab.data &&
            this.selectedBillTab.data.isRealId
        ) {
            this.onCompleteBill();
            return;
        }
        await this.saveBillCashiers(billReq);
    }

    checkSetSelectedBillTab(tabId?) {
        if (tabId) {
            this.selectedBillTab = this.billTabs.find((x) => x.tabId === tabId);
            return;
        }
        if (this.appUtil.isEmpty(this.selectedBillTab)) {
            this.selectedBillTab = this.billTabs.find(
                (x) => x.tabId === this.selectedBillTabId,
            );
        }
    }

    getAllUserActive() {
        this.userService.getAllUserActive().subscribe((res: any) => {
            this.users = res.data;
        });
        this.selectedUser = this.authUser.username;
    }

    getBillCashiersReq = (billTab: any) => {
        let products = [];
        billTab.data.products.forEach(item => {
            products.push(item.cashierRequest);
        })

        return products;
    }

    getBillReq(isPayment: boolean) {
        return {
            ...this.selectedBillTab,
            id: !this.selectedBillTab.data.isRealId
                ? 0
                : this.selectedBillTab.data.id,
            floorId: this.selectedBillTab.floorId,
            deskId: this.selectedBillTab.deskId,
            customerId: this.selectedBillTab.data.customerId || 0,
            customerName:
                this.getCustomerName(this.selectedBillTab.data.customerId) ||
                '',
            userCode: this.selectedUser,
            userType: this.typeSave === 'saveTemp' ? 'seller' : 'cashier',
            quantityCustomer: this.selectedBillTab.data.customerNumber,
            totalAmount: this.selectedBillTab.data.totalAmount,
            amountReceivedByCus:
                this.selectedBillTab.data.amountReceivedByCus || 0,
            amountSendToCus: this.selectedBillTab.data.amountReceivedByCus || 0,
            discountType: this.selectedBillTab.data.discountType || '',
            discountPrice: this.selectedBillTab.data.discountPrice || 0,
            note: this.selectedBillTab.data.note,
            status: this.selectedBillTab.data.status || 'Waiting',
            isPayment,
            typePay: this.selectedBillTab.data.typePay,
            isPrintBill: this.selectedBillTab.isPrintBill == true,
            isPriority: this.selectedBillTab.isPriority == true,
            products: [],
            displayOrder: this.newestBillNumberModel.billOrder,
            billNumber: this.selectedBillTab.data.billNumber,
            type: this.selectedBillTab.data.type,
            vatRate: this.selectedBillTab.data.vat,
            vat: this.selectedBillTab.data.vatAmount,
        };
    }

    onChangeMergeFloors(floorId) {
        this.desksTemp = this.desks.filter((x) => x.floorId === floorId);
    }

    getAccountName(data: Goods) {
        if (data.detail2) {
            return data.detailName2;
        }
        if (data.detail1) {
            return data.detailName1;
        }
        if (data.goodsName) {
            return data.goodsName;
        }
        return data.accountName;
    }

    getCustomerName(customerId) {
        if (customerId > 0) {
            return this.customers.find((x) => x.id === customerId).name;
        }
        return '';
    }

    onCompleteBill() {
        let billId = this.selectedBillTab.data.id;
        this.selectedBillTab.data.userCode = this.selectedUser;
        this.selectedBillTab.data.userType = 'cashier';
        let productsTemp = this.selectedBillTab.data.products.map((product) => {
            return {
                id: 0,
                billId,
                goodsId: product.goodsId ? product.goodsId : product.id,
                quantity: product.billQuantity,
                unitPrice: product.salePrice,
                discountPrice: product.discountPrice,
                discountType: product.discountType,
                taxVat: product.taxVat,
                note: product.note,
            };
        });
        // this.selectedBillTab.data.products = productsTemp;
        const params = {
            ...this.selectedBillTab.data,
            products: productsTemp || [],
        };
        this.billService
            .completeBill(this.selectedBillTab.data.id, params)
            .subscribe((res: any) => {
                if (res && res.status == 400) {
                    this.messageService.add({
                        severity: 'info',
                        detail: AppUtil.translate(
                            this.translateService,
                            `${res.message}`,
                        ),
                    });
                    return;
                }

                {
                    this.messageService.add({
                        severity: 'success',
                        detail: AppUtil.translate(
                            this.translateService,
                            `${this.selectedUser} đã hoàn thành hóa đơn`,
                        ),
                    });
                    this.billNotification.getNotificationMessage();
                    // this.closeBill(this.selectedBillTab.tabId);
                }
            });
    }

    onAddBillFromEmployee(newBill: any) {
        this.billTabs.unshift(newBill);
        this.setSelectedTab(newBill.tabId);
        this.activeTableOrGoods = 1;
    }

    onBillTypeChanged() {
        // this.billService
        //     .changeBillNumberByType(
        //         this.selectedBillTab?.data.id,
        //         this.billTypeSelected,
        //     )
        //     .subscribe((res) => {
        //         this.selectedBillTab.data.billNumber = res.billNumber;
        //         this.selectedBillTab.title = `Bill ${res.billNumber}`;
        //     });
        this.selectedBillTab.isPrintBill =
            this.billTypeSelected == BillType.HasBill;
        this.getLedgers();
    }

    async importByType({ event, importType }) {
        this.importType = importType;
        switch (this.importType) {
            case CashierImportType.CT1CT2Code:
                await this.importBill(event, 1);
                break;
            case CashierImportType.CT1CT2Name:
                await this.importBill(event, 2);
                break;
            case CashierImportType.HHCode:
                await this.importBill(event, 3);
                break;
            case CashierImportType.HHName:
                await this.importBill(event, 4);
                break;
            default:
                // TODO: Implement
                await this.importBill(event, 0);
                break;
        }
    }

    async importBill(event: any, type: number) {
        await this.getBillIdNewest();
        let deskLive = this.desks.find((x) => x.code === 'Live');
        let floorLive = this.floors.find((x) => x.code === 'Floor');
        let newBill = {
            isDefault: false,
            tabId: this.appUtil.makeRandomId(6),
            deskId: deskLive ? deskLive.id : 0,
            deskName: deskLive ? deskLive.name : '',
            floorId: floorLive ? floorLive.id : 0,
            floorName: floorLive ? floorLive.name : '',
            title: `Bill ${this.newestBillNumberModel.billNumber}`,
            data: {
                id: this.newestBillNumberModel.billOrder,
                isRealId: false,
                products: [],
                floorName: '',
                customerNumber: 1,
                customerId: !AppUtil.isEmpty(this.selectedCustomer)
                    ? this.selectedCustomer.id
                    : 0,
                customerName: !AppUtil.isEmpty(this.selectedCustomer)
                    ? `${this.selectedCustomer.code} | ${this.selectedCustomer.name}`
                    : '',
                customerNameOnly: !AppUtil.isEmpty(this.selectedCustomer)
                    ? `${this.selectedCustomer.name}`
                    : '',
                customerTaxCode: !AppUtil.isEmpty(this.selectedCustomer)
                    ? `${this.selectedCustomer.taxCode}`
                    : '',
                discountType: 'money',
                totalAmount: 0,
                discountPrice: 0,
                note: '',
                payPrice: 0,
                tabIndex: this.newestBillNumberModel.billOrder,
                typePay: PaymentType.Debt,
                billNumber: this.newestBillNumberModel.billNumber,
                type: this.billTypeSelected,
                isPrintBill: this.billTypeSelected == BillType.HasBill,
                debitCode: !AppUtil.isEmpty(this.selectedCustomer)
                    ? this.selectedCustomer?.credit?.code
                    : '',
                debitDetailCodeFirst: !AppUtil.isEmpty(this.selectedCustomer)
                    ? this.selectedCustomer?.creditDetailFirst?.code
                    : '',
                debitDetailCodeSecond: !AppUtil.isEmpty(this.selectedCustomer)
                    ? this.selectedCustomer?.creditDetailSecond?.code
                    : '',
                creditCode: !AppUtil.isEmpty(this.selectedCustomer)
                    ? this.selectedCustomer?.debit?.code
                    : '',
                creditDetailCodeFirst: !AppUtil.isEmpty(this.selectedCustomer)
                    ? this.selectedCustomer?.debitDetailFirst?.code
                    : '',
                creditDetailCodeSecond: !AppUtil.isEmpty(this.selectedCustomer)
                    ? this.selectedCustomer?.debitDetailSecond?.code
                    : '',
            },
        };
        this.billTabs.unshift(newBill);
        this.setSelectedTab(newBill.tabId);
        this.activeTableOrGoods = 1;

        const formData = new FormData();
        if (event.target?.files[0]) {
            formData.append('file', event.target?.files[0]);
        }

        this.billService.importBill(formData, type).subscribe((res) => {
            newBill.data.products = res;
            this.messageService.add({
                severity: 'success',
                detail: AppUtil.translate(
                    this.translateService,
                    'success.update',
                ),
            });
        });
    }

    openFile() {
        let fileUrl = 'BillCreator_Template.xlsx';
        window.open(
            `${environment.serverURL}/api/ReportDownload/download-file-template?fileName=${fileUrl}`,
        );
    }

    GetDataPrintLedger(billTab) {
        // call API
        this.billService
            .GetLedgerFromBillId(billTab.data.id)
            .subscribe((res: any) => {
                let data = res[0];
                this.dataPrint = {
                    ...data,
                    debitCode: data.debitCodeName,
                    creditCode: data.creditCodeName,
                };
                this.onPrintLedger();
            });
    }

    onPrintLedger() {
        this.isDisplayXuatKho_Ledger = true;
        this.typePrint = 'PX';
        setTimeout(() => {
            if (window) {
                let type = 'PX';
                const printContents = document.getElementById(type).innerHTML;
                const cssfile = PTCSSForArise;
                if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
                    const popup = window.open(
                        '',
                        '_blank',
                        'width=600,height=600,scrollbars=no,menubar=no,toolbar=no,' +
                            'location=no,status=no,titlebar=no',
                    );
                    popup.window.focus();
                    popup.document.write(
                        '<!DOCTYPE html><html><head>  ' +
                            `${cssfile} ` +
                            '</head><body onload="window.print()"><div class="reward-body">' +
                            printContents +
                            '</div></html>',
                    );
                    popup.onbeforeunload = () => {
                        popup.document.close();
                        return '.\n';
                    };
                    popup.onabort = () => {
                        popup.document.close();
                    };
                    popup.document.close();
                } else {
                    const popup = window.open(
                        '',
                        '_blank',
                        'width=800,height=600',
                    );
                    popup.document.open();
                    popup.document.write(
                        '<html><head>' +
                            ` ${cssfile} ` +
                            '</head><body onload="window.print()">' +
                            printContents +
                            '</html>',
                    );
                    popup.document.close();
                }
                this.isDisplayXuatKho_Ledger = false;
            }
        }, 1000);
    }

    onChangeDocument = (event: any) => {
        this.document = event.value;
        this.getLedgers();
    }

    onChangeMonth = () => {
        this.setOriginalVoucherNumber();
        this.getLedgers();
    }

    onChangeCurrentDate = (event: any) => {
        this.currentDate = event.target.value;
        this.setOriginalVoucherNumber()
    }

    editBill = (ledgeHistory: any) => {
        const ledgeId = ledgeHistory.id;
        this.ledgerService
            .getLedgerV2(
                ledgeId,
                BillTypeNumber[this.billTypeSelected],
            )
            .subscribe((ledgeInfo) => {
                this.customerBillId = this.ledgersWarehouse.find(item => item.orginalVoucherNumber === ledgeInfo.orginalVoucherNumber)?.customerId || null;
                this.customerBillName = this.goodsTable.getCustomerName(this.customerBillId);
                this.ledgerService.getLedgersDetailV3(ledgeId).subscribe((ledgeProduct) => {
                    if (ledgeProduct && ledgeProduct.status === 200) {
                        this.buildBillTab(ledgeInfo, ledgeProduct.data);
                        this.setOriginalVoucherNumber();
                        this.displayNotification = false;
                    }
                });
            })
    }

    buildBillTab = (ledgeInfo: any, ledgeProduct: any) => {
        let deskLive = this.desks.find((x) => x.code === 'Live');
        let floorLive = this.floors.find((x) => x.code === 'Floor');
        let newBill = {
            isDefault: false,
            tabId: this.appUtil.makeRandomId(6),
            deskId: deskLive ? deskLive.id : 0,
            deskName: deskLive ? deskLive.name : '',
            floorId: floorLive ? floorLive.id : 0,
            floorName: floorLive ? floorLive.name : '',
            title: ledgeInfo.orginalVoucherNumber,
            isPrintBill: this.billTypeSelected == BillType.HasBill,
            data: {
                id: this.newestBillNumberModel.billOrder,
                isRealId: false,
                products: [],
                floorName: '',
                customerNumber: 1,
                customerId: this.customerBillId || 0,
                customerName: this.customerBillName || '',
                customerNameOnly: ledgeInfo.customerNameOnly || '',
                customerTaxCode: ledgeInfo.customerTaxCode || '',
                discountType: ledgeInfo.discountType || '',
                totalAmount: ledgeInfo.totalAmount,
                discountPrice: ledgeInfo.discountPrice,
                note: ledgeInfo.note || '',
                payPrice: ledgeInfo.payPrice,
                tabIndex: ledgeInfo.tabIndex,
                typePay: PaymentType.Debt,
                billNumber: ledgeInfo.billNumber,
                type: ledgeInfo.type,
                vat: ledgeInfo.vat,
                vatAmount: ledgeInfo.vatAmount,
                // debitCode: ledgeInfo.debit || '',
                // debitDetailCodeFirst: ledgeInfo.debitDetailCodeFirst || '',
                // debitDetailCodeSecond: ledgeInfo.debitDetailCodeSecond || '',
                debitCode: ledgeInfo.debit
                        ? ledgeInfo.debit?.code
                        : '',
                debitDetailCodeFirst: ledgeInfo.debitDetailFirst
                    ? ledgeInfo.debitDetailFirst?.code
                    : '',
                debitDetailCodeSecond: ledgeInfo.debitDetailSecond
                    ? ledgeInfo.debitDetailSecond?.code
                    : '',
                invoiceNumber: ledgeProduct[0].invoiceNumber,
                invoiceName: ledgeProduct[0].invoiceName,
                invoiceTaxCode: ledgeProduct[0].invoiceTaxCode,
                invoiceCode: ledgeInfo.invoiceCode || '',
                taxCode: ledgeInfo.invoiceCode || '',
                invoiceAddress: ledgeProduct[0].invoiceAddress,
                invoiceSerial: ledgeProduct[0].invoiceSerial,
                invoiceProductItem: ledgeProduct[0].invoiceProductItem,
                depreciaMonth: Number(ledgeProduct[0]['depreciaMonth']) || 0,
                month: ledgeProduct[0].month,
                orginalDescription: ledgeProduct[0].orginalDescription,
                warehouseDesc: ledgeProduct[0].orginalDescription,
                orginalVoucherNumber: ledgeProduct[0].orginalVoucherNumber,
                voucherNumber: ledgeProduct[0].voucherNumber,
                percentImportTax: ledgeProduct[0].percentImportTax,
                percentTransport: ledgeProduct[0].percentTransport,
                tab: ledgeProduct[0].tab,
                invoiceAdditionalDeclarationCode: ledgeProduct[0].invoiceAdditionalDeclarationCode,
                bookDate: moment(
                    ledgeInfo.bookDate
                ).format(AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE),
                orginalBookDate: moment(
                    ledgeInfo.orginalBookDate
                ).format(AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE),
                referenceBookDate: moment(
                    ledgeInfo.referenceBookDate
                ).format(AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE),
                invoiceDate: ledgeInfo.invoiceDate ? moment(
                    ledgeInfo.invoiceDate
                ).format(AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE) : null
            },
        };

        this.document = this.documentList.find(item => item.code === ledgeInfo.type);
        this.filterMonth = ledgeInfo.month;
        this.oldNextStt = ledgeInfo.orginalVoucherNumber ? parseInt(ledgeInfo.orginalVoucherNumber.split('-')[2]) : 0;

        this.selectedBillTab.data.products = [];
        ledgeProduct.forEach(product => {
            if (!product.orginalDescription || !product.orginalDescription.includes('GTGT')) {
                this.onAddProductHistory(product);
            }
        })


        // newBill.data.products = this.selectedBillTab.data.products;
        newBill.data.products = Object.assign([], this.selectedBillTab.data.products)
        if (this.billTabs.length > 1)  {
            this.billTabs.shift();
        }
        this.billTabs.unshift(newBill);
        this.setSelectedTab(newBill.tabId);
        this.activeTableOrGoods = 1;

        const productVat = ledgeProduct.find(product => product.orginalDescription?.includes('GTGT'))
        if (productVat) {
            newBill.data.vat = this.taxRates.find(tax => tax.code === productVat.invoiceCode).percent
            newBill.data.vatAmount = productVat.amount;
            setTimeout(() => {
                this.appBillTable.vatAmountInput = newBill.data.vatAmount;
                this.appBillTable.billTaxCode = this.taxRates.find(tax => tax.code === productVat.invoiceCode).code
                this.appBillTable.taxRatesComponentBill.value = this.taxRates.find(tax => tax.code === productVat.invoiceCode)
            }, 0)
            this.isProductHistoryHasVat = true;
            this.productHistoryVatId = productVat.id;
        } else {
            this.isProductHistoryHasVat = false;
            this.productHistoryVatId = 0
        }
        this.goodsTable.selectedBillTab.data.customerName = this.customerBillName
    }

    getDebitDetail = (product: any) => {
        if (product.debitDetailSecond) {
            return product.debitDetailSecond;
        }

        return product.debitDetailFirst
    }
    onAddProductHistory(product) {
        //check exist in products
        this.checkSetSelectedBillTab();
        let products = this.selectedBillTab.data.products || [];

        product.billQuantity = product.quantity;
        product.billBox = 0;
        product.billNec = 0;
        product.discountPrice = 0;
        product.discountType = 'money';
        product.code = this.getDebitDetail(product).code;
        product.name = this.getDebitDetail(product).name;
        product.parentRef = this.getDebitDetail(product).parentRef;
        product.classification = this.getDebitDetail(product).classification;
        product.accGroup = this.getDebitDetail(product).accGroup;
        product.isForeignCurrency = this.getDebitDetail(product).isForeignCurrency;

        product.cashierRequest = {
            id: product.id,
            type: product.type,
            month: 0,
            voucherNumber: '',
            orginalAddress: '',
            orginalVoucherNumber: '',
            orginalBookDate: '',
            referenceVoucherNumber: '',
            referenceBookDate: '',
            referenceFullName: '',
            referenceAddress: '',
            isInternal: null,
            attachVoucher: '',
            invoiceCode: '',
            invoiceName: '',
            invoiceTaxCode: '',
            invoiceAddress: '',
            invoiceProductItem: '',
            invoiceAdditionalDeclarationCode: '',
            invoiceSerial: '',
            invoiceNumber: '',
            invoiceDate: '',
            debitCode: '',
            debitDetailCodeFirst: '',
            debitDetailCodeSecond: '',
            creditCode: '',
            creditDetailCodeFirst: '',
            creditDetailCodeSecond: '',
            debitWarehouse: '',
            creditWarehouse: '',
            orginalCompanyName: '',
            orginalDescription: '',
            projectCode: product.projectCode,
            depreciaMonth: product.depreciaMonth,
            orginalCurrency: product.orginalCurrency,
            exchangeRate: product.exchangeRate,
            quantity: product.quantity,
            unitPrice: product.unitPrice,
            amount: product.amount,
            tab: null,
            billBox: 1,
            billNec: 1,
            percentTransport: null,
            amountTransport: null,
            amountImportWarehouse: null,
            percentImportTax: null,
            bookDate: '',
        } as ICashierRequest
        this.selectedBillTab.data.products = [
            ...products,
            Object.assign({}, product),
        ];
    }

}

export enum CashierImportType {
    CT1CT2Code = 'CT1CT2Code',
    CT1CT2Name = 'CT1CT2Name',
    HHCode = 'HHCode',
    HHName = 'HHName',
}
