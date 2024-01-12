import { Component, Input, OnInit } from '@angular/core';
import fi from 'date-fns/esm/locale/fi/index.js';
import { Company } from 'src/app/models/company.model';
import { TaxRates } from 'src/app/models/tax_rates.model';
import { TaxRatesService } from 'src/app/service/tax-rates.service';
import AppUtil from 'src/app/utilities/app-util';

@Component({
    selector: 'app-pnpc',
    templateUrl: './pnpc.component.html',
})
export class PNPCComponent implements OnInit {
    public appUtil = AppUtil;
    public taxRate: TaxRates;
    public tax = 0;
    constructor(private readonly taxRateService: TaxRatesService) {}

    getTaxRatesByCode(code: string) {
        if (code) {
            this.taxRateService
                .getTaxRatesByCode(code)
                .subscribe((res: any) => {
                    if (res && res.data && res.data.length) {
                        this.taxRate = res.data;
                        console.log(this.taxRate);
                    }
                });
        }
    }

    @Input() company: Company;
    @Input() ledgers = [];
    async ngOnInit() {
        console.log(this.ledgers);
    }

    calTax(data) {
        this.getTaxRatesByCode(data?.invoiceCode);
        this.tax = data
            ? (data.total || 0) * ((this.taxRate?.percent || 0) / 100)
            : 0;
        return this.tax;
    }
}
