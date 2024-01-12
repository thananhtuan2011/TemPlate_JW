import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    HostListener,
} from '@angular/core';
import { ColumnFilter, Table } from 'primeng/table';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TypeData } from 'src/app/models/common.model';
import { environment } from 'src/environments/environment';
import AppUtil from 'src/app/utilities/app-util';
import { User, UserStatisticsModel } from 'src/app/models/user.model';
import { DistrictService } from 'src/app/service/district.service';
import { District } from 'src/app/models/district.model';
import { ProvinceService } from 'src/app/service/province.service';
import { WardService } from 'src/app/service/ward.service';
import { Province } from 'src/app/models/province.model';
import { Ward } from 'src/app/models/ward.model';
import { TranslateService } from '@ngx-translate/core';
import { UserFormComponent } from './components/user-form/user-form.component';
import AppConstant from 'src/app/utilities/app-constants';
import { PageFilterUser, UserService } from 'src/app/service/user.service';
import { UserRoleService } from 'src/app/service/user-role.service';
import { BranchService } from 'src/app/service/branch.service';
import { MajorService } from 'src/app/service/major.service';
import { StoreService } from 'src/app/service/store.service';
import { PositionDetailService } from 'src/app/service/position-detail.service';
import { TargetService } from 'src/app/service/target.service';
import { SymbolService } from 'src/app/service/symbol.service';
import { ContractTypeService } from 'src/app/service/contract-type.service';
import { DocumentService } from 'src/app/service/document.service';
import * as moment from 'moment';
import { AppMainComponent } from 'src/app/layouts/app.main.component';
import { AuthService } from 'src/app/service/auth.service';
import { ActivatedRoute } from '@angular/router';
import { UserRoleCRUD } from 'src/app/models/user-role.model';
import * as XLSX from 'xlsx';
import { PrintContractComponent } from './components/print-contract/print-contract.component';
import { DialogService } from 'primeng/dynamicdialog';
import { ContractDeparmentService } from 'src/app/service/contract-department';

@Component({
    templateUrl: './user.component.html',
    providers: [MessageService, ConfirmationService],
    styleUrls: ['../../../../assets/demo/badges.scss'],
    styles: [
        `
            .field {
                margin: 0;
            }

            :host ::ng-deep .p-datatable-tbody > tr > td {
                padding: 6px 12px;
            }

            @media screen and (max-width: 768px) {
                :host ::ng-deep .p-datatable-tbody > tr > td {
                    padding: 6px 0;
                }

                :host ::ng-deep .p-datatable.p-datatable-gridlines .p-datatable-header {
                    padding: 6px;
                }

                :host ::ng-deep .p-dialog .p-dialog-header, .p-dialog .p-dialog-content {
                    padding: 6px 8px;
                }

                :host ::ng-deep .p-panel.p-panel-toggleable .p-panel-header {
                    min-height: auto;
                }
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
        `,
    ],
})
export class UserComponent implements OnInit {
    public appConstant = AppConstant;
    @ViewChild('userForm') userFormComponent: UserFormComponent | undefined;

    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    pendingRequest: any;

    first = 0;
    serverImg = environment.serverURLImage + '/';
    number_order_display = true;
    avatar_display = true;
    code_display = true;
    full_name_display = true;
    gender_display = true;
    birthday_display = true;
    phone_number_display = true;
    identify_display = true;
    send_salary_Date_display = true;
    department_display = true;
    role_display = false;
    last_login_display = false;

