import { Component, Input, OnInit } from '@angular/core';
import { Company } from 'src/app/models/company.model';
import AppUtil from '../../../../utilities/app-util';
import { DiscountTypeEnum } from '../../../../utilities/app-enum';

@Component({
    selector: 'app-pxk-v1',
    templateUrl: './pxk-v1.component.html',
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
    styleUrls: ['./pxk-v1.component.css'],
})
export class PxkV1Component implements OnInit {
    appUtil = AppUtil;
    constructor() {}
    @Input() company: Company;
    @Input() dataPrint: any;

    ngOnInit(): void {}

    numberWithCommas(n) {
        return n?.toString()?.replace(/\B(?!\.\d*)(?=(\d{3})+(?!\d))/g, '.');
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

    getDateType(date, type) {
        if (type === 'month') {
            return new Date(date).getMonth();
        }
        if (type === 'year') {
            return new Date(date).getFullYear();
        }
        return new Date(date).getDay();
    }
}
