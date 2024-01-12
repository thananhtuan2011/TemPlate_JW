import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Resolve,
    RouterStateSnapshot,
} from '@angular/router';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { KpiService } from '../../../service/kpi.service';

@Injectable({
    providedIn: 'root',
})
export class TargetKpiResolver implements Resolve<boolean> {
    constructor(private kpiService: KpiService) {}

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): Observable<any> {
        return this.kpiService.getListKPI({
            Page: 1,
            Month: moment(Date.now()).month() + 1,
        });
    }
}