    isMobile = screen.width <= 1199;
    cols: any[] = [
        {
            header: '',
            value: 'headerCustom',
            width: 'w-5rem',
            display: this.isMobile,
            classify: 'personal_info',
            optionHide: false,
            isCustomize: true,
        },
        {
            header: 'label.number_order',
            value: 'order',
            width: 'w-5rem',
            display: true,
            classify: 'personal_info',
            optionHide: false,
            isCustomize: true,
        },
        {
            header: 'label.avatar',
            value: `avatar`,
            width: 'w-7rem',
            display: true,
            classify: 'personal_info',
            optionHide: false,
            isCustomize: true,
        },
        {
            header: 'label.username',
            value: 'username',
            width: 'w-2',
            display: true,
            classify: 'account',
            optionHide: false,
        },
        {
            header: 'label.full_name',
            value: 'fullName',
            width: 'w-2',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.gender',
            value: 'gender',
            width: 'w-7rem',
            display: true,
            classify: 'personal_info',
            optionHide: true,
            isCustomize: true,
        },
        {
            header: 'label.birthday',
            value: 'birthDay',
            width: 'w-1',
            display: true,
            classify: 'personal_info',
            optionHide: true,
        },
        {
            header: 'label.phone_number',
            value: 'phone',
            width: 'w-2',
            display: true,
            classify: 'personal_info',
            optionHide: true,
        },
        {
            header: 'label.identify',
            value: 'identify',
            width: 'w-2',
            display: true,
            classify: 'personal_info',
            optionHide: true,
        },
        {
            header: 'label.send_salary_Date',
            value: 'sendSalaryDate',
            width: 'w-2',
            display: false,
            classify: 'identify',
            optionHide: true,
        },
        {
            header: 'label.department',
            value: 'departmentName',
            width: 'w-2',
            display: true,
            classify: 'account',
            optionHide: true,
        },
        {
            header: 'label.branch',
            value: 'branchId',
            width: 'w-2',
            display: false,
            classify: 'account',
            optionHide: true,
        },
        {
            header: 'label.warehouse',
            value: 'warehouse',
            width: 'w-2',
            display: false,
            classify: 'account',
            optionHide: true,
        },
        {
            header: 'label.role',
            value: 'userRoleName',
            width: 'w-2',
            display: true,
            classify: 'account',
            optionHide: true,
        },
        {
            header: 'label.position_detail',
            value: 'positionDetailId',
            width: 'w-2',
            display: false,
            classify: 'account',
            optionHide: true,
        },
        {
            header: 'label.language',
            value: 'language',
            width: 'w-2',
            display: false,
            classify: 'account',
            optionHide: true,
        },
        {
            header: 'label.note',
            value: 'note',
            width: 'w-2',
            display: false,
            classify: 'account',
            optionHide: true,
        },
        {
            header: 'label.last_login',
            value: 'lastLogin',
            width: 'w-2',
            display: false,
            classify: 'account',
            optionHide: true,
        },
        {
            header: 'label.address',
            value: 'addressFull',
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
            header: 'label.email',
            value: 'email',
            width: 'w-2',
            display: false,
            classify: 'personal_info',
            optionHide: true,
        },
        {
            header: 'label.religion',
            value: 'religion',
            width: 'w-2',
            display: false,
            classify: 'personal_info',
            optionHide: true,
        },
        {
            header: 'label.license_plates',
            value: 'licensePlates',
            width: 'w-2',
            display: false,
            classify: 'personal_info',
            optionHide: true,
        },
        {
            header: 'label.literacy',
            value: 'literacy',
            width: 'w-2',
            display: false,
            classify: 'education',
            optionHide: true,
        },
        {
            header: 'label.literacy_detail',
            value: 'literacyDetail',
            width: 'w-2',
            display: false,
            classify: 'education',
            optionHide: true,
        },
        {
            header: 'label.major',
            value: 'majorId',
            width: 'w-2',
            display: false,
            classify: 'education',
            optionHide: true,
        },
        {
            header: 'label.certificate',
            value: 'certificateOther',
            width: 'w-2',
            display: false,
            classify: 'education',
            optionHide: true,
        },
        {
            header: 'label.bank_account',
            value: 'bankAccount',
            width: 'w-2',
            display: false,
            classify: 'salary_leave_share_holder_number',
            optionHide: true,
        },
        {
            header: 'label.bank_name',
            value: 'bank',
            width: 'w-2',
            display: false,
            classify: 'salary_leave_share_holder_number',
            optionHide: true,
        },
        {
            header: 'label.share_holder_code',
            value: 'shareHolderCode',
            width: 'w-2',
            display: false,
            classify: 'salary_leave_share_holder_number',
            optionHide: true,
        },
        {
            header: 'label.no_of_leave_date',
            value: 'noOfLeaveDate',
            width: 'w-2',
            display: false,
            classify: 'salary_leave_share_holder_number',
            optionHide: true,
        },
        {
            header: 'label.send_salary_date',
            value: 'sendSalaryDate',
            width: 'w-2',
            display: false,
            classify: 'salary_leave_share_holder_number',
            optionHide: true,
        },
        {
            header: 'label.number_of_workdays',
            value: 'numberWorkdays',
            width: 'w-2',
            display: false,
            classify: 'salary_leave_share_holder_number',
            optionHide: true,
        },
        {
            header: 'label.salary',
            value: 'salary',
            width: 'w-2',
            display: false,
            classify: 'salary_leave_share_holder_number',
            optionHide: true,
        },
        {
            header: 'label.social_insurance_salary',
            value: 'socialInsuranceSalary',
            width: 'w-2',
            display: false,
            classify: 'salary_leave_share_holder_number',
            optionHide: true,
        },
        {
            header: 'label.day_off',
            value: 'dayOff',
            width: 'w-2',
            display: false,
            classify: 'salary_leave_share_holder_number',
            optionHide: true,
        },
        {
            header: 'label.personal_tax_code',
            value: 'personalTaxCode',
            width: 'w-2',
            display: false,
            classify: 'personal_tax',
            optionHide: true,
        },
        {
            header: 'label.social_insurance_created',
            value: 'socialInsuranceCreated',
            width: 'w-2',
            display: false,
            classify: 'personal_tax',
            optionHide: true,
        },
        {
            header: 'label.social_insurance_code',
            value: 'socialInsuranceCode',
            width: 'w-2',
            display: false,
            classify: 'personal_tax',
            optionHide: true,
        },
    ];

