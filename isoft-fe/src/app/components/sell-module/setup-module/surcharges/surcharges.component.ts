import {
    Component,
    ElementRef,
    HostListener,
    OnInit,
    ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { ConfirmationService, MessageService } from 'primeng/api';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import { environment } from 'src/environments/environment';
import {
    CustomerService,
    PageFilterCustomer,
} from 'src/app/service/customer.service';
import { Table, ColumnFilter } from 'primeng/table';
import { TypeData } from 'src/app/models/common.model';
import { UserRoleCRUD } from 'src/app/models/user-role.model';
import { SurChargesFormComponent } from './sur-charges-form/sur-charges-form.component';
import { SurchargesService } from 'src/app/service/surcharge.service';
import { SurchargeModel } from 'src/app/models/sur-charge.model';

@Component({
    selector: 'app-surcharges',
    templateUrl: './surcharges.component.html',
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
export class SurchargesComponent implements OnInit {
    public appConstant = AppConstant;
    @ViewChild('surChargesForm') surChargesForm:
        | SurChargesFormComponent
        | undefined;

    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    pendingRequest: any;

    first = 0;

    typeSurcharges = [
        { name: '%', code: 'percent' },
        { name: 'VNĐ', code: 'money' },
    ];

    @ViewChild('dt') table: Table;

    @ViewChild('filter') filter: ElementRef;

    public getParams: PageFilterCustomer = {
        page: 1,
        pageSize: 5,
        sortField: 'id',
        isSort: true,
    };
    public totalRecords = 0;
    public totalPages = 0;
    public myTarget: number;

    public isLoading: boolean = false;

    public surcharges: SurchargeModel[] = [];

    display: boolean = false;

    isMobile = screen.width <= 1199;

    formData: any = {};
    formCustomerTaxData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;

    roles: any[] = [];

    currentPageRole: UserRoleCRUD;

    constructor(
        private messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly surchargesService: SurchargesService,
    ) {}

    ngOnInit() {
        this.currentPageRole = AppUtil.getMenus('PHUTHU');
        AppUtil.getSurchargeSortTypes(this.translateService).subscribe(
            (res) => {
                this.sortFields = res;
            },
        );
        AppUtil.getSortTypes(this.translateService).subscribe((res) => {
            this.sortTypes = res;
        });
    }

    getTypeName(code) {
        let x = this.typeSurcharges.find((x) => x.code === code);
        return x ? x.name : '';
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getSurcharges();
        }
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.getParams.isSort = event.value;
        }
        this.getSurcharges();
    }

    clearFilter(columnFilter: ColumnFilter, field: string) {
        columnFilter.clearFilter();
    }

    getSurcharges(event?: any, isExport: boolean = false): void {
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

        this.pendingRequest = this.surchargesService
            .getSurCharges(this.getParams)
            .subscribe((response: TypeData<SurchargeModel>) => {
                AppUtil.scrollToTop();
                this.surcharges = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    getDetail(customerId: number) {
        this.isEdit = true;
        this.surChargesForm.getDetail(customerId);
        this.showDialog();
    }

    onDelete(surchargeId) {
        this.surchargesService
            .deleteSurcharge(surchargeId)
            .subscribe((response: SurchargeModel) => {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.delete',
                    ),
                });
                this.getSurcharges();
            });
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    showDialog() {
        if (this.currentPageRole && this.currentPageRole.add) {
            this.surChargesForm.onReset();
            this.display = true;
        }
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
