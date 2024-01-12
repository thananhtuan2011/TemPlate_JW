import {
    Component,
    ElementRef,
    OnInit,
    ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
    Bill,
    BillDetail,
    ChangeStatusResult,
} from 'src/app/models/cashier.model';
import { Goods } from 'src/app/models/goods.model';
import { RoomTable } from 'src/app/models/room-table.model';
import { BillDetailService } from 'src/app/service/bill-detail.service';
import { BillService } from 'src/app/service/bill.service';
import { CustomerService } from 'src/app/service/customer.service';
import { RoomTableService } from 'src/app/service/room-table.service';
import AppUtil from 'src/app/utilities/app-util';
import { BillTableComponent } from '../components/bill-table/bill-table.component';
import { DeskTableComponent } from '../components/desk-table/desk-table.component';
import { RoomTableFormComponent } from '../setup-module/room-table/component/room-table-form/room-table-form.component';
import { AuthService } from 'src/app/service/auth.service';
import { CompanyService } from 'src/app/service/company.service';
import { AppMainComponent } from 'src/app/layouts/app.main.component';
import { UserService } from 'src/app/service/user.service';
import { User } from 'src/app/models/user.model';
import { GoodsTableComponent } from '../components/goods-table/goods-table.component';
import { SurchargesService } from 'src/app/service/surcharge.service';
import { TillService } from '../../../service/till.service';
import { TillFormComponent } from '../till/till-form/till-form.component';
import { NewestBillNumberModel } from '../../../models/newest-bill-number';
import { BillType, PaymentType } from '../../../utilities/app-enum';
import { CashierMediatorService } from '../../../service/mediators/cashier-mediator.service';
import { BillNotificationComponent } from './components/bill-notification/bill-notification.component';
import { environment } from 'src/environments/environment';
import { PTCSSForArise } from '../../accounting-module/arise/prints/const_css';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
    selector: 'app-cashier',
    templateUrl: './cashier.component.html',
    styleUrls: ['./cashier.component.scss'],
})
export class CashierComponent implements OnInit {
    appUtil = AppUtil;
    @ViewChild('appBillTable') appBillTable: BillTableComponent;
    @ViewChild('goodsTable') goodsTable: GoodsTableComponent;
    @ViewChild('billNotification') billNotification: BillNotificationComponent;
    @ViewChild('tillForm') tillsForm: TillFormComponent | undefined;
    @ViewChild('roomTableForm') roomTableForm: RoomTableFormComponent;
    @ViewChild('appDeskTable') appDeskTable: DeskTableComponent;

    @ViewChild('uploadFile') uploadFile: ElementRef<HTMLInputElement>;