    @ViewChild('dt') table: Table;

    @ViewChild('filter') filter: ElementRef;

    public getParams: PageFilterUser;
    public totalRecords = 0;
    public totalPages = 0;
    public myTarget: number;

    public isLoading: boolean = false;

    public lstUsers: User[] = [];
    public selectedUsers: User[] = [];

    display: boolean = false;

    formData: any = {};
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
    positions: any[] = [];
    departments: any[] = [];
    degrees: any[] = [];
    certificates: any[] = [];
    chooseSearhBirth: boolean = false;
    searchFor: any[] = [
        { key: 'forAge', value: false, label: 'label.forAge' },
        { key: 'forBirth', value: true, label: 'label.forBirth' },
    ];
    requestPassword: any[] = [
        { key: 'all', value: false, label: 'label.all' },
        { key: 'request', value: true, label: 'label.request' },
    ];
    totalRequestPassword: number = 0;
    status: any[] = [
        { key: 'Tất cả', value: null },
        { key: 'Đang làm', value: false },
        { key: 'Đã nghỉ việc', value: true },
    ];
    genders: any[] = [
        { key: 'Tất cả', value: -1 },
        { key: 'Nam', value: 0 },
        { key: 'Nữ', value: 1 },
    ];

    dataSelectPrintContract = {
        menus: [],
        data: null,
    };

    totalItems: any = 0;

    userStatisticsGenderData: any;
    userStatisticsBirthdayInMonthData: any;

    authUser: any;
    constructor(
        public appMain: AppMainComponent,
        private messageService: MessageService,
        private readonly dialogService: DialogService,
        private readonly userService: UserService,
        private readonly districtService: DistrictService,
        private readonly provinceService: ProvinceService,
        private readonly wardService: WardService,
        private readonly translateService: TranslateService,
        private readonly userRoleService: UserRoleService,
        private readonly branchService: BranchService,
        private readonly majorService: MajorService,
        private readonly warehouseService: StoreService,
        private readonly positionDetailService: PositionDetailService,
        private readonly targetService: TargetService,
        private readonly symbolService: SymbolService,
        private readonly contractTypeService: ContractTypeService,
        private readonly confirmationService: ConfirmationService,
        private readonly documentService: DocumentService,
        private readonly authService: AuthService,
        private readonly activatedRoute: ActivatedRoute,
        private contractDeparmentService: ContractDeparmentService,

    ) {}

