import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import {
    Bill,
    BillDetail,
    ChangeStatusResult,
    NotificationCountResult,
    NotificationResult,
    ProductModel,
} from 'src/app/models/cashier.model';
import { Goods } from 'src/app/models/goods.model';
import { RoomTable } from 'src/app/models/room-table.model';
import { BillDetailService } from 'src/app/service/bill-detail.service';
import { BillService } from 'src/app/service/bill.service';
import { CustomerService } from 'src/app/service/customer.service';
import { RoomTableService } from 'src/app/service/room-table.service';
import AppUtil from 'src/app/utilities/app-util';
import * as signalR from '@microsoft/signalr';
import { BillTableComponent } from '../components/bill-table/bill-table.component';
import { DeskTableComponent } from '../components/desk-table/desk-table.component';
import { RoomTableFormComponent } from '../setup-module/room-table/component/room-table-form/room-table-form.component';
import { environment } from 'src/environments/environment';
import { TypeData } from 'src/app/models/common.model';
import { AuthService } from 'src/app/service/auth.service';
import { StyleCustom } from './PTCSS';
import * as moment from 'moment';
import { CompanyService } from 'src/app/service/company.service';
import { AppMainComponent } from 'src/app/layouts/app.main.component';
import AppConstant from 'src/app/utilities/app-constants';
import { UserService } from 'src/app/service/user.service';
import { User } from 'src/app/models/user.model';
import { GoodsTableComponent } from '../components/goods-table/goods-table.component';
import { SurchargesService } from 'src/app/service/surcharge.service';
import { TillService } from '../../../service/till.service';
import { TillFormComponent } from '../till/till-form/till-form.component';
import { NewestBillNumberModel } from '../../../models/newest-bill-number';
import { LedgerWarehousesService } from '../../../service/ledger-warehouses.service';
import { PaymentType } from '../../../utilities/app-enum';
import { ImportStockDetailComponent } from './components/import-stock-detail/import-stock-detail.component';
@Component({
    selector: 'app-import-stock',
    templateUrl: './import-stock.component.html',
    styleUrls: ['./import-stock.component.scss'],
})
export class ImportStockComponent implements OnInit {
    appUtil = AppUtil;
    @ViewChild('appBillTable') appBillTable: ImportStockDetailComponent;
    @ViewChild('goodsTable') goodsTable: GoodsTableComponent;

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

    billTypeSelected: string = 'HĐ';

    billTypes: any[] = [
        {
            code: 'HĐ',
            name: 'Có hóa đơn',
        },
        {
            code: 'KHĐ',
            name: 'Không hóa đơn',
        },
    ];

    mergeBillTab: any = {};

    newestBillNumberModel: NewestBillNumberModel = {
        billNumber: '',
        billOrder: 1,
    };
    customers: any[] = [];

    displayDiscountPrice: boolean = false;
    displayNotification: boolean = false;

    // notification params
    notification: NotificationCountResult;
    messages: Array<NotificationResult> = [];
    existedNumMessage = 0;
    isVisibleNotification = false;
    fullWidth = false;
    isPayment: boolean = false;
    private hubConnection: signalR.HubConnection;
    typeSave: string = '';
    typePrint: string = '';

    moneys: any[] = [];

    authUser: any = {};

    company: any = {};

    isOnShift: boolean = false;
    isShowOnShiftDialog: boolean = false;
    currentTill: any = {};

    @ViewChild('tillForm') tillsForm: TillFormComponent | undefined;

    constructor(
        public appMain: AppMainComponent,
        private roomTableService: RoomTableService,
        private surchargesService: SurchargesService,
        private customerService: CustomerService,
        private messageService: MessageService,
        private translateService: TranslateService,
        private billService: BillService,
        private billDetailService: BillDetailService,
        private ledgerWarehousesService: LedgerWarehousesService,
        private authService: AuthService,
        private companyService: CompanyService,
        private userService: UserService,
        private tillService: TillService,
    ) {}

