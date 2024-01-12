import { Injectable } from '@angular/core';
import {
    Router,
    Resolve,
    RouterStateSnapshot,
    ActivatedRouteSnapshot,
} from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { BillHistoryCollectionsService } from '../../../service/bill-history-collections.service';
import { UserService } from '../../../service/user.service';
import { CustomerService } from '../../../service/customer.service';
import { BillService } from '../../../service/bill.service';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class DebtCollectionResolver implements Resolve<any> {
    constructor(
        public billHistoryCollectionsService: BillHistoryCollectionsService,
        public userService: UserService,
        public customerService: CustomerService,
        public billService: BillService,
    ) {}
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): Observable<any> {
        return forkJoin([
            this.userService.getAllUserActive(),
            this.billHistoryCollectionsService.getBillHistoryCollections(),
        ]).pipe(
            map((res) => {
                return {
                    users: res[0].data,
                    collection: res[1],
                };
            }),
        );
    }
}
