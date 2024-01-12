import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    HostListener,
    Injector,
} from '@angular/core';
import { ColumnFilter, Table } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';
import { TypeData } from 'src/app/models/common.model';
import { environment } from 'src/environments/environment';
import AppUtil from 'src/app/utilities/app-util';
import { DistrictService } from 'src/app/service/district.service';
import { District } from 'src/app/models/district.model';
import { ProvinceService } from 'src/app/service/province.service';
import { WardService } from 'src/app/service/ward.service';
import { Province } from 'src/app/models/province.model';
import { Ward } from 'src/app/models/ward.model';
import { TranslateService } from '@ngx-translate/core';
import AppConstant from 'src/app/utilities/app-constants';
import { UserRoleService } from 'src/app/service/user-role.service';
import { BranchService } from 'src/app/service/branch.service';
import { MajorService } from 'src/app/service/major.service';
import { StoreService } from 'src/app/service/store.service';
import { PositionDetailService } from 'src/app/service/position-detail.service';
import { TargetService } from 'src/app/service/target.service';
import { SymbolService } from 'src/app/service/symbol.service';
import { ContractTypeService } from 'src/app/service/contract-type.service';
import { CustomersFormComponent } from './components/customers-form/customers-form.component';
import {
    CustomerService,
    PageFilterCustomer,
} from 'src/app/service/customer.service';
import { Customer } from 'src/app/models/customer.model';
import { CustomerTaxService } from 'src/app/service/customer-tax.service';
import { CustomerTax } from 'src/app/models/customer-tax.model';
import { IsFunnelChartModel } from 'src/app/shared/is-funnel-chart/is-funnel-chart.model';
import { Observable, forkJoin } from 'rxjs';
import { CustomerClassificationService } from 'src/app/service/customer-classification.service';
import { CustomerJobService } from 'src/app/service/customer-job.service';
import { CustomerStatusService } from 'src/app/service/customer-status.service';
import { ContactHistoryFormComponent } from './components/contact-history-form/contact-history-form.component';
import { UserService } from 'src/app/service/user.service';
import * as moment from 'moment';
import { UserRoleCRUD } from 'src/app/models/user-role.model';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { AuthService } from '../../../service/auth.service';
import { JobDto, StatusDto } from 'src/app/models/job-and-status.model';
import * as _ from 'lodash';
import { UserStatisticsModel } from 'src/app/models/user.model';
import AppConstants from '../../../utilities/app-constants';
import { CustomerType } from 'src/app/utilities/app-enum';
import { AppComponentBase } from 'src/app/app-component-base';
import { ContractDeparmentService } from 'src/app/service/contract-department';
import { PrintContractComponent } from '../../employee-module/user/components/print-contract/print-contract.component';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-customers',
    templateUrl: './customers.component.html',
    providers: [ConfirmationService],
    styleUrls: ['../../../../assets/demo/badges.scss'],
    styles: [
        `
            .row-mobile {
                padding: 6px 2px;
            }
            :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
                padding: 0.25rem 0.5rem;
            }
            :host ::ng-deep .p-frozen-column {
                font-weight: bold;
            }

            :host ::ng-deep .p-datatable-frozen-tbody {
                font-weight: bold;
            }

            :host ::ng-deep .p-progressbar {
                height: 0.5rem;
            }

            .p-button {
                height: 40px;
            }

            @media screen and (max-width: 768px) {
                :host ::ng-deep .p-datatable.p-datatable-gridlines .p-datatable-header {
                    padding: 0.1rem 0.5rem;
                }

                :host ::ng-deep .p-panel.p-panel-toggleable .p-panel-header {
                  min-height: auto;
                }
            }
        `,
    ],
})
export class CustomersComponent extends AppComponentBase implements OnInit {
    public appConstant = AppConstant;
    @ViewChild('customersForm') customersFormComponent:
        | CustomersFormComponent
        | undefined;
    @ViewChild('contractForm') contractFormComponent:
        | ContactHistoryFormComponent
        | undefined;
    changeEmployeeVisible: boolean = false;

    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    pendingRequest: any;

