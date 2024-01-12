import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomerService } from '../../../../../service/customer.service';
import AppUtil from '../../../../../utilities/app-util';

@Component({
    selector: 'app-view-pdf-file-on-tab',
    templateUrl: './view-pdf-file-on-tab.component.html',
    styleUrls: [],
})
export class ViewPdfFileOnTabComponent implements OnInit {
    constructor(
        private route: ActivatedRoute,
        private customerService: CustomerService,
    ) {}

    ngOnInit(): void {
        const param = {
            customerQuoteId: this.route.snapshot.paramMap.get('quoteId'),
            type: 'html',
            customerId: this.route.snapshot.paramMap.get('customerId'),
        };
        this.getReportCustomerQuoteDetail(param);
    }

    getReportCustomerQuoteDetail(param: any): void {
        this.customerService
            .reportCustomerQuoteDetail(param)
            .subscribe((res) => {
                AppUtil.setShowReportReceiptHtml(res?.data || '');
            });
    }
}
