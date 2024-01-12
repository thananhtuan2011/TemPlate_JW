import { Component, Input, OnInit } from '@angular/core';
import { Company } from 'src/app/models/company.model';
import { environment } from '../../../../../environments/environment';
import AppUtil from '../../../../utilities/app-util';
import { DiscountTypeEnum } from '../../../../utilities/app-enum';

@Component({
    selector: 'app-baogia',
    templateUrl: './baogia.component.html',
    styles: [
        `
            .a5-horizontal {
                width: 21cm;
                height: 13cm;
                margin: 0;
                padding-top: 20px;
            }

            th {
                font-weight: bold;
            }
        `,
    ],
    styleUrls: ['./baogia.component.css'],
})
export class BaogiaComponent implements OnInit {
    appUtil = AppUtil;
    constructor() {}
    @Input() company: Company;
    @Input() dataPrint: any;
    @Input() isHeaderVisible: boolean = true;
    date = new Date();
    ngOnInit(): void {}

    numberWithCommas(n) {
        return n?.toString()?.replace(/\B(?!\.\d*)(?=(\d{3})+(?!\d))/g, '.');
    }

    get imageLogo() {
        return environment.serverURL + '/Uploads/Images/logo-02.png';
    }

    get totalAmountInWord() {
        return this.dataPrint.totalAmount == 0
            ? 'Không'
            : this.appUtil
                  .formatCurrencyVNDString(this.dataPrint.totalAmount)
                  .replace(' VND', 'đ');
    }

    get products() {
        return this.dataPrint.goods.map((good: any) => {
            good.salePrice = this.calculateSalePriceIncDiscount(good);
            good.amount = good.salePrice * good.quantity;
            return good;
        });
    }

    calculateSalePriceIncDiscount(good) {
        let discountMoney = good.discountPrice;
        if (good.discountType == DiscountTypeEnum.Percent) {
            discountMoney = (good.unitPrice * good.discountPrice) / 100;
        }
        return good.unitPrice - discountMoney;
    }
}
