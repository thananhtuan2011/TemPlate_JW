import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DocumentService } from 'src/app/service/document.service';
import AppUtil from 'src/app/utilities/app-util';
import { AssetsFixedService } from '../../../../../service/assets-fixed.service';
import { LedgerService } from '../../../../../service/ledger.service';
import { ChartOfAccountService } from '../../../../../service/chart-of-account.service';

@Component({
    selector: 'app-cost-entry',
    templateUrl: './cost-entry.component.html',
    styles: [
        `
            :host ::ng-deep {
                .p-datatable-scrollable-both .p-datatable-tbody > tr > td {
                    padding: 1rem 1rem !important;
                    font-size: 0.875rem !important;
                }

                .p-inputtext,
                .p-inputgroup > .p-inputwrapper > .p-component > .p-inputtext {
                    width: 100px;
                }

                .p-button,
                .p-button .p-button-icon-left,
                .p-datatable-scrollable-both .p-datatable-tbody > tr > td {
                    font-size: 0.875rem !important;
                }

                .p-datatable-tbody {
                    min-height: auto !important;
                }

                .p-paginator {
                    height: auto !important;
                }
                .p-datatable .p-datatable-thead > tr > th {
                    padding: 2px 2px;
                    font-size: 11px;
                }

                .p-datatable .p-datatable-tbody > tr > td {
                    padding: 2px 2px;
                    font-size: 11px;
                    max-height: 30px;
                    min-height: 30px;
                }
            }
        `,
    ],
})
export class CostEntryComponent implements OnInit {
    appUtil = AppUtil;
    @Input('display') display = false;
    @Input('paramToGetLedgers') paramToGetLedgers: any = {};
    @Output() onCancel = new EventEmitter();
    costOfGoods: any[] = [];
    chartOfAccounts: any[] = [];
    loading = false;
    totalRecords = 0;
    totalPages = 0;
    first = 0;

    constructor(
        private ledgerService: LedgerService,
        private messageService: MessageService,
        private translateService: TranslateService,
        private chartOfAccountService: ChartOfAccountService,
    ) {}

    ngOnInit(): void {}

    onSave() {
        this.ledgerService
            .createCostOfGoods(
                this.costOfGoods,
                this.paramToGetLedgers.isInternal,
            )
            .subscribe((res) => {
                this.messageService.add({
                    severity: 'success',
                    detail: 'Đã lưu thành công',
                });
            });
    }

    getCostOfGoods(event?: any) {
        this.ledgerService
            .getCostOfGoods(this.paramToGetLedgers)
            .subscribe((res) => {
                this.costOfGoods = res.data || [];
                this.costOfGoods.forEach((cost) => {
                    if (!cost.creditWarehouseName) {
                        cost.creditWarehouseName = '';
                    }
                });
            });
    }

    getChartOfAccounts() {
        this.chartOfAccountService
            .getAllByDisplayInsert()
            .subscribe((res: any) => {
                this.chartOfAccounts = res;
            });
    }
}
