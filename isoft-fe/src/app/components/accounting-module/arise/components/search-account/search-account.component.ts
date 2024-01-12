import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { AutoComplete } from 'primeng/autocomplete';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
@Component({
    selector: 'app-search-account',
    templateUrl: './search-account.component.html',
    styles: [
        `
            :host ::ng-deep {
                .p-button,
                .p-button .p-button-icon-left,
                .p-datatable-scrollable-both .p-datatable-tbody > tr > td {
                    font-size: 0.875rem !important;
                }

                .p-inputtext,
                .p-inputgroup > .p-inputwrapper > .p-component > .p-inputtext {
                    width: 100px;
                }
            }
        `,
    ],
})
export class SearchAccountComponent implements OnInit {
    @ViewChild('debit') public vcDebit: AutoComplete;
    @ViewChild('debit1') vcDebit1: AutoComplete;
    @ViewChild('debit2') vcDebit2: AutoComplete;
    @ViewChild('credit') vcCredit: AutoComplete;
    @ViewChild('credit1') vcCredit1: AutoComplete;
    @ViewChild('credit2') vcCredit2: AutoComplete;

    appUtil = AppUtil;
    appConstant = AppConstant;

    @Input('value') value: any = {};
    @Input('chartOfAccounts') chartOfAccounts: any[] = [];
    @Output() onCancel = new EventEmitter();
    @Output() onSetDebit = new EventEmitter();
    @Output() onSetDebit1 = new EventEmitter();
    @Output() onSetDebit2 = new EventEmitter();
    @Output() onSetCredit = new EventEmitter();
    @Output() onSetCredit1 = new EventEmitter();
    @Output() onSetCredit2 = new EventEmitter();

    filteredDebitNames: any[] = [];
    filteredCreditNames: any[] = [];
    debits1: any[] = [];
    filteredDebit1Names: any[] = [];
    debits2: any[] = [];
    filteredDebit2Names: any[] = [];
    credits1: any[] = [];
    filteredCredit1Names: any[] = [];
    credits2: any[] = [];
    filteredCredit2Names: any[] = [];

    constructor(private chartOfAccountService: ChartOfAccountService) {}

    ngOnInit(): void {}

    onSave() {
        console.log('on save');
        this.onCancel.emit({});
    }

    /**
     * Danh sách chi tiêt tài khoản
     * @param accountCode
     * Mã Tài khoản nợ/có
     * @param accountCodeDetail1
     * Mã chi tiêt 1
     * @param type
     * Loại tài khoản có/nợ/chi tiết 1/chi tiê 2
     */
    async getChartOfAccountDetails_1(accountCode, accountCodeDetail1, type) {
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
        const responseDetail =
            await this.chartOfAccountService.getDetail1(parentRef);
        switch (type) {
            case this.appConstant.ACCOUNT_TYPE.DEBIT_1:
                this.debits1 = responseDetail.data || [];
                break;
            case this.appConstant.ACCOUNT_TYPE.DEBIT_2:
                this.debits2 = responseDetail.data || [];
                break;
            case this.appConstant.ACCOUNT_TYPE.CREDIT_1:
                this.credits1 = responseDetail.data || [];
                break;
            case this.appConstant.ACCOUNT_TYPE.CREDIT_2:
                this.credits2 = responseDetail.data || [];
                break;
        }
    }

    filterDebitName1(event) {
        this.filteredDebitNames =
            this.chartOfAccounts?.reduce((arr, curr) => {
                if (
                    curr.code
                        ?.toLowerCase()
                        ?.includes(event.query?.toLowerCase()) ||
                    event?.isTrusted
                )
                    arr.push({
                        value: curr.code,
                        label: `${curr.code} | ${curr.name} | Tính chất ${
                            curr.accGroup
                        } | ${curr.closingDebit || 0}`,
                    });
                return arr;
            }, []) || [];

        const debitCode = this.value.debitCode;
        if (event?.isTrusted || !this.filteredDebitNames?.length) {
            this.resetDebit();
        }
        if (event.query !== debitCode?.value) this.resetDebit1();
    }

    async onDebitSelect1(event?: any) {
        this.resetDebit1();
        const debitCode = this.value.debitCode?.value;
        this.onSetDebit.emit(
            this.chartOfAccounts?.find((acc) => acc.code === debitCode) || {},
        );
        await this.getChartOfAccountDetails_1(
            debitCode,
            '',
            this.appConstant.ACCOUNT_TYPE.DEBIT_1,
        );
        if (this.debits1?.length) {
            this.onFocus(this.vcDebit1);
        } else {
            this.onFocus(this.vcCredit);
        }
    }

    filterDebit1Name1(event) {
        this.filteredDebit1Names =
            this.debits1?.reduce((arr, curr) => {
                if (
                    curr.code
                        ?.toLowerCase()
                        ?.includes(event.query?.toLowerCase()) ||
                    event?.isTrusted
                )
                    arr.push({
                        value: curr.code,
                        label: `${curr.code} | ${curr.warehouseCode} | ${
                            curr.name
                        } | Tính chất ${curr.accGroup} | ${
                            curr.closingDebit || 0
                        }`,
                        id: curr.id,
                    });
                return arr;
            }, []) || [];
        const debit1Code = this.value.debitDetailCodeFirst;
        if (event?.isTrusted || !this.filteredDebit1Names?.length)
            this.resetDebit1();
        if (event.query !== debit1Code?.value) this.resetDebit2();
    }

