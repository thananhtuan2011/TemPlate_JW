import { Component, OnInit } from '@angular/core';
import { Page, TypeData } from '../../../models/common.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import AppUtil from '../../../utilities/app-util';
import { CustomerService } from '../../../service/customer.service';
import AppConstants from '../../../utilities/app-constants';

@Component({
    selector: 'app-customer-warning',
    templateUrl: './customer-warning.component.html',
    styles: [``],
})
export class CustomerWarningComponent implements OnInit {
    appConstant = AppConstants;
    display: boolean = false;
    formData = {};
    loading: boolean = false;
    result: TypeData<any> = {
        data: [],
        currentPage: 0,
        nextStt: 0,
        pageSize: 10,
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
        private readonly customerService: CustomerService,
    ) { }

    ngOnInit(): void { }

    getCustomerWarning() {
        this.loading = true;
        this.customerService.getCustomerWarning().subscribe(
            (res) => {
                AppUtil.scrollToTop();
                this.result = res;
                this.loading = false;
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    detail: 'Lỗi lấy dữ liệu',
                });
            },
        );
    }

    onAddWorkType() {
        this.display = true;
        this.formData = {};
    }

    onEditCustomerWarning(item) {
        this.formData = item;
        this.display = true;
    }

    onCancelForm(event) {
        this.display = false;
        this.formData = {};
    }
}
