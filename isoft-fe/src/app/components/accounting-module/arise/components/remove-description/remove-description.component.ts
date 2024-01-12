import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { TypeData } from 'src/app/models/common.model';
import { Description } from 'src/app/models/description.model';
import { DescriptionService } from 'src/app/service/description.service';
import { PageFilterPayer } from 'src/app/service/payer.service';
import AppUtil from 'src/app/utilities/app-util';
@Component({
    selector: 'app-remove-description',
    templateUrl: './remove-description.component.html',
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
export class RemoveDescriptionComponent implements OnInit {
    @Output() onCancel = new EventEmitter();
    @Output() onRemove = new EventEmitter();

    public getParams: PageFilterPayer = {
        page: 1,
        pageSize: 50,
        sortField: 'id',
        isSort: true,
        searchText: '',
    };

    pendingRequest: any;

    descs: Description[] = [];
    selectedDescs: Description[] = [];
    public totalRecords = 0;
    public totalPages = 0;
    public loading = false;
    first = 0;

    constructor(
        private descriptionService: DescriptionService,
        private messageService: MessageService,
        private translateService: TranslateService,
    ) {}

    ngOnInit(): void {}

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getDescs(null);
        }
    }

    getDescs(event) {
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

        this.pendingRequest = this.descriptionService
            .getPaging(this.getParams)
            .subscribe((response: TypeData<Description>) => {
                this.descs = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    remove() {
        // remove descs
        this.descriptionService
            .deleteMany(this.selectedDescs.map((x) => x.id))
            .subscribe((res) => {
                this.selectedDescs = [];
                this.getDescs(null);
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
}
