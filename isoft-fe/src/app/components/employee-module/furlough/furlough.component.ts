import { Component, HostListener, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Page, TypeData } from '../../../models/common.model';
import { IsoftHistoryModel } from '../../website-module/isoft-history/isoft-history.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { IsoftHistoryService } from '../../website-module/isoft-history/isoft-history.service';
import AppUtil from '../../../utilities/app-util';
import { FurloughService } from '../../../service/furlough.service';
import { FurloughModel } from '../../../models/furlough.model';
import AppConstants from '../../../utilities/app-constants';

@Component({
    selector: 'app-furlough',
    templateUrl: './furlough.component.html',
    styleUrls: [],
})
export class FurloughComponent implements OnInit {
    appConstant = AppConstants;
    display: boolean = false;
    formData = {};
    loading: boolean = false;
    result: TypeData<FurloughModel> = {
        data: [],
        currentPage: 0,
        nextStt: 0,
        pageSize: 20,
        totalItems: 0,
    };
    param: Page = {
        page: 1,
        pageSize: 20,
    };
    isMobile = screen.width <= 1199;
    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly furloughService: FurloughService,
    ) {}

    ngOnInit(): void {}

    getFurloughs(event?: any): void {
        this.param.page =
            Math.floor(Number(event?.first || 0) / Number(event?.rows || 1)) +
            1;
        this.param.pageSize = Number(event?.rows || 20);
        this.furloughService.getPagingFurloughs(this.param).subscribe(
            (res) => {
                AppUtil.scrollToTop();
                this.result = res;
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    detail: 'Lỗi lấy dữ liệu',
                });
            },
        );
    }

    onApproveFurlough(item): void {
        this.furloughService.approveFurlough(item.id, item).subscribe(
            (res) => {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.update',
                    ),
                });
                this.getFurloughs();
            },
            (err) => {
                this.messageService.add({
                    severity: 'error',
                    detail: AppUtil.translate(this.translateService, 'error.0'),
                });
            },
        );
    }

    onAddFurlough(): void {
        this.display = true;
        this.formData = {};
    }

    onEditFurlough(item): void {
        this.display = true;
        this.formData = item;
    }

    onDeleteFurlough(item): void {
        this.furloughService.deleteFurlough(item.id).subscribe(
            (res) => {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.delete',
                    ),
                });
            },
            (err) => {
                this.messageService.add({
                    severity: 'error',
                    detail: AppUtil.translate(this.translateService, 'error.0'),
                });
            },
        );
    }

    onCancel(event): void {
        this.display = false;
        this.getFurloughs();
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddFurlough();
                break;
        }
    }
}
