import { Component, HostListener, OnInit } from '@angular/core';
import { Page, TypeData } from '../../../../models/common.model';
import { AllowanceModel } from '../../../../models/allowance.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { AllowanceService } from '../../../../service/allowance.service';
import AppUtil from '../../../../utilities/app-util';
import { CompanyService } from '../../../../service/company.service';
import AppConstants from '../../../../utilities/app-constants';

@Component({
    selector: 'app-allowance',
    templateUrl: './allowance.component.html',
    styleUrls: [],
    providers: [MessageService, ConfirmationService],
})
export class AllowanceComponent implements OnInit {
    public appConstant = AppConstants;
    display: boolean = false;
    formData = {};
    loading: boolean = false;
    result: TypeData<AllowanceModel> = {
        data: [],
        currentPage: 0,
        nextStt: 0,
        pageSize: 20,
        totalItems: 0,
    };
    param: Page = {
        page: 0,
        pageSize: 20,
        searchText: '',
    };

    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly allowanceService: AllowanceService,
    ) {}

    ngOnInit(): void {}

    async getAllowances(event?: any) {
        this.param.page = Math.floor(
            Number(event?.first || 0) / Number(event?.rows || 1),
        );
        this.param.pageSize = Number(event?.rows || 20);
        this.result = await this.allowanceService.getPagingAllowances(
            this.param,
        );
    }

    onAddAllowance() {
        this.display = true;
        this.formData = {};
    }

    getAllowanceDetail(item) {
        this.display = true;
        this.formData = item;
    }

    onDeleteAllowance(item) {
        this.confirmationService.confirm({
            message: 'Bạn có muốn xóa phụ cấp này',
            header: 'Xóa phụ cấp?',
            accept: () => {
                this.allowanceService.deleteAllowance(item?.id).subscribe(
                    (res) => {
                        AppUtil.scrollToTop();
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.delete',
                            ),
                        });
                        this.getAllowances();
                    },
                    (error) => {
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

    onCancelForm(event) {
        this.display = false;
        this.formData = {};
        this.getAllowances();
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddAllowance();
                break;
        }
    }

    protected readonly AppConstants = AppConstants;
}
