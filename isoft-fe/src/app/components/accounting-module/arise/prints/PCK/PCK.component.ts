import { Component, Input, OnInit } from '@angular/core';
import { Company } from 'src/app/models/company.model';
import { Ledger } from 'src/app/models/ledger.model';
import { CaseService } from 'src/app/service/case.service';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import AppUtil from 'src/app/utilities/app-util';

@Component({
    selector: 'PCK',
    templateUrl: './PCK.component.html',
})
export class PCKComponent implements OnInit {
    appUtil = AppUtil;

    constructor(private readonly caseService: CaseService) {}

    @Input() company: Company;
    @Input() dataPrint: any;
    @Input() creditCodes = [];
    @Input() ledgers = [];
    dateStr = '';
    codeStr = '';
    dataTables = [];
    total = 0;

    public Dvts = [];
    order = '';
    ngOnInit() {
        this.order = this.dataPrint.orginalVoucherNumber.split('/')[0];

        const date = new Date(this.dataPrint.orginalBookDate);
        const day =
            date.getDate() < 10 ? '0' + date.getDate() : '' + date.getDate();
        const month =
            date.getMonth() + 1 < 10
                ? '0' + (date.getMonth() + 1)
                : '' + (date.getMonth() + 1);
        this.dateStr = `Ngày ${day} tháng ${month} năm ${date.getFullYear()}`;
        this.codeStr = this.creditCodes.map((x) => x.creditCode).join(', ');
        let i = 0;
        this.dataTables = this.ledgers.map((x) => {
            this.total += x.amount;
            let codeX = this.buildMaHang(x);
            this.Dvts[i++] = this.buildDonViTinh(x);
            return {
                orginalDescription: x.orginalDescription,
                code: codeX,
                quantity: x.quantity,
                unitPrice: x.unitPrice,
                amount: x.amount,
                invoiceProductItem: x.invoiceProductItem,
            };
        });
    }

    buildMaHang(item: Ledger) {
        var code = item.debitCode;
        if (item.debitDetailCodeFirst && item.debitDetailCodeFirst.length > 0) {
            code = item.debitDetailCodeFirst;
        }

        if (
            item.debitDetailCodeSecond &&
            item.debitDetailCodeSecond.length > 0
        ) {
            code = item.debitDetailCodeSecond;
        }
        return code;
    }

    buildDonViTinh(item: Ledger) {
        // build ref code
        var refCode = item.debitCode;
        if (
            item.debitDetailCodeSecond &&
            item.debitDetailCodeSecond.length > 0
        ) {
            refCode = item.debitDetailCodeFirst;
        }
        var currentCode = this.buildMaHang(item);

        // try {
        //     var receive = await this.caseService.getListDetailsDisplayInsertCase({
        //         page: 0,
        //         pagesize: 1,
        //     }, refCode, currentCode).subscribe(res => {
        //         console.log(res);
        //     });
        //     var unit = "";
        //     if (receive && receive.ti > 0 && receive.dt && receive.dt.length > 0) {
        //         unit = receive.dt[0].stockUnit;
        //     }
        //     console.log(`Đơn vị tính: ${unit}`);
        //     if (!unit || unit.length <= 0) {
        //         return "--";
        //     } else {
        //         return unit;
        //     }
        //     } catch (e) {
        //     } finally {
        // }
        return '--';
    }
}
