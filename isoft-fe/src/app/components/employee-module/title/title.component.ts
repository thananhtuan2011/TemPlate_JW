import {
    Component,
    ElementRef,
    HostListener,
    OnInit,
    ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ColumnFilter, Table } from 'primeng/table';
import { TypeData } from 'src/app/models/common.model';
import { Position } from 'src/app/models/position.model';
import { PageFilterUser } from 'src/app/service/user.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import { environment } from 'src/environments/environment';
import { PositionService } from 'src/app/service/position.service';
import { TitleFormComponent } from './title-form/title-form.component';

@Component({
    selector: 'app-title',
    templateUrl: './title.component.html',
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
        `,
    ],
})
export class TitleComponent implements OnInit {
    public appConstant = AppConstant;
    @ViewChild('PositionForm') TitleFormComponent:
        | TitleFormComponent
        | undefined;

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
    };
    public totalRecords = 0;
    public totalPages = 0;
    public myTarget: number;

    public isLoading: boolean = false;

    public lstPositions: Position[] = [];

    display: boolean = false;

    isMobile = screen.width <= 1199;

    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;

    pendingRequest: any;

    roles: any[] = [];

    constructor(
        private readonly PositionService: PositionService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
    ) {}

    ngOnInit() {
        AppUtil.getUserSortTypes(this.translateService).subscribe((res) => {
            this.sortFields = res;
        });
        AppUtil.getSortTypes(this.translateService).subscribe((res) => {
            this.sortTypes = res;
        });
    }

    formatCurrency(value) {
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getPositions();
        }
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.getParams.isSort = event.value;
        }
        this.getPositions();
    }

    clearFilter(columnFilter: ColumnFilter, field: string) {
        columnFilter.clearFilter();
    }

    getPositions(event?: any, isExport: boolean = false): void {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        this.loading = true;
        if (event) {
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }
        // if (isExport) {
        //     this.religionService
        //         .getExcelReport(this.getParams)
        //         .subscribe((res: any) => {
        //             AppUtil.scrollToTop();
        //             this.openDownloadFile(res.data, 'excel');
        //         });
        // }
        // remove undefined value
        Object.keys(this.getParams).forEach(
            (k) => this.getParams[k] == null && delete this.getParams[k],
        );
        this.pendingRequest = this.PositionService.getListPosition(
            this.getParams,
        ).subscribe((response: TypeData<Position>) => {
            AppUtil.scrollToTop();
            this.lstPositions = response.data;
            this.totalRecords = response.totalItems || 0;
            this.totalPages = response.totalItems / response.pageSize + 1;
            this.loading = false;
        });
    }

    getDetail(PositionId) {
        this.PositionService.getPositionDetail(PositionId).subscribe(
            (response: Position) => {
                this.formData = response;
                this.isEdit = true;
                this.showDialog();
            },
        );
    }

    onDelete(PositionId) {
        let message;
        this.translateService
            .get('question.delete_Position_content')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                this.PositionService.deletePosition(PositionId).subscribe(
                    (response: any) => {
                        this.getPositions();
                    },
                );
            },
        });
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    showDialog() {
        this.TitleFormComponent.onReset();
        this.display = true;
    }

    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                this.isEdit = false;
                this.showDialog();
                break;
        }
    }
}