    ngOnInit() {
        this.authUser = this.authService.user;
        this.resetForm();
        this.activatedRoute.queryParamMap.subscribe((param) => {
            if (param.get('age')) {
                this.getParams.startAge = param.get('age');
                this,
                    (this.getParams.endAge = (
                        parseInt(param.get('age')) + 4
                    ).toString());
            }
            console.log(this.getParams);
        });
        this.getTotalRequestPassword();
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
        this.getListContractType();
        this.getListPosition();
        this.getListDeparments();
        this.getListDegrees();
        this.geListtCertificate();
        this.getUserStatistics();
        AppUtil.getUserSortTypes(this.translateService).subscribe((res) => {
            this.sortFields = res;
        });
        AppUtil.getSortTypes(this.translateService).subscribe((res) => {
            this.sortTypes = res;
        });
        // console.log(this.documentService.getTargetsList());
    }
    formatCurrency(value) {
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getUsers();
        }
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.getParams.isSort = event.value;
        }
        this.getUsers();
    }

    clearFilter(columnFilter: ColumnFilter, field: string) {
        columnFilter.clearFilter();
    }

    private openDownloadFile(_fileName: string, _ft: string) {
        try {
            this.isLoading = false;
            var _l = this.userService.getFolderPathDownload(_fileName, _ft);
            if (_l) window.open(_l);
        } catch (ex) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error Message',
                detail: 'File invalid',
            });
        }
    }

    getUsers(event?: any, isExport: boolean = false): void {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }

        this.loading = true;

        let params = Object.assign({}, this.getParams);
        if (event) {
            params.page = event.first / event.rows + 1;
            params.pageSize = event.rows;
        }
        if (isExport) {
            const body =
                this.selectedUsers.map((user) => {
                    return user.id;
                }) || [];

            this.userService.getExcelReport(body).subscribe((res: any) => {
                AppUtil.scrollToTop();
                this.openDownloadFile(res.data, 'excel');
            });
        }

        // console.log(this.chooseSearhBirth);
        if (this.chooseSearhBirth) {
            if (params.startDate) {
                params.startDate = moment(params.startDate).format(
                    'YYYY-MM-DDTh:mm:ss',
                );
            }
            if (params.endDate) {
                params.endDate = moment(params.endDate).format(
                    'YYYY-MM-DDTh:mm:ss',
                );
            }
        } else {
            if (params.startAge != null) {
                let tmp = new Date();
                tmp.setFullYear(tmp.getFullYear(), 1, 1);
                tmp.setHours(0, 0, 0, 0);
                let startAge: number = parseInt(params.startAge);
                tmp.setFullYear(tmp.getFullYear() - startAge, 11, 31);
                params.endDate = moment(tmp).format('YYYY-MM-DDTh:mm:ss');
            }
            if (params.endAge != null && params.endAge >= params.startAge) {
                let tmp = new Date();
                tmp.setFullYear(tmp.getFullYear(), 1, 1);
                tmp.setHours(0, 0, 0, 0);
                let endAge: number = parseInt(params.endAge);
                tmp.setFullYear(tmp.getFullYear() - endAge, 0, 1);
                params.startDate = moment(tmp).format('YYYY-MM-DDTh:mm:ss');
            }
            // console.log(params);
        }

        // remove undefined value
        Object.keys(params).forEach((k) => {
            if (
                params[k] == null ||
                (k.includes('Id') && params[k] === 0) ||
                params[k] === 'Invalid date'
            ) {
                delete params[k];
            }
        });

        delete params.chooseSearhBirth;
        console.log('this params', params);

        this.pendingRequest = this.userService
            .getPagingUser(params)
            .subscribe((response: TypeData<User>) => {
                AppUtil.scrollToTop();
                this.lstUsers = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.getParams.page = response.currentPage;
                this.loading = false;
            });
    }

    onChangeChoose(value) {
        this.getParams.startAge = '';
        this.getParams.endAge = '';
        this.getParams.startDate = '';
        this.getParams.endDate = '';
    }

    getDetail(userId) {
        this.userService.getUserDetail(userId).subscribe((response: User) => {
            this.formData = response;
            this.isEdit = true;
            this.showDialog();
        });
    }

    getTotalRequestPassword() {
        this.userService
            .getTotalRequestPassword()
            .subscribe((response: any) => {
                this.totalRequestPassword = response;
            });
    }

    onDelete(userId) {
        let message;
        this.translateService
            .get('question.delete_user_content')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                this.userService
                    .deleteUser(userId)
                    .subscribe((response: User) => {
                        this.first = 0;
                        this.getUsers();
                    });
            },
        });
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    showDialog(isAdd: boolean = false) {
        this.userFormComponent.onReset();
        if (isAdd) {
            this.userFormComponent.getLastUsername();
        }
        this.display = true;
    }

    getListPosition() {
        this.documentService.getPositionList().subscribe((data) => {
            this.positions = data.data;
        });
    }

    getListDeparments() {
        this.documentService.getDepartmentList().subscribe((data) => {
            this.departments = data.data;
        });
    }
    getListDegrees() {
        this.documentService.getDegreeList().subscribe((data) => {
            this.degrees = data.data;
        });
    }

    geListtCertificate() {
        this.documentService.getCertificatesList().subscribe((data) => {
            this.certificates = data.data;
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
            .getAllContractType(0)
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

    getUserStatistics() {
        this.userService.userStatistics().subscribe((response) => {
            const userStatisticsData = response.data as UserStatisticsModel;
            this.userStatisticsGenderData = {
                labels: [
                    AppUtil.translateWithParams(
                        this.translateService,
                        'label.male_number',
                        { number: userStatisticsData.totalMale },
                    ),
                    AppUtil.translateWithParams(
                        this.translateService,
                        'label.female_number',
                        { number: userStatisticsData.totalFemale },
                    ),
                ],
                datasets: [
                    {
                        data: [
                            userStatisticsData.totalMale,
                            userStatisticsData.totalFemale,
                        ],
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                    },
                ],
            };

            this.userStatisticsBirthdayInMonthData = {
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

    onSelectBirthdayMonth(event: any) {
        const selectedMonth = event.element.index + 1;
        this.getParams.month = selectedMonth;
        this.getUsers();
    }

    onAddUser() {
        this.isEdit = false;
        this.showDialog(true);
    }

    resetForm() {
        this.getParams = {
            page: 1,
            pageSize: 10,
            sortField: 'id',
            isSort: true,
            keyword: '',
            chooseSearhBirth: '',
            startDate: '',
            endDate: '',
            startAge: null,
            endAge: null,
            positionId: 0,
            targetId: 0,
            degreeId: 0,
            certificateId: 0,
            departmentId: 0,
            gender: -1,
            quit: null,
            requestPassword: null,
        };
    }

    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddUser();
                break;
        }
    }

    importExcel(event) {
        const objProps = [
            'code',
            'username',
            'fullName',
            'positionName',
            'departmentName',
            'genderMale',
            'genderFemale',
            'day',
            'month',
            'year',
            'nativePlace',
            'provinceName',
            'districtName',
            'wardName',
            'address',
            'ethnicGroup',
            'religion',
            'unionMember2',
            'unionMember3',
            'phone',
            'socialInsuranceCode',
            'identify',
            'identifyCreatedDate',
            'identifyCreatedPlace',
            'literacy',
            'literacyDetail',
            'specialize',
            'sendSalaryDate',
            'salary',
            'note',
        ];
        const file = event.target.files[0];
        let arrayBuffer: any;
        let fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);

        fileReader.onload = (e) => {
            arrayBuffer = fileReader.result;
            const data = new Uint8Array(arrayBuffer);
            const arr = [];
            for (let i = 0; i != data.length; ++i) {
                arr[i] = String.fromCharCode(data[i]);
            }
            const bstr = arr.join('');
            const workbook = XLSX.read(bstr, { type: 'binary' });
            const first_sheet_name = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[first_sheet_name];
            const arraylist = XLSX.utils.sheet_to_json(worksheet, {
                blankrows: false,
                header: objProps,
                range: 10,
            });

            const request =
                arraylist?.reduce((arr: any[], curr: any, index) => {
                    arr.push({
                        ...curr,
                        gender: (curr.genderMale || []).length > 0 ? 0 : 1, // Male: 0 - Female: 1
                        birthDay: new Date(curr.year, curr.month, curr.day),
                        sendSalaryDate: AppUtil.adjustDateOffset(
                            AppUtil.convertStringToDate(curr.sendSalaryDate),
                        ),
                        identifyCreatedDate: AppUtil.adjustDateOffset(
                            AppUtil.convertStringToDate(
                                curr.identifyCreatedDate,
                            ),
                        ),
                    });
                    return arr;
                }, []) || [];
            this.userService.importExcel(request).subscribe(
                (res) => {
                    this.messageService.add({
                        severity: 'success',
                        detail: AppUtil.translate(
                            this.translateService,
                            'success.create',
                        ),
                    });
                    this.getUsers();
                },
                (err) => {
                    this.messageService.add({
                        severity: 'error',
                        detail: AppUtil.translate(
                            this.translateService,
                            'error.0',
                        ),
                    });
                },
            );
            // this.formInput.controls['uploadFile'].reset()
        };
    }

    printContract(contractType) {
        var ref = this.dialogService.open(PrintContractComponent, {
            data: {
                employee: this.dataSelectPrintContract.data,
                contractType: contractType,
                typeContract : 0
            },
            width: '70%',
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            header: 'In hợp đồng lao động',
        });
    }
}
