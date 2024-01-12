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
import { SurchargeModel } from 'src/app/models/sur-charge.model';
import { TillFormComponent } from './till-form/till-form.component';
import { TillService } from 'src/app/service/till.service';
import AppConstants from '../../../utilities/app-constants';

@Component({
    selector: 'app-till',
    templateUrl: './till.component.html',
})
export class TillComponent implements OnInit {
    public appConstant = AppConstant;
    @ViewChild('tillForm') tillsForm: TillFormComponent | undefined;

    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    pendingRequest: any;

    first = 0;

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

    public tills: SurchargeModel[] = [];

    display: boolean = false;

    isMobile = screen.width <= 1199;

    formData: any = {};
    formCustomerTaxData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;

    roles: any[] = [];

    constructor(
        private messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly tillsService: TillService,
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
            this.getTills();
        }
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.getParams.isSort = event.value;
        }
        this.getTills();
    }

    clearFilter(columnFilter: ColumnFilter, field: string) {
        columnFilter.clearFilter();
    }

    getTills(event?: any, isExport: boolean = false): void {
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

        this.pendingRequest = this.tillsService
            .getTills(this.getParams)
            .subscribe((response: TypeData<SurchargeModel>) => {
                AppUtil.scrollToTop();
                this.tills = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    calculateMoneyAfterEndOfShift(till: any) {
        return (
            (till.fromAmount || 0) +
            (till.toAmountAuto || 0) -
            (till.amountDifferent || 0)
        );
    }

    getDetail(customerId: number) {
        this.isEdit = true;
        this.tillsForm.getDetail(customerId);
        this.showDialog();
    }

    onDelete(surchargeId) {
        this.tillsService
            .deleteTill(surchargeId)
            .subscribe((response: SurchargeModel) => {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.delete',
                    ),
                });
                this.getTills();
            });
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    showDialog() {
        this.tillsForm.onReset();
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

    protected readonly AppConstants = AppConstants;
}
