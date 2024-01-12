import {
    AfterViewInit,
    Component,
    EventEmitter,
    HostListener,
    Injector,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { debounce } from 'lodash';
import { ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table/table';
import { map, Observable, Subscription } from 'rxjs';
import { AppComponentBase } from 'src/app/app-component-base';
import { AccountGroupDetailForChildParams } from 'src/app/models/account-group.model';
import { NameValueOfInt } from 'src/app/models/common.model';
import { AccountGroupService } from 'src/app/service/account-group.service';
import {
    IsTableColumnType,
    IsTableColumn,
    IIsTableColumn,
} from 'src/app/shared/is-table/is-table.model';
import AppUtil from 'src/app/utilities/app-util';
import {
    AccountTypeList,
    AccountType,
    AddAccountDetailType,
} from '../../account.model';
import { AddEditAccountDetailsComponent } from '../../dialogs/add-edit-account-details/add-edit-account-details.component';
import AppConstants from '../../../../../utilities/app-constants';

@Component({
    selector: 'app-account-detail-first-v2',
    templateUrl: './account-detail-first-v2.component.html',
    styleUrls: ['./account-detail-first-v2.component.scss'],
})
export class AccountDetailFirstV2Component
    extends AppComponentBase
    implements OnInit, AfterViewInit
{
    appConstant = AppConstants;

    @Input('displayDeleteButton') displayDeleteButton: boolean = true;
    @Input('displayAddItemButton') displayAddItemButton: boolean = true;
    @Input('displayCongCuButton') displayCongCuButton: boolean = true;
    @Input('displayGoHomeButton') displayGoHomeButton: boolean = true;
    @Input('displayHoachToanNoiBoButton') displayHoachToanNoiBoButton: boolean =
        true;
    @Input('displayHasChildButton') displayHasChildButton: boolean = true;
    @Input('displayTitleText') displayTitleText: boolean = true;
    @Input('displaySelectButton') displaySelectButton: boolean = false;
    @Input('scrolHeight') scrolHeight = '82vh';
    @Input('isDip') isDip: boolean = false;
    @Input('account') account: any;
    @Output('onSelectItem') onSelectItem = new EventEmitter<any>();

    @ViewChild('dtTmp') dtTmp: Table;
    cols: any[];
    accounts = [];
    $accounts: Subscription;
    columnType = IsTableColumnType;
    currentAccountType: NameValueOfInt = AccountTypeList[0];
    accountTypeList = AccountTypeList;
    selectedHeaderDropdown: any;
    queryParamsForChild: AccountGroupDetailForChildParams = {
        page: 1,
        pageSize: 50,
        sortField: 'id',
        isSort: true,
        warehouseCode: undefined,
        isInternal: 1,
    };
    pageData = {
        data: [],
        totalItem: 0,
    };

    @ViewChild('addEditAccountDetailsTmp')
    addEditAccountDetailsComponent: AddEditAccountDetailsComponent;
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
        private readonly confirmationService: ConfirmationService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly _injector: Injector,
        private readonly router: Router,
    ) {
        super(_injector);
    }

    ngAfterViewInit(): void {
        if (this.isDip) {
            return;
        }
        setTimeout(() => {
            const isOpenModal = window.history.state.isOpenModal;
            if (isOpenModal) {
                this.onAddAccount();
            }
        }, 500);
    }

    ngOnInit() {
        if (this.isDip) {
            return;
        }
        this.account = window.history.state.account;
        if (!this.account) {
            this.onBackHomePage();
            return;
        }
        const stateAccountDetail1 = window.history.state.accountDetail1;
        if (stateAccountDetail1) {
            this.queryParamsForChild.searchText = stateAccountDetail1.code;
        }
        this.buildData();
    }

    buildData() {
        this.loadAccountsLazy({
            first: 0,
            rows: this.queryParamsForChild.pageSize,
        });
        this.cols = this.buildCols();
    }

    onSearchTable = debounce(() => {
        this.loadAccountsLazy({
            first: 0,
            rows: this.queryParamsForChild.pageSize,
        });
    }, 1000);

    onChangeAccountType($event) {
        this.cols = this.buildCols();
        this.buildData();
    }

    onAddAccount() {
        if (!this.account.displayInsert) {
            return;
        }
        this.addEditAccountDetailsComponent.show(
            AddAccountDetailType.CT1,
            this.account,
        );
    }

    onEditAccount(data) {
        this.addEditAccountDetailsComponent.show(
            AddAccountDetailType.CT1,
            this.account,
            data,
        );
    }

    onAddEditAccountSuccessfull($event) {
        this.loadAccountsLazy({
            first: 0,
            rows: this.queryParamsForChild.pageSize,
        });
    }

    onRemoveAccount(data) {
        if (!data || !data.displayDelete) return;
        this.confirmationService.confirm({
            message: AppUtil.translate(
                this.translateService,
                'question.delete_confirm',
            ),
            acceptLabel: AppUtil.translate(this.translateService, 'label.yes'),
            rejectLabel: AppUtil.translate(this.translateService, 'label.no'),
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.accountGroupService
                    .deleteAccount(data.id)
                    .subscribe((_) => {
                        this.loadAccountsLazy({
                            first: 0,
                            rows: this.queryParamsForChild.pageSize,
                        });
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
        this.router.navigate(['/uikit/account-v2'], {
            state: { account: this.account },
        });
    }

    loadAccountsLazy(event: LazyLoadEvent) {
        if (this.dtTmp) {
            this.dtTmp.resetScrollTop();
        }
        let queryParam = _.cloneDeep(this.queryParamsForChild);
        queryParam.pageSize = event.rows;
        queryParam.page = event.first / event.rows + 1;
        queryParam.isInternal = this.currentAccountType.value;
        delete queryParam.warehouseCode;
        this.pageData.data = [];
        this.accountGroupService
            .getListDetailForChildNode(this.account.code, queryParam)
            .subscribe((response) => {
                this.pageData.totalItem = response.totalItems;
                this.pageData.data = response.data;
            });
    }

    onGoToAccountDetai2(accountDetail1, isOpenModal: boolean) {
        this.router.navigate(['/uikit/account-detail-second-v2'], {
            state: {
                account: this.account,
                accountDetail1: accountDetail1,
                isOpenModal: isOpenModal,
            },
        });
    }

    private buildCols() {
        switch (this.currentAccountType.value) {
            case AccountType.NB:
                return [
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.warehouse_code',
                        field: 'warehouseCode',
                        styleClass: 'w--10',
                    }),
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
                        header: 'label.stock_unit',
                        field: 'stockUnit',
                        styleClass: 'w--10',
                    }),
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.SL',
                        field: 'openingStockQuantityNb',
                        type: IsTableColumnType.DoubleInString,
                        styleClass: 'w--10 text-right',
                    }),
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.stock_price_nb',
                        field: 'stockUnitPriceNb',
                        type: IsTableColumnType.DoubleInString,
                        styleClass: 'w--10 text-right',
                    }),
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.residual_debt_nb',
                        field: 'openingDebitNb',
                        type: IsTableColumnType.DoubleInString,
                        styleClass: 'w--10 text-right',
                    }),
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.residual_opening_nb',
                        field: 'openingCreditNb',
                        type: IsTableColumnType.DoubleInString,
                        styleClass: 'w--10 text-right',
                    }),
                ];
            default:
                return [
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.warehouse_code',
                        field: 'warehouseCode',
                        styleClass: 'w--10',
                    }),
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
                        header: 'label.stock_unit',
                        field: 'stockUnit',
                        styleClass: 'w--10',
                    }),
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.SL',
                        field: 'openingStockQuantity',
                        type: IsTableColumnType.DoubleInString,
                        styleClass: 'w--10 text-right',
                    }),
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.stock_price',
                        field: 'stockUnitPrice',
                        type: IsTableColumnType.DoubleInString,
                        styleClass: 'w--10 text-right',
                    }),
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.residual_debt',
                        field: 'openingDebit',
                        type: IsTableColumnType.DoubleInString,
                        styleClass: 'w--10 text-right',
                    }),
                    new IsTableColumn(<IIsTableColumn>{
                        header: 'label.residual_opening',
                        field: 'openingCredit',
                        type: IsTableColumnType.DoubleInString,
                        styleClass: 'w--10 text-right',
                    }),
                ];
        }
    }
}
