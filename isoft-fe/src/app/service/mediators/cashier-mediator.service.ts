import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CashierMediatorService {
    // customers filter change event
    private customerChangedSubject = new BehaviorSubject<any>(null);
    public customerChanged = this.customerChangedSubject.asObservable();

    public notifyOnCustomerFiltered(customers: any[]): void {
        this.customerChangedSubject.next(customers);
    }

    // Cashier bill tab change event
    private selectedTabSubject = new BehaviorSubject<any>(null);
    public $selectedTabChanged = this.selectedTabSubject.asObservable();
    public changeSelectedTab(data: any) {
        console.log('Change Selected Tab Event: ', data);
        this.selectedTabSubject.next(data);
    }

    // Cashier list of price code change event
    private priceCodeSubject = new BehaviorSubject<any>(null);
    public $priceCodeChanged = this.priceCodeSubject.asObservable();
    public changePriceCode(data: any) {
        console.log('Change Price Code Event: ', data);
        this.priceCodeSubject.next(data);
    }
}
