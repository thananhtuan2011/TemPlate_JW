import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TypeData } from '../../../../../models/common.model';
import { CustomerService } from '../../../../../service/customer.service';
import { MessageService } from 'primeng/api';
import AppUtil from '../../../../../utilities/app-util';
import { BillPdfGeneratorService } from 'src/app/service/bill-pdf-generator.service';

@Component({
    selector: 'app-customer-quote-history',
    templateUrl: './customer-quote-history.component.html',
    styleUrls: [],
})
export class CustomerQuoteHistoryComponent implements OnInit {
    loading: boolean = false;
    loadingDetail: boolean = false;
    param = {
        isSort: true,
        sortField: '',
        page: 1,
        pageSize: 20,
        searchText: '',
        fromDate: 0,
        toDate: 0,
        customerId: 0,
    };
    result: TypeData<any> = {
        data: [],
        pageSize: 20,
        totalItems: 0,
        currentPage: 1,
        nextStt: 0,
    };
    customer: any;
    displayDetail = false;
    resultDetail: any = [];
    customerDetail: any;

    constructor(
        private route: ActivatedRoute,
        private customerService: CustomerService,
        private messageService: MessageService,
        private billPdfGeneratorService: BillPdfGeneratorService,
        viewContainerRef: ViewContainerRef,
    ) {
        this.billPdfGeneratorService.setup(viewContainerRef);

    }

    ngOnInit(): void {
        this.param.customerId = Number(
            this.route.snapshot.paramMap.get('id') || 0,
        );
        // this.getCustomerQuoteHistories()
    }

    getCustomerQuoteHistories(event?: any): void {
        this.param.page =
            Math.floor(Number(event?.first || 0) / Number(event?.rows || 1)) +
            1;
        this.param.pageSize = Number(event?.rows || 20);
        this.customerService.getListCustomerQuoteHistory(this.param).subscribe(
            (res) => {
                this.result = res;
                this.result.data =
                    this.result?.data?.reduce((arr, curr, index) => {
                        arr.push({
                            ...curr,
                            no:
                                (this.param.page - 1) * this.param.pageSize +
                                index +
                                1,
                        });
                        return arr;
                    }, []) || [];
                this.customer = {
                    name: res?.data?.[0]?.customerName,
                };
            },
            (err) => {
                this.messageService.add({
                    severity: 'error',
                    detail: 'Có lỗi xảy ra',
                });
            },
        );
    }

    getCustomerQuoteDetail(customerQuoteId): void {
        const param = {
            customerQuoteId,
        };
        this.customerService
            .getListCustomerQuoteDetail(param)
            .subscribe((res) => {
                this.resultDetail =
                    res?.reduce((arr, curr, index) => {
                        arr.push({
                            ...curr,
                            no: index + 1,
                            totalPrice:
                                Number(curr?.quantity || 0) *
                                    Number(curr?.unitPrice || 0) -
                                Number(curr?.discountPrice || 0),
                        });
                        return arr;
                    }, []) || [];
                this.customerDetail = this.resultDetail?.[0];
            });
    }

    onViewDetail(item): void {
        this.displayDetail = true;
        this.getCustomerQuoteDetail(item.id);
    }

    onPreview(item): void {
        this.billPdfGeneratorService.prepareAndGenerateBaoGia(item.customerId, item.id);
    }

    onDownload(item): void {
        const param = {
            customerQuoteId: item?.id,
            type: 'pdf',
            customerId: item?.customerId,
        };
        this.customerService
            .reportCustomerQuoteDetail(param)
            .subscribe((res) => {
                AppUtil.openDownloadFile(res.data, 'pdf');
            });
    }
}