    first = 0;

    @ViewChild('dt') table: Table;

    @ViewChild('filter') filter: ElementRef;

    selectedCustomers: any[] = [];

    public getParams: PageFilterCustomer = {
        page: 1,
        pageSize: 5,
        sortField: 'id',
        isSort: true,
        keyword: '',
        type: 0,
    };
    public totalRecords = 0;
    public totalPages = 0;
    public myTarget: number;

    public isLoading: boolean = false;

    public lstCustomers: Customer[] = [];

    display: boolean = false;
    displayHistories: boolean = false;

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
    customerTypes: any[] = [];
    customerJobs: JobDto[] = [];
    customerStatus: StatusDto[] = [];
    serverImg = environment.serverURLImage + '/';
    displayContract: boolean = false;
    customer_target = [
        { key: 'Khách hàng offline', value: 0 },
        { key: 'Khách hàng online', value: 2 },
    ];
    typeCustomer: number;
    usersChoose;
    totalJob: any[] = [];
    totalStatus: any[] = [];
    users: any[] = [];

    dateAddCustomerFrom;
    dateAddCustomerTo;
    startAge;
    endAge;
    cmnd;
    gender = null;
    genders: any[] = [
        { key: 'Tất cả', value: null },
        { key: 'Nam', value: 0 },
        { key: 'Nữ', value: 1 },
    ];
    debitFrom;
    debitTo;
    boughtFrom;
    boughtTo;
    customer_job;
    status;
    account;
    area;

