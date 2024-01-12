import { AddPriceList } from './add-price-list';

export interface UpdatePriceList extends AddPriceList {
    priceFrom?: number;
    priceTo?: number;
    priceList?: string;
}
