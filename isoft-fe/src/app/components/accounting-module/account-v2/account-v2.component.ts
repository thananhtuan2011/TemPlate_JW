import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Injector,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    AccountGroupDetailForChildParams,
    ImportExportAcccountQueryParam,
} from 'src/app/models/account-group.model';
import { ChartOfAccount } from 'src/app/models/case.model';
import { NameValueOfInt } from 'src/app/models/common.model';
import { AccountGroupService } from 'src/app/service/account-group.service';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import {
    IIsTableColumn,
    IsTableColumn,
    IsTableColumnType,
} from 'src/app/shared/is-table/is-table.model';
import AppUtil from 'src/app/utilities/app-util';
import { AccountType, AccountTypeList } from './account.model';
import * as XLSX from 'xlsx';
import { LookupValueScopes } from 'src/app/utilities/app-enum';
import { LookupValuesService } from 'src/app/service/lookupValues.service';
import { Table } from 'primeng/table';
import * as _ from 'lodash';
import { AddEditAccountComponent } from './dialogs/add-edit-account/add-edit-account.component';
import { AddEditAccountGroupComponent } from './dialogs/add-edit-account-group/add-edit-account-group.component';
import AppConstants from '../../../utilities/app-constants';

@Component({
    selector: 'app-account-v2',
    templateUrl: './account-v2.component.html',
    styleUrls: ['./account-v2.component.scss'],
})
export class AccountV2Component
    extends AppComponentBase
    implements OnInit, AfterViewInit
{
    appConstant = AppConstants;
    cols: any[];
    accounts: any[];
    $accounts: Subscription;
    columnType = IsTableColumnType;

    currentAccountType: NameValueOfInt = AccountTypeList[0];
    accountTypeList = AccountTypeList;
    selectedHeaderDropdown: any;
    menuActionItems: MenuItem[] = [];
    displayImportExportDetailModal = false;
    accountDetail1s = [];
    queryParamsForChild: AccountGroupDetailForChildParams = {
        page: 1,
        pageSize: 50,
        sortField: 'id',
        isSort: true,
        warehouseCode: undefined,
        isInternal: 1,
    };
    accGroups = [];
    classifications = [];
    codeExcelDetail = '';
    codeExcel = '';
    formInput!: FormGroup;
    dtSearch: string;

    @Input('displayDeleteButton') displayDeleteButton: boolean = true;
    @Input('displayAddItemButton') displayAddItemButton: boolean = true;
    @Input('displayCongCuButton') displayCongCuButton: boolean = true;
    @Input('displayGoHomeButton') displayGoHomeButton: boolean = true;
    @Input('displayHoachToanNoiBoButton') displayHoachToanNoiBoButton: boolean =
        true;
    @Input('displayHasChildButton') displayHasChildButton: boolean = true;
    @Input('displayTitleText') displayTitleText: boolean = true;
    @Input('displaySelectButton') displaySelectButton: boolean = false;
    @Input('scrolHeight') scrolHeight = '88vh';
    @Output('onSelectItem') onSelectItem = new EventEmitter<any>();

    @ViewChild('dt') dt: Table;
    @ViewChild('addEditAccountTmp')
    addEditAccountComponent: AddEditAccountComponent;
    @ViewChild('addEditAccountGroupTmp', { static: false })
    addEditAccountGroupComponent: AddEditAccountGroupComponent;
    @ViewChild('uploadFileTaiKhoanArising')
    fileInputTaiKhoanArising: ElementRef;
    @ViewChild('uploadFile') fileInput: ElementRef;
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F6':
                event.preventDefault();
                this.onBackHomePage();
                break;
            case 'F7':
                event.preventDefault();
                this.onAddAccount();
                break;
        }
    }

    constructor(
        private readonly accountGroupService: AccountGroupService,
        private readonly chartOfAccountService: ChartOfAccountService,
        private readonly confirmationService: ConfirmationService,
        private readonly lookupValuesService: LookupValuesService,
        private readonly _injector: Injector,
        private readonly router: Router,
    ) {
        super(_injector);
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.buildMenuItem();
            const stateAccount = window.history.state.account;
            if (stateAccount) {
                this.dt.filterGlobal(stateAccount.code, 'startsWith');
                this.dtSearch = stateAccount.code;
            }
        }, 500);
    }

    ngOnInit() {
        this.getLookupValues();
        this.getAccounts();
        this.cols = this.buildCols();
        this.formInput = new FormGroup({
            uploadFile: new FormControl(null),
            uploadFileTaiKhoanArising: new FormControl(null),
            uploadFileTaiKhoanCT1: new FormControl(null),
        });
    }

    onChangeAccountType($event) {
        this.cols = this.buildCols();
    }

    onAddAccount() {
        this.addEditAccountComponent.show();
    }

    onEditAccount(data) {
        this.addEditAccountComponent.show(data);
    }

    onAddEditAccountSuccessfull($event) {
        this.getAccounts();
    }

    onRemoveAccount(data) {
        if (!data || !data.displayDelete) return;

        this.confirmationService.confirm({
            header: 'Xóa dữ liệu',
            message: `Bạn có chắc chắn muốn xóa tài khoản ${data.code} hay không ?`,
            acceptLabel: AppUtil.translate(this.translateService, 'label.yes'),
            rejectLabel: AppUtil.translate(this.translateService, 'label.no'),
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.accountGroupService
                    .deleteAccount(data.id)
                    .subscribe((_) => {
                        this.getAccounts();
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.delete',
                            ),
                        });
                    });
            },
        });
    }

    onBackHomePage(): void {
        this.router.navigate(['/uikit']);
    }

    onGoToAccountDetail1(account, isOpenModal: boolean) {
        this.router.navigate(['/uikit/account-detail-first-v2'], {
            state: { account: account, isOpenModal: isOpenModal },
        });
    }

    getCodeExcel(event) {
        const param = _.cloneDeep(this.queryParamsForChild);
        delete param.warehouseCode;
        this.accountGroupService
            .getListDetailForChildNode(event.value, param)
            .subscribe((response) => {
                this.accountDetail1s = response.data;
            });
    }

    importExcel(event) {
        const objProps = [
            'code',
            'name',
            'openingDebit',
            'openingCredit',
            'foreignDebit',
            'foreignCredit',
            'accGroup',
            'classification',
            'type',
        ];
        const file = event.target.files[0];
        let arrayBuffer: any;
        let fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = (e) => {
            arrayBuffer = fileReader.result;
            const data = new Uint8Array(arrayBuffer);
            const arr = new Array();
            for (let i = 0; i != data.length; ++i)
                arr[i] = String.fromCharCode(data[i]);
            const bstr = arr.join('');
            const workbook = XLSX.read(bstr, { type: 'binary' });
            const first_sheet_name = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[first_sheet_name];
            const arraylist = XLSX.utils.sheet_to_json(worksheet, {
                blankrows: false,
                header: objProps,
                range: 3,
            });
            const request =
                arraylist?.reduce((arr: any[], curr, index) => {
                    const item = new ChartOfAccount();
                    item.code = curr?.['code'];
                    item.name = curr?.['name'];
                    item.parentRef = curr?.['parentCode']?.toString();
                    item.warehouseCode = curr?.['Kho']?.toString();
                    if (curr?.['type'] == 'Nội bộ') {
                        item.isInternal = 3;
                        item.openingDebitNB = curr?.['openingDebit'] || 0;
                        item.openingCreditNB = curr?.['openingCredit'] || 0;
                        item.openingForeignDebitNB =
                            curr?.['foreignDebit'] || 0;
                        item.openingForeignCreditNB =
                            curr?.['foreignCredit'] || 0;
                    } else {
                        item.openingDebit = curr?.['openingDebit'] || 0;
                        item.openingCredit = curr?.['openingCredit'] || 0;
                        item.openingForeignDebit = curr?.['foreignDebit'] || 0;
                        item.openingForeignCredit =
                            curr?.['foreignCredit'] || 0;
                    }
                    let accGroup = this.accGroups.find(
                        (e) => e.value == curr?.['accGroup'],
                    );
                    item.accGroup = accGroup?.code || 1;

                    let classification = this.classifications.find(
                        (e) => e.value == curr?.['classification'],
                    );
                    item.classification = classification?.code || 1;
                    arr.push(item);
                    return arr;
                }, []) || [];
            this.accountGroupService.importTaiKhoan(request).subscribe(
                (res) => {
                    this.messageService.add({
                        severity: 'success',
                        detail: AppUtil.translate(
                            this.translateService,
                            'success.create',
                        ),
                    });
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
            this.formInput.controls['uploadFile'].reset();
        };
    }

    importTaiKhoanCT1(event) {
        const objProps = [
            'warehouse',
            'parentRef',
            'code',
            'name',
            'unit',
            'quantity',
            'unitPrice',
            'openingDebit',
            'openingCredit',
            'foreignDebit',
            'foreignCredit',
            'accGroup',
            'classification',
            'type',
            'isInternal',
        ];
        const file = event.target.files[0];
        let arrayBuffer: any;
        let fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = (e) => {
            arrayBuffer = fileReader.result;
            const data = new Uint8Array(arrayBuffer);
            const arr = new Array();
            for (let i = 0; i != data.length; ++i)
                arr[i] = String.fromCharCode(data[i]);
            const bstr = arr.join('');
            const workbook = XLSX.read(bstr, { type: 'binary' });
            const first_sheet_name = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[first_sheet_name];
            const arraylist = XLSX.utils.sheet_to_json(worksheet, {
                blankrows: false,
                header: objProps,
                range: 3,
            });
            const request =
                arraylist?.reduce((arr: any[], curr, index) => {
                    const item = new ChartOfAccount();
                    item.code = curr?.['code']?.toString();
                    item.name = curr?.['name']?.toString();
                    item.parentRef = curr?.['parentRef']?.toString();
                    item.warehouseCode = curr?.['warehouse']?.toString();
                    item.stockUnit = curr?.['unit'];
                    if (curr?.['type'] == 'Nội bộ') {
                        item.typeInternal = 3;
                        item.openingDebitNB = curr?.['openingDebit'] || 0;
                        item.openingCreditNB = curr?.['openingCredit'] || 0;
                        item.openingForeignDebitNB =
                            curr?.['foreignDebit'] || 0;
                        item.openingForeignCreditNB =
                            curr?.['foreignCredit'] || 0;
                        item.openingStockQuantityNB = curr?.['quantity'] || 0;
                        item.stockUnitPriceNB = curr?.['unitPrice'] || 0;
                    } else {
                        item.openingDebit = curr?.['openingDebit'] || 0;
                        item.openingCredit = curr?.['openingCredit'] || 0;
                        item.openingForeignDebit = curr?.['foreignDebit'] || 0;
                        item.openingForeignCredit =
                            curr?.['foreignCredit'] || 0;
                        item.openingStockQuantity = curr?.['quantity'] || 0;
                        item.stockUnitPrice = curr?.['unitPrice'] || 0;
                    }
                    let accGroup = this.accGroups.find(
                        (e) => e.value == curr?.['accGroup'],
                    );
                    item.accGroup = accGroup?.code || 1;
                    let classification = this.classifications.find(
                        (e) => e.value == curr?.['classification'],
                    );
                    item.classification = classification?.code || 1;
                    item.isInternal = 1;
                    if(curr?.['isInternal'])
                    {
                        if(curr?.['isInternal'] == "HT"){
                            item.isInternal = 2;
                        }
                        else if(curr?.['isInternal'] == "NB"){
                            item.isInternal = 3;
                        }
                    }
                    arr.push(item);
                    return arr;
                }, []) || [];
            const parentCode = this.codeExcelDetail
                ? `${this.codeExcel}:${this.codeExcelDetail}`
                : this.codeExcel;
            this.accountGroupService
                .importTaiKhoanCT1(parentCode, request)
                .subscribe(
                    (res) => {
                        this.getAccounts();
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.create',
                            ),
                        });
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
            this.formInput.controls['uploadFileTaiKhoanCT1'].reset();
        };
    }

    importFromExcelTaiKhoanArising(event) {
        const objProps = [
            'code',
            'name',
            'parentCode',
            'warehouse',
            'openingDebit',
            'openingCredit',
            'foreignDebit',
            'foreignCredit',
            'accGroup',
            'classification',
            'type',
        ];
        const file = event.target.files[0];
        let arrayBuffer: any;
        let fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = (e) => {
            arrayBuffer = fileReader.result;
            const data = new Uint8Array(arrayBuffer);
            const arr = new Array();
            for (let i = 0; i != data.length; ++i)
                arr[i] = String.fromCharCode(data[i]);
            const bstr = arr.join('');
            const workbook = XLSX.read(bstr, { type: 'binary' });
            const first_sheet_name = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[first_sheet_name];
            const arraylist = XLSX.utils.sheet_to_json(worksheet, {
                blankrows: false,
                header: objProps,
                range: 3,
            });
            const request =
                arraylist?.reduce((arr: any[], curr, index) => {
                    const item = new ChartOfAccount();
                    item.code = curr?.['code'];
                    item.name = curr?.['name'];
                    item.parentRef = curr?.['parentCode'].toString();
                    item.warehouseCode = curr?.['Kho']?.toString();
                    if (curr?.['type'] == 'Nội bộ') {
                        item.isInternal = 3;
                        item.openingDebitNB = curr?.['openingDebit'] || 0;
                        item.openingCreditNB = curr?.['openingCredit'] || 0;
                        item.openingForeignDebitNB =
                            curr?.['foreignDebit'] || 0;
                        item.openingForeignCreditNB =
                            curr?.['foreignCredit'] || 0;
                    } else {
                        item.openingDebit = curr?.['openingDebit'] || 0;
                        item.openingCredit = curr?.['openingCredit'] || 0;
                        item.openingForeignDebit = curr?.['foreignDebit'] || 0;
                        item.openingForeignCredit =
                            curr?.['foreignCredit'] || 0;
                    }
                    let accGroup = this.accGroups.find(
                        (e) => e.value == curr?.['accGroup'],
                    );
                    item.accGroup = accGroup?.code || 1;

                    let classification = this.classifications.find(
                        (e) => e.value == curr?.['classification'],
                    );
                    item.classification = classification?.code || 1;
                    arr.push(item);
                    return arr;
                }, []) || [];
            this.accountGroupService
                .importFromExcelTaiKhoanArising(request)
                .subscribe(
                    (res) => {
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.create',
                            ),
                        });
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
            this.formInput.controls['uploadFileTaiKhoanArising'].reset();
        };
    }

    exportExcel(isExportAll: boolean = false) {
        const parentCode = this.codeExcelDetail
            ? `${this.codeExcel}:${this.codeExcelDetail}`
            : this.codeExcel;
        this.accountGroupService
            .exportTaiKhoanNoiBoChiTiet1(<ImportExportAcccountQueryParam>{
                code: parentCode,
                Loai: this.currentAccountType.value,
                isExportAll: isExportAll
            })
            .subscribe((res) => {
                this.openDownloadFile(res.data, 'excel');
            });
    }

    private getLookupValues() {
        this.lookupValuesService
            .lookupValues({ scope: LookupValueScopes.ChartOfAccount_AccGroup })
            .subscribe(
                (res) => {
                    this.accGroups = res || [];
                },
                (err) => {
                    this.accGroups = [];
                },
            );
        this.lookupValuesService
            .lookupValues({
                scope: LookupValueScopes.ChartOfAccount_Classification,
            })
            .subscribe(
                (res) => {
                    this.classifications = res || [];
                },
                (err) => {
                    this.classifications = [];
                },
            );
    }

    private buildMenuItem() {
        this.menuActionItems = [
            {
                label: 'Tài khoản đồng bộ',
                command: () => {
                    this.addEditAccountGroupComponent.show();
                },
            },
            {
                label: 'Nhập xuất chi tiết',
                command: () => {
                    this.displayImportExportDetailModal = true;
                },
            },
            {
                label: 'Xuất excel tài khoản',
                command: () => {
                    let accountType = this.currentAccountType.value == AccountType.HT ? 0 : 1;
                    this.accountGroupService
                        .exportTaiKhoan(accountType)
                        .subscribe((res) => {
                            this.openDownloadFile(res.data, 'excel');
                        });
                },
            },
            {
                label: 'Nhập excel tài khoản',
                command: () => {
                    this.fileInput.nativeElement.click();
                },
            },
            {
                label: 'Cập nhật số dư phát sinh',
                command: () => {
                    this.chartOfAccountService.UpdateArisingAccount().subscribe(
                        (res) => {
                            this.getAccounts();
                        },
                        (err) => {},
                    );
                },
            },
            {
                label: 'Kết chuyển sang năm sau',
                command: () => {
                    this.chartOfAccountService.transferAccount().subscribe((res: any) => {
                        this.getAccounts();
                    });
                },
            },
        ];
    }

    private openDownloadFile(_fileName: string, _ft: string) {
        try {
            var _l = this.accountGroupService.getFolderPathDownload(
                _fileName,
                _ft,
            );
            if (_l) window.open(_l);
        } catch (ex) {}
    }

    private getAccounts() {
        this.accounts = null;
        this.$accounts = this.accountGroupService
            .getListDetail({})
            .subscribe((response: any) => {
                this.accounts = response;
            });
    }

    private buildCols() {
        switch (this.currentAccountType.value) {
            case AccountType.NB:
                return [
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.account_code',
                        field: 'code',
                        styleClass: 'w--10',
                    }),
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'left_menu.account',
                        field: 'name',
                        styleClass: 'w--40',
                    }),
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.residual_debt_nb',
                        field: 'openingDebitNb',
                        styleClass: 'w--10 text-right',
                        type: IsTableColumnType.DoubleInString,
                    }),
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.residual_opening_nb',
                        field: 'openingCreditNb',
                        styleClass: 'w--10 text-right',
                        type: IsTableColumnType.DoubleInString,
                    }),
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.currency',
                        field: 'isForeignCurrency',
                        type: IsTableColumnType.ForeignCurrency,
                        styleClass: 'w--5 text-center',
                    }),
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.duration',
                        field: 'duration',
                        styleClass: 'w--5 text-center',
                    }),
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.nature',
                        field: 'accGroup',
                        styleClass: 'w--5 text-center',
                    }),
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.type',
                        field: 'classification',
                        styleClass: 'w--5 text-center',
                    }),
                ] as IsTableColumn[];
            default:
                return [
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.account_code',
                        field: 'code',
                        styleClass: 'w--10',
                    }),
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'left_menu.account',
                        field: 'name',
                        styleClass: 'w--40',
                    }),
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.residual_debt',
                        field: 'openingDebit',
                        styleClass: 'w--10 text-right',
                        type: IsTableColumnType.DoubleInString,
                    }),
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.residual_opening',
                        field: 'openingCredit',
                        styleClass: 'w--10 text-right',
                        type: IsTableColumnType.DoubleInString,
                    }),
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.currency',
                        field: 'isForeignCurrency',
                        type: IsTableColumnType.ForeignCurrency,
                        styleClass: 'w--5 text-center',
                    }),
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.duration',
                        field: 'duration',
                        styleClass: 'w--5 text-center',
                    }),
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.nature',
                        field: 'accGroup',
                        styleClass: 'w--5 text-center',
                    }),
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.type',
                        field: 'classification',
                        styleClass: 'w--5 text-center',
                    }),
                ];
        }
    }
}