    cols: any[] = [
        // {
        //     header: "label.number_order",
        //     value: "id",
        //     width: "w-5rem",
        //     display: true,
        //     classify: "personal_info",
        //     optionHide: false
        // },
        {
            header: 'label.avatar',
            value: `avatar`,
            width: 'w-7rem',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.code',
            value: 'code',
            width: 'w-2',
            display: true,
            classify: 'account',
            optionHide: false,
        },
        {
            header: 'label.customer_name',
            value: 'fullName',
            width: 'w-3',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.contact',
            value: 'customer_job',
            width: 'w-2',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.status',
            value: 'status',
            width: 'w-2',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.bought',
            value: 'bought',
            width: 'w-1',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.debt',
            value: 'debt',
            width: 'w-1',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.quote',
            value: 'quote',
            width: 'w-1',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.customer_job',
            value: 'totalTask',
            width: 'w-1',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.phone_number',
            value: 'phone_number',
            width: 'w-2',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.address',
            value: 'address',
            width: 'w-4',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        // add
        {
            header: 'label.email',
            value: 'email',
            width: 'w-2',
            display: false,
            classify: 'personal_info',
            optionHide: true,
        },
        {
            header: 'label.facebook',
            value: 'facebook',
            width: 'w-2',
            display: false,
            classify: 'personal_info',
            optionHide: true,
        },
        {
            header: 'label.identify',
            value: 'identityCardNo',
            width: 'w-2',
            display: false,
            classify: 'personal_info',
            optionHide: true,
        },
        {
            header: 'label.identify_created_date',
            value: 'identityCardIssueDate',
            width: 'w-2',
            display: false,
            classify: 'personal_info',
            optionHide: true,
        },
        {
            header: 'label.identify_expired_date',
            value: 'identityCardValidUntil',
            width: 'w-2',
            display: false,
            classify: 'personal_info',
            optionHide: true,
        },
        {
            header: 'label.identify_created_place',
            value: 'identityCardIssuePlace',
            width: 'w-2',
            display: false,
            classify: 'personal_info',
            optionHide: true,
        },
        {
            header: 'label.account',
            value: 'debitCode',
            width: 'w-2',
            display: false,
            classify: 'account',
            optionHide: true,
        },
        {
            header: 'label.detail_1',
            value: 'debitDetailCodeFirst',
            width: 'w-2',
            display: false,
            classify: 'account',
            optionHide: true,
        },
        {
            header: 'label.detail_2',
            value: 'debitDetailCodeSecond',
            width: 'w-2',
            display: false,
            classify: 'account',
            optionHide: true,
        },
    ];

    statisChartCustomerData: IsFunnelChartModel;
    statisticsBirthdayInMonthData: any;

    selectedCustomer: Customer;

    areas = [
        {
            value: 1,
            label: 'Miền Bắc',
        },
        {
            value: 0,
            label: 'Miền Nam',
        },
    ];
    showAccountingConnection = false;

    constructor(
        private readonly customerService: CustomerService,
        private readonly districtService: DistrictService,
        private readonly provinceService: ProvinceService,
        private readonly wardService: WardService,
        private readonly userRoleService: UserRoleService,
        private readonly branchService: BranchService,
        private readonly majorService: MajorService,
        private readonly warehouseService: StoreService,
        private readonly positionDetailService: PositionDetailService,
        private readonly targetService: TargetService,
        private readonly symbolService: SymbolService,
        private readonly contractTypeService: ContractTypeService,
        private readonly confirmationService: ConfirmationService,
        private readonly customerTaxService: CustomerTaxService,
        private readonly customerClassificationService: CustomerClassificationService,
        private readonly customerJobService: CustomerJobService,
        private readonly customerStatusService: CustomerStatusService,
        private readonly userService: UserService,
        public readonly router: Router,
        public readonly authService: AuthService,
        private _injector: Injector,
        private contractDeparmentService: ContractDeparmentService,
        private readonly dialogService: DialogService,


    ) {
        super(_injector);
    }

    ngOnInit() {
        this.getJobsAndStatus();
        this.getListDistrict();
        this.getListProvince();
        this.getListWard();
        this.getListRole();
        this.getListBranch();
        this.getListMajor();
        this.getListWarehouse();
        this.getListPositionDetail();
        this.getListTarget();
        this.getListSymbol();
        this.getListAccountCustomer();
        this.getListContractType();
        this.getAllUserActive();
        this.getTotalJob();
        AppUtil.getCustomerSortTypes(this.translateService).subscribe((res) => {
            this.sortFields = res;
        });
        AppUtil.getSortTypes(this.translateService).subscribe((res) => {
            this.sortTypes = res;
        });
        this.showAccountingConnection = this.authService.user?.roleName.some(
            (role) =>
                [
                    AppConstant.USER_TYPE.SUPER_ADMIN,
                    AppConstant.USER_TYPE.ADMIN_BRANCH,
                ].includes(role),
        );
    }

    onSelectBirthdayMonth(event: any) {
        if (event.dataset[0].element.options.backgroundColor === '#78909C') {
            this.getParams.gender = 1;
        } else {
            this.getParams.gender = 0;
        }
        const selectedMonth = event.element.index + 1;
        this.getParams.birthday = `2020/${selectedMonth}/1`;
        this.getCustomers();
    }

    getStatisData() {
        this.statisChartCustomerData = new IsFunnelChartModel({
            labels: [
                'Khách truy cập',
                'Khách tiềm năng',
                'Khách chất lượng',
                'Khách mua hàng',
            ],
            backgroundColors: ['#FF6384', '#FFCE56', '#36A2EB', '#66BB6A'],
            data: ['2.000', '1.500', '1.000', '500'],
        });

        let customerType = null;
        switch (this.router.url) {
            case '/uikit/customers':
                customerType = CustomerType.Customer;
                break;
            case '/uikit/suppliers':
                customerType = CustomerType.Supplier;
                break;
            case '/uikit/web-customers':
                customerType = CustomerType.WebCustomer;
                break;
        }

        this.customerService
            .getChartBirthDay(customerType)
            .subscribe((response: any) => {
                const userStatisticsData = response.data as UserStatisticsModel;
                this.statisticsBirthdayInMonthData = {
                    labels: userStatisticsData.birthDayOfUsers.map((a) =>
                        AppUtil.translateWithParams(
                            this.translateService,
                            'label.number_month',
                            { month: a.month },
                        ),
                    ),
                    datasets: [
                        {
                            label: AppUtil.translate(
                                this.translateService,
                                'label.male',
                            ),
                            backgroundColor: [
                                '#EC407A',
                                '#AB47BC',
                                '#42A5F5',
                                '#7E57C2',
                                '#66BB6A',
                                '#FFCA28',
                                '#26A69A',
                            ],
                            yAxisID: 'y',
                            data: userStatisticsData.birthDayOfUsers.map(
                                (a) => a.male,
                            ),
                        },
                        {
                            label: AppUtil.translate(
                                this.translateService,
                                'label.female',
                            ),
                            backgroundColor: '#78909C',
                            yAxisID: 'y1',
                            data: userStatisticsData.birthDayOfUsers.map(
                                (a) => a.female,
                            ),
                        },
                    ],
                };
            });
    }

    getJobsAndStatus() {
        this.customerJobService
            .getJobAndStatusExistingInCustomerHistories(0)
            .subscribe((res) => {
                AppUtil.scrollToTop();
                this.customerJobs = res.jobs;
                this.customerStatus = res.statuses;
            });
    }

    getCustomerStatus() {
        this.customerStatusService
            .getCustomerStatus({
                page: 0,
                pageSize: 9999,
            })
            .subscribe((response: TypeData<any>) => {
                this.customerStatus = response.data;
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
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }
        // check url
        switch (this.router.url) {
            case '/uikit/customers':
                {
                    this.getParams.type = 0;
                }
                break;
            case '/uikit/suppliers':
                {
                    this.getParams.type = 1;
                }
                break;
            case '/uikit/web-customers':
                {
                    this.getParams.type = 2;
                }
                break;
        }
        if (isExport) {
            this.getParams['type'] = this.getParams.type;
            this.getParams['FromDate'] = this.dateAddCustomerFrom
                ? moment(this.dateAddCustomerFrom).format('YYYY-MM-DD')
                : null;
            this.getParams['ToDate'] = this.dateAddCustomerTo
                ? moment(this.dateAddCustomerTo).format('YYYY-MM-DD')
                : null;
            this.getParams['FromAge'] = this.startAge;
            this.getParams['ToAge'] = this.endAge;
            this.getParams['searchText'] = this.cmnd;
            this.getParams['Gender'] = this.gender >= 0 ? this.gender : null;
            // this.getParams['debitFrom'] = this.debitFrom;
            // this.getParams['debitTo'] = this.debitTo
            // this.getParams['boughtFrom'] = this.boughtFrom;
            // this.getParams['boughtTo'] = this.boughtTo;
            this.getParams['JobId'] = this.customer_job;
            this.getParams['StatusId'] = this.status;
            this.getParams['account'] = this.account;
            this.getParams['area'] = this.area;

            Object.keys(this.getParams).forEach(
                (k) => this.getParams[k] == null && delete this.getParams[k],
            );
            this.customerService
                .getExcelReport(this.getParams)
                .subscribe((res: any) => {
                    AppUtil.scrollToTop();
                    this.openDownloadFile(res.data, 'excel');
                    this.loading = false;
                });
        } else {
            // remove undefined value
            Object.keys(this.getParams).forEach(
                (k) => this.getParams[k] == null && delete this.getParams[k],
            );

            this.pendingRequest = this.customerService
                .getPagingCustomer(this.getParams)
                .subscribe((response: TypeData<Customer>) => {
                    AppUtil.scrollToTop();
                    this.getStatisData();
                    this.lstCustomers = response.data;
                    this.totalRecords = response.totalItems || 0;
                    this.totalPages =
                        response.totalItems / response.pageSize + 1;
                    this.lstCustomers.map((cus) => {
                        cus.avatar = `${this.serverImg}${cus.avatar}`;
                    });
                    this.loading = false;
                });
        }
    }

    getDetail(customerId: number) {
        forkJoin([
            this.customerService.getCustomerDetail(customerId),
            this.customerTaxService.getCustomerTaxDetailByCustomerId(
                customerId,
            ),
        ]).subscribe(([cusRes, taxRes]) => {
            this.formData = cusRes.data;
            this.formCustomerTaxData = taxRes;
            this.isEdit = true;
            this.display = true;
        });
    }

    async getContractForm(customer: Customer) {
        this.customerService
            .getCustomerDetail(customer.id)
            .subscribe((response: any) => {
                this.selectedCustomer = response.data;
                this.contractFormComponent.onReset(this.selectedCustomer);
                this.displayContract = true;
            });
    }

    getContractList(customer: Customer) {
        this.selectedCustomer = customer;
        this.displayHistories = true;
        AppUtil.scrollToTop();
    }
    dataSelectPrintContract = {
        menus: [],
        data: null,
    };

    printContract(contractType) {
        var ref = this.dialogService.open(PrintContractComponent, {
            data: {
                employee: this.dataSelectPrintContract.data,
                contractType: contractType,
                typeContract:1
            },
            width: '70%',
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            header: 'In hợp đồng lao động',
        });
    }


    getCustomerTaxDetail(customerId: number) {
        this.customerTaxService
            .getCustomerTaxDetailByCustomerId(customerId)
            .subscribe((response: CustomerTax) => {
                this.formCustomerTaxData = response;
                this.isEdit = true;
                this.showDialog();
            });
    }

    getTotalJob() {
        this.customerService.getTotalJob().subscribe((res) => {
            this.totalJob = res.data;
        });
    }

    getJobCustomers(job: JobDto) {
        delete this.getParams['employeeId'];

        if (job?.isSelect) {
            this.getParams['jobId'] = this.getParams['statusId'] = null;
            this.resetJobAndStatus([this.customerJobs, this.customerStatus]);
            this.getCustomers();
            return;
        } else if (!job?.isSelect) {
            this.getParams['jobId'] = job.id;
            this.selectJob(job);
            this.getCustomers();
        }
    }

    getStatusCustomers(status: StatusDto) {
        if (status.isDisable) return;

        if (!this.getParams['jobId']) return;

        delete this.getParams['employeeId'];

        if (status?.isSelect) {
            this.getParams['statusId'] = null;
            const job = _.find(this.customerJobs, (item) => {
                return item.id == this.getParams['jobId'];
            });
            this.selectJob(job);
            this.getCustomers();
            return;
        } else if (!status?.isSelect) {
            this.getParams['statusId'] = status.id;
            const job = _.find(this.customerJobs, (item) => {
                return item.id == this.getParams['jobId'];
            });
            this.selectStatus(status, job);
            this.getCustomers();
        }
    }

    private resetJobAndStatus(datas: any[]) {
        _.each(datas, (list) => {
            _.each(list, (item: JobDto | StatusDto) => {
                item.reset();
            });
        });
    }

    private selectJob(job: JobDto | undefined) {
        this.getParams['statusId'] = null;

        _.each(this.customerJobs, (item) => {
            item.isSelect = false;
            item.isDisable = true;
        });

        if (job) {
            job.isSelect = true;
            job.isDisable = false;
        }

        let i = 0;
        let indexStatus = 0;
        _.each(this.customerStatus, (item, index) => {
            item.isSelect = false;

            if (job && job.hasStatusId(item.id)) {
                i++;
                indexStatus = index;
                item.isDisable = false;
            } else {
                item.isDisable = true;
            }
        });

        if (i == 1) {
            delete this.getParams['employeeId'];
            this.customerStatus[indexStatus].isSelect = true;
            this.getParams['statusId'] = this.customerStatus[indexStatus].id;
        }
    }

    private selectStatus(status: StatusDto, job: JobDto) {
        _.each(this.customerStatus, (item) => {
            item.isDisable = item.hasJobId(job.id) ? false : true;
            item.isSelect = false;
        });

        status.isSelect = true;
        status.isDisable = false;
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
                this.customerService
                    .deleteCustomer(userId)
                    .subscribe((response: Customer) => {
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.delete',
                            ),
                        });
                        this.getCustomers();
                    });
            },
        });
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    showDialog() {
        if (this.customersFormComponent !== undefined) {
            this.customersFormComponent.onReset();
        }
        this.display = true;
    }

    getListAccountCustomer() {
        this.customerClassificationService
            .getAllCustomerClassification()
            .subscribe((response: any) => {
                this.customerTypes = response.data;
            });
    }

    getListDistrict() {
        this.districtService
            .getListDistrict()
            .subscribe((response: District[]) => {
                this.districts = response;
            });
    }

    getListProvince() {
        this.provinceService
            .getListProvince()
            .subscribe((response: Province[]) => {
                this.provinces = response;
                this.nativeProvinces = this.provinces;
            });
    }

    getListWard() {
        this.wardService.getListWard().subscribe((response: Ward[]) => {
            this.wards = response;
        });
    }

    getListRole() {
        this.userRoleService.getAllUserRole().subscribe((response: any) => {
            // console.log(this.roles);
            this.roles = response.data;
        });
    }

    getListBranch() {
        this.branchService.getAllBranch().subscribe((response: any) => {
            this.branches = response.data;
        });
    }

    getListMajor() {
        this.majorService.getAllMajor().subscribe((response: any) => {
            this.majors = response.data;
        });
    }

    getListWarehouse() {
        this.warehouseService.getAllStore().subscribe((response: any) => {
            this.warehouses = response.data;
        });
    }

    getListPositionDetail() {
        this.positionDetailService
            .getAllPositionDetail()
            .subscribe((response: any) => {
                this.positionDetails = response.data;
            });
    }

    getListTarget() {
        this.targetService.getAllTarget().subscribe((response: any) => {
            this.targets = response.data;
        });
    }

    getListSymbol() {
        this.symbolService.getAllSymbol().subscribe((response: any) => {
            this.symbols = response.data;
        });
    }

    getListContractType() {
        this.contractTypeService
            .getAllContractType(1)
            .subscribe((response: any) => {
                this.contractTypes = response.data;
                this.dataSelectPrintContract.menus = response?.data.map(t => {
                    return {
                        ...t,
                        label: t.name ? "In " + t.name.toLowerCase() : '',
                        command: () => {
                            this.printContract(t);
                        }
                    }
                })
            });
    }

    getRoleName(id) {
        let role = this.roles.find((x) => x.id === id);
        return role ? role.title : '';
    }

    onHide(event) {
        console.log('on hide', event);
    }

    getAllUserActive() {
        this.userService.getAllUserActive().subscribe((res: any) => {
            this.users = res.data;
        });
    }

    change() {
        console.log('typeCustomer', this.typeCustomer);
    }

    searchCustomer() {
        this.getParams['type'] = this.typeCustomer;
        this.getParams['FromDate'] = this.dateAddCustomerFrom
            ? moment(this.dateAddCustomerFrom).format('YYYY-MM-DD')
            : null;
        this.getParams['ToDate'] = this.dateAddCustomerTo
            ? moment(this.dateAddCustomerTo).format('YYYY-MM-DD')
            : null;
        this.getParams['FromAge'] = this.startAge;
        this.getParams['ToAge'] = this.endAge;
        this.getParams['searchText'] = this.cmnd;
        this.getParams['Gender'] = this.gender >= 0 ? this.gender : null;
        // this.getParams['debitFrom'] = this.debitFrom;
        // this.getParams['debitTo'] = this.debitTo
        // this.getParams['boughtFrom'] = this.boughtFrom;
        // this.getParams['boughtTo'] = this.boughtTo;
        this.getParams['JobId'] = this.customer_job;
        this.getParams['StatusId'] = this.status;
        this.getParams['account'] = this.account;
        this.getParams['area'] = this.area;
        this.getParams['employeeId'] = this.usersChoose;

        this.getCustomers();
    }

    onViewHistory(item): void {
        this.router.navigate([`/uikit/customer-quote-history/${item.id}`]);
    }

    import(evt) {
        this.isLoading = true;
        const objProps = [
            'id',
            'avatar', // mã tài khoản 3
            'code', // tên tài khoản 4
            'name', //mã ct1 5
            'phone', // tên ct1 6
            'facebook', // mã ct2
            'email', // tên ct2
            'gender',
            'birthday',
            'provinceName',
            'districtName',
            'wardName',
            'address',
            'identityCardNo', // thuế VAT 11
            'taxCompanyName', // giảm giá 12
            'taxTaxCode', // nhóm sản phẩm 13
            'taxAddress', //bảng giá 14
            'taxPhone', // loại hàng 15
            'taxAccountNumber', // vị trí 16
            'taxBank', // vị trí 16
            'debitCode', // ,menu web 17
            'debitDetailCodeFirst', //image1 18
            'debitDetailCodeSecond', //image2 19
        ];
        const target: DataTransfer = <DataTransfer>evt.target;
        if (target.files.length !== 1)
            throw new Error('Cannot use multiple files');
        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {
            let dataImport = [];
            /* read workbook */
            const bstr: string = e.target.result;
            const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

            /* grab first sheet */
            const wsname: string = wb.SheetNames[0];
            const ws: XLSX.WorkSheet = wb.Sheets[wsname];

            /* save data */
            const datas = XLSX.utils.sheet_to_json(ws, {
                header: 1,
                blankrows: false,
                range: 6,
            }) as any;

            if (datas && datas?.length > 0) {
                datas.forEach((element) => {
                    const objItem = {};
                    objProps.forEach((item, index) => {
                        if (item == 'gender') {
                            objItem[item] = element[index] == 'Nam' ? 0 : 1;
                        } else if (
                            item == 'birthday' &&
                            element[index] !== undefined &&
                            element[index] !== null
                        ) {
                            objItem[item] = AppUtil.adjustDateOffset(
                                AppUtil.convertStringToDate(element[index]),
                            );
                        } else {
                            objItem[item] = element[index]?.toString();
                        }
                    });
                    objItem['type'] = this.getParams.type;
                    dataImport.push(objItem);
                });
            }
            this.customerService
                .importExcel(dataImport, this.getParams.type)
                .subscribe(
                    (res) => {
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.update',
                            ),
                        });
                        this.searchCustomer();
                        this.isLoading = false;
                    },
                    (err) => {
                        this.messageService.add({
                            severity: 'error',
                            detail: AppUtil.translate(
                                this.translateService,
                                'error.0',
                            ),
                        });
                        this.isLoading = false;
                    },
                );
        };
        reader.readAsBinaryString(target.files[0]);
        (document.getElementById('fileInput') as HTMLInputElement).value = null;
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
    getCurrentMenu() {
        switch (this.router.url) {
            case '/uikit/suppliers': {
                return this.appConstant.MENU_TYPE.DANHSACHNHACUNGCAP;
            }
            case '/uikit/web-customers': {
                return this.appConstant.MENU_TYPE.DANHSACHKHACHHANGWEB;
            }
            default:
                return this.appConstant.MENU_TYPE.DANHSACHKHACHHANG;
        }
    }

    onAddJob(customerId) {
        AppUtil.setStorage('customerIdPassing', customerId);
        this.router.navigate(['/uikit/workflow']);
    }
}
