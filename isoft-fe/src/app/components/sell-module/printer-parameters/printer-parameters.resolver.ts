import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Resolve,
    RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { PrintSettingService } from '../../../service/print-setting.service';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class PrinterParametersResolver implements Resolve<boolean> {
    constructor(private printSettingService: PrintSettingService) {}

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): Observable<boolean> {
        return this.printSettingService.getPageSetting().pipe(
            map((res) => {
                return res.data;
            }),
        );
    }
}
