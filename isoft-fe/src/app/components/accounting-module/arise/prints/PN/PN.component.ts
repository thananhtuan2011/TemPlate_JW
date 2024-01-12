import { Component, Input, OnInit } from '@angular/core';
import { Company } from 'src/app/models/company.model';
import { TaxRates } from 'src/app/models/tax_rates.model';
import { LedgerService } from 'src/app/service/ledger.service';
import { TaxRatesService } from 'src/app/service/tax-rates.service';
import AppUtil from 'src/app/utilities/app-util';

@Component({
    selector: 'PN',
    templateUrl: './PN.component.html',
})
export class PNComponent implements OnInit {
    appUtil = AppUtil;
    public taxRate: TaxRates;
    public tax = 0;
    constructor(
        private readonly taxRateService: TaxRatesService,
        private ledgerService: LedgerService,
    ) {}

    getTaxRatesByCode(code: string) {
        this.taxRateService.getTaxRatesByCode(code).subscribe((res: any) => {
            if (res && res.data && res.data.length) {
                this.taxRate = res.dt[0];
                console.log(this.taxRate);
            }
        });
    }

    @Input() company: Company;
    @Input() dataPrint: any;
    @Input() debitCodes = [];
    @Input() creditCodes = [];
    @Input() ledgers = [];
    dateStr = '';
    debitCodeStr = '';
    creditCodeStr = '';
    dataTables = [];
    total = 0;
    order = '';
    orginalDescription = '';
    async ngOnInit() {
        this.order = this.dataPrint.orginalVoucherNumber.split('/')[0];
        const date = new Date(this.dataPrint.orginalBookDate);
        const day =
            date.getDate() < 10 ? '0' + date.getDate() : '' + date.getDate();
        const month =
            date.getMonth() + 1 < 10
                ? '0' + (date.getMonth() + 1)
                : '' + (date.getMonth() + 1);
        this.dateStr = `Ngày ${day} tháng ${month} năm ${date.getFullYear()}`;
        this.debitCodeStr = this.debitCodes.map((x) => x.debitCode).join(', ');
        this.creditCodeStr = this.creditCodes
            .map((x) => x.creditCode)
            .join(', ');
        this.creditCodes.forEach((ele: any) => {
            if (this.orginalDescription.indexOf(ele.orginalDescription) < 0)
                this.orginalDescription =
                    this.orginalDescription + '; ' + ele.orginalDescription;
        });
        if (this.dataPrint?.orginalVoucherNumber)
            this.ledgerService
                .getListLedgerPrint(
                    this.dataPrint?.orginalVoucherNumber,
                    this.dataPrint?.isInternal,
                )
                .subscribe((res) => {
                    this.dataTables =
                        res?.reduce((arr, x) => {
                            this.total += x.amount;
                            arr.push({
                                orginalDescription: x.debitDetailCodeSecondName
                                    ? x.debitDetailCodeSecondName
                                    : x.debitDetailCodeFirstName
                                    ? x.debitDetailCodeFirstName
                                    : x.debitCodeName,
                                code: x.debitDetailCodeSecond
                                    ? x.debitDetailCodeSecond
                                    : x.debitDetailCodeFirst
                                    ? x.debitDetailCodeFirst
                                    : x.debitCode,
                                dvt: x.stockUnit,
                                quantity: x.quantity,
                                unitPrice: x.unitPrice,
                                amount: x.amount,
                                warehouseCode: x.debitWarehouse,
                            });
                            return arr;
                        }, []) || [];
                });
        await this.getTaxRatesByCode(this.dataPrint?.invoiceCode);
    }

    calTax() {
        this.tax =
            this.dataPrint?.amount * ((this.taxRate?.percent || 0) / 100);
        return this.tax;
    }
}
