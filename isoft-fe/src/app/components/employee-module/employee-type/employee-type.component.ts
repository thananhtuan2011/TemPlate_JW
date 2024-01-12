import {
    Component,
    ElementRef,
    HostListener,
    OnInit,
    ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ColumnFilter, Table } from 'primeng/table';
import { TypeData } from 'src/app/models/common.model';
import { ContractType } from 'src/app/models/contract-type.model';
import { ContractTypeService } from 'src/app/service/contract-type.service';
import { PageFilterUser } from 'src/app/service/user.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import { environment } from 'src/environments/environment';
import { EmployeeTypeFormComponent } from './employee-type-form/employee-type-form.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-employee-type',
    templateUrl: './employee-type.component.html',
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
export class EmployeeTypeComponent implements OnInit {
    public appConstant = AppConstant;
    @ViewChild('ContractTypeForm') ContractTypeFormComponent:
        | EmployeeTypeFormComponent
        | undefined;

    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    first = 0;

    @ViewChild('dt') table: Table;

    @ViewChild('filter') filter: ElementRef;

    public getParams: any = {
        page: 1,
        pageSize: 5,
        sortField: 'id',
        isSort: true,
        searchText: '',
        typeContract: 0
    };
    public totalRecords = 0;
    public totalPages = 0;
    public myTarget: number;

    public isLoading: boolean = false;

    public lstContractTypes: ContractType[] = [];

    display: boolean = false;

    isMobile = screen.width <= 1199;

    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;

    pendingRequest: any;
    typeContracts : any = [ { value: 0, label: 'Nhân sự' },
    { value: 1, label: 'Khách hàng' },];

    constructor(
        private readonly ContractTypeService: ContractTypeService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private router: Router,
    ) {}

    ngOnInit() {
        AppUtil.getUserSortTypes(this.translateService).subscribe((res) => {
            this.sortFields = res;
        });
        AppUtil.getSortTypes(this.translateService).subscribe((res) => {
            this.sortTypes = res;
        });
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getContractTypes();
        }
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.getParams.isSort = event.value;
        }
        this.getContractTypes();
    }

    clearFilter(columnFilter: ColumnFilter, field: string) {
        columnFilter.clearFilter();
    }

    getContractTypes(event?: any, isExport: boolean = false): void {
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
        this.pendingRequest = this.ContractTypeService.getListContractType(
            this.getParams,
        ).subscribe((response: TypeData<ContractType>) => {
            AppUtil.scrollToTop();
            this.lstContractTypes = response.data;
            this.totalRecords = response.totalItems || 0;
            this.totalPages = response.totalItems / response.pageSize + 1;
            this.loading = false;
        });
    }

    getDetail(ContractTypeId) {
        this.ContractTypeService.getContractTypeDetail(
            ContractTypeId,
        ).subscribe((response: ContractType) => {
            this.formData = response;
            this.isEdit = true;
            this.showDialog();
        });
    }

    onAddContractType() {
        this.isEdit = false;
        this.showDialog();
    }

    onDelete(ContractTypeId) {
        let message;
        this.translateService
            .get('question.delete_ContractType_content')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                this.ContractTypeService.deleteContractType(
                    ContractTypeId,
                ).subscribe((response: any) => {
                    this.getContractTypes();
                });
            },
        });
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    showDialog() {
        this.ContractTypeFormComponent.onReset();
        this.display = true;
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddContractType();
                break;
        }
    }
}
