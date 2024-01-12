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
import { User } from 'src/app/models/user.model';
import { DistrictService } from 'src/app/service/district.service';
import { District } from 'src/app/models/district.model';
import { ProvinceService } from 'src/app/service/province.service';
import { WardService } from 'src/app/service/ward.service';
import { Province } from 'src/app/models/province.model';
import { Ward } from 'src/app/models/ward.model';
import { TranslateService } from '@ngx-translate/core';
import AppConstant from 'src/app/utilities/app-constants';
import { AuthService } from 'src/app/service/auth.service';
import { PageFilterUser, UserService } from 'src/app/service/user.service';
import { UserRoleService } from 'src/app/service/user-role.service';
import { BranchService } from 'src/app/service/branch.service';
import { MajorService } from 'src/app/service/major.service';
import { StoreService } from 'src/app/service/store.service';
import { PositionDetailService } from 'src/app/service/position-detail.service';
import { TargetService } from 'src/app/service/target.service';
import { SymbolService } from 'src/app/service/symbol.service';
import { ContractTypeService } from 'src/app/service/contract-type.service';
import { UserFormComponent } from '../../employee-module/user/components/user-form/user-form.component';
import { RelativesFormComponent } from './components/relatives-form/relatives-form.component';
import {
    PageFilterRelative,
    RelativeService,
} from 'src/app/service/relative.service';
import { Relative } from 'src/app/models/relative.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DocumentService } from 'src/app/service/document.service';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { UserRoleCRUD } from 'src/app/models/user-role.model';
// import { PageFilterRelation } from 'src/app/service/relation.service';
import * as saveAs from 'file-saver';
import { DatePipe } from '@angular/common';
type AOA = any[][];

