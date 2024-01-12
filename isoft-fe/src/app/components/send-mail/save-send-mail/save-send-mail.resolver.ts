import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Resolve,
    RouterStateSnapshot,
} from '@angular/router';
import { forkJoin, map, Observable } from 'rxjs';
import { SendMailService } from '../../../service/send-mail.service';
import { CustomerService } from '../../../service/customer.service';

@Injectable({
    providedIn: 'root',
})
export class SaveSendMailResolver implements Resolve<boolean> {
    constructor(
        private sendMailService: SendMailService,
        private customerService: CustomerService,
    ) {}

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): Observable<boolean> {
        const id = route?.params?.id;

        const source$ = [this.customerService.getAllCustomer()];

        if (id) {
            source$.push(this.sendMailService.getList());
        }
        return forkJoin(source$).pipe(
            map((res: any) => {
                return {
                    customerList: res[0]?.data,
                    ...res[1],
                };
            }),
        );
    }
}
