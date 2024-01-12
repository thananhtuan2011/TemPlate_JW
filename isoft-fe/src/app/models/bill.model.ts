import { DiscountTypeEnum } from '../utilities/app-enum';

export class BillModel {
    goods?: BillGood[];
    taxRate?: number;

    // Getter
    get subtotalAmount() {
        // TODO
        return 0;
    }

    get taxTotal() {
        return 0;
    }
}

export class BillGood {
    goodId?: number;
    goodName?: string;
    quantity: number;
    unitPrice: number;
    discountPrice: number;
    discountType: DiscountTypeEnum;

    get salePrice() {
        return this.unitPrice - this.discountPriceCalc;
    }

    get discountPriceCalc() {
        // Percent discount
        if (this.discountType == DiscountTypeEnum.Percent) {
            return (this.unitPrice * this.discountPrice) / 100;
        }
        return this.discountPrice;
    }
}