@Component({
    selector: 'app-relatives',
    templateUrl: './relatives.component.html',
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
export class RelativesComponent implements OnInit {
    public appConstant = AppConstant;
    @ViewChild('relativesForm') RelativesFormComponent:
        | RelativesFormComponent
        | undefined;

    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    pendingRequest: any;

    first = 0;

    @ViewChild('dt') table: Table;

    @ViewChild('filter') filter: ElementRef;

    public getParams = {
        page: 1,
        pageSize: 5,
        sortField: 'id',
        isSort: true,
        searchText: '',
    };
    public paramsSearch: PageFilterRelative = {
        page: 1,
    };
    public totalRecords = 0;
    public totalPages = 0;
    public myTarget: number;

    public isLoading: boolean = false;

    public lstRelatives: Relative[] = [];

    display: boolean = false;

    isMobile = screen.width <= 1199;

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
    searchAdvancedForm: FormGroup = new FormGroup({});
    chooseSearhBirth: boolean = false;
    searchFor: any[] = [
        { key: 'forAge', value: false, label: 'label.forAge' },
        { key: 'forBirth', value: true, label: 'label.forBirth' },
    ];
    genders: any[] = [
        { key: 'Tất cả', value: -1 },
        { key: 'Nam', value: 0 },
        { key: 'Nữ', value: 1 },
    ];
    degrees: any[] = [];
    certificates: any[] = [];
    cols: any[] = [
        {
            header: 'label.number_order',
            value: 'id',
            width: 'w-1',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.avatar',
            value: `avatar`,
            width: 'w-1',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.relatives_name',
            value: 'fullName',
            width: 'w-2',
            display: true,
            classify: 'personal_info',
            optionHide: false,
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
            header: 'label.gender',
            value: 'gender',
            width: 'w-1',
            display: true,
            classify: 'personal_info',
            optionHide: true,
        },
        {
            header: 'label.birthday',
            value: 'birthDay',
            width: 'w-1',
            display: true,
            classify: 'napersonal_infome',
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
            header: 'label.address',
            value: 'address',
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
            classify: 'literacy',
            optionHide: true,
        },
        {
            header: 'label.degree',
            value: 'literacyDetail',
            width: 'w-2',
            display: false,
            classify: 'literacy',
            optionHide: true,
        },
        {
            header: 'label.professional_expertise',
            value: 'specialize',
            width: 'w-2',
            display: false,
            classify: 'literacy',
            optionHide: true,
        },
        {
            header: 'label.certificate',
            value: 'certificate',
            width: 'w-2',
            display: false,
            classify: 'literacy',
            optionHide: true,
        },
    ];

    statisAgeGroupData: any;
    statisAgeGroupByMonth: any;
    statisAgeGroupByMonthOptions: any = {
        tooltips: {
            mode: 'index',
            intersect: false,
        },
        responsive: true,
        scales: {
            xAxes: [
                {
                    stacked: true,
                },
            ],
            yAxes: [
                {
                    stacked: true,
                },
            ],
        },
    };
    stackedData: any;
    stackedOptions: any;
    authUser: any;
    serverImg = environment.serverURLImage + '/';

    constructor(
        private messageService: MessageService,
        private readonly userService: UserService,
        private readonly districtService: DistrictService,
        private readonly provinceService: ProvinceService,
        private readonly wardService: WardService,
        private readonly translateService: TranslateService,
        private readonly branchService: BranchService,
        private readonly majorService: MajorService,
        private readonly warehouseService: StoreService,
        private readonly positionDetailService: PositionDetailService,
        private readonly targetService: TargetService,
        private readonly symbolService: SymbolService,
        private readonly contractTypeService: ContractTypeService,
        private readonly confirmationService: ConfirmationService,
        private relativeServices: RelativeService,
        private readonly documentService: DocumentService,
        private fb: FormBuilder,
        private readonly authService: AuthService,
    ) {
        this.initForm();
    }

    ngOnInit() {
        this.authUser = this.authService.user;
        this.getListDistrict();
        this.getListProvince();
        this.getListDegrees();
        this.geListtCertificate();
        AppUtil.getUserSortTypes(this.translateService).subscribe((res) => {
            this.sortFields = res;
        });
        AppUtil.getSortTypes(this.translateService).subscribe((res) => {
            this.sortTypes = res;
        });
        this.getUserStatistics();
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getRelatives();
        }
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.getParams.isSort = event.value;
        }
        this.getRelatives();
    }

    clearFilter(columnFilter: ColumnFilter, field: string) {
        columnFilter.clearFilter();
    }

    initForm() {
        this.searchAdvancedForm = this.fb.group({
            startDate: null,
            endDate: null,
            startAge: null,
            endAge: null,
            keyword: null,
            Degree: null,
            CertificateOther: null,
            gender: null,
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

    getRelatives(event?: any, isExport: boolean = false): void {
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
        this.pendingRequest = this.relativeServices
            .getListRelative(this.getParams)
            .subscribe(
                (response: TypeData<Relative>) => {
                    AppUtil.scrollToTop();
                    this.lstRelatives = response.data;
                    this.totalRecords = response.totalItems || 0;
                    this.totalPages =
                        response.totalItems / response.pageSize + 1;
                    this.loading = false;
                },
                (err) => {
                    AppUtil.scrollToTop();
                    this.lstRelatives = [];
                    // this.lstRelatives = response.data;
                    // this.totalRecords = response.totalItems || 0;
                    // this.totalPages = response.totalItems / response.pageSize + 1;
                    this.loading = false;
                },
            );
    }

    getDetail(relativeId) {
        this.relativeServices
            .getRelativeDetail(relativeId)
            .subscribe((response: Relative) => {
                this.formData = response;
                this.isEdit = true;
                this.showDialog();
            });
    }

    onDelete(RelativeId) {
        let message;
        this.translateService
            .get('question.delete_relative_header')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                this.relativeServices
                    .deleteRelative(RelativeId)
                    .subscribe((response: Relative) => {
                        this.getRelatives();
                    });
            },
        });
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    showDialog() {
        this.RelativesFormComponent.onReset();
        this.display = true;
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

    // getListRole() {
    //     this.userRoleService.getAllUserRole().subscribe((response: any) => {
    //         console.log(this.roles);
    //         this.roles = response.data;
    //     });
    // }

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

    getRoleName(id) {
        let role = this.roles.find((x) => x.id === id);
        return role ? role.title : '';
    }
    resetForm() {
        this.chooseSearhBirth = false;
        this.searchAdvancedForm.setValue({
            keyword: null,
            startDate: null,
            endDate: null,
            startAge: null,
            endAge: null,
            Degree: null,
            CertificateOther: null,
            gender: null,
        });
        this.paramsSearch = {
            page: 1,
        };
    }
    search() {
        if (this.searchAdvancedForm.value.keyword) {
            this.paramsSearch.SearchText =
                this.searchAdvancedForm.value.keyword;
        }
        if (!this.chooseSearhBirth) {
            if (this.searchAdvancedForm.value.startAge != null) {
                let tmp = new Date();
                tmp.setFullYear(tmp.getFullYear(), 1, 1);
                tmp.setHours(0, 0, 0, 0);
                let startAge: number = this.searchAdvancedForm.value.startAge;
                tmp.setFullYear(tmp.getFullYear() - startAge, 11, 31);
                this.paramsSearch.endDate =
                    moment(tmp).format('YYYY-MM-DDTh:mm:ss');
            }
            if (
                this.searchAdvancedForm.value.endAge != null &&
                this.searchAdvancedForm.value.endAge >=
                    this.searchAdvancedForm.value.startAge
            ) {
                let tmp = new Date();
                tmp.setFullYear(tmp.getFullYear(), 1, 1);
                tmp.setHours(0, 0, 0, 0);
                let endAge: number = this.searchAdvancedForm.value.endAge;
                tmp.setFullYear(tmp.getFullYear() - endAge, 0, 1);
                this.paramsSearch.startDate =
                    moment(tmp).format('YYYY-MM-DDTh:mm:ss');
            }
        } else {
            if (this.searchAdvancedForm.value.startDate) {
                this.paramsSearch.startDate = moment(
                    this.searchAdvancedForm.value.startDate,
                ).format('YYYY-MM-DDTh:mm:ss');
            }
            if (this.searchAdvancedForm.value.endDate) {
                this.paramsSearch.startDate = moment(
                    this.searchAdvancedForm.value.endDate,
                ).format('YYYY-MM-DDTh:mm:ss');
            }
        }

        // if (this.searchAdvancedForm.value.degree) {
        this.paramsSearch.degreeId = this.searchAdvancedForm.value.degree;
        // }
        // if (this.searchAdvancedForm.value.certificate) {
        this.paramsSearch.certificatedId =
            this.searchAdvancedForm.value.certificate;
        // }
        if (this.searchAdvancedForm.value.gender) {
            this.paramsSearch.gender =
                this.searchAdvancedForm.value.gender.value;
        }

        this.pendingRequest = this.relativeServices
            .getListRelative(this.paramsSearch)
            .subscribe((response: TypeData<User>) => {
                AppUtil.scrollToTop();
                this.lstRelatives = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    getUserStatistics() {
        this.statisAgeGroupByMonthOptions = {
            plugins: {
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                legend: {
                    labels: {
                        color: '#495057',
                    },
                },
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: '#495057',
                    },
                    grid: {
                        color: '#ebedef',
                    },
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: '#495057',
                    },
                    grid: {
                        color: '#ebedef',
                    },
                },
            },
        };

        forkJoin([
            AppUtil.translate$(this.translateService, 'label.yo_under_18'),
            AppUtil.translate$(this.translateService, 'label.yo_from_18_to_50'),
            AppUtil.translate$(this.translateService, 'label.yo_more_than_50'),
        ]).subscribe(([under18, from18to50, moreThan50]) => {
            this.statisAgeGroupData = {
                labels: [under18, from18to50, moreThan50],
                datasets: [
                    {
                        data: [10, 20, 30],
                        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
                        hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D'],
                    },
                ],
            };

            this.statisAgeGroupByMonth = {
                labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((a) =>
                    AppUtil.translateWithParams(
                        this.translateService,
                        'label.number_month',
                        { month: a },
                    ),
                ),
                datasets: [
                    {
                        type: 'bar',
                        label: under18,
                        backgroundColor: '#42A5F5',
                        data: [50, 25, 12, 48, 90, 76, 42, 32, 10, 40],
                    },
                    {
                        type: 'bar',
                        label: from18to50,
                        backgroundColor: '#66BB6A',
                        data: [50, 25, 12, 48, 90, 76, 42, 32, 10, 40],
                    },
                    {
                        type: 'bar',
                        label: moreThan50,
                        backgroundColor: '#FFA726',
                        data: [50, 25, 12, 48, 90, 76, 42, 32, 10, 40],
                    },
                ],
            };
        });
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
    exportData(): void {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }

        this.loading = true;

        this.relativeServices.getExcelReport().subscribe(
            (resultBlob: Blob) => {
                saveAs(
                    resultBlob,
                    `Relative_${new DatePipe('en_US').transform(
                        new Date(),
                        'yyyyMMdd_HHmmss',
                    )}.xlsx`,
                );
            },
            (error) => {
                console.log('error', error);
                this.messageService.add({
                    severity: 'error',
                    detail: 'Lỗi lấy dữ liệu',
                });
            },
        );
    }
}
