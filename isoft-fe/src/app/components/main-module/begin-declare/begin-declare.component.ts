import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TypeData } from 'src/app/models/common.model';
import { environment } from 'src/environments/environment';
import AppUtil from 'src/app/utilities/app-util';
import { TranslateService } from '@ngx-translate/core';
import AppConstant from 'src/app/utilities/app-constants';
import { Company } from 'src/app/models/company.model';
import { CompanyService } from 'src/app/service/company.service';
import { BeginDeclareFormComponent } from './components/begin-declare-form/begin-declare-form.component';
import { PageFilterUser } from 'src/app/service/user.service';
@Component({
    templateUrl: './begin-declare.component.html',
    providers: [MessageService, ConfirmationService],
    styles: [
        `
            .card-hover {
                cursor: pointer;
            }
        `,
    ],
})
export class BeginDeclareComponent implements OnInit {
    public appConstant = AppConstant;
    public appUtil = AppUtil;
    @ViewChild('beginDeclareForm') beginDeclareFormComponent:
        | BeginDeclareFormComponent
        | undefined;

    loading: boolean = true;

    first = 0;

    public lstCompanies: Company[] = [];
    public totalRecords = 0;
    public totalPages = 0;
    public getParams: PageFilterUser = {
        page: 1,
        pageSize: 5,
        sortField: 'id',
        isSort: true,
        searchText: '',
    };

    serverURLImage = environment.serverURLImage;
    isMobile = screen.width <= 1199;
    isEdit: boolean = false;

    pendingRequest: any;

    types: any = {};

    constructor(
        private readonly companyService: CompanyService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
    ) {}

    ngOnInit() {
        this.types = this.appUtil.getCompanyTypes();
    }

    getCompanies(event?: any): void {
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
        this.pendingRequest = this.companyService
            .getListCompany(this.getParams)
            .subscribe((response: TypeData<Company>) => {
                AppUtil.scrollToTop();
                this.lstCompanies = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    onDelete(companyId) {
        let message;
        this.translateService
            .get('question.delete_company_log_content')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                this.companyService
                    .deleteCompany(companyId)
                    .subscribe((response: any) => {
                        this.beginDeclareFormComponent.getLastInfo();
                        this.getCompanies();
                    });
            },
        });
    }

    getbusinessTypeName(value) {
        let businessType = this.types.businessType.find(
            (x) => x.value === value,
        );
        return businessType ? businessType.label : '';
    }

    getAccordingAccountingRegimeName(value) {
        let accordingAccountingRegime =
            this.types.accordingAccountingRegime.find((x) => x.value === value);
        return accordingAccountingRegime ? accordingAccountingRegime.label : '';
    }

    getMethodCalcExportPriceName(value) {
        let methodCalcExportPrice = this.types.methodCalcExportPrice.find(
            (x) => x.value === value,
        );
        return methodCalcExportPrice ? methodCalcExportPrice.label : '';
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }
}