    async onDebit1Select1(event?: any) {
        this.resetDebit2();
        const debit1Code = this.value.debitDetailCodeFirst?.value;
        this.onSetDebit1.emit(
            this.debits1?.find((acc) => acc.id === event?.id) || {},
        );
        await this.getChartOfAccountDetails_1(
            this.value.debitCode?.value,
            debit1Code,
            this.appConstant.ACCOUNT_TYPE.DEBIT_2,
        );
        if (this.debits2?.length) {
            this.onFocus(this.vcDebit2);
        } else {
            this.onFocus(this.vcCredit);
        }
    }

    filterDebit2Name1(event) {
        this.filteredDebit2Names =
            this.debits2?.reduce((arr, curr) => {
                if (
                    curr.code
                        ?.toLowerCase()
                        ?.includes(event.query?.toLowerCase()) ||
                    event?.isTrusted
                )
                    arr.push({
                        value: curr.code,
                        label: `${curr.code} | ${curr.name} | Thuộc tính ${curr.classification}`,
                    });
                return arr;
            }, []) || [];
        if (event?.isTrusted || !this.filteredDebit2Names?.length) {
            this.resetDebit2();
        }
    }

    filterCreditName1(event) {
        this.filteredCreditNames =
            this.chartOfAccounts?.reduce((arr, curr) => {
                if (
                    curr.code
                        ?.toLowerCase()
                        ?.includes(event.query?.toLowerCase()) ||
                    event?.isTrusted
                )
                    arr.push({
                        value: curr.code,
                        label: `${curr.code} | ${curr.name} | Tính chất ${
                            curr.accGroup
                        } | ${curr.closingDebit || 0}`,
                    });
                return arr;
            }, []) || [];
        const creditCode = this.value.creditCode;
        if (event?.isTrusted || !this.filteredCreditNames?.length) {
            this.resetCredit();
        }
        if (event.query !== creditCode?.value) this.resetCredit1();
    }

    async onCreditSelect1(event?: any) {
        this.resetCredit1();
        const creditCode = this.value.creditCode?.value;
        this.onSetCredit.emit(
            this.chartOfAccounts?.find((acc) => acc.code === creditCode) || {},
        );
        await this.getChartOfAccountDetails_1(
            creditCode,
            '',
            this.appConstant.ACCOUNT_TYPE.CREDIT_1,
        );
        if (this.credits1?.length) {
            this.onFocus(this.vcCredit1);
        }
    }

    filterCredit1Name1(event) {
        this.filteredCredit1Names =
            this.credits1?.reduce((arr, curr) => {
                if (
                    curr.code
                        ?.toLowerCase()
                        ?.includes(event.query?.toLowerCase()) ||
                    event?.isTrusted
                )
                    arr.push({
                        value: curr.code,
                        label: `${curr.code} | ${curr.warehouseCode} | ${
                            curr.name
                        } | Tính chất ${curr.accGroup} | ${
                            curr.closingDebit || 0
                        }`,
                        id: curr.id,
                    });
                return arr;
            }, []) || [];
        const credit1Code = this.value.creditDetailCodeFirst;
        if (event?.isTrusted || !this.filteredCredit1Names?.length)
            this.resetCredit1();
        if (event.query !== credit1Code?.value) this.resetCredit2();
    }

    async onCredit1Select1(event?: any) {
        this.resetCredit2();
        const credit1Code = this.value.creditDetailCodeFirst?.value;
        this.onSetCredit1.emit(
            this.credits1?.find((acc) => acc.id === event?.id) || {},
        );
        await this.getChartOfAccountDetails_1(
            this.value.creditCode?.value,
            credit1Code,
            this.appConstant.ACCOUNT_TYPE.CREDIT_2,
        );
        if (this.credits2?.length) {
            this.onFocus(this.vcCredit2);
        }
    }

    async onDebit2Select1(event?: any) {
        const debit2Code = this.value.debitDetailCodeSecond?.value;
        this.onSetDebit2.emit(
            this.debits2?.find((acc) => acc.code === debit2Code) || {},
        );
        this.onFocus(this.vcCredit);
    }

    async onCredit2Select1(event?: any) {
        const credit2Code = this.value.creditDetailCodeSecond?.value;
        this.onSetCredit2.emit(
            this.credits2?.find((acc) => acc.code === credit2Code) || {},
        );
    }

    filterCredit2Name1(event) {
        this.filteredCredit2Names =
            this.credits2?.reduce((arr, curr) => {
                if (
                    curr.code
                        ?.toLowerCase()
                        ?.includes(event.query.toLowerCase()) ||
                    event?.isTrusted
                )
                    arr.push({
                        value: curr.code,
                        label: `${curr.code} | ${curr.name} | Thuộc tính ${curr.classification}`,
                    });
                return arr;
            }, []) || [];
        if (event?.isTrusted || !this.filteredCredit2Names?.length) {
            this.resetCredit2();
        }
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

    resetCredit() {
        this.value.creditCode = {
            value: '',
            label: '',
        };
        this.value.creditDetailCodeFirst = {
            value: '',
            label: '',
        };
        this.value.creditDetailCodeSecond = {
            value: '',
            label: '',
        };
    }

    resetCredit1() {
        this.value.creditDetailCodeFirst = {
            value: '',
            label: '',
        };
        this.value.creditDetailCodeSecond = {
            value: '',
            label: '',
        };
    }

    resetCredit2() {
        this.value.creditDetailCodeSecond = {
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
}
