import { Injectable, OnInit } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Resolve,
    RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { KpiService } from '../../../service/kpi.service';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { TreeNode } from 'primeng/api';

@Injectable({
    providedIn: 'root',
})
export class ReportKpiResolver implements Resolve<any> {
    constructor(private kpiService: KpiService) {}

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): Observable<any> {
        return this.kpiService.getReportKPI({
            Month: moment(Date.now()).month() + 1,
        });
    }
}
