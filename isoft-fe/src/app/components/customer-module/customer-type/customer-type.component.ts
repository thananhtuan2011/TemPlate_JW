import {
    Component,
    ElementRef,
    HostListener,
    OnInit,
    ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table, ColumnFilter } from 'primeng/table';
import { TypeData } from 'src/app/models/common.model';
import { CustomerClassification } from 'src/app/models/customer-classification.model';
import { District } from 'src/app/models/district.model';
import { Province } from 'src/app/models/province.model';
import { UserRoleCRUD } from 'src/app/models/user-role.model';
import { Ward } from 'src/app/models/ward.model';
import { CustomerClassificationService } from 'src/app/service/customer-classification.service';
import {
    PageFilterCustomer,
    CustomerService,
} from 'src/app/service/customer.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import { environment } from 'src/environments/environment';
import { CustomerTypeFormComponent } from './components/customer-type-form/customer-type-form.component';
@Component({
    selector: 'app-customer-type',
    templateUrl: './customer-type.component.html',
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

            :host ::ng-deep .p-badge {
                background-color: inherit;
                padding: 0 16px;
                font-size: 14px;
            }
        `,
    ],
})
export class CustomerTypeComponent implements OnInit {
    public appConstant = AppConstant;
    @ViewChild('customerTypeForm') customerTypeForm:
        | CustomerTypeFormComponent
        | undefined;

    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    pendingRequest: any;

    first = 0;

    @ViewChild('dt') table: Table;

    @ViewChild('filter') filter: ElementRef;

    public getParams: PageFilterCustomer = {
        page: 0,
        pageSize: 5,
        sortField: 'id',
        isSort: true,
        keyword: '',
    };
    public totalRecords = 0;
    public totalPages = 0;
    public myTarget: number;

    public isLoading: boolean = false;

    public lstCustomersClassification: CustomerClassification[] = [];

    display: boolean = false;

    isMobile = screen.width <= 1199;

    formData: any = {};
    formCustomerTaxData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;

    districts: District[] = [];
    provinces: Province[] = [];
    nativeProvinces: Province[] = [];
    wards: Ward[] = [];
    roles: any[] = [];
    branches: any[] = [];
    majors: any[] = [];
    warehouses: any[] = [];
    positionDetails: any[] = [];
    targets: any[] = [];
    symbols: any[] = [];
    contractTypes: any[] = [];

    constructor(
        private messageService: MessageService,
        private readonly customerService: CustomerService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly customerClassificationService: CustomerClassificationService,
        private _host: ElementRef,
    ) {}

    ngOnInit() {
        AppUtil.getCustomerClassificationSortTypes(
            this.translateService,
        ).subscribe((res) => {
            this.sortFields = res;
        });
        AppUtil.getSortTypes(this.translateService).subscribe((res) => {
            this.sortTypes = res;
        });
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getCustomers();
        }
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.getParams.isSort = event.value;
        }
        this.getCustomers();
    }

    clearFilter(columnFilter: ColumnFilter, field: string) {
        columnFilter.clearFilter();
    }

    private openDownloadFile(_fileName: string, _ft: string) {
        try {
            this.isLoading = false;
            var _l = this.customerService.getFolderPathDownload(_fileName, _ft);
            if (_l) window.open(_l);
        } catch (ex) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error Message',
                detail: 'File invalid',
            });
        }
    }

    getCustomers(event?: any, isExport: boolean = false): void {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        this.loading = true;
        if (event) {
            this.getParams.page = event.first / event.rows;
            this.getParams.pageSize = event.rows;
        }
        if (isExport) {
            // this.customerClassificationService
            //     .getExcelReport(this.getParams)
            //     .subscribe((res: any) => {
            //         AppUtil.scrollToTop();
            //         this.openDownloadFile(res.data, 'excel');
            //     });
        }
        // remove undefined value
        Object.keys(this.getParams).forEach(
            (k) => this.getParams[k] == null && delete this.getParams[k],
        );

        this.pendingRequest = this.customerClassificationService
            .getCustomerClassification(this.getParams)
            .subscribe((response: TypeData<CustomerClassification>) => {
                AppUtil.scrollToTop();
                this.lstCustomersClassification = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    getDetail(customerId: number) {
        this.isEdit = true;
        this.customerTypeForm.getDetail(customerId);
        this.showDialog();

        // this.getCustomerTaxDetail(customerId);
    }

    onDelete(userId) {
        let message;
        this.translateService
            .get('question.delete_customer_content')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                this.customerClassificationService
                    .deleteCustomerClassification(userId)
                    .subscribe((response: CustomerClassification) => {
                        this.getCustomers();
                    });
            },
        });
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    showDialog() {
        this.customerTypeForm.onReset();
        this.display = true;
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                this.isEdit = false;
                await this.showDialog();
                break;
        }
    }
}
