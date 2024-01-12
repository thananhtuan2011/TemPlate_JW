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
import { PositionDetail } from 'src/app/models/position-detail.model';
import { PageFilterUser } from 'src/app/service/user.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import { environment } from 'src/environments/environment';
import { JobTitleDetailsFormComponent } from './job-title-details-form/job-title-details-form.component';
import { PositionDetailService } from 'src/app/service/position-detail.service';

@Component({
    templateUrl: './job-title-details.component.html',
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
export class JobTitleDetailsComponent implements OnInit {
    public appConstant = AppConstant;
    @ViewChild('PositionDetailForm') PositionDetailFormComponent:
        | JobTitleDetailsFormComponent
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

    public lstPositionDetails: PositionDetail[] = [];

    display: boolean = false;

    isMobile = screen.width <= 1199;

    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;

    pendingRequest: any;

    roles: any[] = [];

    constructor(
        private readonly PositionDetailService: PositionDetailService,
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
            this.getPositionDetails();
        }
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.getParams.isSort = event.value;
        }
        this.getPositionDetails();
    }

    clearFilter(columnFilter: ColumnFilter, field: string) {
        columnFilter.clearFilter();
    }

    getPositionDetails(event?: any, isExport: boolean = false): void {
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
        console.log('this params', this.getParams);
        this.pendingRequest = this.PositionDetailService.getListPositionDetail(
            this.getParams,
        ).subscribe((response: TypeData<PositionDetail>) => {
            AppUtil.scrollToTop();
            this.lstPositionDetails = response.data;
            this.totalRecords = response.totalItems || 0;
            this.totalPages = response.totalItems / response.pageSize + 1;
            this.loading = false;
        });
    }

    getDetail(PositionDetailId) {
        this.PositionDetailService.getPositionDetailDetail(
            PositionDetailId,
        ).subscribe((response: PositionDetail) => {
            this.formData = response;
            this.isEdit = true;
            this.showDialog();
        });
    }

    onDelete(PositionDetailId) {
        let message;
        this.translateService
            .get('question.delete_PositionDetail_content')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                this.PositionDetailService.deletePositionDetail(
                    PositionDetailId,
                ).subscribe((response: any) => {
                    this.getPositionDetails();
                });
            },
        });
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    showDialog() {
        this.PositionDetailFormComponent.onReset();
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
