import {
    Component,
    ElementRef,
    HostListener,
    OnInit,
    ViewChild,
} from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import { DescriptionService } from 'src/app/service/description.service';
import { PayerService } from 'src/app/service/payer.service';
import { TaxRatesService } from 'src/app/service/tax-rates.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AccountType } from '../account-v2/account.model';
import { ConfigAriseEnum } from 'src/app/models/config-arise.model';
import { AddEditAccountComponent } from '../account-v2/dialogs/add-edit-account/add-edit-account.component';
import { AddEditAccountDetailsComponent } from '../account-v2/dialogs/add-edit-account-details/add-edit-account-details.component';
import { AccountV2Component } from '../account-v2/account-v2.component';
import { AccountDetailFirstV2Component } from '../account-v2/components/account-detail-first-v2/account-detail-first-v2.component';
import * as _ from 'lodash';
import { AccountDetailSecondV2Component } from '../account-v2/components/account-detail-second-v2/account-detail-second-v2.component';
import AppUtil from 'src/app/utilities/app-util';
import { AriseListV2Component } from '../arise-v2/arise-list-v2/arise-list-v2.component';
import { AriseCrudV3Component } from './arise-crud-v3/arise-crud-v3.component';

@Component({
    selector: 'app-arise-v2',
    templateUrl: './arise-v3.component.html',
    styleUrls: ['./arise-v3.component.scss'],
})
export class AriseV3Component implements OnInit {
    @ViewChild('ariseListV2Component')
    ariseListV2Component!: AriseListV2Component;
    @ViewChild('ariseCrudV3Component')
    ariseCrudV3Component!: AriseCrudV3Component;
    @ViewChild('accountV2Component') accountV2Component!: AccountV2Component;
    @ViewChild('accountDetailFirstV2Component')
    accountDetailFirstV2Component!: AccountDetailFirstV2Component;
    @ViewChild('accountDetailSecondV2Component')
    accountDetailSecondV2Component!: AccountDetailSecondV2Component;

    @ViewChild('yesButtonElm') yesButtonElm: ElementRef;
    @ViewChild('addEditAccount', { static: false })
    addEditAccount: AddEditAccountComponent;
    @ViewChild('addEditAccountDetail', { static: false })
    addEditAccountDetail: AddEditAccountDetailsComponent;

    chartOfAccounts: any[];
    orginalDescriptionList: any[];
    payerList: any[];
    invoiceCodeList: any[];

    display: boolean = false;
    displayCURSAccount: boolean = false;
    displayCURSAccountDetailFirst: boolean = false;
    displayCURSAccountDetailSecond: boolean = false;

    selectedDisplay = 0;
    selectedHeader;
    buttonMenus = [];

