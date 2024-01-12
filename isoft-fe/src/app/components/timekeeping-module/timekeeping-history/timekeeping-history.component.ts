import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ColumnFilter, Table } from 'primeng/table';
import { forkJoin } from 'rxjs';
import { TypeData } from 'src/app/models/common.model';
import { Relation } from 'src/app/models/relation.model';
import { RelationService } from 'src/app/service/relation.service';
import { SymbolService } from 'src/app/service/symbol.service';
import { TargetService } from 'src/app/service/target.service';
import { TimekeepingHistoryService } from 'src/app/service/timekeeping-history.service';
import { PageFilterUser, UserService } from 'src/app/service/user.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
@Component({
    selector: 'app-timekeeping-history',
    templateUrl: './timekeeping-history.component.html',
    providers: [MessageService, ConfirmationService],
    styleUrls: ['../../../../assets/demo/badges.scss'],
    styles: [
        `
            :host ::ng-deep .p-frozen-column {
                font-weight: bold;
            }

            :host ::ng-deep .p-datatable-frozen-tbody {
                font-weight: bold;
            }

            :host ::ng-deep .p-progressbar {
                height: 0.5rem;
            }
            :host ::ng-deep .p-calendar {
                .p-datepicker {
                    min-width: 300px;
                    z-index: 100;
                }
            }
            :host ::ng-deep .dropdown-table {
                height: 100%;
                width: 100%;
                .p-dropdown {
                    height: 100%;
                    width: 100%;
                }
            }
        `,
    ],
})
export class TimekeepingHistoryComponent implements OnInit {
    public appConstant = AppConstant;
    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    first = 0;

    @ViewChild('dt') table: Table;

    @ViewChild('filter') filter: ElementRef;

    public getParams: PageFilterUser = {
        page: 1,
        pageSize: 5,
        sortField: 'id',
        isSort: true,
        searchText: '',
        departmentId: null,
        targetId: null,
        checkCurrentUser: true,
        fromDate: null,
        toDate: null,
        dateTimeKeep: moment(new Date().setHours(0, 0, 0, 0)).format(
            this.appConstant.FORMAT_DATE.MOMENT_T_DATE,
        ),
    };
    public totalRecords = 0;
    public totalPages = 0;
    public myTarget: number;
    public isLoading: boolean = false;
    public lstTimekeepingHistory = [];
    display: boolean = false;
    isMobile = screen.width <= 1199;
    pendingRequest: any;
    roles: any[] = [];
    exportParam = {
        fromDate: new Date(),
        toDate: new Date(),
        targetId: null,
    };

    listSymbol = [];
    listMethod = [
        { name: 'BT', id: 1 },
        { name: 'TC', id: 2 },
        { name: 'P', id: 3 },
        { name: 'KP', id: 4 },
    ];
    listTarget = [];

    constructor(
        private readonly translateService: TranslateService,
        private symbolService: SymbolService,
        private readonly targetService: TargetService,
        private timeKeepingHistory: TimekeepingHistoryService,
        private readonly confirmationService: ConfirmationService,
    ) {}

    ngOnInit() {
        AppUtil.getUserSortTypes(this.translateService).subscribe((res) => {
            this.sortFields = res;
        });
        AppUtil.getSortTypes(this.translateService).subscribe((res) => {
            this.sortTypes = res;
        });
        forkJoin([
            this.symbolService.getAllSymbol(),
            this.targetService.getAllTarget(),
        ]).subscribe(([symbol, target]) => {
            this.listSymbol = symbol.data;
            this.listTarget = target.data;
        });
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getTimekeepingHistory();
        }
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.getParams.isSort = event.value;
        }
        this.getTimekeepingHistory();
    }

    clearFilter(columnFilter: ColumnFilter, field: string) {
        columnFilter.clearFilter();
    }

    getTimekeepingHistory(event?: any, isExport: boolean = false): void {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        this.loading = true;
        if (event) {
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }
        this.getParams.fromDate =
            moment(this.exportParam.fromDate.setHours(0, 0, 0, 0)).format(
                this.appConstant.FORMAT_DATE.MOMENT_T_DATE,
            ) || null;
        this.getParams.toDate =
            moment(this.exportParam.toDate.setHours(0, 0, 0, 0)).format(
                this.appConstant.FORMAT_DATE.MOMENT_T_DATE,
            ) || null;
        Object.keys(this.getParams).forEach(
            (k) => this.getParams[k] == null && delete this.getParams[k],
        );
        this.pendingRequest = this.timeKeepingHistory
            .getAll(this.getParams)
            .subscribe((response: TypeData<any>) => {
                AppUtil.scrollToTop();
                this.lstTimekeepingHistory = response.data;
                // convert date
                this.lstTimekeepingHistory.map((item) => {
                    item.timeIn = new Date(item?.timeIn) || null;
                    item.timeOut = new Date(item?.timeOut) || null;
                });
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    updateHistory(data) {
        let message = 'Bạn có muốn sửa bản ghi này không?';
        // this.confirmationService.confirm({
        //     message: message,
        //     accept: () => {
        if (!data.symbolId) return;
        data.timeIn = moment(data.timeIn).format(
            this.appConstant.FORMAT_DATE.MOMENT_T_DATE,
        );
        data.timeOut = moment(data.timeOut).format(
            this.appConstant.FORMAT_DATE.MOMENT_T_DATE,
        );
        this.timeKeepingHistory.updateHistory(data).subscribe(() => {
            this.getTimekeepingHistory();
        });
        // },
        // });
    }
    deleteHistory(data) {
        let message = 'Bạn có muốn xoá bản ghi này không?';
        // this.translateService
        //     .get('question.delete_Relation_content')
        //     .subscribe((res) => {
        //         message = res;
        //     });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                if (!data.symbolId) return;
                this.timeKeepingHistory.deleteHistory(data.id).subscribe(() => {
                    this.getTimekeepingHistory();
                });
            },
        });
    }
}
