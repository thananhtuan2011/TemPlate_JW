import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { AppMainComponent } from 'src/app/layouts/app.main.component';
import { InventoryService } from '../../../service/inventory.service';
import { TypeData } from '../../../models/common.model';
import { CategoryWebService } from '../../../service/category-web.service';
import AppConstant from '../../../utilities/app-constants';

@Component({
    selector: 'app-inventory',
    templateUrl: './inventory.component.html',
    styleUrls: [],
})
export class PromotionComponent implements OnInit {
    appConstant = AppConstant;
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

    constructor(
        private appMain: AppMainComponent,
        private readonly messageService: MessageService,
        private readonly inventoryService: InventoryService,
        private readonly translateService: TranslateService,
        private confirmationService: ConfirmationService,
        private readonly categoryWebService: CategoryWebService,
    ) {}

    ngOnInit(): void {}

    noteStr: string;

    onSaveComment(event): void {
        this.display = false;
        this.selectedItem.note = event;
    }

    getPromotion(event?: any): void {
        this.param.page =
            Math.floor(Number(event?.first || 0) / Number(event?.rows || 1)) +
            1;
        this.param.pageSize = Number(event?.rows || 20);
        this.categoryWebService
            .getPagingPromotion(this.param)
            .subscribe((res) => {
                this.result = res;
            });
    }

    onAddPromotion(): void {
        this.displayForm = true;
        this.formData = {};
    }

    onCancelForm(event): void {
        this.displayForm = false;
        this.getPromotion();
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
                this.categoryWebService
                    .deleteInventory(id)
                    .subscribe((response: any) => {
                        this.getPromotion();
                    });
            },
        });
    }

    getDetail(id) {
        this.categoryWebService.getDetail(id).subscribe((res: any) => {
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
                await this.onAddPromotion();
                break;
        }
    }
}
