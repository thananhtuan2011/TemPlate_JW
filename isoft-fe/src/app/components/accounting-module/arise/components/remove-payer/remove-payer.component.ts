import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { TypeData } from 'src/app/models/common.model';
import { Payer, PayerPageFilterPayer } from 'src/app/models/payer.model';
import { PageFilterPayer, PayerService } from 'src/app/service/payer.service';
import AppUtil from 'src/app/utilities/app-util';
@Component({
    selector: 'app-remove-payer',
    templateUrl: './remove-payer.component.html',
    styles: [
        `
            :host ::ng-deep {
                .card-table {
                    min-height: auto !important;
                }

                .p-paginator {
                    height: auto !important;
                }

                .p-disabled {
                    background-color: inherit !important;
                }

                .p-button,
                .p-button .p-button-icon-left,
                .p-datatable-scrollable-both .p-datatable-tbody > tr > td {
                    font-size: 0.875rem !important;
                }

                .p-datatable-tbody {
                    min-height: auto !important;
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
export class RemovePayerComponent implements OnInit {
    @Output() onCancel = new EventEmitter();
    @Output() onRemove = new EventEmitter();

    public getParams: PayerPageFilterPayer = {
        page: 1,
        pageSize: 50,
        sortField: 'id',
        isSort: true,
        searchText: '',
        payerType: 1,
    };

    types = [
        {
            value: 1,
            name: '1. Thông tin cá nhân',
        },
        {
            value: 2,
            name: '2. Thông tin công ty',
        },
    ];

    pendingRequest: any;

    payers: Payer[] = [];
    selectedPayers: Payer[] = [];
    public totalRecords = 0;
    public totalPages = 0;
    public loading = false;
    first = 0;

    constructor(
        private payerService: PayerService,
        private messageService: MessageService,
        private translateService: TranslateService,
    ) {}

    ngOnInit(): void {}

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getPayers(null);
        }
    }

    getPayers(event) {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        this.loading = true;
        if (event) {
            this.getParams.page = event.first / event.rows;
            this.getParams.pageSize = event.rows;
        }
        // remove undefined value
        Object.keys(this.getParams).forEach(
            (k) => this.getParams[k] == null && delete this.getParams[k],
        );

        this.pendingRequest = this.payerService
            .getPaging(this.getParams)
            .subscribe((response: TypeData<Payer>) => {
                this.payers = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    remove() {
        // remove payers
        this.payerService
            .deleteMany(this.selectedPayers.map((x) => x.id))
            .subscribe((res) => {
                this.selectedPayers = [];
                this.getPayers(null);
                this.onRemove.emit({});
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.delete',
                    ),
                });
            });
    }

    onChangeType($event) {
        this.getParams.page = 0;
        this.getParams.pageSize = 10;
        this.getParams.sortField = 'id';
        this.getParams.isSort = true;
        this.getParams.searchText = '';
        this.getPayers(null);
    }
}
