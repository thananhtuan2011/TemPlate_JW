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
import { AuthService } from '../../../../../service/auth.service';
import { InventoryService } from '../../../../../service/inventory.service';
import AppUtil from '../../../../../utilities/app-util';
import { ChartOfAccountService } from '../../../../../service/chart-of-account.service';
import { AppMainComponent } from 'src/app/layouts/app.main.component';

@Component({
    selector: 'app-inventory-form',
    templateUrl: './inventory-form.component.html',
    styleUrls: [],
    styles: [``],
})
export class InventoryFormComponent implements OnInit {
    @Input() display = false;
    @Input() formData;
    inventoryForm!: FormGroup;
    @Output() onCancel = new EventEmitter();
    items: FormArray;
    paramGoodInventory = {
        wareHouse: '',
        account: '',
        detail1: '',
        detail2: '',
    };
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
    ) {}

    ngOnInit(): void {
        this.getChartOfAccount();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.formData?.id || this.formData?.isCache) {
            this.inventoryForm = new FormGroup({
                procedureNumber: new FormControl(this.formData.procedureNumber),
                name: new FormControl(this.formData.name),
                items: new FormArray([]),
            });
        } else
            this.inventoryForm = new FormGroup({
                procedureNumber: new FormControl(null),
                name: new FormControl(null),
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
        this.items = this.inventoryForm.get('items') as FormArray;
        this.goodInventories = this.formData?.items || [];
    }

    getGoodInventory(event?: any) {
        this.inventoryService
            .getGoodInventory(this.paramGoodInventory)
            .subscribe((res) => {
                this.goods =
                    res?.reduce((arr, curr) => {
                        arr.push({
                            ...curr,
                            checked: false,
                        });
                        return arr;
                    }, []) || [];
            });
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
        } else {
            this.detail1s = [];
        }
    }

    getAccountDetail1(accountCode) {
        this.chartOfAccountService
            .getDetail(accountCode)
            .subscribe((res: any) => {
                this.detail1s = res.data;
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
        });
        this.visibleGoodTable = false;
    }

    onRemoveGood(good: any): void {
        const index = this.goodInventories.indexOf(good);
        if (index > -1) this.goodInventories?.splice(index, 1);
    }

    onDelete(): void {}

    prepareRequest() {
        const items =
            this.goodInventories?.reduce((arr, curr) => {
                delete curr.checked;
                arr.push(curr);
                return arr;
            }, []) || [];

        return {
            id: this.formData?.id || 0,
            procedureNumber: this.inventoryForm.value.procedureNumber,
            name: this.inventoryForm.value.name,
            p_ProcedureStatusId: this.formData?.p_ProcedureStatusId || 0,
            p_ProcedureStatusName: '',
            createAt: new Date(),
            items,
        };
    }

    onSave(): void {
        let request = this.prepareRequest();
        let action = this.formData?.id
            ? this.inventoryService.updateInventory(request, this.formData.id)
            : this.inventoryService.createInventory(request);

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

    onQRScanSuccess(qrCode: string) {
        console.log(this.goodInventories);
        let good = this.goodInventories.find((item) => item.qrCode == qrCode);

        if (good == null) {
            this.messageService.add({
                severity: 'error',
                detail: `Không tìm thấy sản phẩm với mã ${qrCode}`,
            });
            return;
        }

        good.quantityReal = parseInt(good.quantityReal) + 1;
        this.messageService.add({
            severity: 'success',
            detail: AppUtil.translate(
                this.translateService,
                `Đã tìm thấy sản phẩm ${good.goodsName}`,
            ),
        });
        this.storeCache();
    }

    storeCache() {
        let inventory = this.prepareRequest();
        this.inventoryService.storeInventoryCache(inventory);
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
