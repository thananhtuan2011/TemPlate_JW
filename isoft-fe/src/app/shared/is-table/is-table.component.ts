import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    Output,
    QueryList,
    SimpleChanges,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import MiniSearch from 'minisearch';
import { MenuItem, MessageService, PrimeTemplate } from 'primeng/api';
import { AutoComplete } from 'primeng/autocomplete';
import { ColumnActionType } from 'src/app/components/accounting-module/account-v2/account.model';
import { NameValueOfInt } from 'src/app/models/common.model';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import { IsTableClass } from './is-table.class';
import {
    ExcelActionType,
    ExcelActionTypeList,
    IIsTableColumn,
    IsTableColumnType,
} from './is-table.model';
import { Router } from '@angular/router';

@Component({
    selector: 'is-table',
    templateUrl: './is-table.component.html',
    styles: [
        `
            .is-table {
                .excel-dropdown {
                    ::ng-deep {
                        .p-dropdown {
                            width: 102px !important;
                        }
                    }
                }

                &--scroll {
                    ::ng-deep {
                        .p-datatable-wrapper {
                            .p-datatable-thead {
                                position: sticky;
                                top: 0;
                                z-index: 1;
                            }
                        }
                    }
                }
            }

            :host ::ng-deep {
                .p-paginator {
                    margin: auto !important;
                }

                .p-button {
                    padding: 0.2rem 1rem;
                }

                .p-inputtext,
                #menu .p-autocomplete .p-autocomplete-input {
                    height: 25px !important;
                    padding: 0.2rem 0 0 0.2rem;
                }

                .p-inputgroup-addon:last-child {
                    height: 25px !important;
                }

                .p-paginator .p-dropdown .p-dropdown-label {
                    width: auto;
                    padding: 0.8rem 0 0 0.8rem;
                    height: auto !important;
                }

                .p-multiselect {
                    height: 38px;
                }
            }

            @media screen and (max-width: 960px) {
                :host ::ng-deep {
                    #pr_id_10.p-datatable-gridlines
                        .p-datatable-tbody
                        > tr
                        > td:last-child {
                        display: block !important;
                        text-align: right !important;
                    }
                }
            }
        `,
    ],
})
export class IsTableComponent
    implements OnInit, AfterContentInit, AfterViewInit, OnChanges
{
    appConstant = AppConstant;

    @Input() styleClass = '';
    @Input() headerDropdownOptions: any[] = [];
    @Input() showHeaderDropdown = false;
    @Input() showHeaderButton = false;
    @Input() scrollable = false;
    @Input() scrollHeight = '';
    @Input() headerActionLabel = '';
    @Input() headerActionItems: MenuItem[] = [];
    @Input() isHighLight: boolean = false;
    @Input() chartOfAccounts: any[] = [];
    @Input() currentParentCode: string = '';

    @Input() searchValue: any = {};

    @Output() onChangePaging = new EventEmitter();
    @Output() onChangeAccount = new EventEmitter();
    @Output() onChangeDetail1 = new EventEmitter();
    @Output() onChangeDetail2 = new EventEmitter();
    @Output() expandChange = new EventEmitter<any>();
    @Output() excelActionChange = new EventEmitter<{
        type: ExcelActionType;
        data: any;
    }>();
    @Output() changeHeaderDropdown = new EventEmitter<any>();
    @Output() headerButtonClick = new EventEmitter();
    @Output() actionButtonClick = new EventEmitter<any>();

    @ContentChildren(PrimeTemplate) templates: QueryList<any>;
    @ViewChild('fileUpload', { static: false })
    fileUpload: ElementRef<HTMLInputElement>;
    @ViewChild('debit') public vcDebit: AutoComplete;
    @ViewChild('debit1') vcDebit1: AutoComplete;
    @ViewChild('debit2') vcDebit2: AutoComplete;

    isTable: IsTableClass = new IsTableClass();
    columnType = IsTableColumnType;
    expandTemplate: TemplateRef<any>;
    excelAction: NameValueOfInt;
    excelActions = ExcelActionTypeList;
    columnActionType = ColumnActionType;
    isShow = true;
    autoCompleteResults = [];
    selectedHeaderDropdown: any;

    constructor(
        private chartOfAccountService: ChartOfAccountService,
        private messageService: MessageService,
        private translateService: TranslateService,
        private _cdr: ChangeDetectorRef,
        private _host: ElementRef,
        private router: Router,
    ) {}

    async ngOnChanges(changes: SimpleChanges) {
        if (this.searchValue?.debitCode) {
            await this.getChartOfAccountDetails_1(
                this.searchValue.debitCode,
                '',
                this.appConstant.ACCOUNT_TYPE.DEBIT_1,
            );
            await this.getChartOfAccountDetails_1(
                this.searchValue.debitCode,
                this.searchValue.debitDetailCodeFirst,
                this.appConstant.ACCOUNT_TYPE.DEBIT_2,
            );
            this.value = {
                debitCode: {
                    value: this.searchValue.debitCode,
                    label: '',
                },
                debitDetailCodeFirst: {
                    value: this.searchValue.debitDetailCodeFirst,
                    label: '',
                },
                debitDetailCodeSecond: {
                    value: this.searchValue.debitDetailCodeSecond,
                    label: '',
                },
            };
            if (this.searchValue.debitCode) {
                this.expandChange.emit({ expanded: true });
                this.getParams.parentCode = this.searchValue.debitCode;
                this.onChangeAccount.emit(this.getParams);
            }
        }
    }

    ngOnInit() {}

    ngAfterViewInit(): void {
        this.handleAddScroll();
    }

    handleAddScroll() {
        if (this.scrollable) {
            const pTableWrapper = this._host.nativeElement.querySelector(
                '.p-datatable-wrapper',
            );
            if (pTableWrapper) {
                pTableWrapper.style.height = this.scrollHeight;
                this._cdr.detectChanges();
            }
        }
    }

    ngAfterContentInit(): void {
        this.templates.forEach((template) => {
            switch (template.getType()) {
                case this.columnType.Expand.toString():
                    this.expandTemplate = template.template;
            }
        });
    }

    refresh(columns: IIsTableColumn[]) {
        this.isTable.columns = columns;
        this.updateTable(this.isTable.data);
    }

    updateTable(data: any[]) {
        this.isTable.updateTable(data);
        this._cdr.detectChanges();
    }

    updateTotalRecords(totalRecords: number = 50) {
        this.isTable.updateTotalRecords(totalRecords);
        this._cdr.detectChanges();
    }

    updateColumns(columns: IIsTableColumn[]) {
        this.isTable.columns = columns;
        this._cdr.detectChanges();
    }

    onExpand(rowData: any) {
        this.expandChange.emit(rowData);
    }

    onRowCollapse(eventData: any) {
        console.log(eventData);
    }

    onChangeExcelAction(data: NameValueOfInt, rowData: any) {
        if (data.value === ExcelActionType.Import) {
            this.fileUpload.nativeElement.click();
        } else {
            this.excelActionChange.emit({
                type: data.value,
                data: { rowData: rowData, file: null },
            });
        }
    }

    onFileSelected(event: any, rowData: any) {
        const file: File = event.target.files[0];

        if (file) {
            const formData = new FormData();
            formData.append('thumbnail', file);
            this.excelActionChange.emit({
                type: ExcelActionType.Import,
                data: { rowData: rowData, file: formData },
            });
        }
    }

    onChangeHeaderDropdown(data: { event: any; value: any }) {
        this.changeHeaderDropdown.emit(data.value);
    }

    onHeaderButtonClick() {
        this.headerButtonClick.emit();
    }

    onActionButtonClick(event: any, data: any, type: ColumnActionType) {
        this.actionButtonClick.emit({ event, data, type });
    }

    //   onAccountAutoCompleteSearch(event: any, rowDataColumn: AccountGroupSyncAutoComplete) {
    //     rowDataColumn.search$.subscribe(value => {
    //       this.autoCompleteResults = value.filter(a => a.indexOf(event.query) >= 0);
    //     });
    //   }

    /**
     * Danh sách chi tiêt tài khoản
     * @param accountCode
     * Mã Tài khoản nợ/có
     * @param accountCodeDetail1
     * Mã chi tiêt 1
     * @param type
     * Loại tài khoản có/nợ/chi tiết 1/chi tiê 2
     */

    filteredDebitNames: any[] = [];
    debits1: any[] = [];
    debits1TotalRecords: number = 0;
    filteredDebit1Names: any[] = [];
    debits2: any[] = [];
    filteredDebit2Names: any[] = [];
    value: any = {};

    async getChartOfAccountDetails_1(
        accountCode,
        accountCodeDetail1,
        type,
        isDialog = false,
    ) {
        let parentRef = '';
        switch (type) {
            case this.appConstant.ACCOUNT_TYPE.DEBIT_1:
            case this.appConstant.ACCOUNT_TYPE.CREDIT_1:
                parentRef = accountCode;
                break;
            case this.appConstant.ACCOUNT_TYPE.DEBIT_2:
            case this.appConstant.ACCOUNT_TYPE.CREDIT_2:
                parentRef = `${accountCode}:${accountCodeDetail1}`;
                break;
        }
        const responseDetail = await this.chartOfAccountService.getDetail1(
            parentRef,
            this.dialogGetParams,
        );
        switch (type) {
            case this.appConstant.ACCOUNT_TYPE.DEBIT_1:
                this.debits1 = responseDetail.data || [];
                if (isDialog) {
                    this.dialogData = this.debits1;
                    this.dialogTotalRecords = responseDetail.totalItems;
                }
                break;
            case this.appConstant.ACCOUNT_TYPE.DEBIT_2:
                this.debits2 = responseDetail.data || [];
                if (isDialog) {
                    this.dialogData = this.debits2;
                    this.dialogTotalRecords = responseDetail.totalItems;
                }
                break;
        }
    }

    filterDebitName1(event) {
        if (!event || !event.query) {
            this.filteredDebitNames = [];
            this.chartOfAccounts.forEach((curr) => {
                this.filteredDebitNames.push({
                    value: curr.code,
                    label: `${curr.code} | ${curr.name} | Tính chất ${
                        curr.accGroup
                    } | ${curr.closingDebit || 0}`,
                });
            });
            return;
        }
        let miniSearch = new MiniSearch({
            fields: ['code', 'name'], // fields to index for full-text search
            storeFields: ['code', 'name', 'accGroup', 'closingDebit'], // fields to return with search results
        });
        miniSearch.addAll(this.chartOfAccounts);
        let results = miniSearch.search(event.query.toLowerCase(), {
            prefix: true,
        });
        if (results.length > 0) {
            this.filteredDebitNames = [];
            results.forEach((curr) => {
                this.filteredDebitNames.push({
                    value: curr.code,
                    label: `${curr.code} | ${curr.name} | Tính chất ${
                        curr.accGroup
                    } | ${curr.closingDebit || 0}`,
                });
            });
        }
        const debitCode = this.value.debitCode;
        if (
            event?.isTrusted ||
            !this.filteredDebitNames?.length ||
            results.length === 0
        ) {
            this.resetDebit();
            this.onChangeAccount.emit('');
        }
        if (event.query !== debitCode?.value) this.resetDebit1();
    }

    async onDebitSelect1(isFocus: boolean = true) {
        this.resetDebit1();
        const debitCode = this.value.debitCode?.value;
        await this.getChartOfAccountDetails_1(
            debitCode,
            '',
            this.appConstant.ACCOUNT_TYPE.DEBIT_1,
        );
        if (this.debits1?.length && isFocus) {
            this.onFocus(this.vcDebit1);
        }
        this.getParams.parentCode = debitCode;
        this.onChangeAccount.emit(this.getParams);
    }

    filterDebit1Name1(event) {
        if (!event || !event.query) {
            this.filteredDebit1Names = [];
            this.debits1.forEach((curr) => {
                this.filteredDebit1Names.push({
                    value: curr.code,
                    label: `${curr.code} | ${
                        curr.warehouseCode ? curr.warehouseCode : 'Không'
                    } | ${curr.name} | Tính chất ${curr.accGroup} | ${
                        curr.closingDebit || 0
                    }`,
                    id: curr.id,
                });
            });
            return;
        }

        let miniSearch = new MiniSearch({
            fields: ['code', 'name'], // fields to index for full-text search
            storeFields: ['code', 'name', 'accGroup', 'closingDebit'], // fields to return with search results
        });
        miniSearch.addAll(this.debits1);
        let results = miniSearch.search(event.query.toLowerCase(), {
            prefix: true,
        });
        console.log(results);
        if (results.length > 0) {
            this.filteredDebit1Names = [];
            results.forEach((curr) => {
                this.filteredDebit1Names.push({
                    value: curr.code,
                    label: `${curr.code} | ${
                        curr.warehouseCode ? curr.warehouseCode : 'Không'
                    } | ${curr.name} | Tính chất ${curr.accGroup} | ${
                        curr.closingDebit || 0
                    }`,
                    id: curr.id,
                });
            });
        }

        if (event?.isTrusted || !this.filteredDebit1Names?.length) {
            this.resetDebit1();
            this.onChangeDetail1.emit('');
        }
        if (event.query !== this.value.debitDetailCodeFirst?.value)
            this.resetDebit2();
    }

    async onDebit1Select1(isFocus: boolean = true) {
        this.resetDebit2();
        const debit1Code = this.value.debitDetailCodeFirst?.value;
        await this.getChartOfAccountDetails_1(
            this.value.debitCode?.value,
            debit1Code,
            this.appConstant.ACCOUNT_TYPE.DEBIT_2,
        );
        if (this.debits2?.length && isFocus) {
            this.onFocus(this.vcDebit2);
        }
        this.onChangeDetail1.emit(debit1Code);
    }

    filterDebit2Name1(event) {
        if (!event || !event.query) {
            this.filteredDebit2Names = [];
            this.debits2.forEach((curr) => {
                this.filteredDebit2Names.push({
                    value: curr.code,
                    label: `${curr.code} | ${curr.name} | Thuộc tính ${
                        curr.classification ? curr.classification : 'Không'
                    }`,
                });
            });
            return;
        }

        let miniSearch = new MiniSearch({
            fields: ['code', 'name'], // fields to index for full-text search
            storeFields: ['code', 'name', 'accGroup', 'closingDebit'], // fields to return with search results
        });
        miniSearch.addAll(this.debits2);
        let results = miniSearch.search(event.query.toLowerCase(), {
            prefix: true,
        });
        console.log(results);
        if (results.length > 0) {
            this.filteredDebit2Names = [];
            results.forEach((curr) => {
                this.filteredDebit2Names.push({
                    value: curr.code,
                    label: `${curr.code} | ${curr.name} | Thuộc tính ${
                        curr.classification ? curr.classification : 'Không'
                    }`,
                });
            });
        }
        if (event?.isTrusted || !this.filteredDebit2Names?.length) {
            this.resetDebit2();
        }
    }

    onDebit2Select1() {
        this.onChangeDetail2.emit(this.value.debitDetailCodeSecond?.value);
    }

    resetDebit() {
        this.value.debitCode = {
            value: '',
            label: '',
        };
        this.value.debitDetailCodeFirst = {
            value: '',
            label: '',
        };
        this.value.debitDetailCodeSecond = {
            value: '',
            label: '',
        };
    }

    resetDebit1() {
        this.value.debitDetailCodeFirst = {
            value: '',
            label: '',
        };
        this.value.debitDetailCodeSecond = {
            value: '',
            label: '',
        };
    }

    resetDebit2() {
        this.value.debitDetailCodeSecond = {
            value: '',
            label: '',
        };
    }

    // Focus event handlers
    onFocus(dataBinding) {
        setTimeout(() => {
            dataBinding.focusInput();
        }, 200);
    }

    dialogHeaderText = 'Danh sách tài khoản';
    dialogData = [];
    dialogTotalRecords: number = 0;
    dialogFirst: number = 0;
    isSearchAccount: boolean = false;
    formControlName: string = '';
    getParams = {
        page: 1,
        pageSize: 50,
        parentCode: '',
    };

    dialogGetParams = {
        page: 1,
        pageSize: 50,
        parentCode: '',
        searchText: '',
    };

    getPaging(event?: any) {
        if (event) {
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }
        this.getParams.parentCode = this.currentParentCode;
        this.onChangePaging.emit(this.getParams);
    }

    showAccountDialog(type) {
        if (
            (type === 'detail1' && !this.value.debitCode) ||
            (type === 'detail2' && !this.value.debitDetailCodeFirst) ||
            (type === 'detail1' && this.debits1.length === 0) ||
            (type === 'detail2' && this.debits2.length === 0)
        ) {
            // this.messageService.add({
            //         severity: 'info',
            //         detail: AppUtil.translate(this.translateService, 'info.please_check_again_account')
            //     })
            return;
        }
        this.isSearchAccount = true;
        switch (type) {
            case 'account':
                {
                    this.dialogFirst = 0;
                    this.dialogHeaderText = 'Danh sách tài khoản';
                    this.dialogData = this.chartOfAccounts;
                    this.dialogTotalRecords = this.chartOfAccounts.length;
                    this.formControlName = 'account';
                }
                break;
            case 'detail1':
                {
                    this.dialogFirst = 0;
                    this.dialogHeaderText = 'Danh sách chi tiết 1';
                    this.dialogData = this.debits1;
                    this.dialogTotalRecords = this.debits1.length;
                    this.formControlName = 'detail1';
                }
                break;
            case 'detail2':
                {
                    this.dialogFirst = 0;
                    this.dialogHeaderText = 'Danh sách chi tiết 2';
                    this.dialogData = this.debits2;
                    this.dialogTotalRecords = this.debits2.length;
                    this.formControlName = 'detail2';
                }
                break;
        }
    }

    async onSearchAccount(event) {
        let searchText = event.target.value;
        switch (this.formControlName) {
            case 'account':
                {
                    this.dialogData = !searchText
                        ? this.chartOfAccounts
                        : this.chartOfAccounts.filter(
                              (x) =>
                                  x.code
                                      .trim()
                                      .toLowerCase()
                                      .includes(
                                          searchText.trim().toLowerCase(),
                                      ) ||
                                  x.name
                                      .trim()
                                      .toLowerCase()
                                      .includes(
                                          searchText.trim().toLowerCase(),
                                      ),
                          );
                }
                break;
            case 'detail1':
                {
                    this.dialogGetParams.searchText = searchText;
                    const debitCode = this.value.debitCode?.value;
                    await this.getChartOfAccountDetails_1(
                        debitCode,
                        '',
                        this.appConstant.ACCOUNT_TYPE.DEBIT_1,
                        true,
                    );
                }
                break;
            case 'detail2':
                {
                    this.dialogGetParams.searchText = searchText;
                    const debit1Code = this.value.debitDetailCodeFirst?.value;
                    await this.getChartOfAccountDetails_1(
                        this.value.debitCode?.value,
                        debit1Code,
                        this.appConstant.ACCOUNT_TYPE.DEBIT_2,
                    );
                }
                break;
        }
    }

    onSelectAccount(event) {
        if (event && event.code) {
            console.log(event);
            switch (this.formControlName) {
                case 'account':
                    {
                        this.value.debitCode = { value: event.code };
                        this.onDebitSelect1(false);
                    }
                    break;
                case 'detail1':
                    {
                        this.value.debitDetailCodeFirst = { value: event.code };
                        this.onDebit1Select1(false);
                    }
                    break;
                case 'detail2':
                    {
                        this.value.debitDetailCodeSecond = {
                            value: event.code,
                        };
                        this.onDebit2Select1();
                    }
                    break;
            }
            this.isSearchAccount = false;
        }
    }

    async onChangePage(event) {
        console.log(event);
        if (event) {
            this.dialogGetParams.page = event.first / event.rows + 1;
            this.dialogGetParams.pageSize = event.rows;
        }
        switch (this.formControlName) {
            case 'detail1':
                {
                    const debitCode = this.value.debitCode?.value;
                    await this.getChartOfAccountDetails_1(
                        debitCode,
                        '',
                        this.appConstant.ACCOUNT_TYPE.DEBIT_1,
                        true,
                    );
                }
                break;
            case 'detail2':
                {
                    const debit1Code = this.value.debitDetailCodeFirst?.value;
                    await this.getChartOfAccountDetails_1(
                        this.value.debitCode?.value,
                        debit1Code,
                        this.appConstant.ACCOUNT_TYPE.DEBIT_2,
                    );
                }
                break;
        }
    }

    onBackHomePage(): void {
        this.router.navigate(['/uikit']);
    }

    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F9':
                event.preventDefault();
                this.onHeaderButtonClick();
                break;
            case 'F6':
                event.preventDefault();
                this.onBackHomePage();
                break;
        }
    }
}
