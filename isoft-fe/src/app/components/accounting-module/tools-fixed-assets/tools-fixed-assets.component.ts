import {
    Component,
    ElementRef,
    HostListener,
    OnInit,
    ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ColumnFilter, Table } from 'primeng/table';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import { SymbolService } from 'src/app/service/symbol.service';
import { ToolsFixedAssetsService } from 'src/app/service/tools-fixed-assets.service';
import { PageFilterUser } from 'src/app/service/user.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import { ToolsFixedAssetsFormComponent } from './tools-fixed-assets-form/tools-fixed-assets-form.component';
import { AssetsFixed242Service } from '../../../service/assets-fixed-242.service';
import { ActivatedRoute } from '@angular/router';
import { AppMainComponent } from '../../../layouts/app.main.component';
import { FormControl } from '@angular/forms';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';
import * as saveAs from 'file-saver';
import { environment } from '../../../../environments/environment';
import AppConstants from 'src/app/utilities/app-constants';

@Component({
    selector: 'app-tools-fixed-assets',
    templateUrl: './tools-fixed-assets.component.html',
    providers: [MessageService, ConfirmationService],
    styleUrls: ['../../../../assets/demo/badges.scss'],
    styles: [
        `
            :host ::ng-deep .dropdown-custom {
                height: 100%;
                width: 180px;
                margin-right: 5px;
                .p-dropdown {
                    height: fit-content;
                    width: 100%;
                }
                .p-dropdown-label {
                    height: 2.7rem;
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
        `,
    ],
})
export class ToolsFixedAssetsComponent implements OnInit {
    toolSelectChoose = 'PB';
    depreciationSelectChoose = 1;
    toolSelect = [
        {
            label: 'Công cụ dụng cụ',
            value: 'PB',
        },
        {
            label: 'Tài sản cố định',
            value: 'KH',
        },
    ];

    depreciationSelect = [
        {
            label: 'Hết khấu hao',
            value: 0,
        },
        {
            label: 'Còn khấu hao',
            value: 1,
        },
    ];
    isPageUse = false;
    public appConstant = AppConstant;
    @ViewChild('FixedAssets') ToolsFixedAssetsFormComponent:
        | ToolsFixedAssetsFormComponent
        | undefined;

    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    first = 0;

    @ViewChild('dt') table: Table;

    @ViewChild('filter') filter: ElementRef;

    public getParams: any = {
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
        private toolFixedAssetsService: ToolsFixedAssetsService,
        private assetsFixed242Service: AssetsFixed242Service,
        private readonly chartOfAccount: ChartOfAccountService,
        private readonly messageService: MessageService,
        public activatedRoute: ActivatedRoute,
        public appMain: AppMainComponent,
    ) {}

    ngOnInit(): void {
        this.isPageUse = this.activatedRoute.snapshot.data.isPageUse;
        this.getListCreditAccount();
    }
    onSearch(event) {
        if (event.key === 'Enter') {
            this.getToolFixedAssets();
        }
    }

