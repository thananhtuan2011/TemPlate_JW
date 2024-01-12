import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table, ColumnFilter } from 'primeng/table';
import { TypeData } from 'src/app/models/common.model';
import { CustomerStatus } from 'src/app/models/customer-status.model';
import { District } from 'src/app/models/district.model';
import { Province } from 'src/app/models/province.model';
import { UserRoleCRUD } from 'src/app/models/user-role.model';
import { Ward } from 'src/app/models/ward.model';
import { CustomerStatusService } from 'src/app/service/customer-status.service';
import {
    PageFilterCustomer,
    CustomerService,
} from 'src/app/service/customer.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import { environment } from 'src/environments/environment';
import { BillHistoryCollectionsService } from '../../../service/bill-history-collections.service';
import { BillHistoryCollection } from '../../../models/customer.model';
import { UserService } from '../../../service/user.service';

@Component({
    selector: 'app-bill-history-collections',
    templateUrl: './bill-history-collections.component.html',
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
export class BillHistoryCollectionsComponent implements OnInit {
    public appConstant = AppConstant;

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

    public lstCustomersStatus: BillHistoryCollection[] = [];

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
    employees: any[][];

    billHistoryNewRow: any = {};
    isAddNewRow: boolean = false;

    currentPageRole: UserRoleCRUD;

    constructor(
        private messageService: MessageService,
        private readonly customerService: CustomerService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly customerStatusService: CustomerStatusService,
        private _host: ElementRef,
        private billHistoryCollectionsService: BillHistoryCollectionsService,
        private userService: UserService,
    ) {}

    ngOnInit() {
        this.currentPageRole = AppUtil.getMenus('TRANGTHAIKHACHHANG');
        AppUtil.getCustomerStatusSortTypes(this.translateService).subscribe(
            (res) => {
                this.sortFields = res;
            },
        );
        AppUtil.getSortTypes(this.translateService).subscribe((res) => {
            this.sortTypes = res;
        });
        this.getAllUserActive();
    }

    getAllUserActive() {
        this.userService.getAllUserActive().subscribe((res: any) => {
            this.employees = res.data;
        });
    }

    onAddNewRow() {
        this.lstCustomersStatus.push(
            new (class implements BillHistoryCollection {
                amount: 0;
                billId: 0;
                date: null;
                id: 0;
                note: '';
                statusAccountantId: 0;
                statusUserId: 0;
                userId: 0;
            })(),
        );
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

    // getCustomers(event?: any, isExport: boolean = false): void {
    //     if (this.pendingRequest) {
    //         this.pendingRequest.unsubscribe();
    //     }
    //     this.loading = true;
    //     if (event) {
    //         this.getParams.page = event.first / event.rows;
    //         this.getParams.pageSize = event.rows;
    //     }
    //
    //     // remove undefined value
    //     Object.keys(this.getParams).forEach(
    //         (k) => this.getParams[k] == null && delete this.getParams[k]
    //     );
    //
    //     this.pendingRequest = this.customerStatusService.getCustomerStatus(this.getParams)
    //         .subscribe((response: TypeData<CustomerStatus>) => {
    //             AppUtil.scrollToTop();
    //             this.lstCustomersStatus = response.data;
    //             this.totalRecords = response.totalItems || 0;
    //             this.totalPages = response.totalItems / response.pageSize + 1;
    //             this.loading = false;
    //         });
    // }

    getBillHistoryCollections(): void {
        this.billHistoryCollectionsService
            .getBillHistoryCollections()
            .subscribe((response: TypeData<BillHistoryCollection>) => {
                AppUtil.scrollToTop();
                this.lstCustomersStatus = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    getDetail(customerId: number) {
        this.isEdit = true;
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
                this.customerStatusService
                    .deleteCustomerStatus(userId)
                    .subscribe((response: CustomerStatus) => {
                        // this.getCustomers();
                    });
            },
        });
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    showDialog() {
        this.display = true;
    }

    onRowEditInit(product: BillHistoryCollection) {
        this.lstCustomersStatus[product.id] = { ...product };
    }

    onRowEditSave(product: BillHistoryCollection) {
        // if (product.price > 0) {
        //     delete this.lstCustomersStatus[product.id];
        //     this.messageService.add({severity:'success', summary: 'Success', detail:'Product is updated'});
        // }
        // else {
        //     this.messageService.add({severity:'error', summary: 'Error', detail:'Invalid Price'});
        // }
    }

    onRowEditCancel(product: BillHistoryCollection, index: number) {
        this.lstCustomersStatus[index] = this.lstCustomersStatus[product.id];
        delete this.lstCustomersStatus[product.id];
    }
}
