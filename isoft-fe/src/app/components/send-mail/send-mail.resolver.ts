import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Resolve,
    RouterStateSnapshot,
} from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { SendMailService } from '../../service/send-mail.service';
import { CustomerService } from '../../service/customer.service';
import { UserService } from '../../service/user.service';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SendMailResolver implements Resolve<any> {
    constructor(
        private sendMailService: SendMailService,
        private customerService: CustomerService,
        private userService: UserService,
    ) {}

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): Observable<any> {
        return forkJoin([
            this.sendMailService.getList(),
            this.customerService.getAllCustomer(),
            this.userService.getAllUserActive(),
        ]).pipe(
            map((res) => {
                return {
                    customerList: res[1].data,
                    user: res[2].data,
                    ...res[0],
                };
            }),
        );
    }
}