    constructor(
        private readonly descriptionService: DescriptionService,
        private readonly payerService: PayerService,
        private readonly chartOfAccountService: ChartOfAccountService,
        private readonly translateService: TranslateService,
        private readonly taxRatesService: TaxRatesService,
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService,
        private readonly router: Router,
    ) {}

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (
            this.keyOpenModelAccount ||
            !['F8', 'F9', 'F2', 'F4', 'F6', 'F10', 'F7', 'F3'].includes(
                event.key,
            )
        )
            return;
        this.ariseCrudV3Component?.focusInput(
            this.ariseCrudV3Component?.orginalVoucherNumberTmp,
        );
        event.preventDefault();
        setTimeout(() => {
            switch (event.key) {
                case 'F8':
                    if (!this.ariseCrudV3Component.allowWorkForm) return;
                    this.ariseCrudV3Component?.onF8();
                    break;
                case 'F9':
                    if (!this.ariseCrudV3Component.allowWorkForm) return;
                    this.ariseCrudV3Component?.onF9();
                    break;
                case 'F2':
                    if (!this.ariseCrudV3Component.allowWorkForm) return;
                    this.ariseCrudV3Component?.onF2();
                    break;
                case 'F4':
                    if (!this.ariseCrudV3Component.allowWorkForm) return;
                    this.ariseCrudV3Component?.onF4();
                    break;
                case 'F3':
                    if (!this.ariseCrudV3Component.allowWorkForm) return;
                    this.ariseCrudV3Component?.onF3();
                    break;
                case 'F6':
                    this.onBackHomePage();
                    break;
                case 'F10':
                    if (!this.ariseCrudV3Component.allowWorkForm) return;
                    this.ariseCrudV3Component?.onF10();
                    break;
                case 'F7':
                    if (this.ariseCrudV3Component.dataTable?.showAllDocument)
                        return;
                    this.ariseCrudV3Component.f7BtnTmp?.nativeElement?.click();
                    break;
            }
        }, 1000);
    }

    ngOnInit(): void {
        this.getChartOfAccounts(null);
        this.getTaxRates();
        this.getPayers();
        this.getDescriptions();
        this.buildButtonOtherCommand();
    }

    onBackHomePage(): void {
        if (this.ariseCrudV3Component?.fc['amount']?.value) {
            this.translateService
                .get('question.go_home_arise_content')
                .subscribe((res) => {
                    this.confirmationService.confirm({
                        key: 'confirmBackHomePageTmp',
                        message: res,
                        accept: () => {
                            this.router.navigate(['/uikit']);
                        },
                    });
                    setTimeout(() => {
                        if (this.yesButtonElm) {
                            this.yesButtonElm.nativeElement?.focus();
                        }
                    }, 100);
                });
        } else {
            this.router.navigate(['/uikit']);
        }
    }

    onReloadTableAfterCrud($eventButtonClick) {
        // this.ariseListV2Component.resetData();
        this.ariseListV2Component.getLedgers(
            this.ariseListV2Component.dataTable,
            (data) => {
                this.ariseCrudV3Component.buildFormAfterCrud({
                    ...data,
                    buttonClick: $eventButtonClick,
                });
            },
        );
    }

    onCancelEditOrder(): void {
        window.location.reload();
    }

    // khi filter table, form nhập phát sinh sẽ dc làm mới toàn bộ dữ liệu
    onFilterTable($event) {
        this.ariseCrudV3Component.buildNewForm($event);
    }

    onViewDetail($event) {
        this.ariseCrudV3Component.buildNewForm($event);
    }

    onResetTableViewDetail() {
        this.ariseListV2Component.selectAriseContextMenuView = null;
    }

    onGetDescriptions() {
        this.getDescriptions();
    }
    onGetPayers() {
        this.getPayers();
    }

    currentAccountType: AccountType = AccountType.HT;
    keyOpenModelAccount: string;
    accountParent: any;
    accountDetail1: any;

    onDisplayCURSAccount($event) {
        this.keyOpenModelAccount = $event.key;
        this.displayCURSAccount = true;
    }
    onHiddenCURSAccount($event) {
        this.keyOpenModelAccount = null;
        this.displayCURSAccount = true;
    }

    onAfterAddEditAccountItem() {
        this.displayCURSAccount = false;
        this.displayCURSAccountDetailFirst = false;
        this.displayCURSAccountDetailSecond = false;
        this.keyOpenModelAccount = null;
        this.getChartOfAccounts(() => {
            if (this.ariseCrudV3Component.isDebitCodeHas) {
                const code =
                    this.ariseCrudV3Component.fc['debitCode'].value.code;
                const account = _.find(this.chartOfAccounts, { code: code });
                if (!account) {
                    return;
                }
                this.ariseCrudV3Component.fc['debitCode'].setValue(
                    _.cloneDeep(account),
                );
            }
            if (this.ariseCrudV3Component.isCreditCodeHas) {
                const code =
                    this.ariseCrudV3Component.fc['creditCode'].value.code;
                const account = _.find(this.chartOfAccounts, { code: code });
                if (!account) {
                    return;
                }
                this.ariseCrudV3Component.fc['creditCode'].setValue(
                    _.cloneDeep(account),
                );
            }
            this.ariseCrudV3Component.setFlagCaculate();
        });
    }

    onAfterAddEditAccountDetailFirstItem() {
        this.onAfterAddEditAccountItem();
        if (this.ariseCrudV3Component.isDebitDetailCodeFirstHas) {
            const debitCode =
                this.ariseCrudV3Component.fc['debitCode'].value.code;
            const id = this.ariseCrudV3Component.fc['debitCode'].value.id;
            const debitDetailCodeFirstCode =
                this.ariseCrudV3Component.fc['debitDetailCodeFirst'].value.code;
            this.chartOfAccountService
                .getDetailV2(debitCode, {
                    page: 1,
                    pageSize: 1,
                    parentCode: debitCode,
                    searchText: debitDetailCodeFirstCode,
                    id: id,
                })
                .subscribe((res) => {
                    if (res.data.length) {
                        this.ariseCrudV3Component.fc[
                            'debitDetailCodeFirst'
                        ].setValue(res.data[0]);
                    }
                    this.ariseCrudV3Component.setFlagCaculate();
                });
        }
        if (this.ariseCrudV3Component.isCreditDetailCodeFirstHas) {
            const creditCode =
                this.ariseCrudV3Component.fc['creditCode'].value.code;
            const id = this.ariseCrudV3Component.fc['debitCode'].value.id;
            const creditDetailCodeFirstCode =
                this.ariseCrudV3Component.fc['creditDetailCodeFirst'].value
                    .code;
            this.chartOfAccountService
                .getDetailV2(creditCode, {
                    page: 1,
                    pageSize: 1,
                    parentCode: creditCode,
                    searchText: creditDetailCodeFirstCode,
                    id: id,
                })
                .subscribe((res) => {
                    if (res.data.length) {
                        this.ariseCrudV3Component.fc[
                            'creditDetailCodeFirst'
                        ].setValue(res.data[0]);
                    }
                    this.ariseCrudV3Component.setFlagCaculate();
                });
        }
    }

    onAfterAddEditAccountDetailSecondItem() {
        this.displayCURSAccount = false;
        this.displayCURSAccountDetailFirst = false;
        this.displayCURSAccountDetailSecond = false;
        this.keyOpenModelAccount = null;
        if (this.ariseCrudV3Component.isDebitDetailCodeSecondHas) {
            const debitCode =
                this.ariseCrudV3Component.fc['debitCode'].value.code;
            const id = this.ariseCrudV3Component.fc['debitCode'].value.id;
            const debitDetailCodeFirstCode =
                this.ariseCrudV3Component.fc['debitDetailCodeFirst'].value.code;
            const debitDetailCodeSecondCode =
                this.ariseCrudV3Component.fc['debitDetailCodeSecond'].value
                    .code;
            const parentCode = `${debitCode}:${debitDetailCodeFirstCode}`;
            this.chartOfAccountService
                .getDetailV2(parentCode, {
                    page: 1,
                    pageSize: 1,
                    parentCode: parentCode,
                    searchText: debitDetailCodeSecondCode,
                    id: id,
                })
                .subscribe((res) => {
                    if (res.data.length) {
                        this.ariseCrudV3Component.fc[
                            'debitDetailCodeSecond'
                        ].setValue(res.data[0]);
                    }
                    this.ariseCrudV3Component.setFlagCaculate();
                });
        }
        if (this.ariseCrudV3Component.isCreditDetailCodeSecondHas) {
            const creditCode =
                this.ariseCrudV3Component.fc['creditCode'].value.code;
            const id = this.ariseCrudV3Component.fc['creditCode'].value.id;
            const creditDetailCodeFirstCode =
                this.ariseCrudV3Component.fc['creditDetailCodeFirst'].value
                    .code;
            const creditDetailCodeSecondCode =
                this.ariseCrudV3Component.fc['creditDetailCodeSecond'].value
                    .code;
            const parentCode = `${creditCode}:${creditDetailCodeFirstCode}`;
            this.chartOfAccountService
                .getDetailV2(parentCode, {
                    page: 1,
                    pageSize: 1,
                    parentCode: parentCode,
                    searchText: creditDetailCodeSecondCode,
                    id: id,
                })
                .subscribe((res) => {
                    if (res.data.length) {
                        this.ariseCrudV3Component.fc[
                            'creditDetailCodeSecond'
                        ].setValue(res.data[0]);
                    }
                    this.ariseCrudV3Component.setFlagCaculate();
                });
        }
    }

    onSelectAccountItem($event) {
        this.displayCURSAccount = false;
        this.displayCURSAccountDetailFirst = false;
        this.displayCURSAccountDetailSecond = false;
        if (
            this.keyOpenModelAccount ==
            ConfigAriseEnum[ConfigAriseEnum.debitCode]
        ) {
            this.ariseCrudV3Component.onClearDebitCode();
            this.ariseCrudV3Component.onSelectDebitCode($event);
        } else if (
            this.keyOpenModelAccount ==
            ConfigAriseEnum[ConfigAriseEnum.debitDetailCodeFirst]
        ) {
            this.ariseCrudV3Component.onClearDebitDetailCodeFirst();
            this.ariseCrudV3Component.onSelectDebitDetailCodeFirst($event);
        } else if (
            this.keyOpenModelAccount ==
            ConfigAriseEnum[ConfigAriseEnum.debitDetailCodeSecond]
        ) {
            this.ariseCrudV3Component.onClearDebitDetailCodeSecond();
            this.ariseCrudV3Component.onSelectDebitDetailCodeSecond($event);
        }
        // credit
        else if (
            this.keyOpenModelAccount ==
            ConfigAriseEnum[ConfigAriseEnum.creditCode]
        ) {
            this.ariseCrudV3Component.onClearCreditCode();
            this.ariseCrudV3Component.onSelectCreditCode($event);
        } else if (
            this.keyOpenModelAccount ==
            ConfigAriseEnum[ConfigAriseEnum.creditDetailCodeFirst]
        ) {
            this.ariseCrudV3Component.onClearCreditDetailCodeFirst();
            this.ariseCrudV3Component.onSelectCreditDetailCodeFirst($event);
        } else if (
            this.keyOpenModelAccount ==
            ConfigAriseEnum[ConfigAriseEnum.creditDetailCodeSecond]
        ) {
            this.ariseCrudV3Component.onClearCreditDetailCodeSecond(false);
            this.ariseCrudV3Component.onSelectCreditDetailCodeSecond($event);
            setTimeout(() => {
                this.ariseCrudV3Component.focusInput(
                    this.ariseCrudV3Component.creditDetailCodeSecondTmp,
                );
            }, 100);
        }
        this.keyOpenModelAccount = null;
    }

    onDisplayCURSAccountDetailFirst($event) {
        this.keyOpenModelAccount = $event.key;
        if ($event.isAllowOpen) {
            this.displayCURSAccountDetailFirst = true;
            this.accountParent = $event.accountParent;
            setTimeout(() => {
                this.accountDetailFirstV2Component.pageData.data = null;
                setTimeout(() => {
                    this.accountDetailFirstV2Component.buildData();
                }, 100);
            }, 100);
        }
    }
    onDisplayCURSAccountDetailSecond($event) {
        this.keyOpenModelAccount = $event.key;
        if ($event.isAllowOpen) {
            this.displayCURSAccountDetailSecond = true;
            this.accountParent = $event.accountParent;
            this.accountDetail1 = $event.accountDetail1;
            setTimeout(() => {
                this.accountDetailSecondV2Component.pageData.data = null;
                setTimeout(() => {
                    this.accountDetailSecondV2Component.buildData();
                }, 100);
            }, 100);
        }
    }

    onSaveDescription($event) {
        if (!this.ariseCrudV3Component.isSaveDescription) {
            return;
        }
        const orginalDescription =
            this.ariseCrudV3Component.fc['orginalDescription'].value;
        const debitCode =
            this.ariseCrudV3Component.fc['debitCode'].value?.code || '';
        const debitDetailCodeFirst =
            this.ariseCrudV3Component.fc['debitDetailCodeFirst'].value?.code ||
            '';
        const debitDetailCodeSecond =
            this.ariseCrudV3Component.fc['debitDetailCodeSecond'].value?.code ||
            '';
        const creditCode =
            this.ariseCrudV3Component.fc['creditCode'].value?.code || '';
        const creditDetailCodeFirst =
            this.ariseCrudV3Component.fc['creditDetailCodeFirst'].value?.code ||
            '';
        const creditDetailCodeSecond =
            this.ariseCrudV3Component.fc['creditDetailCodeSecond'].value
                ?.code || '';
        this.descriptionService
            .create({
                id: 0,
                debitCode: debitCode || '',
                creditCode: creditCode || '',
                debitDetailCodeFirst: debitDetailCodeFirst || '',
                debitDetailCodeSecond: debitDetailCodeSecond || '',
                creditDetailCodeFirst: creditDetailCodeFirst || '',
                creditDetailCodeSecond: creditDetailCodeSecond || '',
                name: orginalDescription || '',
            })
            .subscribe((res) => {
                this.getDescriptions();
                this.ariseCrudV3Component.fc['orginalDescription'].setValue({
                    name: orginalDescription,
                    code: orginalDescription,
                });
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.create',
                    ),
                });
            });
    }

    onSaveTaxCode($event) {
        if (!this.ariseCrudV3Component.isSaveTaxCode) {
            return;
        }
        const invoiceTaxCode =
            this.ariseCrudV3Component.fc['invoiceTaxCode'].value?.taxCode ||
            this.ariseCrudV3Component.fc['invoiceTaxCode'].value;
        const invoiceName = this.ariseCrudV3Component.fc['invoiceName'].value;
        const invoiceAddress =
            this.ariseCrudV3Component.fc['invoiceAddress'].value;
        const invoiceProductItem =
            this.ariseCrudV3Component.fc['invoiceProductItem'].value || '';

        this.payerService
            .create({
                id: 0,
                code: '',
                name: invoiceName,
                address: invoiceAddress,
                phone: '',
                email: '',
                taxCode: invoiceTaxCode,
                bankNumber: '',
                bankName: '',
                identityNumber: '',
                product: invoiceProductItem,
                payerType: 2,
            })
            .subscribe((res) => {
                this.getTaxRates();
                this.getPayers();
                this.ariseCrudV3Component.fc['invoiceTaxCode'].setValue({
                    name: invoiceTaxCode,
                    taxCode: invoiceTaxCode,
                });
                this.messageService.add({
                    severity: 'success',
                    detail: 'Thêm Mã số thuế thành công',
                });
            });
    }

    onSavePayerName($event) {
        if (!this.ariseCrudV3Component.isSavePayerName) {
            return;
        }
        const orginalCompanyName =
            this.ariseCrudV3Component.fc['orginalCompanyName'].value?.name ||
            this.ariseCrudV3Component.fc['orginalCompanyName'].value;
        const orginalAddress =
            this.ariseCrudV3Component.fc['orginalAddress'].value;
        this.payerService
            .create({
                id: 0,
                code: '',
                name: orginalCompanyName,
                address: orginalAddress,
                phone: '',
                email: '',
                taxCode: '',
                bankNumber: '',
                bankName: '',
                identityNumber: '',
                product: '',
                payerType: 1,
            })
            .subscribe((res) => {
                this.getPayers();
                this.ariseCrudV3Component.fc['orginalCompanyName'].setValue({
                    name: orginalCompanyName,
                    code: orginalCompanyName,
                });
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.create',
                    ),
                });
            });
    }

    onCancelConvertInternal() {
        this.display = false;
        this.ariseListV2Component.ngOnInit();
    }

    private getChartOfAccounts(callBack) {
        this.chartOfAccountService
            .getAllByDisplayInsert()
            .subscribe((res: any) => {
                this.chartOfAccounts = res;
                if (callBack) {
                    callBack();
                }
            });
    }

    onCancelCostEntry() {
        this.display = false;
        this.ariseListV2Component.dataTable.documentType = 'XK';
        this.ariseListV2Component.dataTable.document = _.cloneDeep(
            _.find(this.ariseListV2Component.documentList, {
                code: this.ariseListV2Component.dataTable.documentType,
            }),
        );
        this.ariseListV2Component.onFilter();
    }

    onCancelCCDC() {
        this.display = false;
        this.ariseListV2Component.dataTable.documentType = 'PB';
        this.ariseListV2Component.dataTable.document = _.cloneDeep(
            _.find(this.ariseListV2Component.documentList, {
                code: this.ariseListV2Component.dataTable.documentType,
            }),
        );
        this.ariseListV2Component.onFilter();
    }

    onCancelTSCD() {
        this.display = false;
        this.ariseListV2Component.dataTable.documentType = 'KH';
        this.ariseListV2Component.dataTable.document = _.cloneDeep(
            _.find(this.ariseListV2Component.documentList, {
                code: this.ariseListV2Component.dataTable.documentType,
            }),
        );
        this.ariseListV2Component.onFilter();
    }

    private getDescriptions() {
        this.descriptionService.getListV2().subscribe((res) => {
            this.orginalDescriptionList = res.data;
        });
    }

    private getPayers() {
        this.payerService.getList().subscribe((res) => {
            this.payerList = res.data;
        });
    }

    private getTaxRates() {
        this.taxRatesService.getAllTaxRatesV2().subscribe((res: any) => {
            this.invoiceCodeList = res.data;
        });
    }

    private buildButtonOtherCommand() {
        this.buttonMenus = [
            {
                id: 1,
                label: '1. Xóa người nộp / Đơn vị',
                icon: 'pi pi-user-minus',
                command: () => {
                    this.display = true;
                    this.selectedDisplay = 1;
                    this.selectedHeader = 'label.payer_management';
                },
            },
            {
                id: 2,
                label: '2. Xóa diễn giải',
                icon: 'pi pi-trash',
                command: () => {
                    this.display = true;
                    this.selectedDisplay = 2;
                    this.selectedHeader = 'label.desc_management';
                },
            },
            {
                id: 3,
                label: '3. Sửa số thứ tự',
                icon: 'pi pi-sort-numeric-up',
                command: () => {
                    console.log('Sửa số thứ tự');
                    this.display = true;
                    this.selectedDisplay = 3;
                    this.selectedHeader = 'label.edit_order';
                },
            },
            {
                id: 4,
                label: '4. Công cụ dụng cụ',
                icon: 'pi pi-cog',
                command: () => {
                    console.log('Công cụ dụng cụ');
                    this.display = true;
                    this.selectedDisplay = 4;
                    this.selectedHeader = 'label.tools_used';
                },
            },
            {
                id: 5,
                label: '5. Tài sản cố định',
                icon: 'pi pi-dollar',
                command: () => {
                    console.log('Tài sản cố định');
                    this.display = true;
                    this.selectedDisplay = 5;
                    this.selectedHeader = 'label.fixed_assets';
                },
            },
            {
                id: 6,
                label: '6. Bút toán xuất giá vốn',
                icon: 'pi pi-sign-out',
                command: () => {
                    this.display = true;
                    this.selectedDisplay = 6;
                    this.selectedHeader = 'label.cost_entry';
                },
            },
            {
                id: 7,
                label: '7. Kết chuyển cuối kỳ',
                icon: 'pi pi-wallet',
                command: () => {
                    this.display = true;
                    this.selectedDisplay = 7;
                    this.selectedHeader = 'label.end_of_term';
                },
            },
            {
                id: 9,
                label: '9. Chuyển đổi thêm mới',
                icon: 'pi pi-sort',
                command: () => {
                    this.display = true;
                    this.selectedDisplay = 9;
                    this.selectedHeader = 'label.convert_internal';
                },
            },
            {
                id: 13,
                label: '13. K/C BHXH, BHYT,...',
                icon: 'pi pi-book',
                command: () => {
                    this.display = true;
                    this.selectedDisplay = 13;
                    this.selectedHeader = 'label.salary_tranfer';
                },
            },
        ];
    }
}
