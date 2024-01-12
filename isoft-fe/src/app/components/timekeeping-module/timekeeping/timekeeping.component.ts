import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ColumnFilter, Table } from 'primeng/table';
import { forkJoin } from 'rxjs';
import { Symbol } from 'src/app/models/symbol.model';
import { SymbolService } from 'src/app/service/symbol.service';
import { TargetService } from 'src/app/service/target.service';
import { TimekeepingService } from 'src/app/service/timekeeping.service';
import { PageFilterUser, UserService } from 'src/app/service/user.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
@Component({
    selector: 'app-timekeeping',
    templateUrl: './timekeeping.component.html',
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
            :host ::ng-deep .p-datepicker-group-container {
                width: 18rem;
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
export class TimekeepingComponent implements OnInit {
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
        dateTimeKeep: new Date(),
    };
    public totalRecords = 0;
    public totalPages = 0;
    public myTarget: number;

    public isLoading: boolean = false;

    public lstTimekeeping = [];

    isMobile = screen.width <= 1199;
    pendingRequest: any;
    roles: any[] = [];
    exportParam = {
        dateTimeKeep: new Date(),
    };
    listSymbol: Symbol[] = [];
    listMethod = [
        { name: 'BT', id: 1 },
        { name: 'TC', id: 2 },
        { name: 'P', id: 3 },
        { name: 'KP', id: 4 },
    ];
    listTarget = [];

    constructor(
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private symbolService: SymbolService,
        private TimeKeepingService: TimekeepingService,
        private targetService: TargetService,
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
            this.listTarget = target.data;
            this.listSymbol = symbol.data;
        });
        this.getTimekeeping();
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getTimekeeping();
        }
    }

    onChangeSort(event, type?) {
        if (type === 'sortType') {
            this.getParams.isSort = event.value;
        }
        console.log(event);
        this.getTimekeeping();
    }

    clearFilter(columnFilter: ColumnFilter, field: string) {
        columnFilter.clearFilter();
    }

    getTimekeeping(event?: any, isExport: boolean = false): void {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        this.loading = true;
        if (event) {
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }
        this.getParams.dateTimeKeep = moment(
            this.exportParam?.dateTimeKeep,
        ).format('YYYY/MM/DD');
        Object.keys(this.getParams).forEach(
            (k) => this.getParams[k] == null && delete this.getParams[k],
        );
        this.pendingRequest = this.TimeKeepingService.getListInOut(
            this.getParams,
        ).subscribe(
            (response) => {
                AppUtil.scrollToTop();
                this.lstTimekeeping = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            },
            (err) => console.log(err),
        );
    }

    updateTimeKeeper(data: TimeKeeping) {
        //call API update
        let message = 'Chắc chắn chấm công';
        data.symbolCode = data.defaultSymbolCode;
        if (!data.symbolCode) return;
        // tranfer data
        data.symbolName = data.symbolCode
            ? this.listSymbol.find((item) => item.code === data.symbolCode)
                  ?.name
            : null;
        data.symbolId = data.symbolCode
            ? this.listSymbol.find((item) => item.code === data.symbolCode)?.id
            : null;
        data.targetCode = this.listTarget.find(
            (item) => item.id === data.targetId,
        )?.code;
        console.log(data.targetCode);
        data.userFullName = data.fullName;
        data.userName = data.username;
        data.timeIn = moment(this.getParams.dateTimeKeep).format(
            this.appConstant.FORMAT_DATE.MOMENT_T_DATE,
        );
        data.timeIn = moment(this.getParams.dateTimeKeep).format(
            this.appConstant.FORMAT_DATE.MOMENT_T_DATE,
        );
        data.checked = true;
        data.isOverTime = 0;
        this.TimeKeepingService.saveInOut(data).subscribe(() => {
            this.getTimekeeping();
        });
    }
    updateTimeKeeperWith(data: TimeKeeping) {
        let message: string;
        this.translateService
            .get('question.confirm_timekeeping_again')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                data.symbolCode = data.defaultSymbolCode;
                if (!data.symbolCode) return;
                // tranfer data
                data.symbolName = data.symbolCode
                    ? this.listSymbol.find(
                          (item) => item.code === data.symbolCode,
                      )?.name
                    : null;
                data.symbolId = data.symbolCode
                    ? this.listSymbol.find(
                          (item) => item.code === data.symbolCode,
                      )?.id
                    : null;
                data.targetCode = this.listTarget.find(
                    (item) => item.id === data.targetId,
                )?.code;
                console.log(data.targetCode);
                data.userFullName = data.fullName;
                data.userName = data.username;
                data.timeIn = moment(this.getParams.dateTimeKeep).format(
                    this.appConstant.FORMAT_DATE.MOMENT_T_DATE,
                );
                data.timeOut = moment(this.getParams.dateTimeKeep).format(
                    this.appConstant.FORMAT_DATE.MOMENT_T_DATE,
                );
                data.checked = true;
                data.isOverTime = 0;
                this.TimeKeepingService.saveInOut(data).subscribe(() => {
                    this.getTimekeeping();
                });
            },
        });
    }
}

interface TimeKeeping {
    checkInMethod: number;
    checked: boolean;
    id: number;
    isOverTime: number;
    isSort: boolean;
    page: number;
    pageSize: number;
    searchText: string;
    sortField: string;
    symbolCode: number | string;
    symbolId: number;
    symbolName: string;
    targetCode: string | number;
    targetName: string;
    timeIn: string;
    timeOut: string;
    userFullName: string;
    userId: number;
    defaultSymbolCode?: number | string;
    fullName?: string;
    targetId?: number;
    username?: string;
    userName?: string;
}