    onChangeDropdownSearch() {
        this.getParams = {
            ...this.getParams,
            use: this.depreciationSelectChoose,
            type: this.toolSelectChoose,
        };
        this.getToolFixedAssets();
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.getParams.isSort = event.value;
        }
        this.getToolFixedAssets();
    }

    clearFilter(columnFilter: ColumnFilter, field: string) {
        columnFilter.clearFilter();
    }

    getToolFixedAssets(event?: any, isExport: boolean = false) {
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

        const api = this.activatedRoute.snapshot.data.isPageUse
            ? this.assetsFixed242Service.getListAssets242Search(this.getParams)
            : this.toolFixedAssetsService.getListToolsFixedAssets(
                  this.getParams,
              );
        this.pendingRequest = api.subscribe(
            (response: any) => {
                AppUtil.scrollToTop();
                this.listToolsFixedAssets = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            },
            (err) => {
                console.log(err);
            },
        );
    }

    showDialog() {
        this.display = true;
    }

    getDetail(id: string | number) {
        const api = this.activatedRoute.snapshot.data.isPageUse
            ? this.assetsFixed242Service.getByID(id)
            : this.toolFixedAssetsService.getByID(id);
        api.subscribe((response: any) => {
            this.formData = response;
            this.isEdit = true;
            this.showDialog();
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
                const api = this.activatedRoute.snapshot.data.isPageUse
                    ? this.assetsFixed242Service.deleteAssets(id)
                    : this.toolFixedAssetsService.deleteToolFixedAssets(id);
                api.subscribe((response: any) => {
                    this.getToolFixedAssets();
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
            this.getToolFixedAssets();
        } else {
            this.types.detail1 = [];
        }
    }

    onImportExcel(files) {
        try {
            const header = [
                'id',
                'creditCode',
                'creditCodeName',
                'creditDetailCodeFirst',
                'creditDetailCodeFirstName',
                'creditDetailCodeSecondName',
                'creditDetailCodeSecondName',
                'usedDate',
                'quantity',
                'unitPrice',
                'historicalCost',
                'totalMonth',
                'use',
                'type',
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
                result.splice(0, 1);
                result.forEach((element) => {
                    importListItem.push({
                        id: 0,
                        name: element['name'] || '',
                        historicalCost: Number(element['historicalCost']) || 0,
                        voucherNumber: element['voucherNumber'] || '',
                        usedDate: new Date(
                            AppUtil.convertStringToDate(element['usedDate']) ||
                                '',
                        ),
                        // endOfDepreciation: AppUtil.convertStringToDate(element['endOfDepreciation'])  || '',
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
                        type:
                            element['type'] ||
                            (this.activatedRoute.snapshot.data.isPageUse
                                ? 'PB'
                                : ''),
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
                        debitCode: (element['debitCode'] || '').toString(),
                        debitWarehouse: element['debitWarehouse'] || '',
                        debitDetailCodeFirst: (
                            element['debitDetailCodeFirst'] || ''
                        ).toString(),
                        debitDetailCodeSecond: (
                            element['debitDetailCodeSecond'] || ''
                        ).toString(),
                        creditCode: (element['creditCode'] || '').toString(),
                        creditWarehouse: element['creditWarehouse'] || ' ',
                        creditDetailCodeFirst: (
                            element['creditDetailCodeFirst'] || ''
                        ).toString(),
                        creditDetailCodeSecond: (
                            element['creditDetailCodeSecond'] || ''
                        ).toString(),
                        invoiceNumber: element['invoiceNumber'] || '',
                        invoiceTaxCode: element['invoiceTaxCode'] || '',
                        invoiceSerial: element['invoiceSerial'] || '',
                        invoiceDate:
                            AppUtil.convertStringToDate(
                                element['invoiceDate'],
                            ) || '',
                        use: element['use'] == 'Có' ? 1 : 0,
                        departmentId: Number(element['departmentId']) || 0,
                        userId: Number(element['userId']) || 0,
                        usedDateUnix: Number(element['usedDateUnix']) || 0,
                        quantity: Number(element['quantity']) || 0,
                        unitPrice: Number(element['unitPrice']) || 0,
                    });
                });

                const api = this.activatedRoute.snapshot.data.isPageUse
                    ? this.assetsFixed242Service.importExcel(importListItem)
                    : this.toolFixedAssetsService.importExcel(importListItem);
                api.subscribe(
                    (res) => {
                        this.messageService.add({
                            severity: 'success',
                            detail: 'Import dữ liệu thành công',
                        });
                        fileReader = null;
                        this.getToolFixedAssets();
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
        const api = this.activatedRoute.snapshot.data.isPageUse
            ? this.assetsFixed242Service.exportExcel(body)
            : this.toolFixedAssetsService.exportExcel(body);
        api.subscribe(
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
                this.isEdit = false;
                this.showDialog();
                break;
        }
    }
}
