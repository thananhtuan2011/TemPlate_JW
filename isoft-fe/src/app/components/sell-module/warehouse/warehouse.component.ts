import { Component, OnInit } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import {
    ChangeStatusResult,
    NotificationCountResult,
    NotificationResult,
} from 'src/app/models/cashier.model';
import { TypeData } from 'src/app/models/common.model';
import { Goods } from 'src/app/models/goods.model';
import { RoomTable } from 'src/app/models/room-table.model';
import { BillDetailService } from 'src/app/service/bill-detail.service';
import { BillService } from 'src/app/service/bill.service';
import { GoodsService, PageFilterGoods } from 'src/app/service/goods.service';
import { RoomTableService } from 'src/app/service/room-table.service';
import AppUtil from 'src/app/utilities/app-util';
import { environment } from 'src/environments/environment';
import { MessageService } from 'primeng/api';
import { GoodWarehouseService } from '../../../service/good-warehouse.service';
import { logger } from 'codelyzer/util/logger';
import { ConfirmationService, ConfirmEventType } from 'primeng/api';
import { CompanyService } from '../../../service/company.service';
import AppConstants from '../../../utilities/app-constants';
import AppConstant from '../../../utilities/app-constants';

@Component({
    selector: 'app-warehouse',
    templateUrl: './warehouse.component.html',
    styles: [``],
})
export class WarehouseComponent implements OnInit {
    appConstant = AppConstants;
    appUtil = AppUtil;

    // notification params
    notification: NotificationCountResult;
    messages: Array<NotificationResult> = [];
    existedNumMessage = 0;
    isVisibleNotification = false;
    isQRScannerVisible: boolean = false;
    private hubConnection: signalR.HubConnection;

    isShowDetail: boolean = false;
    currentBill: any = {};
    suggestions: any[] = [];

    floors: RoomTable[];
    desks: RoomTable[];
    lstGoodsAll: Goods[] = [];
    isShowQrCode: boolean = true;

    suggestionQRScanFocused: any;
    positionQRScanFocused: any;

    constructor(
        private billService: BillService,
        private billDetailService: BillDetailService,
        private goodsService: GoodsService,
        private roomTableService: RoomTableService,
        public messageService: MessageService,
        public goodWarehouseService: GoodWarehouseService,
        private confirmationService: ConfirmationService,
        private companyService: CompanyService,
    ) {}

    ngOnInit() {
        this.getFloors();
        this.getGoodsAll();
        this.refreshScreen();
        this.getCompanyInfo();
    }

    refreshScreen() {
        this.currentBill = {};
        this.initNotificationRealtime();
    }

    getCompanyInfo() {
        this.companyService
            .getListCompany({ page: 1, pageSize: 10 })
            .subscribe((res) => {
                let companies = res.data;
                if (companies != null && companies.length > 0) {
                    this.isShowQrCode = companies[0].isShowBarCode;
                }
            });
    }

    getGoodsAll(): void {
        this.goodsService
            .getListNoQuery()
            .subscribe((response: TypeData<Goods>) => {
                this.lstGoodsAll = response.data;
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
            this.messages = messages;
        });
    }

    addPriority(msg: NotificationResult) {
        this.billService.changePriority(msg.id).subscribe((res) => {
            this.getNotificationMessage();
        });
    }

    changeStatusCooked() {
        // validation
        let invalid = false;
        this.currentBill.products.forEach((product) => {
            let quantitySuggestion = 0;
            if (product.suggestions != null) {
                product.suggestions.forEach(
                    (suggest) => (quantitySuggestion += suggest.realQuantity),
                );
            }
            // Case 1 : quantity < suggestion quantity
            if (quantitySuggestion > product.quantity) {
                this.messageService.add({
                    severity: 'error',
                    detail: `Sản phẩm ${product.productName} - số lượng đã quét (${quantitySuggestion}) vượt quá số lượng trên đơn hàng(${product.quantity})`,
                });
                invalid = true;
            }

            //Case 2: quantity > suggestion quantity
            if (quantitySuggestion < product.quantity) {
                this.confirmationService.confirm({
                    message: `Sản phẩm ${product.productName} - số lượng đã quét (${quantitySuggestion}) chưa đủ so với số lượng trên đơn hàng(${product.quantity}). Bạn có muốn tiếp tục không?`,
                    header: 'Xác nhận',
                    icon: 'pi pi-exclamation-triangle',
                    reject: () => (invalid = true),
                });
            }
            if (invalid) return;
        });

        if (invalid) return;

        this.goodWarehouseService
            .completeBill(false, this.currentBill.products)
            .subscribe(
                (res) => {
                    const { status, message } = res;
                    if (status == 200) {
                        this.messageService.add({
                            severity: 'success',
                            detail: message,
                        });
                        this.confirmationService.confirm({
                            message: `Đã hoàn thành. Bạn có muốn thoát không?`,
                            header: 'Xác nhận',
                            icon: 'pi pi-exclamation-triangle',
                            accept: () => this.refreshScreen(),
                        });
                        return;
                    }

                    // Retry
                    if (status == 400) {
                        this.confirmationService.confirm({
                            message: `${message}. Bạn có muốn tiếp tục không?`,
                            header: 'Xác nhận',
                            icon: 'pi pi-exclamation-triangle',
                            accept: () => {
                                this.goodWarehouseService
                                    .completeBill(
                                        true,
                                        this.currentBill.products,
                                    )
                                    .subscribe(
                                        (res) => {
                                            this.messageService.add({
                                                severity: 'success',
                                                detail: res.message,
                                            });
                                        },
                                        (error) => {
                                            this.messageService.add({
                                                severity: 'error',
                                                detail: error.message,
                                            });
                                        },
                                    );
                            },
                        });
                    }
                },
                (error) => {
                    this.messageService.add({
                        severity: 'error',
                        detail: error.messages,
                    });
                },
            );
    }

