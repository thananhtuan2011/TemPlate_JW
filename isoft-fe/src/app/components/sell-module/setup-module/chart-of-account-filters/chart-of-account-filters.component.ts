import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
    PageFilterRoomTable,
    RoomTableService,
} from 'src/app/service/room-table.service';
import AppUtil from 'src/app/utilities/app-util';
import { environment } from 'src/environments/environment';
import { RoomTable } from 'src/app/models/room-table.model';
import { ChartOfAccountFiltersFormComponent } from './component/chart-of-account-filters-form/chart-of-account-filters-form.component';
import { DocumentTypeService } from '../../../../service/document-type.service';
import { DocumentService } from '../../../../service/document.service';
import { Document } from '../../../../models/document.model';
import { CoaFiltersModel } from '../../../../models/coa-filters.model';
import { COAService } from '../../../../service/coa-filters.service';
import { ChartOfAccountService } from '../../../../service/chart-of-account.service';

@Component({
    selector: 'app-chart-of-account-filters',
    templateUrl: './chart-of-account-filters.component.html',
    providers: [MessageService, ConfirmationService],
    styles: [
        `
            :host ::ng-deep .p-badge {
                font-size: 0.75rem;
            }
            :host ::ng-deep .p-frozen-column {
                font-weight: bold;
            }
            :host ::ng-deep .p-datatable-frozen-tbody {
                font-weight: bold;
            }
            :host ::ng-deep .p-progressbar {
                height: 0.5rem;
            }
            :host ::ng-deep .p-panel .p-panel-header .p-panel-header-icon {
                position: absolute;
                top: 92px;
                right: 30px;
            }
            :host ::ng-deep .p-button {
                height: 40px;
            }
        `,
    ],
})
export class ChartOfAccountFiltersComponent implements OnInit {
    @ViewChild('coaFilterForm')
    coaFilterForm: ChartOfAccountFiltersFormComponent;
    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    first = 0;

    public getParams: PageFilterRoomTable = {
        page: 1,
        pageSize: 5,
        sortField: 'id',
        isSort: true,
        floorId: 0,
        isFloor: 'true',
        searchText: '',
    };
    public totalRecords = 0;
    public totalPages = 0;

    public isLoading: boolean = false;

    public coaFilters: RoomTable[] = [];

    display: boolean = false;

    isMobile = screen.width <= 1199;

    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;

    floors: RoomTable[];
    documents: Document[];
    chartOfAccounts: any[];

    pendingRequest: any;

    constructor(
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly roomTableServices: RoomTableService,
        private readonly documentService: DocumentService,
        private readonly chartOfAccountService: ChartOfAccountService,
        private readonly coaFiltersService: COAService,
    ) {}

    ngOnInit() {
        this.getChartOfAccounts();
        this.getDocuments();
    }

    // get list chart of account
    getChartOfAccounts() {
        this.chartOfAccountService
            .getAllByDisplayInsert()
            .subscribe((res: any) => {
                this.chartOfAccounts = res;
            });
    }

    getAccountNames(codes: string) {
        let results = [];
        codes.split(';').forEach((code) => {
            results.push(code);
        });
        return results.join(', ');
    }

    getDocuments() {
        this.documentService.getAllActiveDocument().subscribe((res) => {
            this.documents = res?.data || [];
        });
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getCOAFilters();
        }
    }

    getCOAFilters(event?: any): void {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        this.loading = true;
        if (event) {
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }
        Object.keys(this.getParams).forEach(
            (k) => this.getParams[k] == null && delete this.getParams[k],
        );
        this.pendingRequest = this.coaFiltersService
            .getList(this.getParams)
            .subscribe((response: any) => {
                AppUtil.scrollToTop();
                this.coaFilters = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    getDetail(id) {
        this.isEdit = true;
        this.coaFilterForm.onReset();
        this.coaFilterForm.getDetail(id);
        this.display = true;
    }

    onAddCOAFilters() {
        this.isEdit = false;
        this.coaFilterForm.onReset();
        this.display = true;
    }

    onDelete(id) {
        let message;
        this.translateService
            .get('question.delete_room_table')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                this.coaFiltersService.delete(id).subscribe((response: any) => {
                    this.getCOAFilters();
                });
            },
        });
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddCOAFilters();
                break;
        }
    }
}
