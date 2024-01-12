import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { Page, TypeData } from '../../../../models/common.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { IncomingTextService } from '../../../../service/incoming-text.service';
import { TranslateService } from '@ngx-translate/core';
import { InventoryService } from '../../../../service/inventory.service';
import AppUtil from '../../../../utilities/app-util';
import { DatePipe } from '@angular/common';
import appUtil from '../../../../utilities/app-util';
import * as _ from 'lodash';
import { AppMainComponent } from 'src/app/layouts/app.main.component';

@Component({
    selector: 'app-inventory',
    templateUrl: './inventory.component.html',
    styleUrls: [],
})
export class InventoryComponent implements OnInit {
    @Input() isQRScannerVisible: boolean;
    formData = {};
    loading: boolean = false;
    display: boolean = false;
    displayForm: boolean = false;
    selectedItem: any;
    isMobile = this.appMain.isMobile();
    result: TypeData<any> = {
        data: [],
        currentPage: 0,
        nextStt: 0,
        pageSize: 10,
        totalItems: 0,
    };
    param = {
        page: 1,
        pageSize: 20,
        dtMax: new Date(),
        searchText: '',
    };
    checkedDate = new Date();
    inventories = [];
    inventoryDates = [];

    constructor(
        private appMain: AppMainComponent,
        private readonly messageService: MessageService,
        private readonly inventoryService: InventoryService,
        private readonly translateService: TranslateService,
        private confirmationService: ConfirmationService,
    ) {}

    ngOnInit(): void {
        // this.getListDateInventory()
        this.restoreInventoryCache();
    }

    restoreInventoryCache() {
        let inventoryCache = this.inventoryService.restoreInventoryCache();
        if (inventoryCache != null) {
            this.confirmationService.confirm({
                message: `<strong>Có một kiểm kho chưa được lưu bạn có muốn tiếp tục không?</strong>`,
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    inventoryCache.isCache = true;
                    this.formData = inventoryCache;
                    this.displayForm = true;
                },
                reject: () => this.inventoryService.removeInventoryCache(),
            });
        }
    }

    onOpenCommentDialog(inventory: any): void {
        this.selectedItem = inventory;
        this.noteStr = inventory.note;
        this.display = true;
    }

    noteStr: string;

    onSaveComment(event): void {
        this.display = false;
        this.selectedItem.note = event;
    }

    getInventoryByDates(event?: any): void {
        const params = {
            dtMax: new DatePipe('en_US').transform(
                new Date(this.param?.dtMax),
                'yyyy/MM/dd HH:mm:ss',
            ),
            page: Number(event?.first || 0) / Number(event?.rows || 1) + 1,
            pageSize: Number(event?.rows || 10),
        };
        this.inventoryService.getInventoryByDate(params).subscribe((res) => {
            const inventories =
                res?.data.reduce((arr, curr, index) => {
                    arr.push({
                        ...curr,
                        no: index + 1,
                        image1:
                            curr.image1 && appUtil.baseUrlImage(curr.image1),
                    });
                    return arr;
                }, []) || [];
            this.result = {
                ...res,
                data: inventories,
            };
        });
    }

    getListDateInventory(): void {
        this.inventoryService.getListDateInventory().subscribe((res) => {
            const inventoryDates =
                [...new Set(res.map((item) => item))]?.map((date) => {
                    return {
                        label: new DatePipe('en_US').transform(
                            date,
                            'dd/MM/yyyy HH:mm:ss',
                        ),
                        value: date,
                    };
                }) || [];
            this.inventoryDates = _.orderBy(
                inventoryDates,
                ['value'],
                ['desc'],
            );
            this.param.dtMax = this.inventoryDates?.[0]?.value || new Date();
            this.getInventoryByDates();
        });
    }

    /** P_inventory **/
    getInventories(event?: any): void {
        this.param.page =
            Math.floor(Number(event?.first || 0) / Number(event?.rows || 1)) +
            1;
        this.param.pageSize = Number(event?.rows || 20);
        this.inventoryService
            .getPagingInventory(this.param)
            .subscribe((res) => {
                this.result = res;
            });
    }

    onAddInventory(): void {
        this.displayForm = true;
        this.formData = {};
    }

    onApproveInventory(item): void {
        this.confirmationService.confirm({
            message: `<strong>Nếu chấp Nhận Bạn sẽ không được thay đổi trạng thái nữa và không có quyền Sửa hoặc Xóa?</strong>`,
            header: 'Bạn có muốn đổi Trạng thái là Hoàn thành không?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.inventoryService.approveInventory(item.id, item).subscribe(
                    (res) => {
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.update',
                            ),
                        });
                        this.getInventories();
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
            },
        });
    }

    onCancelForm(event): void {
        this.displayForm = false;
        this.getInventories();
    }

    onDelete(id) {
        let message;
        this.translateService
            .get('question.delete_inventory')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                this.inventoryService
                    .deleteInventory(id)
                    .subscribe((response: any) => {
                        this.getInventories();
                    });
            },
        });
    }

    getDetail(id) {
        this.inventoryService.getDetail(id).subscribe((res: any) => {
            this.formData = res;
            this.displayForm = true;
        });
    }

    exportExcel(id) {
        this.inventoryService.exportExcel(id).subscribe((res: any) => {
            this.openDownloadFile(res.data, `excel`);
        });
    }

    openDownloadFile(_fileName: string, _ft: string) {
        try {
            var _l = this.inventoryService.getFolderPathDownload(
                _fileName,
                _ft,
            );
            if (_l) window.open(_l);
        } catch (ex) {}
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddInventory();
                break;
        }
    }
}
