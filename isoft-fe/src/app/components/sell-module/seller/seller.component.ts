import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import {
    Bill,
    BillDetail,
    NotificationCountResult,
    NotificationResult,
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
import { AuthService } from 'src/app/service/auth.service';
@Component({
    selector: 'app-seller',
    templateUrl: './seller.component.html',
    styles: [
        `
            :host ::ng-deep {
                .p-dropdown {
                    min-height: 40px;
                    min-width: 150px;
                }

                .p-dialog .p-dialog-content {
                    padding: 2rem 1.5rem 0.5rem 1.5rem;
                }

                .card-table {
                    min-height: 80vh !important;
                }

                .p-paginator {
                    padding: 0 !important;
                }

                .p-orderlist .p-orderlist-header,
                .p-orderlist .p-orderlist-filter-container {
                    display: none;
                }

                .p-tabview .p-tabview-panels {
                    padding: 0;
                }

                #tabBills .p-tabview .p-tabview-nav .p-tabview-ink-bar {
                    display: none;
                }

                #tabBills .p-tabview .p-tabview-nav li .p-tabview-nav-link {
                    padding: 0.95rem;
                    border-right: 1px solid #dee2e6;
                    border-top-right-radius: 0;
                }

                #tabBills
                    .p-tabview
                    .p-tabview-nav
                    li.p-highlight
                    .p-tabview-nav-link {
                    border-color: #dee2e6;
                }

                #tabBills .p-tabview .p-tabview-nav-btn.p-link {
                    border-bottom: 1px solid #dee2e6;
                }
            }
        `,
    ],
})
export class SellerComponent implements OnInit {
    appUtil = AppUtil;
    @ViewChild('appBillTable') appBillTable: BillTableComponent;
    @ViewChild('roomTableForm') roomTableForm: RoomTableFormComponent;
    @ViewChild('appDeskTable') appDeskTable: DeskTableComponent;

    display: boolean = false;
    floors: RoomTable[];
    desks: RoomTable[];
    activeTableOrGoods: number = 0;
    selectedBillTabId = '';
    floorTabs: any[] = [];
    billTabs: any[] = [];
    mergeBillTab: any = {};
    billIdIdentity = 0;
    customers: any[] = [];
    displayDiscountPrice: boolean = false;
    displayNotification: boolean = false;
    notification: NotificationCountResult;
    messages: Array<NotificationResult> = [];
    existedNumMessage = 0;
    hubConnection: signalR.HubConnection;
    authUser: any = {};
    displaySplitMerge: boolean = false;
    mergeGoods: any[] = [];

    constructor(
        private roomTableService: RoomTableService,
        private customerService: CustomerService,
        private messageService: MessageService,
        private translateService: TranslateService,
        private billService: BillService,
        private billDetailService: BillDetailService,
        private authService: AuthService,
    ) {}

    ngOnInit() {
        this.authUser = this.authService.user;
        this.getFloors();
        this.getChartOfAccounts();
        this.initNotificationRealtime();
        this.getBillIdNewest();
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
        });
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
        this.customerService.getAllCustomer().subscribe((res: any) => {
            this.customers = res.data;
        });
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
            title: `Bill ${this.billIdIdentity}`,
            data: {
                id: this.billIdIdentity,
                isRealId: false,
                products: [],
                deskId: roomTable.id,
                floorName: '',
                customerNumber: 1,
                customerId: '',
                customerName: '',
                discountType: 'money',
                totalPrice: 0,
                discountPrice: 0,
                note: '',
                payPrice: 0,
                tabIndex: this.billIdIdentity,
                isSendToCashier: false,
                isSendToChef: false,
                isCooking: false,
                isCooked: false,
                isPaid: false,
                typePay: 'TM',
            },
        };
        this.billTabs.unshift(newBill);
        this.setSelectedTab(newBill.tabId);
        this.activeTableOrGoods = 1;
    }

    addProduct(event) {
        if (
            this.desks &&
            this.desks.length === 1 &&
            this.floors &&
            this.floors.length === 1 &&
            this.billTabs.length === 0
        ) {
            let newBill = {
                isDefault: false,
                tabId: this.appUtil.makeRandomId(6),
                deskId: this.desks.find((x) => x.code === 'Live').id,
                deskName: this.desks.find((x) => x.code === 'Live').name,
                floorId: this.floors.find((x) => x.code === 'Floor').id,
                floorName: this.floors.find((x) => x.code === 'Floor').name,
                title: `Bill ${this.billIdIdentity}`,
                data: {
                    id: this.billIdIdentity,
                    isRealId: false,
                    products: [],
                    floorName: '',
                    customerNumber: 1,
                    customerId: '',
                    customerName: '',
                    discountType: 'money',
                    totalPrice: 0,
                    discountPrice: 0,
                    note: '',
                    payPrice: 0,
                    tabIndex: this.billIdIdentity,
                    isSendToCashier: false,
                    isSendToChef: false,
                    isCooking: false,
                    isCooked: false,
                    isPaid: false,
                    typePay: 'TM',
                },
            };
            this.billTabs.unshift(newBill);
            this.setSelectedTab(newBill.tabId);
            this.activeTableOrGoods = 1;
        }
        // if(this.appBillTable) {
        this.onAddProduct(event);
        // }
    }

    onAddProduct(product) {
        //check exist in products
        let products = this.billTabs.find(
            (x) => x.tabId === this.selectedBillTabId,
        ).data.products;
        // check exist in has bill
        let productTemp =
            products.find((x) =>
                x.goodsId ? x.goodsId === product.id : x.id === product.id,
            ) || {};
        console.log(productTemp);
        if (!this.appUtil.isEmpty(productTemp)) {
            // this.messageService.add({
            //     severity: 'info', detail: AppUtil.translate(this.translateService, 'Hàng hóa đã tồn tại'),
            // });
            return;
        }
        product.billQuantity = 1;
        product.discountPrice = 0;
        product.discountType = 'money';
        this.billTabs.find(
            (x) => x.tabId === this.selectedBillTabId,
        ).data.products = [...products, Object.assign({}, product)];
    }

    async closeBill(tabId) {
        this.billTabs = this.billTabs.filter((x) => x.tabId !== tabId);
        this.setSelectedTab(this.billTabs[0].tabId);
        this.activeTableOrGoods = 0;
        await this.getBillIdNewest();
    }

    async getBillIdNewest() {
        let res = await this.billService.getBillIdNewestByType('KHĐ');
        this.billIdIdentity = res.billOrder;
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

    setSelectedTab(tabId) {
        this.selectedBillTabId = tabId;
    }

    onSendToCashier(event) {
        this.doSendBill(false, false);
        this.displayDiscountPrice = true;
    }

    private async saveBill(
        param: Bill,
        showPrint: boolean = true,
        isPayment: boolean = false,
    ) {
        console.log('params save bill ', param);
        const params: any = Object.assign({}, param);
        // set default floor id & deskId if not exist desk floor
        if (params.id === 0) {
            this.billService.createBill(params).subscribe((res: any) => {
                console.log(res);
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.create',
                    ),
                });
                this.billTabs.find(
                    (x) => x.tabId === this.selectedBillTabId,
                ).id = res.data.id;
                this.onSaveBillDetail(
                    this.billTabs.find(
                        (x) => x.tabId === this.selectedBillTabId,
                    ),
                    res.data.id,
                );
            });
        }
    }

    doSendBill(showPrint: boolean = true, isPayment: boolean = false) {
        let billReq = this.getBillReq(isPayment, true);
        billReq.products = [
            {
                billId: 0,
                discountPrice: 10,
                discountType: 'percent',
                id: 0,
                note: '',
                quantity: 1,
                taxVat: 0,
                unitPrice: 10000,
            },
        ];
        this.saveBill(billReq, showPrint, isPayment);
    }

    onSaveBillDetail(billTab, billId) {
        const params: BillDetail[] = [];
        billTab.data.products.forEach((product) => {
            const param: BillDetail = {
                id: 0,
                billId,
                goodsId: product.id,
                quantity: product.billQuantity,
                unitPrice: product.salePrice,
                discountPrice: product.discountPrice,
                discountType: product.discountType,
                taxVat: product.taxVat,
                note: product.note,
            };
            params.push(param);
        });

        this.createBillDetail(params);
    }

    private createBillDetail(param: BillDetail[]) {
        this.billDetailService.createBillDetail(param).subscribe((res: any) => {
            this.getNotificationCount();
            this.closeBill(this.selectedBillTabId);
            this.appUtil.scrollToTop();
            this.getBillIdNewest();
        });
    }

    getBillReq(isPayment: boolean, isNew?: boolean) {
        const params: any[] = [];
        let bill = this.billTabs.find(
            (x) => x.tabId === this.selectedBillTabId,
        );
        console.log('selected bill req ', bill);
        bill.data.products.forEach((product) => {
            const param: BillDetail = {
                id: 0,
                billId: bill.id,
                goodsId: product.id,
                quantity: product.quantity,
                unitPrice: product.salePrice,
                discountPrice: product.discountPrice,
                discountType: product.discountType,
                taxVat: product.taxVat,
                note: product.note,
            };
            params.push(param);
        });
        console.log(bill);
        return {
            id: isNew ? 0 : bill.data.id,
            floorId: bill.floorId,
            deskId: bill.deskId,
            customerId: bill.data.customerId || 0,
            customerName: this.getCustomerName(bill.data.customerId) || '',
            userCode: this.authUser.fullname,
            userType: 'seller',
            quantityCustomer: bill.data.customerNumber,
            totalAmount: bill.data.totalPrice,
            amountReceivedByCus: bill.data.payPrice,
            amountSendToCus: 0,
            // bill.payPrice - this.getDiscountBillMoney()
            discountType: bill.data.discountType || '',
            discountPrice: bill.data.discountPrice || 0,
            note: bill.data.note,
            status: bill.data.status || 'Waiting',
            isPayment,
            typePay: bill.data.typePay,
            products: params,
            displayOrder: this.billIdIdentity,
        };
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
}
