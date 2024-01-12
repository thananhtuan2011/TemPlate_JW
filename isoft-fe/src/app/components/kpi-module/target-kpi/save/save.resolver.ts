import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Resolve,
    RouterStateSnapshot,
} from '@angular/router';
import { forkJoin, map, Observable, switchMap, tap } from 'rxjs';
import { KpiService } from '../../../../service/kpi.service';
import { DepartmentService } from '../../../../service/department.service';
import { UserService } from '../../../../service/user.service';

@Injectable({
    providedIn: 'root',
})
export class SaveResolver implements Resolve<boolean> {
    constructor(
        private kpiService: KpiService,
        private departmentService: DepartmentService,
        private userService: UserService,
    ) {}

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): Observable<any> {
        const id = route?.params?.id;

        const source$ = [
            this.kpiService.getProcedureNumber(),
            this.departmentService.getAllDepartment({
                isDelate: 0,
            }),
            this.userService.getAllUserActive(),
        ];

        if (id) {
            source$.push(this.kpiService.getKPIById(id));
        }
        return forkJoin(source$).pipe(
            map((res: any) => {
                return {
                    procedureNumberKPI: res[0],
                    departments: res[1]?.data,
                    users: res[2]?.data,
                    ...res[3],
                };
            }),
        );
    }
}