    floors: RoomTable[];
    desks: RoomTable[];
    desksTemp: RoomTable[];
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
    billTypeSelected: string = BillType.HasBill;
    billTypes: any[] = [
        {
            code: BillType.HasBill,
        },
        {
            code: BillType.NoBill,
        },
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
    isOnShift: boolean = false;
    isShowOnShiftDialog: boolean = false;
    currentTill: any = {};
    display: boolean = false;
    selectedCustomer: any = {};
    displaySplitMerge: boolean = false;
    mergeGoods: any[] = [];
    users: User[] = [];
    selectedUser: string = '';
    surchargeData: any = {};

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
    isDisplayXuatKho_Ledger: boolean = false;
    dataPrint: any = {};
    creditCodesPrint: any = [];
    typePay: string = PaymentType.Debt;
    constructor(
        public appMain: AppMainComponent,
        private roomTableService: RoomTableService,
        private surchargesService: SurchargesService,
        private customerService: CustomerService,
        private billService: BillService,
        private billDetailService: BillDetailService,
        private authService: AuthService,
        private companyService: CompanyService,
        private userService: UserService,
        private tillService: TillService,
        private cashierMediator: CashierMediatorService,
        private messageService: MessageService,
        private translateService: TranslateService,
        private confirmationService: ConfirmationService
    ) {
        this.cashierMediator.customerChanged.subscribe((filteredCustomers) => {
            this.customers = filteredCustomers;
        });
    }

    ngOnInit() {
        this.typePay = this.authService.getConfigurationViewTypePays[0].value;

        this.authUser = this.authService.user;
        this.getLastSurcharge();
        this.getAllUserActive();
        this.getLastInfo();
        this.getFloors();
        this.getListCustomer();
        this.resetMoneys();
        this.getCurrentTill();
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
            this.isOnShift = this.currentTill != null;
        });
    }

    startOnShift() {
        this.tillsForm.getDetail(null);
        this.tillsForm.setFinishStatus(false);
        this.isShowOnShiftDialog = true;
    }

    endOfShift() {
        this.tillsForm.getDetail(this.currentTill.id);
        this.tillsForm.setFinishStatus(true);
        this.isShowOnShiftDialog = true;
    }

    onEndOfShiftSuccess(event) {
        if (!event.isFinish) {
            this.isOnShift = true;
        } else {
            this.isOnShift = false;
        }
        this.getCurrentTill();
        this.isShowOnShiftDialog = false;
    }

    onAddRoomTable() {
        this.roomTableForm.onReset();
        this.display = true;
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
            this.goodsTable.getGoods();
            return;
        }

        if (this.appBillTable) {
            this.appBillTable.onChangeCustomer(event);
        }
        this.selectedCustomer = event;
        this.setUserSelected(event?.userCreated);
        this.selectedBillTab.descriptionForLedger = this.getDescriptionForLedger();
    }

    getDescriptionForLedger() {
        let customerName = this.selectedCustomer?.name || '';
        return customerName.length > 0
            ? `Bán hàng cho ${this.selectedCustomer.name}`
            : 'Bán hàng Online';
    }

    setUserSelected(userId) {
        if (userId == null || userId == undefined) {
            return;
        }
        this.selectedUser = this.authUser.username;
        this.userService.getUserDetail(userId).subscribe((res) => {
            this.selectedUser = res?.username || this.authUser.username;
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

    async addBill(roomTable) {
        await this.getBillIdNewest();
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
        let desk = this.floors.find((x) => x.id === roomTable.id)
        let floor = this.floors.find((x) => x.id === roomTable.floorId)
        let newBill = this.addNewBill(desk, floor);

        this.billTabs.unshift(newBill);
        this.setSelectedTab(newBill.tabId);
        this.activeTableOrGoods = 1;
    }

    async addProduct(event) {
        let doAddProduct = async () => {
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
                let newBill = this.addNewBill(deskLive, floorLive);
                this.billTabs.unshift(newBill);
                this.setSelectedTab(newBill.tabId);
                this.activeTableOrGoods = 1;
            }
            this.onAddProduct(event);
        };

        if(event?.quantity == 0) {
            this.confirmationService.confirm({
                message: `Sản phẩm $"Hiện tại số lượng Tồn = 0 bạn có muốn bán sản phẩm này?`,
                header: 'Xác nhận',
                icon: 'pi pi-exclamation-triangle',
                accept: doAddProduct
            });
        } else {
            await doAddProduct();
        }
    }

    private addNewBill( desk: RoomTable, floor: RoomTable) : any {
        return {
            isDefault: false,
            tabId: this.appUtil.makeRandomId(6),
            deskId: desk ? desk.id : 0,
            deskName: desk ? desk.name : '',
            floorId: floor ? floor.id : 0,
            floorName: floor ? floor.name : '',
            title: `Bill ${this.newestBillNumberModel.billNumber}`,
            isPrintBill: this.billTypeSelected == BillType.HasBill,
            descriptionForLedger: this.getDescriptionForLedger(),
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
                typePay: this.typePay,
                billNumber: this.newestBillNumberModel.billNumber,
                displayOrder: this.newestBillNumberModel.billOrder,
                type: this.billTypeSelected,
                vat: 0,
                vatAmount: 0,
                vatCode: '',
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
        product.billBox = 0;
        product.billNec = product.net;
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
        this.cashierMediator.changeSelectedTab(this.selectedBillTab);
    }

    switchMergeGoods(goods, value) {
        goods.mergeQuantity = value ? 1 : null;
    }

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

    async onShowPayment(billTab, isPayment, typeSave, typePrint: string = '') {
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
        // not show dialog and send direct if type is notification
        if (!isPayment) {
            this.doSendBill(isPayment);
            return;
        }
        await this.getLastSurcharge(true);
        this.checkSetSelectedBillTab();

        // Don't show payment model if payment type is CN
        if (typePay == PaymentType.Debt) {
            this.onSaveBillConfirm();
        } else {
            this.displayDiscountPrice = true;
        }
    }

    onSaveBillConfirm() {
        this.doSendBill(this.isPayment);
        this.resetMoneys();
        this.displayDiscountPrice = false;
    }

    private async saveBill(param: Bill, isPayment) {
        const params: any = Object.assign({}, param);
        if (params.id === 0) {
            this.billService.createBill(params).subscribe((res: any) => {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.create',
                    ),
                });
                this.selectedBillTab.data.id = res.data.id;
                this.selectedBillTab.data.status = res.data.status;
                this.selectedBillTab.data.createdDate = res.data.createdDate;
                this.appBillTable.setRealBill(this.selectedBillTab);
                if (isPayment) {
                    this.updateSurchargeBill(this.selectedBillTab.data);
                }
                this.onSaveBillDetail(res.data.id);
                this.appBillTable.getItemPrint();
            });
        } else {
            if (this.typeSave === 'saveTemp') {
                this.billService
                    .updateBill(params, params.id)
                    .subscribe((res: any) => {
                        this.onSaveBillDetail(res.data.id);
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.update',
                            ),
                        });
                    });
            }
            if (this.typeSave === 'sendToChef') {
                this.changeStatusSendToChef(params.id);
            }
            if (isPayment) {
                this.updateSurchargeBill(this.selectedBillTab);
            }
        }
    }

    updateSurchargeBill(param: Bill) {
        if (this.surchargeData != null && this.surchargeData.value > 0) {
            const params: any = Object.assign({}, param);
            let newSurChargeBill: any = {
                id: params.id,
                surcharge: this.surchargeData.realPrice || 0,
            };
            this.billService
                .updateBillSurcharge(newSurChargeBill, params.id)
                .subscribe((res: any) => {
                    this.messageService.add({
                        severity: 'success',
                        detail: AppUtil.translate(
                            this.translateService,
                            'success.update',
                        ),
                    });
                });
        }
    }

    changeStatusSendToChef(billId: number = 0) {
        let changeParams: ChangeStatusResult = {
            id: this.selectedBillTab.msgId,
            billId: billId,
            currentTranType: 'SendToCashier',
        };
        this.billService.changeStatus(changeParams).subscribe((res) => {
            this.billNotification.getNotificationMessage();
            this.messageService.add({
                severity: 'success',
                detail: AppUtil.translate(
                    this.translateService,
                    'success.update',
                ),
            });
            // this.closeBill(this.selectedBillTabId);
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

    onSaveBillDetail(billId) {
        const params: BillDetail[] = [];
        this.selectedBillTab.data.products.forEach((product) => {
            const param: BillDetail = {
                id: 0,
                billId: billId,
                goodsId: product.goodsId ? product.goodsId : product.id,
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
        this.billDetailService
            .createBillDetail(param)
            .subscribe(async (res: any) => {
                this.billNotification.getNotificationCount();
                if (
                    this.isPayment ||
                    (this.typeSave === 'saveTemp' && this.typePrint === 'XK')
                ) {
                    this.appBillTable.defaultPrintCommand();
                }
                if (this.typeSave === 'saveTemp' && this.typePrint === 'XD') {
                    this.appBillTable.printSmallBill();
                }
                await this.getBillIdNewest();
                this.goodsTable.getGoods(null, true);
            },
            (err) => {
                this.messageService.add({
                    severity: 'error',
                    detail: err.msg,
                });
            },);
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

    getBillReq(isPayment: boolean) {
        let selectedBill = this.selectedBillTab.data;
        return {
            ...this.selectedBillTab,
            id: !selectedBill.isRealId ? 0 : selectedBill.id,
            floorId: this.selectedBillTab.floorId,
            deskId: this.selectedBillTab.deskId,
            customerId: selectedBill.customerId || 0,
            userCode: this.selectedUser,
            userType: this.typeSave === 'saveTemp' ? 'seller' : 'cashier',
            quantityCustomer: selectedBill.customerNumber,
            totalAmount: selectedBill.totalAmount,
            amountReceivedByCus: selectedBill.amountReceivedByCus,
            amountSendToCus:
                selectedBill.amountReceivedByCus -
                    this.getDiscountBillMoney() || 0,
            discountType: selectedBill.discountType || '',
            discountPrice: selectedBill.discountPrice || 0,
            note: selectedBill.note,
            status: selectedBill.status || 'Waiting',
            isPayment,
            typePay: selectedBill.typePay,
            isPrintBill: this.selectedBillTab.isPrintBill == true,
            isPriority: this.selectedBillTab.isPriority == true,
            products: [],
            displayOrder: selectedBill.displayOrder,
            billNumber: selectedBill.billNumber,
            type: selectedBill.type,
            vatRate: selectedBill.vat,
            vat: selectedBill.vatAmount,
            vatCode: selectedBill.vatCode,
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

    onCompleteBill() {
        let billId = this.selectedBillTab.data.id;
        this.selectedBillTab.data.userCode = this.selectedUser;
        this.selectedBillTab.data.userType = 'cashier';
        this.selectedBillTab.data.vatRate = this.selectedBillTab.data.vat;

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
                if (
                    this.isPayment ||
                    (this.typeSave === 'saveTemp' &&
                        this.typePrint === 'XK')
                ) {
                    this.appBillTable.defaultPrintCommand();
                }
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        `${this.selectedUser} đã hoàn thành hóa đơn`,
                    ),
                });
                this.billNotification.getNotificationMessage();
                this.selectedBillTab.data.status = res.data.status;
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

    onAddBillFromEmployee(newBill: any) {
        this.billTabs.unshift(newBill);
        this.setSelectedTab(newBill.tabId);
        this.activeTableOrGoods = 1;
        this.billTypeSelected = this.selectedBillTab?.data?.type;
    }

    onBillTypeChanged() {
        this.billService
            .changeBillNumberByType(
                this.selectedBillTab?.data.id,
                this.billTypeSelected,
            )
            .subscribe((res) => {
                this.selectedBillTab.data.billNumber = res.billNumber;
                this.selectedBillTab.data.displayOrder = res.billOrder;
                this.selectedBillTab.title = `Bill ${res.billNumber}`;
                this.selectedBillTab.data.type = this.billTypeSelected;
            });
        this.selectedBillTab.isPrintBill = this.billTypeSelected == BillType.HasBill;
    }

    async importByType(event: any) {
        // TODO: Implement by import type
        console.log(this.importType);
        switch (this.importType) {
            case CashierImportType.CT1CT2Code:
                // TODO: Implement
                this.importBill(event, 1);
                break;
            case CashierImportType.CT1CT2Name:
                this.importBill(event, 2);

                break;
            case CashierImportType.HHCode:
                this.importBill(event, 3);

                break;
            case CashierImportType.HHName:
                this.importBill(event, 4);
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
        let newBill = this.addNewBill(deskLive, floorLive);

        this.billTabs.unshift(newBill);
        this.setSelectedTab(newBill.tabId);
        this.activeTableOrGoods = 1;

        const formData = new FormData();
        if (event.target?.files[0]) {
            formData.append('file', event.target?.files[0]);
        }

        this.billService.importBill(formData, type).subscribe(
            (res) => {
                newBill.data.products = res;
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.update',
                    ),
                });
            },
            (err) => {
                this.messageService.add({
                    severity: 'error',
                    detail: err,
                });
            },
        );
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
                console.log(billTab);
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
                    popup.onbeforeunload = (event) => {
                        popup.document.close();
                        return '.\n';
                    };
                    popup.onabort = (event) => {
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
    onShowExportBill(){
        this.GetDataPrintLedger(this.selectedBillTab);
    }
}

export enum CashierImportType {
    Default = 'Default',
    CT1CT2Code = 'CT1CT2Code',
    CT1CT2Name = 'CT1CT2Name',
    HHCode = 'HHCode',
    HHName = 'HHName',
}