    ngOnInit() {
        this.authUser = this.authService.user;
        this.getLastSurcharge();
        this.getAllUserActive();
        this.getLastInfo();
        this.getFloors();
        this.getChartOfAccounts();
        this.initNotificationRealtime();
        this.resetMoneys();
        this.getCurrentTill();
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
            this.isOnShift = this.currentTill != null;
        });
    }

    startOnShift() {
        this.tillService.startOfShift({}).subscribe((res) => {
            this.isOnShift = true;
            this.currentTill = res.data;
            this.messageService.add({
                severity: 'success',
                detail: AppUtil.translate(
                    this.translateService,
                    'Bắt đầu vào ca',
                ),
            });
        });
    }

    endOfShift() {
        this.tillsForm.getDetail(this.currentTill.id);
        this.tillsForm.setFinishStatus(true);
        this.isShowOnShiftDialog = true;
    }

    onEndOfShiftSuccess() {
        this.isOnShift = false;
        this.isShowOnShiftDialog = false;
        this.messageService.add({
            severity: 'success',
            detail: AppUtil.translate(
                this.translateService,
                'Kết thúc ca thành công',
            ),
        });
    }

    initNotificationRealtime() {
        this.getNotificationCount();
        this.hubConnection = new signalR.HubConnectionBuilder()
            .configureLogging(signalR.LogLevel.Information)
            .withUrl(`${environment.serverURL}/notify`, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets,
            })
            // .withHubProtocol(new signalRMsgPack.MessagePackHubProtocol())
            .build();

        this.hubConnection
            .start()
            .then(() => {
                console.log('SignalR Connected!');
                this.getNotificationCount();
                this.getNotificationMessage();
            })
            .catch((err) => console.error(err.toString()));

        this.hubConnection.on('BroadcastMessage', () => {
            this.getNotificationCount();
            this.getNotificationMessage();
        });
        this.hubConnection.on('ReceiveMessage', (data: any) => {
            console.log('SignalR receive message ', data);
        });
    }

    getNotificationCount() {
        this.billService.getNotificationCount().subscribe((notification) => {
            this.notification = notification;
        });
    }

    getNotificationMessage() {
        this.billService.getNotificationMessage().subscribe((messages) => {
            if (messages.length === 0) {
                this.displayNotification = false;
                return;
            }
            this.reloadMessCount(messages);
            this.getNotificationCount();
        });
    }

    getNotificationBillId(billId: any) {
        const realBill = (this.messages ?? []).find((x) => x.billId === billId);
        return realBill ? 'LBill ' + realBill.displayOrder + ' - ' : '';
    }

    reloadMessCount(messages?: NotificationResult[]) {
        if (messages && messages.length > 0) {
            this.messages = messages.filter(
                (x) =>
                    !this.billTabs
                        .map((x) => x.data)
                        .map((x) => x.id)
                        .includes(x.billId),
            );
            this.existedNumMessage = this.messages.length;
        }
    }

    deleteNotifications(): void {
        if (confirm(`Are you sure want to delete all notifications?`)) {
            this.billService.deleteNotifications().subscribe(() => {
                this.getNotificationMessage();
            });
        }
    }

    deleteNotification(message: NotificationResult) {
        this.billService.deleteNotification(message.id).subscribe(() => {
            this.getNotificationMessage();
        });
    }

    @ViewChild('roomTableForm') roomTableForm: RoomTableFormComponent;
    display: boolean = false;

    onAddRoomTable() {
        this.roomTableForm.onReset();
        this.display = true;
    }

    @ViewChild('appDeskTable') appDeskTable: DeskTableComponent;
    floors: RoomTable[];
    desks: RoomTable[];
    desksTemp: RoomTable[];
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
            this.appDeskTable.onChangeFloorTab({ index: 0 });
        });
    }

    getChartOfAccounts() {
        let typeSupplier = 1;
        this.customerService
            .getAllCustomer('', typeSupplier)
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

    selectedCustomer: any = {};
    onChangeCustomer(event) {
        if (!event) {
            this.goodsTable.getGoods();
            return;
        }
        if (this.appBillTable) {
            this.appBillTable.onChangeCustomer(event);
        } else {
            this.selectedCustomer = event;
            this.setUserSelected(event?.userCreated);
        }
    }

    setUserSelected(userId) {
        if (userId == null || userId == undefined) {
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
        if (
            this.desks &&
            this.desks.length === 1 &&
            this.floors &&
            this.floors.length === 1 &&
            this.billTabs.length === 1
        ) {
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
                    typePay: 'CN',
                    billNumber: this.newestBillNumberModel.billNumber,
                    type: this.billTypeSelected,
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
        this.onAddProduct(event);
    }

    onAddProduct(product) {
        //check exist in products
        this.checkSetSelectedBillTab();
        let products = this.selectedBillTab.data.products;
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
        product.discountPrice = 0;
        product.discountType = 'money';
        this.selectedBillTab.data.products = [
            ...products,
            Object.assign({}, product),
        ];
    }

    closeBill(tabId) {
        this.billTabs = this.billTabs.filter((x) => x.tabId !== tabId);
        this.setSelectedTab(this.billTabs[0].tabId);
        this.activeTableOrGoods = 0;
    }

    onChangeTab(event) {
        this.setSelectedTab(this.billTabs[event.index].tabId);
    }

    displaySplitMerge: boolean = false;
    mergeGoods: any[] = [];
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

    onHideSplitMerge() {
        this.mergeBillTab = {};
        this.mergeGoods = [];
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

    surchargeData: any = {};
    getLastSurcharge(loadBill?) {
        this.surchargesService.getLastSurcharge().subscribe((res: any) => {
            this.surchargeData = res;
            if (loadBill) {
                this.selectedBillTab.data.discountType = 'money';
                this.selectedBillTab.data.amountReceivedByCus =
                    this.getDiscountBillMoney();
            }
        });
    }

    async onShowPayment(event, isPayment, typeSave, typePrint: string = '') {
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
        this.doSendBill(isPayment);
    }

    private saveBill(bill: Bill, isPayment) {
        this.onSaveBillDetail({
            typePay: bill.typePay,
            customerId: bill.customerId,
            isPrintBill: this.billTypeSelected == 'HĐ',
        });
    }

    doSendBill(isPayment: boolean = false) {
        let billReq = this.getBillReq(isPayment);
        if (
            isPayment &&
            this.selectedBillTab.data &&
            this.selectedBillTab.data.isRealId
        ) {
            this.onCompleteBill();
            return;
        }
        this.saveBill(billReq, isPayment);
    }

    onSaveBillDetail(requestParams: any) {
        const payload: BillDetail[] = [];
        this.selectedBillTab.data.products.forEach((product) => {
            const billDetail: BillDetail = {
                id: 0,
                billId: 0,
                goodsId: product.goodsId ? product.goodsId : product.id,
                quantity: product.billQuantity,
                unitPrice: product.salePrice,
                discountPrice: product.discountPrice,
                discountType: product.discountType,
                taxVat: product.taxVat,
                note: product.note,
            };
            payload.push(billDetail);
        });

        this.createBillDetail(requestParams, payload);
    }

    private createBillDetail(requestParams: any, payload: BillDetail[]) {
        this.ledgerWarehousesService
            .create(requestParams, payload)
            .subscribe(async (res: any) => {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.create',
                    ),
                });
                // this.getNotificationCount();
                // if (this.isPayment || (this.typeSave === 'saveTemp' && this.typePrint === 'XK')) {
                //     this.appBillTable.onPrintXuatKho();
                // }
                // if (this.typeSave === 'saveTemp' && this.typePrint === 'XD') {
                //     this.onPrint(this.selectedBillTab);
                // }
                setTimeout(() => {
                    // this.closeBill(this.selectedBillTabId);
                }, 1000);
                // await this.getBillIdNewest();
                this.goodsTable.getGoods(null, true);
            });
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

    users: User[] = [];
    selectedUser: string = '';
    getAllUserActive() {
        this.userService.getAllUserActive().subscribe((res: any) => {
            this.users = res.data;
        });
        this.selectedUser = this.authUser.username;
    }

    getBillReq(isPayment: boolean) {
        return {
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
            amountReceivedByCus: this.selectedBillTab.data.amountReceivedByCus,
            amountSendToCus:
                this.selectedBillTab.data.amountReceivedByCus -
                    this.getDiscountBillMoney() || 0,
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
        };
    }

    addBillFromEmployee(msg: NotificationResult) {
        this.billService.getBillDetail(msg.billId).subscribe((res: any) => {
            if (res && res.data) {
                this.addBillFromNotification(res.data, msg);
                this.displayNotification = false;
            }
        });
    }

    addBillFromNotification(bill: Bill, msg: NotificationResult) {
        const newProducts: any[] = [];
        this.billDetailService
            .getBillDetails(bill.id)
            .subscribe((res: TypeData<BillDetail>) => {
                res.data.forEach((data: any) => {
                    newProducts.push({
                        id: data.id,
                        billId: data.billId,
                        goodsId: data.goodsId,
                        goodsName: data.goodsName,
                        goodsCode: data.goodsCode,
                        wareHouseName: data.wareHouseName,
                        billQuantity: data.quantity,
                        salePrice: data.unitPrice,
                        discountType: data.discountType,
                        taxVat: data.taxVat,
                        discountPrice: data.discountPrice,
                        note: data.note,
                        image1: data.image1,
                    });
                });
                let deskLive = this.desks.find((x) => x.id === bill.deskId);
                let floorLive = this.floors.find((x) => x.id === bill.floorId);
                let customer = this.getCustomer(bill.customerId);
                let newBill = {
                    isDefault: false,
                    msgId: msg.id,
                    tabId: this.appUtil.makeRandomId(6),
                    deskId: deskLive ? deskLive.id : 0,
                    deskName: deskLive ? deskLive.name : '',
                    floorId: floorLive ? floorLive.id : 0,
                    floorName: floorLive ? floorLive.name : '',
                    title: `Bill ${bill.billNumber || bill.displayOrder}`,
                    isPrintBill: bill.isPrintBill,
                    isPriority: bill.isPriority,
                    data: {
                        id: bill.id,
                        isRealId: true,
                        products: newProducts,
                        customerNumber: bill.quantityCustomer,
                        customerId: bill.customerId,
                        customerName: bill.customerName,
                        debitCode: customer ? customer.debit?.code : '',
                        debitDetailCodeFirst: customer
                            ? customer.debitDetailFirst?.code
                            : '',
                        debitDetailCodeSecond: customer
                            ? customer.debitDetailSecond?.code
                            : '',
                        discountType: bill.discountType,
                        totalAmount: bill.totalAmount,
                        discountPrice: bill.discountPrice,
                        note: bill.note,
                        status: bill.status,
                        typePay: bill.typePay,
                        createdDate: bill.createdDate,
                        billNumber: bill.billNumber,
                        type: bill.type,
                    },
                };
                this.billTabs.unshift(newBill);
                this.setSelectedTab(newBill.tabId);
                this.activeTableOrGoods = 1;
                if (this.appBillTable) {
                    this.appBillTable.reloadTotalAmount();
                }
                this.getNotificationMessage();
            });
    }

    getCustomer(customerId) {
        return this.customers.find((x) => x.id === customerId);
    }

    receivedBill(message: NotificationResult) {
        this.billService
            .receivedBill(message.billId, this.authUser.id)
            .subscribe((res: any) => {
                if (res && res.data) {
                    this.messageService.add({
                        severity: 'success',
                        detail: AppUtil.translate(
                            this.translateService,
                            `${this.selectedUser} đã nhận món từ bếp`,
                        ),
                    });
                    this.getNotificationMessage();
                }
            });
    }

    onChangeMergeFloors(floorId) {
        this.desksTemp = this.desks.filter((x) => x.floorId === floorId);
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
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        `${this.selectedUser} đã hoàn thành hóa đơn`,
                    ),
                });
                this.getNotificationMessage();
                // this.closeBill(this.selectedBillTab.tabId);
            });
    }

    getDiscountBillMoney() {
        let totalPrice = 0;
        if (this.selectedBillTab.data.discountType === 'percent') {
            totalPrice =
                this.selectedBillTab.data.totalAmount -
                (this.selectedBillTab.data.totalAmount / 100) *
                    this.selectedBillTab.data.discountPrice;
        } else {
            totalPrice =
                this.selectedBillTab.data.totalAmount -
                this.selectedBillTab.data.discountPrice;
        }

        if (this.surchargeData && this.surchargeData.value > 0) {
            totalPrice =
                this.surchargeData.type === 'percent'
                    ? totalPrice + (totalPrice * this.surchargeData.value) / 100
                    : totalPrice + this.surchargeData.value;
        }
        return totalPrice;
    }

    formatMoney(n) {
        if (n)
            return n
                .toFixed(2)
                .replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
                .replace('.00', '');
        return 0;
    }

    getDiscountMoney(product: ProductModel, discountTemp: number) {
        if (product.discountType === 'percent') {
            return (
                product.salePrice +
                product.taxVat -
                (product.salePrice / 100) * discountTemp
            );
        }
        return product.salePrice + product.taxVat - discountTemp;
    }

    onPrint(billTab) {
        setTimeout(() => {
            const cssFile = StyleCustom;
            if (window) {
                let products = '';
                const dateNow = moment().format('DD/MM/YYYY hh:mm:ss');
                let i = 0;
                billTab.data.products.forEach((product) => {
                    i = i + 1;
                    products +=
                        '    \t\t\t\t\t\t\t<tr>\n' +
                        "    \t\t\t\t\t\t\t\t<td colspan = '3'>" +
                        i +
                        '. ' +
                        this.getAccountCode(product) +
                        ' - ' +
                        this.getAccountName(product) +
                        '</td>\n' +
                        '    \t\t\t\t\t\t\t</tr>\n' +
                        '    \t\t\t\t\t\t\t<tr>\n' +
                        "    \t\t\t\t\t\t\t\t<td style='text-align: right;'>" +
                        product.billQuantity +
                        ' x ' +
                        ' </td>\n' +
                        "    \t\t\t\t\t\t\t\t<td style='text-align: right;'>" +
                        this.formatMoney(
                            this.getDiscountMoney(
                                product,
                                product.discountPrice,
                            ),
                        ) +
                        ' = ' +
                        ' </td>\n' +
                        "    \t\t\t\t\t\t\t\t<td style='text-align: right;'>" +
                        this.formatMoney(
                            product.billQuantity *
                                this.getDiscountMoney(
                                    product,
                                    product.discountPrice,
                                ),
                        ) +
                        ' </td>\n' +
                        '    \t\t\t\t\t\t\t</tr>\n' +
                        '    \t\t\t\t\t\t\t<tr>\n' +
                        // "    \t\t\t\t\t\t\t\t<td style='text-align: right;'>" + this.formatMoney(product.realPrice) + "đ</td>\n" +

                        // "    \t\t\t\t\t\t\t\t<td style='text-align: right;'>" + this.formatMoney(product.discountPrice) + ((product.discountType === 'percent') ? '%' : 'đ') +  "</td>\n" +
                        // "    \t\t\t\t\t\t\t\t<td style='text-align: right;'>" + this.formatMoney(product.quantity * product.unitPrice) + "đ</td>\n" +
                        '    \t\t\t\t\t\t\t</tr>\n' +
                        '                                <tr>\n';
                    if (product.discountPrice > 0) {
                        products +=
                            '    \t\t\t\t\t\t\t<tr>\n' +
                            "    \t\t\t\t\t\t\t\t<td style='text-align: left;' colspan = '2'> KM </td>\n" +
                            "    \t\t\t\t\t\t\t\t<td style='text-align: right;'> " +
                            this.formatMoney(product.discountPrice) +
                            (product.discountType === 'percent' ? '%' : 'đ') +
                            '</td>\n' +
                            '    \t\t\t\t\t\t\t</tr>\n';
                    }
                });
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
                            `${cssFile} ` +
                            '</head><body onload="window.print()"><div class="reward-body">' +
                            '<div class="container">\n' +
                            '    <div class="row">\n' +
                            '        <div class="col-xs-12">\n' +
                            '    \t\t<div class="invoice-title">\n' +
                            "    \t\t\t<div style='text-align: center;'><p style='font-size: 24px; padding: 2px;'><strong>" +
                            this.company.name +
                            '</strong></p></div>\n' +
                            "    \t\t\t<div style='text-align: center;'><p style='font-size: 20px; padding: 2px;'><strong>Hóa đơn thanh toán</strong></p></div>\n" +
                            "    \t\t\t<div style='text-align: right;'><p style='font-size: 16px;'>Số phiếu: " +
                            billTab.data.id +
                            '</p></div>\n' +
                            '    \t\t</div>\n' +
                            '    \t\t<hr>\n' +
                            "    \t\t\t<div style='text-align: center;'><p style='font-size: 16px; padding: 2px;'><strong>Pass Wifi: " +
                            this.appUtil.getStorage(AppConstant.WIFI) +
                            '</strong></p></div>\n' +
                            '    \t\t<div class="row">\n' +
                            '    \t\t\t<div class="col-xs-6">\n' +
                            '    \t\t\t\t<address>\n' +
                            '    \t\t\t\tTên bàn: <span>' +
                            billTab.floorName +
                            '<span></span> / <span>' +
                            billTab.deskName +
                            '</span>' +
                            ' <br />\n' +
                            '    \t\t\tTên KH: <span>' +
                            this.getCustomerName(billTab.data.customerId) +
                            '</span><br />\n' +
                            '    \t\t\tSL: <span>' +
                            billTab.data.customerNumber +
                            '</span>KH<br />\n' +
                            "    \t\t\t<span style='font-size: 12px;'>" +
                            dateNow +
                            '</span><br />\n' +
                            '    \t\t</div>\n' +
                            '    \t</div>\n' +
                            '    </div>\n' +
                            '    \n' +
                            '    <div class="row">\n' +
                            '    \t<div class="col-md-12">\n' +
                            '    \t\t<div class="panel panel-default">\n' +
                            '    \t\t\t<div class="panel-heading">\n' +
                            '    \t\t\t\t<h4 class="panel-title">Chi tiết biên nhận</h4>\n' +
                            '    \t\t\t<div class="panel-body">\n' +
                            '    \t\t\t\t<div class="table-responsive">' +
                            '    \t\t\t\t\t<table class="table table-condensed">' +
                            '    \t\t\t\t\t\t<tbody>\n' +
                            '    \t\t\t\t\t\t\t<!-- foreach ($order->lineItems as $line) or some such thing here -->\n' +
                            products +
                            '    \t\t\t\t\t\t</tbody>\n' +
                            '    \t\t\t\t\t</table>\n' +
                            '    \t\t\t\t</div>\n' +
                            '    \t\t\t</div>\n' +
                            '    \t\t</div>\n' +
                            '    \t\t\t\tGiảm trên tổng hóa đơn: <span>' +
                            this.formatMoney(
                                this.selectedBillTab.data.discountPrice,
                            ) +
                            (this.selectedBillTab.data.discountType ===
                            'percent'
                                ? '%'
                                : 'đ') +
                            '.</span>' +
                            ' <br />\n' +
                            '    \t\t\t\tTổng tiền: <span>' +
                            this.formatMoney(
                                this.selectedBillTab.data.totalAmount,
                            ) +
                            'đ.</span>' +
                            ' <br />\n' +
                            '    \t\t\t\tBằng chữ: <span>' +
                            this.appUtil.formatCurrencyVNDString(
                                this.selectedBillTab.data.totalAmount,
                            ) +
                            '</span>' +
                            ' <br />\n' +
                            '    \t\t\t\tSố tiền khách đưa: <span>' +
                            this.formatMoney(
                                this.selectedBillTab.data.amountReceivedByCus,
                            ) +
                            'đ.</span>' +
                            ' <br />\n' +
                            '    \t\t\t\tSố tiền trả lại khách: <span>' +
                            this.formatMoney(
                                this.selectedBillTab.data.amountReceivedByCus -
                                    this.getDiscountBillMoney() || 0,
                            ) +
                            'đ.</span>' +
                            ' <br />\n' +
                            '    \t\t\t\tGhi chú: <span>' +
                            (this.selectedBillTab.data.note || '') +
                            '.</span>' +
                            ' <br /><br /><br /><br />\n' +
                            '    \t\t<hr>\n' +
                            "    \t\t\t<div style='text-align: center;'><p style='font-size: 16px; padding: 2px;'>Cảm ơn Quý khách và hẹn gặp lại!!!</p></div><br />\n" +
                            "<div style='page-break-before:always'></div>" +
                            '    \t</div>\n' +
                            '    </div>\n' +
                            '</div>' +
                            '</div></html>',
                    );
                    popup.onbeforeunload = (event) => {
                        popup.document.close();
                        // this.dataPrint = null;
                        return '.\n';
                    };
                    popup.onabort = (event) => {
                        popup.document.close();
                        // this.dataPrint = null;
                    };
                    popup.document.close();
                    // this.dataPrint = null;
                } else {
                    const popup = window.open(
                        '',
                        '_blank',
                        'width=800,height=600',
                    );
                    popup.document.open();
                    popup.document.write(
                        '<!DOCTYPE html><html><head>  ' +
                            `${cssFile} ` +
                            '</head><body onload="window.print()"><div class="reward-body">' +
                            '<div class="container">\n' +
                            '    <div class="row">\n' +
                            '        <div class="col-xs-12">\n' +
                            '    \t\t<div class="invoice-title">\n' +
                            "    \t\t\t<div style='text-align: center;'><p style='font-size: 24px; padding: 2px;'><strong>" +
                            this.company.name +
                            '</strong></p></div>\n' +
                            "    \t\t\t<div style='text-align: center;'><p style='font-size: 20px; padding: 2px;'><strong>Hóa đơn thanh toán</strong></p></div>\n" +
                            "    \t\t\t<div style='text-align: right;'><p style='font-size: 16px;'>Số phiếu: " +
                            billTab.data.id +
                            '</p></div>\n' +
                            '    \t\t</div>\n' +
                            '    \t\t<hr>\n' +
                            "    \t\t\t<div style='text-align: center;'><p style='font-size: 16px; padding: 2px;'><strong>Pass Wifi: " +
                            this.appUtil.getStorage(AppConstant.WIFI) +
                            '</strong></p></div>\n' +
                            '    \t\t<div class="row">\n' +
                            '    \t\t\t<div class="col-xs-6">\n' +
                            '    \t\t\t\t<address>\n' +
                            '    \t\t\t\tTên bàn: <span>' +
                            billTab.floorName +
                            '<span></span> / <span>' +
                            billTab.deskName +
                            '</span>' +
                            ' <br />\n' +
                            '    \t\t\tTên KH: <span>' +
                            this.getCustomerName(billTab.data.customerId) +
                            '</span><br />\n' +
                            '    \t\t\tSL: <span>' +
                            billTab.data.customerNumber +
                            '</span>KH<br />\n' +
                            "    \t\t\t<span style='font-size: 12px;'>" +
                            dateNow +
                            '</span><br />\n' +
                            '    \t\t</div>\n' +
                            '    \t</div>\n' +
                            '    </div>\n' +
                            '    \n' +
                            '    <div class="row">\n' +
                            '    \t<div class="col-md-12">\n' +
                            '    \t\t<div class="panel panel-default">\n' +
                            '    \t\t\t<div class="panel-heading">\n' +
                            '    \t\t\t\t<h4 class="panel-title">Chi tiết biên nhận</h4>\n' +
                            '    \t\t\t<div class="panel-body">\n' +
                            '    \t\t\t\t<div class="table-responsive">' +
                            '    \t\t\t\t\t<table class="table table-condensed">' +
                            '    \t\t\t\t\t\t<tbody>\n' +
                            '    \t\t\t\t\t\t\t<!-- foreach ($order->lineItems as $line) or some such thing here -->\n' +
                            products +
                            '    \t\t\t\t\t\t</tbody>\n' +
                            '    \t\t\t\t\t</table>\n' +
                            '    \t\t\t\t</div>\n' +
                            '    \t\t\t</div>\n' +
                            '    \t\t</div>\n' +
                            '    \t\t\t\tGiảm trên tổng hóa đơn: <span>' +
                            this.formatMoney(
                                this.selectedBillTab.data.discountPrice,
                            ) +
                            (this.selectedBillTab.data.discountType ===
                            'percent'
                                ? '%'
                                : 'đ') +
                            '.</span>' +
                            ' <br />\n' +
                            '    \t\t\t\tTổng tiền: <span>' +
                            this.formatMoney(
                                this.selectedBillTab.data.totalAmount,
                            ) +
                            'đ.</span>' +
                            ' <br />\n' +
                            '    \t\t\t\tBằng chữ: <span>' +
                            this.appUtil.formatCurrencyVNDString(
                                this.selectedBillTab.data.totalAmount,
                            ) +
                            '</span>' +
                            ' <br />\n' +
                            '    \t\t\t\tSố tiền khách đưa: <span>' +
                            this.formatMoney(
                                this.selectedBillTab.data.amountReceivedByCus,
                            ) +
                            'đ.</span>' +
                            ' <br />\n' +
                            '    \t\t\t\tSố tiền trả lại khách: <span>' +
                            (this.selectedBillTab.data.amountReceivedByCus -
                                this.getDiscountBillMoney() || 0) +
                            'đ.</span>' +
                            ' <br />\n' +
                            '    \t\t\t\tGhi chú: <span>' +
                            (this.selectedBillTab.data.note || '') +
                            '.</span>' +
                            ' <br /><br /><br /><br />\n' +
                            '    \t\t<hr>\n' +
                            "    \t\t\t<div style='text-align: center;'><p style='font-size: 16px; padding: 2px;'>Cảm ơn Quý khách và hẹn gặp lại!!!</p></div><br />\n" +
                            "<div style='page-break-before:always'></div>" +
                            '    \t</div>\n' +
                            '    </div>\n' +
                            '</div>' +
                            '</div></html>',
                    );
                    popup.onbeforeunload = (event) => {
                        popup.document.close();
                        // this.dataPrint = null;
                        return '.\n';
                    };
                    popup.onabort = (event) => {
                        popup.document.close();
                        // this.dataPrint = null;
                    };
                    popup.document.close();
                    // this.dataPrint = null;
                }
            }
        }, 1000);
    }
    cancelBill(message: NotificationResult) {
        this.billService
            .cancelBill(message.billId, this.authUser.id)
            .subscribe((res: any) => {
                if (res && res.data) {
                    this.messageService.add({
                        severity: 'success',
                        detail: AppUtil.translate(
                            this.translateService,
                            `${this.selectedUser} đã nhận món từ bếp`,
                        ),
                    });
                    this.getNotificationMessage();
                }
            });
    }
}
