import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TypeData } from 'src/app/models/common.model';
import { environment } from 'src/environments/environment';
import AppUtil from 'src/app/utilities/app-util';
import { TranslateService } from '@ngx-translate/core';
import AppConstant from 'src/app/utilities/app-constants';
import { Router } from '@angular/router';
import { BillsFormComponent } from './bills-form/bills-form.component';
import {
    PageFilterTaxRates,
    TaxRatesService,
} from 'src/app/service/tax-rates.service';
import { TaxRates } from 'src/app/models/tax_rates.model';

@Component({
    selector: 'app-bills',
    templateUrl: './bills.component.html',
    providers: [MessageService, ConfirmationService],
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
export class BillsComponent implements OnInit {
    public appConstant = AppConstant;
    @ViewChild('billsForm') billsFormComponent: BillsFormComponent | undefined;

    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    first = 0;

    public getParams: PageFilterTaxRates = {
        page: 1,
        pageSize: 5,
        sortField: 'id',
        isSort: true,
        searchText: '',
    };
    public totalRecords = 0;
    public totalPages = 0;

    public isLoading: boolean = false;
    public lstTaxRates: TaxRates[] = [];

    display: boolean = false;
    isMobile = screen.width <= 1199;

    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;

    pendingRequest: any;

    roles: any[] = [];

    constructor(
        private messageService: MessageService,
        private readonly taxRatesService: TaxRatesService,
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
            this.getTaxRates();
        }
    }

    getTaxRates(event?: any, isExport: boolean = false): void {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        this.loading = true;
        if (event) {
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }
        // remove undefined value
        Object.keys(this.getParams).forEach(
            (k) => this.getParams[k] == null && delete this.getParams[k],
        );
        console.log('this params', this.getParams);
        this.pendingRequest = this.taxRatesService
            .getListTaxRates(this.getParams)
            .subscribe((response: TypeData<TaxRates>) => {
                AppUtil.scrollToTop();
                this.lstTaxRates = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    getDetail(code) {
        this.taxRatesService
            .getTaxRatesByCode(code)
            .subscribe((response: TaxRates) => {
                this.formData = response;
                this.isEdit = true;
                this.showDialog();
            });
    }

    onAddTaxRates() {
        this.isEdit = false;
        this.showDialog();
    }

    onDelete(taxRatesId) {
        let message;
        this.translateService
            .get('question.delete_bills_content')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                this.taxRatesService
                    .deleteTaxRates(taxRatesId)
                    .subscribe((response: any) => {
                        this.getTaxRates();
                    });
            },
        });
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    showDialog() {
        // this.billsFormComponent.onReset();
        this.display = true;
    }

    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddTaxRates();
                break;
        }
    }
}
