import { Component, HostListener, OnInit } from '@angular/core';
import { KpiService } from '../../../service/kpi.service';
import { BaseTableKPI } from '../../../utilities/app-base-table-kpi';
import { ActivatedRoute, Router } from '@angular/router';
import { TargetKpi } from '../../../models/kpi/target-kpi';
import { FormControl } from '@angular/forms';
import AppUtil from '../../../utilities/app-util';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import AppConstants from '../../../utilities/app-constants';

@Component({
    selector: 'app-target-kpi',
    templateUrl: './target-kpi.component.html',
    styles: [
        `
            .btn-kpi-add {
                margin: 0 0 0 auto;
            }

            .table-target-kpi {
                .p-column-title {
                    white-space: nowrap;
                }
            }
        `,
    ],
})
export class TargetKpiComponent
    extends BaseTableKPI<TargetKpi>
    implements OnInit
{
    appConstant = AppConstants;
    month = new FormControl(this.defaultParam.Month);
    isUpdate = false;

    constructor(
        private _kpiService: KpiService,
        private activatedRoute: ActivatedRoute,
        private confirmationService: ConfirmationService,
        private translateService: TranslateService,
        private messageService: MessageService,
        public breakpointObserver: BreakpointObserver,
        public router: Router,
    ) {
        super(breakpointObserver, activatedRoute);
    }

    ngOnInit(): void {
        this.loadHeader();
    }

    fetchData(): void {
        const request = this._kpiService.getListKPI({
            ...this.defaultParam,
            Month: this.month.value,
        });
        this.processData(request);
    }

    loadHeader() {
        this.cols = [
            {
                header: 'label.kpi_procedureNumber',
                field: 'procedureNumber',
                classHeader: 'py-4 w--20',
                classBody: 'py-4 w--20',
            },
            {
                header: 'label.kpi_name',
                field: 'name',
                classHeader: 'py-4 w--20',
                classBody: 'py-4 w--20',
            },
            {
                header: 'label.kpi_department',
                field: 'departmentName',
                classHeader: 'py-4 w--20',
                classBody: 'py-4 w--20',
            },
            {
                header: 'label.kpi_created',
                field: 'createAt',
                classHeader: 'py-4 w--20',
                classBody: 'py-4 w--20',
            },
        ];
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        this.month.valueChanges.subscribe((_) => {
            this.defaultParam.Page = 1;
            this.fetchData();
        });
    }

    onDelete(id: string | number) {
        this.confirmationService.confirm({
            header: AppUtil.translate(
                this.translateService,
                'question.delete_confirm',
            ),
            message: AppUtil.translate(
                this.translateService,
                'question.delete_confirm',
            ),
            accept: () => {
                this._kpiService
                    .deleteKPI(id)
                    .pipe(
                        catchError((err: HttpErrorResponse) => {
                            this.messageService.add({
                                severity: 'error',
                                detail: AppUtil.translate(
                                    this.translateService,
                                    'error.1',
                                ),
                            });
                            return throwError(err);
                        }),
                    )
                    .subscribe((_) => {
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.delete',
                            ),
                        });
                        this.fetchData();
                    });
            },
        });
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                this.isUpdate = true;
                this.router.navigate(['/uikit/kpi/target/create']);
                break;
        }
    }
}
