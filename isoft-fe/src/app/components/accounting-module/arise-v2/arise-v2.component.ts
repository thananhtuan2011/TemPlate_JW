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
import { AriseCrudV2Component } from './arise-crud-v2/arise-crud-v2.component';
import { AriseListV2Component } from './arise-list-v2/arise-list-v2.component';
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
import { ProjectCodeService } from 'src/app/service/project.service';

@Component({
    selector: 'app-arise-v2',
    templateUrl: './arise-v2.component.html',
    styleUrls: ['./arise-v2.component.scss'],
})
export class AriseV2Component implements OnInit {
    @ViewChild('ariseListV2Component')
    ariseListV2Component!: AriseListV2Component;
    @ViewChild('ariseCrudV2Component')
    ariseCrudV2Component!: AriseCrudV2Component;
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
    projectList: any[];
    orginalDescriptionList: any[];
    payerList: any[];
    invoiceCodeList: any[];

    display: boolean = false;
    displayCURSAccount: boolean = false;
    displayCURSAccountDetailFirst: boolean = false;
    displayCURSAccountDetailSecond: boolean = false;
    displayCrudProject: boolean = false;

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
        private readonly projectCodeService: ProjectCodeService,
        private readonly router: Router,
    ) {}

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (
            this.keyOpenModelAccount ||
            !['F8', 'F9', 'F2', 'F4', 'F6', 'F10', 'F7'].includes(event.key)
        )
            return;
        this.ariseCrudV2Component?.focusInput(
            this.ariseCrudV2Component?.orginalVoucherNumberTmp,
        );
        event.preventDefault();
        setTimeout(() => {
            switch (event.key) {
                case 'F8':
                    if (!this.ariseCrudV2Component.allowWorkForm) return;
                    this.ariseCrudV2Component?.onF8();
                    break;
                case 'F9':
                    if (!this.ariseCrudV2Component.allowWorkForm) return;
                    this.ariseCrudV2Component?.onF9();
                    break;
                case 'F2':
                    if (!this.ariseCrudV2Component.allowWorkForm) return;
                    this.ariseCrudV2Component?.onF2();
                    break;
                case 'F4':
                    if (!this.ariseCrudV2Component.allowWorkForm) return;
                    this.ariseCrudV2Component?.onF4();
                    break;
                case 'F6':
                    this.onBackHomePage();
                    break;
                case 'F10':
                    if (!this.ariseCrudV2Component.allowWorkForm) return;
                    this.ariseCrudV2Component?.onF10();
                    break;
                case 'F7':
                    if (this.ariseCrudV2Component.dataTable?.showAllDocument)
                        return;
                    this.ariseCrudV2Component.f7BtnTmp?.nativeElement?.click();
                    break;
            }
        }, 1000);
    }

    ngOnInit(): void {
        this.getChartOfAccounts(null);
        this.getTaxRates();
        this.getPayers(null);
        this.getListProject(null);
        this.getDescriptions();
    }

    onBackHomePage(): void {
        if (this.ariseCrudV2Component?.fc['amount']?.value) {
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
                this.ariseCrudV2Component.buildFormAfterCrud({
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
        this.ariseCrudV2Component.buildNewForm($event);
        this.buildButtonOtherCommand($event.dataTable);
    }

    onViewDetail($event) {
        this.ariseCrudV2Component.buildNewForm($event);
    }

    onResetTableViewDetail() {
        this.ariseListV2Component.selectAriseContextMenuView = null;
    }

    onGetDescriptions() {
        this.getDescriptions();
    }
    onGetPayers() {
        this.getPayers(null);
    }

    currentAccountType: AccountType = AccountType.HT;
    keyOpenModelAccount: string;
    accountParent: any;
    accountDetail1: any;

    onDisplayCrudProject($event) {
        this.displayCrudProject = $event;
        this.getListProject(null);
    }

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
            if (this.ariseCrudV2Component.isDebitCodeHas) {
                const code =
                    this.ariseCrudV2Component.fc['debitCode'].value.code;
                const account = _.find(this.chartOfAccounts, { code: code });
                if (!account) {
                    return;
                }
                this.ariseCrudV2Component.fc['debitCode'].setValue(
                    _.cloneDeep(account),
                );
            }
            if (this.ariseCrudV2Component.isCreditCodeHas) {
                const code =
                    this.ariseCrudV2Component.fc['creditCode'].value.code;
                const account = _.find(this.chartOfAccounts, { code: code });
                if (!account) {
                    return;
                }
                this.ariseCrudV2Component.fc['creditCode'].setValue(
                    _.cloneDeep(account),
                );
            }
            this.ariseCrudV2Component.setFlagCaculate();
        });
    }

    onAfterAddEditAccountDetailFirstItem() {
        this.onAfterAddEditAccountItem();
        if (this.ariseCrudV2Component.isDebitDetailCodeFirstHas) {
            const debitCode =
                this.ariseCrudV2Component.fc['debitCode'].value.code;
            const id = this.ariseCrudV2Component.fc['debitCode'].value.id;
            const debitDetailCodeFirstCode =
                this.ariseCrudV2Component.fc['debitDetailCodeFirst'].value.code;
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
                        this.ariseCrudV2Component.fc[
                            'debitDetailCodeFirst'
                        ].setValue(res.data[0]);
                    }
                    this.ariseCrudV2Component.setFlagCaculate();
                });
        }
        if (this.ariseCrudV2Component.isCreditDetailCodeFirstHas) {
            const creditCode =
                this.ariseCrudV2Component.fc['creditCode'].value.code;
            const id = this.ariseCrudV2Component.fc['creditCode'].value.id;
            const creditDetailCodeFirstCode =
                this.ariseCrudV2Component.fc['creditDetailCodeFirst'].value
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
                        this.ariseCrudV2Component.fc[
                            'creditDetailCodeFirst'
                        ].setValue(res.data[0]);
                    }
                    this.ariseCrudV2Component.setFlagCaculate();
                });
        }
    }

    onAfterAddEditAccountDetailSecondItem() {
        this.displayCURSAccount = false;
        this.displayCURSAccountDetailFirst = false;
        this.displayCURSAccountDetailSecond = false;
        this.keyOpenModelAccount = null;
        if (this.ariseCrudV2Component.isDebitDetailCodeSecondHas) {
            const debitCode =
                this.ariseCrudV2Component.fc['debitCode'].value.code;
            const id = this.ariseCrudV2Component.fc['debitCode'].value.id;
            const debitDetailCodeFirstCode =
                this.ariseCrudV2Component.fc['debitDetailCodeFirst'].value.code;
            const debitDetailCodeSecondCode =
                this.ariseCrudV2Component.fc['debitDetailCodeSecond'].value
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
                        this.ariseCrudV2Component.fc[
                            'debitDetailCodeSecond'
                        ].setValue(res.data[0]);
                    }
                    this.ariseCrudV2Component.setFlagCaculate();
                });
        }
        if (this.ariseCrudV2Component.isCreditDetailCodeSecondHas) {
            const creditCode =
                this.ariseCrudV2Component.fc['creditCode'].value.code;
            const id = this.ariseCrudV2Component.fc['creditCode'].value.id;
            const creditDetailCodeFirstCode =
                this.ariseCrudV2Component.fc['creditDetailCodeFirst'].value
                    .code;
            const creditDetailCodeSecondCode =
                this.ariseCrudV2Component.fc['creditDetailCodeSecond'].value
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
                        this.ariseCrudV2Component.fc[
                            'creditDetailCodeSecond'
                        ].setValue(res.data[0]);
                    }
                    this.ariseCrudV2Component.setFlagCaculate();
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
            this.ariseCrudV2Component.onClearDebitCode();
            this.ariseCrudV2Component.onSelectDebitCode($event);
        } else if (
            this.keyOpenModelAccount ==
            ConfigAriseEnum[ConfigAriseEnum.debitDetailCodeFirst]
        ) {
            this.ariseCrudV2Component.onClearDebitDetailCodeFirst();
            this.ariseCrudV2Component.onSelectDebitDetailCodeFirst($event);
        } else if (
            this.keyOpenModelAccount ==
            ConfigAriseEnum[ConfigAriseEnum.debitDetailCodeSecond]
        ) {
            this.ariseCrudV2Component.onClearDebitDetailCodeSecond();
            this.ariseCrudV2Component.onSelectDebitDetailCodeSecond($event);
        }
        // credit
        else if (
            this.keyOpenModelAccount ==
            ConfigAriseEnum[ConfigAriseEnum.creditCode]
        ) {
            this.ariseCrudV2Component.onClearCreditCode();
            this.ariseCrudV2Component.onSelectCreditCode($event);
        } else if (
            this.keyOpenModelAccount ==
            ConfigAriseEnum[ConfigAriseEnum.creditDetailCodeFirst]
        ) {
            this.ariseCrudV2Component.onClearCreditDetailCodeFirst();
            this.ariseCrudV2Component.onSelectCreditDetailCodeFirst($event);
        } else if (
            this.keyOpenModelAccount ==
            ConfigAriseEnum[ConfigAriseEnum.creditDetailCodeSecond]
        ) {
            this.ariseCrudV2Component.onClearCreditDetailCodeSecond(false);
            this.ariseCrudV2Component.onSelectCreditDetailCodeSecond($event);
            setTimeout(() => {
                this.ariseCrudV2Component.focusInput(
                    this.ariseCrudV2Component.creditDetailCodeSecondTmp,
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
        if (!this.ariseCrudV2Component.isSaveDescription) {
            return;
        }
        const orginalDescription =
            this.ariseCrudV2Component.fc['orginalDescription'].value;
        const debitCode =
            this.ariseCrudV2Component.fc['debitCode'].value?.code || '';
        const debitDetailCodeFirst =
            this.ariseCrudV2Component.fc['debitDetailCodeFirst'].value?.code ||
            '';
        const debitDetailCodeSecond =
            this.ariseCrudV2Component.fc['debitDetailCodeSecond'].value?.code ||
            '';
        const creditCode =
            this.ariseCrudV2Component.fc['creditCode'].value?.code || '';
        const creditDetailCodeFirst =
            this.ariseCrudV2Component.fc['creditDetailCodeFirst'].value?.code ||
            '';
        const creditDetailCodeSecond =
            this.ariseCrudV2Component.fc['creditDetailCodeSecond'].value
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
                this.ariseCrudV2Component.fc['orginalDescription'].setValue({
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
        if (!this.ariseCrudV2Component.isSaveTaxCode) {
            return;
        }
        const invoiceTaxCode =
            this.ariseCrudV2Component.fc['invoiceTaxCode'].value?.taxCode ||
            this.ariseCrudV2Component.fc['invoiceTaxCode'].value;
        const invoiceName = this.ariseCrudV2Component.fc['invoiceName'].value;
        const invoiceAddress =
            this.ariseCrudV2Component.fc['invoiceAddress'].value;
        const invoiceProductItem =
            this.ariseCrudV2Component.fc['invoiceProductItem'].value || '';

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
                this.getPayers(null);
                this.ariseCrudV2Component.fc['invoiceTaxCode'].setValue({
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
        if (!this.ariseCrudV2Component.isSavePayerName) {
            return;
        }
        const orginalCompanyName =
            this.ariseCrudV2Component.fc['orginalCompanyName'].value?.name ||
            this.ariseCrudV2Component.fc['orginalCompanyName'].value;
        const orginalAddress =
            this.ariseCrudV2Component.fc['orginalAddress'].value;
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
                this.getPayers(null);
                this.ariseCrudV2Component.fc['orginalCompanyName'].setValue({
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

    getListProject($event) {
        this.projectList = null;
        return this.projectCodeService.getList().subscribe((res: any) => {
            this.projectList = _.orderBy(res?.data, ['code'], ['asc']);
        });
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

    getPayers(event) {
        let keyword = event?.query?.toLowerCase();
        this.payerService.getPayerCustomers(keyword).subscribe((res) => {
            this.payerList = res.data;
        });
    }

    private getTaxRates() {
        this.taxRatesService.getAllTaxRatesV2().subscribe((res: any) => {
            this.invoiceCodeList = res.data;
        });
    }

    private buildButtonOtherCommand(dataTable) {
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

        if (dataTable?.document.code == 'NK') {
            this.buttonMenus.push({
                id: 10,
                label: '10. In phiếu nhập',
                icon: 'pi pi-pencil',
                command: () => {
                    this.ariseListV2Component.onPrintF7(
                        dataTable?.document.code,
                    );
                },
            });
        } else if (
            dataTable?.document.code == 'XK' ||
            dataTable?.document.code == 'CK'
        ) {
            this.buttonMenus.push({
                id: 11,
                label: '11. In phiếu xuất',
                icon: 'pi pi-pencil',
                command: () => {
                    this.ariseListV2Component.onPrintF7(
                        dataTable?.document.code,
                    );
                },
            });
            this.buttonMenus.push({
                id: 12,
                label: '12. In phiếu xuất không đơn giá',
                icon: 'pi pi-pencil',
                command: () => {
                    this.ariseListV2Component.onPrintF7(
                        dataTable?.document.code,
                    );
                },
            });
        }
        this.buttonMenus = _.orderBy(this.buttonMenus, ['id'], ['asc']);
    }
}
