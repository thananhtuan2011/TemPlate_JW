import {
    Component,
    ElementRef,
    HostListener,
    OnInit,
    ViewChild,
} from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import AppConstant from '../../../utilities/app-constants';
import { ColumnFilter, Table } from 'primeng/table';
import { PageFilterUser } from '../../../service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { ToolsFixedAssetsService } from '../../../service/tools-fixed-assets.service';
import { ChartOfAccountService } from '../../../service/chart-of-account.service';
import AppUtil from '../../../utilities/app-util';
import { SymbolService } from 'src/app/service/symbol.service';
import { AssetsFixedUserService } from '../../../service/assets-fixed-user.service';
import { AppMainComponent } from '../../../layouts/app.main.component';
import { FormControl } from '@angular/forms';
import * as XLSX from 'xlsx';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import AppConstants from '../../../utilities/app-constants';

@Component({
    selector: 'app-tools-fixed-assets-user',
    templateUrl: './tools-fixed-assets-user.component.html',
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

            :host ::ng-deep .p-calendar {
                .p-datepicker {
                    min-width: 250px;
                }
            }

            :host ::ng-deep .dropdown-table {
                height: 100%;
                width: 100%;

                .p-dropdown {
                    height: 100%;
                    width: 100%;
                }
            }
            :host ::ng-deep .cell-number {
                text-align: right;
                justify-content: right;
            }
        `,
    ],
})
export class ToolsFixedAssetsUserComponent implements OnInit {
    public appConstant = AppConstant;
    @ViewChild('FixedAssets') ToolsFixedAssetsFormComponent: any;

    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    first = 0;

    @ViewChild('dt') table: Table;

    @ViewChild('filter') filter: ElementRef;

    public getParams: PageFilterUser = {
        page: 1,
        pageSize: 5,
        sortField: 'id',
        isSort: true,
        searchText: '',
    };
    public totalRecords = 0;
    public totalPages = 0;
    public myTarget: number;

    public isLoading: boolean = false;
    display: boolean = false;

    isMobile = screen.width <= 1199;
    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;
    pendingRequest: any;
    roles: any[] = [];
    listToolsFixedAssets = [];
    creditAccounts = [];
    types: any = {};
    uploadFile = new FormControl('');

    constructor(
        private readonly SymbolService: SymbolService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private assetsFixedUserService: AssetsFixedUserService,
        private readonly chartOfAccount: ChartOfAccountService,
        public readonly appMain: AppMainComponent,
        private readonly messageService: MessageService,
        private readonly router: Router,
    ) {}

    ngOnInit(): void {
        this.getListCreditAccount();
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getFixedAssetsUser();
        }
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.getParams.isSort = event.value;
        }
        this.getFixedAssetsUser();
    }

    clearFilter(columnFilter: ColumnFilter, field: string) {
        columnFilter.clearFilter();
    }

    getFixedAssetsUser(event?: any, isExport: boolean = false) {
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
        this.pendingRequest = this.assetsFixedUserService
            .getList(this.getParams)
            .subscribe(
                (response: any) => {
                    AppUtil.scrollToTop();
                    this.listToolsFixedAssets = response.data;
                    this.totalRecords = response.totalItems || 0;
                    this.totalPages =
                        response.totalItems / response.pageSize + 1;
                    this.loading = false;
                },
                (err) => {
                    console.log(err);
                },
            );
    }

    getDetail(id: string | number) {
        this.assetsFixedUserService.getByID(id).subscribe((response: any) => {
            this.formData = response?.result || response;
            this.isEdit = true;
        });
    }

    onDelete(id: string | number) {
        let message;
        this.translateService
            .get('question.delete_tools_fixed_assets')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                this.assetsFixedUserService
                    .deleteFixedAssetUsers(id)
                    .subscribe((response: any) => {
                        this.getFixedAssetsUser();
                    });
            },
        });
    }

    getListCreditAccount() {
        const query = { classification: [4, 5] };
        this.chartOfAccount
            .getAllClassification(query)
            .subscribe((res: any) => {
                this.types.creditAccounts = res;
            });
    }

    getDetail1(accountCode) {
        this.chartOfAccount.getDetail(accountCode).subscribe((res: any) => {
            this.types.detail1 = res.data;
        });
    }

    onChangeAccount(event) {
        if (event && event.value) {
            this.getDetail1(event.value);
            this.getFixedAssetsUser();
        } else {
            this.types.detail1 = [];
        }
    }

    onImportExcel(files) {
        try {
            const header = [
                'id',
                'name',
                'historicalCost',
                'voucherNumber',
                'usedDate',
                'endOfDepreciation',
                'liquidationDate',
                'totalMonth',
                'depreciationOfOneDay',
                'accruedExpense',
                'totalDayDepreciationOfThisPeriod',
                'depreciationOfThisPeriod',
                'carryingAmountOfLiquidationAsset',
                'carryingAmount',
                'departmentManager',
                'departmentManagerName',
                'userManager',
                'userManagerName',
                'type',
                'debitCodeName',
                'debitDetailCodeFirstName',
                'debitDetailCodeSecondName',
                'creditCodeName',
                'creditDetailCodeFirstName',
                'creditDetailCodeSecondName',
                'debitCode',
                'debitWarehouse',
                'debitDetailCodeFirst',
                'debitDetailCodeSecond',
                'creditCode',
                'creditWarehouse',
                'creditDetailCodeFirst',
                'creditDetailCodeSecond',
                'invoiceNumber',
                'invoiceTaxCode',
                'invoiceSerial',
                'invoiceDate',
                'use',
                'departmentId',
                'userId',
                'usedDateUnix',
            ];
            let fileReader = new FileReader();
            let arrayBuffer: any;
            let result = [];
            const importListItem = [];
            fileReader.readAsArrayBuffer(files[0]);
            fileReader.onload = (e) => {
                arrayBuffer = fileReader.result;
                var data = new Uint8Array(arrayBuffer);
                var arr = new Array();
                for (var i = 0; i != data.length; ++i) {
                    arr[i] = String.fromCharCode(data[i]);
                }
                var bstr = arr.join('');
                var workbook = XLSX.read(bstr, { type: 'binary' });
                var first_sheet_name = workbook.SheetNames[0];
                var worksheet = workbook.Sheets[first_sheet_name];
                result = XLSX.utils.sheet_to_json(worksheet, {
                    raw: true,
                    header: header,
                    range: 2,
                });
                result.forEach((element) => {
                    importListItem.push({
                        id: 0,
                        name: element['name'] || '',
                        historicalCost: Number(element['month']) || 0,
                        voucherNumber: element['voucherNumber'] || '',
                        usedDate:
                            AppUtil.convertStringToDate(element['usedDate']) ||
                            '',
                        endOfDepreciation:
                            AppUtil.convertStringToDate(
                                element['endOfDepreciation'],
                            ) || '',
                        liquidationDate:
                            AppUtil.convertStringToDate(
                                element['liquidationDate'],
                            ) || '',
                        totalMonth: Number(element['totalMonth']) || 0,
                        depreciationOfOneDay:
                            Number(element['depreciationOfOneDay']) || 0,
                        accruedExpense: Number(element['accruedExpense']) || 0,
                        totalDayDepreciationOfThisPeriod:
                            Number(
                                element['totalDayDepreciationOfThisPeriod'],
                            ) || 0,
                        depreciationOfThisPeriod:
                            Number(element['depreciationOfThisPeriod']) || 0,
                        carryingAmountOfLiquidationAsset:
                            Number(
                                element['carryingAmountOfLiquidationAsset'],
                            ) || 0,
                        carryingAmount: Number(element['carryingAmount']) || 0,
                        departmentManager: element['departmentManager'] || '',
                        departmentManagerName:
                            element['departmentManagerName'] || '',
                        userManager: element['userManager'] || '',
                        userManagerName: element['userManagerName'] || '',
                        type: element['type'] || '',
                        debitCodeName: element['debitCodeName'] || '',
                        debitDetailCodeFirstName:
                            element['debitDetailCodeFirstName'] || '',
                        debitDetailCodeSecondName:
                            element['debitDetailCodeSecondName'] || '',
                        creditCodeName: element['creditCodeName'] || '',
                        creditDetailCodeFirstName:
                            element['creditDetailCodeFirstName'] || '',
                        creditDetailCodeSecondName:
                            element['creditDetailCodeSecondName'] || '',
                        debitCode: element['debitCode'] || ' ',
                        debitWarehouse: element['debitWarehouse'] || '',
                        debitDetailCodeFirst:
                            element['debitDetailCodeFirst'] || '',
                        debitDetailCodeSecond:
                            element['debitDetailCodeSecond'] || '',
                        creditCode: element['creditCode'] || ' ',
                        creditWarehouse: element['creditWarehouse'] || ' ',
                        creditDetailCodeFirst:
                            element['creditDetailCodeFirst'] || '',
                        creditDetailCodeSecond:
                            element['creditDetailCodeSecond'] || '',
                        invoiceNumber: element['invoiceNumber'] || '',
                        invoiceTaxCode: element['invoiceTaxCode'] || '',
                        invoiceSerial: element['invoiceSerial'] || '',
                        invoiceDate:
                            AppUtil.convertStringToDate(
                                element['invoiceDate'],
                            ) || '',
                        use: Number(element['use']) || 0,
                        departmentId: Number(element['departmentId']) || 0,
                        userId: Number(element['userId']) || 0,
                        usedDateUnix: Number(element['usedDateUnix']) || 0,
                    });
                });

                this.assetsFixedUserService
                    .importExcel(importListItem)
                    .subscribe(
                        (res) => {
                            this.messageService.add({
                                severity: 'success',
                                detail: 'Import dữ liệu thành công',
                            });
                            fileReader = null;
                            this.getFixedAssetsUser();
                        },
                        (er) => {
                            this.messageService.add({
                                severity: 'error',
                                detail: 'Import dữ liệu thất bại',
                            });
                            fileReader = null;
                        },
                    );
                this.uploadFile.reset();
            };
        } catch (error) {
            throw new Error('Kiểm tra lại file import');
        }
    }

    onExportExcel() {
        const body = {
            isSort: true,
            sortField: '',
            page: 0,
            pageSize: 0,
            searchText: '',
        };
        this.assetsFixedUserService.exportExcel(body).subscribe(
            (res: any) => {
                this.openDownloadFile(res.data, 'excel');
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    detail: 'Lỗi lấy dữ liệu',
                });
            },
        );
    }

    openDownloadFile(_fileName: string, _ft: string) {
        try {
            var _l = this.getFolderPathDownload(_fileName, _ft);
            if (_l) window.open(_l);
        } catch (ex) {}
    }

    getFolderPathDownload(f: string, t: string): string {
        var k =
            environment.serverURL +
            '/api/ReportDownload/DownloadReportFromFile' +
            `?filename=${f}&fileType=${t}`;
        return k;
    }

    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                this.router.navigate(['/uikit/fixed-assets-user', 0]);
                break;
        }
    }

    protected readonly AppConstants = AppConstants;
}
