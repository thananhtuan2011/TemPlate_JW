import { PageFilterPayer } from '../service/payer.service';

export class Payer {
    id: number = 0;
    code: string = '';
    name: string = '';
    address: string = '';
    phone: string = '';
    email: string = '';
    taxCode: string = '';
    bankNumber: string = '';
    bankName: string = '';
    identityNumber: string = '';
    product: string = '';
    payerType: 1 | 2;
}

export interface PayerPageFilterPayer extends PageFilterPayer {
    payerType: 1 | 2;
}
