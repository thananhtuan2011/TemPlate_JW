import { Component, Input, OnInit } from '@angular/core';
import { BillDetailService } from '../../../../../../service/bill-detail.service';

@Component({
    selector: 'app-bill-refund',
    templateUrl: './bill-refund.component.html',
})
export class BillRefundComponent implements OnInit {
    display: boolean = false;
    billDetails: any[] = [];
    billId: number;
    @Input() isMobile = false;

    constructor(private readonly billDetailService: BillDetailService) {}

    ngOnInit(): void {}

    onAdjustBillDetail(billId: number, billDetails: any) {
        this.display = true;
        this.billId = billId;
        this.billDetails = billDetails;
    }

    onSubmit() {
        let request = this.billDetails.map((item: any) => {
            return {
                id: item.id,
                billId: this.billId,
                goodsId: item.goodsId,
                quantityRefund: item.quantityRefund,
                noteRefund: item.noteRefund,
            };
        });
        this.billDetailService
            .BillGoodsRefund(this.billId, request)
            .subscribe((res: any) => {
                console.log(res);
                this.display = false;
            });
    }
}