    changeStatusCooking(message: NotificationResult) {
        let changeParams: ChangeStatusResult = {
            id: message.id,
            currentTranType: message.tranType,
        };
        this.billService.changeStatus(changeParams).subscribe((res) => {
            this.getNotificationMessage();
        });
    }

    oldGoods: any[] = [];

    async viewDetail(msg: NotificationResult) {
        this.suggestions = [];
        this.isShowDetail = true;
        this.billService.getBillDetail(msg.billId).subscribe((res: any) => {
            this.currentBill = {
                id: msg.billId,
                deskName: this.desks.find((x) => x.id === res.data.deskId)
                    ?.name,
                floorName: this.floors.find((x) => x.id === res.data.floorId)
                    ?.name,
                payPrice: 0,
                products: [],
                tabId: '',
                deskId: res.data.deskId,
                floorId: res.data.floorId,
                tabIndex: 0,
                customerName: res.data.customerName,
                customerId: res.data.customerId,
                discountPrice: res.data.discountPrice,
                discountType: res.data.discountType,
                note: res.data.note,
                isRealId: false,
                customerNumber: res.data.customerId,
                totalPrice: res.data.totalAmount,
                isSendToCashier: false,
                isSendToChef: false,
                isCooking: false,
                isPaid: false,
                isCooked: false,
                typePay: 'TM',
            };

            this.billDetailService
                .getBillDetailForWarehouses(msg.billId)
                .subscribe((res: any) => {
                    this.oldGoods = res.data;
                    res.data.forEach((product) => {
                        this.currentBill.products.push({
                            ...product,
                            productId: product.goodsId,
                            productName: product.goodsName,
                            productCode: product.goodsCode,
                            quantity: product.quantity,
                            note: product.note,
                            isSelect: false,
                            isCooked: false,
                            suggestions:
                                product.suggestions == null
                                    ? null
                                    : product.suggestions.map((item) => {
                                          return {
                                              realQuantity: 0,
                                              ...item,
                                          };
                                      }),
                        });
                        console.log(this.currentBill.products);
                    });
                    this.isShowDetail = false;
                });
        });
    }

    getFloors() {
        this.roomTableService.getListNoQuery().subscribe((res) => {
            this.floors = res.data.filter((item) => item.floorId === 0) || [];
            this.desks = res.data.filter((item) => item.floorId !== 0) || [];
        });
    }

    getAccountName(data: Goods) {
        if (data) {
            if (data.detail2) {
                return data.detailName2;
            }
            if (data.detail1) {
                return data.detailName1;
            }
            return data.accountName;
        }
        return '';
    }

    getAccountCode(data: Goods) {
        if (data) {
            if (data.detail2) {
                return data.detail2;
            }
            if (data.detail1) {
                return data.detail1;
            }
            return data.account;
        }
        return '';
    }

    allowDone() {
        if (this.currentBill.products) {
            return (
                this.currentBill.products &&
                this.currentBill.products.length > 0 &&
                this.currentBill.products.length ===
                    this.currentBill.products.filter((x) => x.isSelect).length
            );
        }
        return false;
    }

    resetGoodsNote(goods) {
        if (!goods.isError) {
            goods.note = this.oldGoods.find((x) => x.id === goods.id).note;
        } else {
            goods.isHasReason = false;
        }
        goods.isSelect = goods.isError;
    }

    resetGoodsReason(goods) {
        if (goods.isHasReason) {
            goods.isError = false;
        }
        goods.reasonForManager = '';
    }

    onQRScanSuccess(qrCodeScanned: string) {
        if (this.suggestionQRScanFocused.qrCode != qrCodeScanned) {
            this.messageService.add({
                severity: 'error',
                detail: `Không tìm thấy sản phẩm với mã ${qrCodeScanned} trong đơn hàng này`,
            });
            return;
        }

        if (this.positionQRScanFocused.quantityReal == null)
            this.positionQRScanFocused.quantityReal = 0;

        if (
            this.positionQRScanFocused.quantityReal >=
            this.positionQRScanFocused.quantity
        ) {
            this.messageService.add({
                severity: 'error',
                detail: `Sản phẩm ${this.suggestionQRScanFocused.productName} đã đạt giới hạn số lượng tồn. Không thể quét`,
            });
        }

        this.positionQRScanFocused.quantityReal++;
        this.messageService.add({
            severity: 'success',
            detail: `Đã quét sản phẩm ${this.suggestionQRScanFocused.productName} - Vị trí ${this.positionQRScanFocused.position}}`,
        });
        return;
    }

    onStartQRScan(suggestion, position) {
        this.suggestionQRScanFocused = suggestion;
        this.positionQRScanFocused = position;
        this.isQRScannerVisible = true;
    }

    protected readonly AppConstant = AppConstant;
}
