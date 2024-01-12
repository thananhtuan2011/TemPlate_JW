import { Component, Input, OnInit } from '@angular/core';
import { Company } from 'src/app/models/company.model';
import AppUtil from 'src/app/utilities/app-util';
import { LedgerService } from '../../../../../service/ledger.service';

@Component({
    selector: 'PX',
    templateUrl: './PX.component.html',
})
export class PXComponent implements OnInit {
    public appUtil = AppUtil;

    constructor(private ledgerService: LedgerService) {}

    @Input() company: Company;
    @Input() dataPrint: any;

    debitCodeStr = '';
    creditCodeStr = '';
    dateStr = '';
    codeStr = '';
    dataTables = [];
    total = 0;
    order = '';
    orginalDescription = '';
    ngOnInit(): void {
        const date = this.dataPrint.orginalBookDate
            ? new Date(this.dataPrint.orginalBookDate)
            : new Date();
        const day =
            date.getDate() < 10 ? '0' + date.getDate() : '' + date.getDate();
        const month =
            date.getMonth() + 1 < 10
                ? '0' + (date.getMonth() + 1)
                : '' + (date.getMonth() + 1);
        this.dateStr = `Ngày ${day} tháng ${month} năm ${date.getFullYear()}`;

        if (this.dataPrint?.orginalVoucherNumber)
            this.ledgerService
                .getListLedgerPrint(
                    this.dataPrint?.orginalVoucherNumber,
                    this.dataPrint?.isInternal,
                )
                .subscribe((res) => {
                    this.debitCodeStr = res[0]?.debitCode;
                    this.creditCodeStr = res[0]?.creditCode;

                    this.dataTables =
                        res?.reduce((arr, x) => {
                            this.total += x.amount;
                            arr.push({
                                orginalDescription: x.creditDetailCodeSecondName
                                    ? x.creditDetailCodeSecondName
                                    : x.creditDetailCodeFirstName
                                    ? x.creditDetailCodeFirstName
                                    : x.creditCodeName,
                                code: x.creditDetailCodeSecond
                                    ? x.creditDetailCodeSecond
                                    : x.creditDetailCodeFirst
                                    ? x.creditDetailCodeFirst
                                    : x.creditCode,
                                dvt: x.stockUnit,
                                quantity: x.quantity,
                                unitPrice: x.unitPrice,
                                amount: x.amount,
                                warehouseCode: x.debitWarehouse,
                            });
                            return arr;
                        }, []) || [];
                });
        this.order = this.dataPrint?.orginalVoucherNumber?.split('/')[0] || '';
    }
}
