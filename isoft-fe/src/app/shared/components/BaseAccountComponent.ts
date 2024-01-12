import {
    Component,
    ElementRef,
    Injectable,
    Injector,
    Renderer2,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { AutoComplete } from 'primeng/autocomplete';
import { InputMask } from 'primeng/inputmask';
import { InputNumber } from 'primeng/inputnumber';
import { ConfigAriseEnum } from 'src/app/models/config-arise.model';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';

@Injectable()
export abstract class BaseAccountComponent {
    configAriseEnum = ConfigAriseEnum;
    form: FormGroup;
    emptyMessageAutoComplete: string = 'không tìm thấy dữ liệu';

    @ViewChild('debitCodeTmp', { static: false }) debitCodeTmp: AutoComplete;
    @ViewChild('debitDetailCodeFirstTmp', { static: false })
    debitDetailCodeFirstTmp: AutoComplete;
    @ViewChild('debitDetailCodeSecondTmp', { static: false })
    debitDetailCodeSecondTmp: AutoComplete;
    @ViewChild('creditCodeTmp', { static: false }) creditCodeTmp: AutoComplete;
    @ViewChild('creditDetailCodeFirstTmp', { static: false })
    creditDetailCodeFirstTmp: AutoComplete;
    @ViewChild('creditDetailCodeSecondTmp', { static: false })
    creditDetailCodeSecondTmp: AutoComplete;

    chartOfAccounts: any[];
    debitCodeFilter: any[] = [];
    debitDetailCodeFirstFilter: any[] = [];
    debitDetailCodeFirstPage = {
        page: 1,
        pageSize: 20,
        parentCode: '',
        searchText: '',
        totalItems: -1,
        isLoadding: false,
    };

    creditCodeFilter: any;
    debitDetailCodeSecondFilter: any = [];
    debitDetailCodeSecondPage = {
        page: 1,
        pageSize: 20,
        parentCode: '',
        searchText: '',
        totalItems: -1,
        isLoadding: false,
    };

    creditDetailCodeFirstFilter: any[] = [];
    creditDetailCodeFirstPage = {
        page: 1,
        pageSize: 20,
        parentCode: '',
        searchText: '',
        totalItems: -1,
        isLoadding: false,
    };
    creditDetailCodeSecondFilter: any = [];
    creditDetailCodeSecondPage = {
        page: 1,
        pageSize: 20,
        parentCode: '',
        searchText: '',
        totalItems: -1,
        isLoadding: false,
    };

    defaultChartOfAccount: any = {};

    constructor(
        protected fb: FormBuilder,
        protected chartOfAccountService: ChartOfAccountService,
        protected renderer: Renderer2,
        protected injector: Injector,
    ) {}

    getAllByDisplayInsert() {
        this.chartOfAccountService
            .getAllByDisplayInsert()
            .subscribe((res: any) => {
                this.chartOfAccounts = res;
            });
    }

    getChartOfAccountForGoods() {
        this.chartOfAccountService
            .getAllClassification({classification: [2, 3]})
            .subscribe((res: any) => {
                this.chartOfAccounts = res;
                this.defaultChartOfAccount = this.chartOfAccounts.find(x => x.code == '1561');
                this.form.patchValue({
                    debitCode: this.defaultChartOfAccount
                });
            });
    }

    get f() {
        return this.form;
    }

    get fc() {
        return this.form.controls;
    }

    get isHiddenAutoCompleteCreditDetailCodeSecond() {
        return (
            this.fc['creditDetailCodeSecond'].value instanceof Object &&
            this.creditDetailCodeSecondFilter?.length
        );
    }

    get isHiddenAutoCompleteCreditDetailCodeFirst() {
        return (
            this.fc['creditDetailCodeFirst'].value instanceof Object &&
            this.creditDetailCodeFirstFilter?.length
        );
    }

    get isHiddenAutoCompleteCreditCode() {
        return (
            this.fc['creditCode'].value instanceof Object &&
            this.creditCodeFilter?.length
        );
    }

    get isHiddenAutoCompleteDebitDetailCodeSecond() {
        return (
            this.fc['debitDetailCodeSecond'].value instanceof Object &&
            this.debitDetailCodeSecondFilter?.length
        );
    }

    get isHiddenAutoCompleteDebitDetailCodeFirst() {
        return (
            this.fc['debitDetailCodeFirst'].value instanceof Object &&
            this.debitDetailCodeFirstFilter?.length
        );
    }

    get isHiddenAutoCompleteDebitCode() {
        return (
            this.fc['debitCode'].value instanceof Object &&
            this.debitCodeFilter?.length
        );
    }

    get isCreditCodeHasDetails() {
        return this.fc['creditCode'].value?.hasDetails;
    }

    get isCreditCodeHas() {
        return this.fc['creditCode'].value instanceof Object;
    }

    get isCreditDetailCodeFirstHas() {
        return this.fc['creditDetailCodeFirst'].value instanceof Object;
    }

    get isCreditDetailCodeFirstHasDetails() {
        return this.fc['creditDetailCodeFirst'].value?.hasDetails;
    }

    get isDebitCodeHasDetails() {
        return this.fc['debitCode'].value?.hasDetails;
    }

    get isDebitCodeHas() {
        return this.fc['debitCode'].value instanceof Object;
    }

    get isDebitDetailCodeFirstHas() {
        return this.fc['debitDetailCodeFirst'].value instanceof Object;
    }

    get isDebitDetailCodeFirstHasDetails() {
        return this.fc['debitDetailCodeFirst'].value?.hasDetails;
    }

    get isDebitDetailCodeSecondHas() {
        return this.fc['debitDetailCodeSecond'].value instanceof Object;
    }

    get isCreditDetailCodeSecondHas() {
        return this.fc['creditDetailCodeSecond'].value instanceof Object;
    }

    get isUserManagerHas() {
        return this.fc['userManager'].value instanceof Object;
    }

    // nhận sự kiện khi click mũi tên đi xuống sẽ tự động lấy dữ liệu
    // chỉ dành cho chi tiết 1 và 2
    onKeyUpAutoCompleteLazyLoadding($event: any) {
        if ($event.event.key !== 'ArrowDown') return;
        const key = $event.key;
        try {
            const autocompletePanel = this[
                `${ConfigAriseEnum[key]}Tmp`
            ]?.el?.nativeElement?.querySelector('.p-autocomplete-panel');
            if (
                autocompletePanel &&
                this[`${ConfigAriseEnum[key]}Filter`].length > 0
            ) {
                if (
                    autocompletePanel.scrollHeight -
                        autocompletePanel.clientHeight -
                        10 <=
                    autocompletePanel.scrollTop
                ) {
                    const str =
                        ConfigAriseEnum[key].charAt(0).toUpperCase() +
                        ConfigAriseEnum[key].slice(1);
                    this[`get${str}`](null);
                }
            }
        } catch {}
    }

    // chi tiet no 1
    filterDebitDetailCodeFirst(event) {
        if (!event) {
            this.debitDetailCodeFirstFilter = [];
            return;
        }
        if (!this.isDebitCodeHas) {
            console.log('Chưa chọn tài khoản nợ');
            this.debitDetailCodeFirstFilter = [];
            return;
        }

        event.query = event.query || '';
        if (this.fc['debitDetailCodeFirst'].value instanceof String) {
            event.query = this.fc['debitDetailCodeFirst'].value || '';
        } else if (this.fc['debitDetailCodeFirst'].value instanceof Object) {
            this.debitDetailCodeFirstFilter = [
                _.cloneDeep(this.fc['debitDetailCodeFirst'].value),
            ];
            return;
        }

        this.debitDetailCodeFirstPage = {
            ...this.debitDetailCodeFirstPage,
            searchText: event.query,
            parentCode: this.fc['debitCode'].value.code,
            page: 1,
            totalItems: -1,
        };
        var callBack = () => {
            setTimeout(() => {
                const autocompletePanel =
                    this.debitDetailCodeFirstTmp.el.nativeElement.querySelector(
                        '.p-autocomplete-panel',
                    );
                if (
                    autocompletePanel &&
                    this.debitDetailCodeFirstFilter.length > 0
                ) {
                    this.renderer.listen(
                        autocompletePanel,
                        'scroll',
                        (event) => {
                            if (
                                event.target.scrollHeight -
                                    event.target.clientHeight ===
                                event.target.scrollTop
                            ) {
                                this.getDebitDetailCodeFirst(null);
                            }
                        },
                    );
                }
            }, 1000);
        };
        this.getDebitDetailCodeFirst(callBack);
    }

    // tai khoan no
    filterDebitCode(event) {
        if (!event) {
            this.debitCodeFilter = [];
            return;
        }
        event.query = event.query || '';
        if (this.fc['debitCode'].value instanceof String) {
            event.query = this.fc['debitCode'].value || '';
        } else if (this.fc['debitCode'].value instanceof Object) {
            event.query = this.fc['debitCode'].value.code || '';
            this.debitCodeFilter = [_.cloneDeep(this.fc['debitCode'].value)];
            return;
        }
        const list = _.filter(_.cloneDeep(this.chartOfAccounts), (item) => {
            return (
                item.name &&
                item.name != '' &&
                item.code.toLowerCase().startsWith(event.query.toLowerCase())
            );
        });
        this.debitCodeFilter = list;
    }

    onSelectDebitCode($event) {
        if (
            !(
                this.fc['debitCode'].value instanceof Object &&
                $event.code === this.fc['debitCode'].value.code
            )
        ) {
            this.f.patchValue({
                debitCode: $event,
                debitDetailCodeFirst: '',
                debitDetailCodeSecond: '',
            });
        }

        if (this.isDebitCodeHas && this.isDebitCodeHasDetails) {
            this.focusInput(this.debitDetailCodeFirstTmp);
        } else {
            this.focusInput(this.creditCodeTmp);
        }
    }

    onSelectDebitDetailCodeFirst($event) {
        if (
            !(
                this.fc['debitDetailCodeFirst'].value instanceof Object &&
                $event.code === this.fc['debitDetailCodeFirst'].value.code
            )
        ) {
            this.f.patchValue({
                debitDetailCodeFirst: $event,
                debitDetailCodeSecond: '',
            });
        }
        if (
            this.isDebitDetailCodeFirstHas &&
            this.isDebitDetailCodeFirstHasDetails
        ) {
            this.focusInput(this.debitDetailCodeSecondTmp);
        } else {
            this.focusInput(this.creditCodeTmp);
        }
    }

    // tai khoan no
    filterCreditCode(event) {
        if (!event) {
            this.creditCodeFilter = [];
            return;
        }
        event.query = event.query || '';
        if (this.fc['creditCode'].value instanceof String) {
            event.query = this.fc['creditCode'].value || '';
        } else if (this.fc['creditCode'].value instanceof Object) {
            this.creditCodeFilter = [
                (event.query = this.fc['creditCode'].value),
            ];
            return;
        }

        const list = _.filter(_.cloneDeep(this.chartOfAccounts), (item) => {
            return (
                item.name &&
                item.name != '' &&
                item.code.toLowerCase().startsWith(event.query.toLowerCase())
            );
        });
        this.creditCodeFilter = list;
    }

    onSelectCreditCode($event) {
        if (
            !(
                this.fc['creditCode'].value instanceof Object &&
                $event.code === this.fc['creditCode'].value.code
            )
        ) {
            this.f.patchValue({
                creditCode: $event,
                creditDetailCodeFirst: '',
                creditDetailCodeSecond: '',
            });
        }
        if (this.isCreditCodeHas && this.isCreditCodeHasDetails) {
            this.focusInput(this.creditDetailCodeFirstTmp);
        }
    }

    onSelectUserManager($event) {
        this.f.patchValue({
            userManager: $event,
        });
    }

    focusInput(input: InputMask | InputNumber | AutoComplete | ElementRef) {
        setTimeout(() => {
            if (input instanceof InputMask) {
                (input as InputMask)?.focus();
            } else if (input instanceof InputNumber) {
                (input as InputNumber)?.input?.nativeElement?.focus();
            } else if (input instanceof ElementRef) {
                (input as ElementRef)?.nativeElement?.focus();
            } else if (input instanceof AutoComplete) {
                (input as AutoComplete)?.focusInput();
            }
        }, 150);
    }

    // chi tiet no 2
    filterDebitDetailCodeSecond(event) {
        if (!event) {
            this.debitDetailCodeSecondFilter = [];
            return;
        }
        if (!this.isDebitDetailCodeFirstHas) {
            console.log('Chưa chọn chi tiết nợ 1');
            this.debitDetailCodeSecondFilter = [];
            return;
        }
        event.query = event.query || '';
        if (this.fc['debitDetailCodeSecond'].value instanceof String) {
            event.query = this.fc['debitDetailCodeSecond'].value || '';
        } else if (this.fc['debitDetailCodeSecond'].value instanceof Object) {
            this.debitDetailCodeSecondFilter = [
                this.fc['debitDetailCodeSecond'].value,
            ];
            return;
        }
        this.debitDetailCodeSecondPage = {
            ...this.debitDetailCodeSecondPage,
            searchText: event.query,
            parentCode: `${this.fc['debitCode'].value.code}:${this.fc['debitDetailCodeFirst'].value.code}`,
            page: 1,
            totalItems: -1,
        };
        var callBack = () => {
            setTimeout(() => {
                const autocompletePanel =
                    this.debitDetailCodeSecondTmp.el.nativeElement.querySelector(
                        '.p-autocomplete-panel',
                    );
                if (
                    autocompletePanel &&
                    this.debitDetailCodeSecondFilter.length > 0
                ) {
                    this.renderer.listen(
                        autocompletePanel,
                        'scroll',
                        (event) => {
                            if (
                                event.target.scrollHeight -
                                    event.target.clientHeight ===
                                event.target.scrollTop
                            ) {
                                this.getDebitDetailCodeSecond(null);
                            }
                        },
                    );
                }
            }, 1000);
        };
        this.getDebitDetailCodeSecond(callBack);
    }

    onSelectDebitDetailCodeSecond($event) {
        if (
            !(
                this.fc['debitDetailCodeSecond'].value instanceof Object &&
                $event.code === this.fc['debitDetailCodeSecond'].value.code
            )
        ) {
            this.f.patchValue({
                debitDetailCodeSecond: $event,
            });
        }
        this.focusInput(this.creditCodeTmp);
    }

    // chi tiet có 1
    filterCreditDetailCodeFirst(event) {
        if (!event) {
            this.creditDetailCodeFirstFilter = [];
            return;
        }
        if (!this.isCreditCodeHas) {
            console.log('Chưa chọn tài khoản có');
            this.creditDetailCodeFirstFilter = [];
            return;
        }

        event.query = event.query || '';
        if (this.fc['creditDetailCodeFirst'].value instanceof String) {
            event.query = this.fc['creditDetailCodeFirst'].value || '';
        } else if (this.fc['creditDetailCodeFirst'].value instanceof Object) {
            this.creditDetailCodeFirstFilter = [
                this.fc['creditDetailCodeFirst'].value,
            ];
            return;
        }

        this.creditDetailCodeFirstPage = {
            ...this.creditDetailCodeFirstPage,
            searchText: event.query,
            parentCode: this.fc['creditCode'].value.code,
            page: 1,
            totalItems: -1,
        };
        var callBack = () => {
            setTimeout(() => {
                const autocompletePanel =
                    this.creditDetailCodeFirstTmp.el.nativeElement.querySelector(
                        '.p-autocomplete-panel',
                    );
                if (
                    autocompletePanel &&
                    this.creditDetailCodeFirstFilter.length > 0
                ) {
                    this.renderer.listen(
                        autocompletePanel,
                        'scroll',
                        (event) => {
                            if (
                                event.target.scrollHeight -
                                    event.target.clientHeight ===
                                event.target.scrollTop
                            ) {
                                this.getCreditDetailCodeFirst(null);
                            }
                        },
                    );
                }
            }, 1000);
        };
        this.getCreditDetailCodeFirst(callBack);
    }

    onSelectCreditDetailCodeFirst($event) {
        if (
            !(
                this.fc['creditDetailCodeFirst'].value instanceof Object &&
                $event.code === this.fc['creditDetailCodeFirst'].value.code
            )
        ) {
            this.f.patchValue({
                creditDetailCodeFirst: $event,
                creditDetailCodeSecond: '',
            });
        }
        if (
            this.isCreditDetailCodeFirstHas &&
            this.isCreditDetailCodeFirstHasDetails
        ) {
            this.focusInput(this.creditDetailCodeSecondTmp);
        }
    }

    // chi tiet no 2
    filterCreditDetailCodeSecond(event) {
        if (!event) {
            this.creditDetailCodeSecondFilter = [];
            return;
        }
        if (!this.isCreditDetailCodeFirstHas) {
            console.log('Chưa chọn chi tiết có 1');
            this.creditDetailCodeSecondFilter = [];
            return;
        }
        event.query = event.query || '';
        if (this.fc['creditDetailCodeSecond'].value instanceof String) {
            event.query = this.fc['creditDetailCodeSecond'].value || '';
        } else if (this.fc['creditDetailCodeSecond'].value instanceof Object) {
            this.creditDetailCodeFirstFilter = [
                this.fc['creditDetailCodeSecond'].value,
            ];
            return;
        }
        this.creditDetailCodeSecondPage = {
            ...this.creditDetailCodeSecondPage,
            searchText: event.query,
            parentCode: `${this.fc['creditCode'].value.code}:${this.fc['creditDetailCodeFirst'].value.code}`,
            page: 1,
            totalItems: -1,
        };
        var callBack = () => {
            setTimeout(() => {
                const autocompletePanel =
                    this.creditDetailCodeSecondTmp.el.nativeElement.querySelector(
                        '.p-autocomplete-panel',
                    );
                if (
                    autocompletePanel &&
                    this.creditDetailCodeSecondFilter.length > 0
                ) {
                    this.renderer.listen(
                        autocompletePanel,
                        'scroll',
                        (event) => {
                            if (
                                event.target.scrollHeight -
                                    event.target.clientHeight ===
                                event.target.scrollTop
                            ) {
                                this.getCreditDetailCodeSecond(null);
                            }
                        },
                    );
                }
            }, 1000);
        };
        this.getCreditDetailCodeSecond(callBack);
    }

    onSelectCreditDetailCodeSecond($event) {
        if (
            !(
                this.fc['creditDetailCodeSecond'].value instanceof Object &&
                $event.code === this.fc['creditDetailCodeSecond'].value.code
            )
        ) {
            this.f.patchValue({
                creditDetailCodeSecond: $event,
            });
        }
        this.focusInput(this.creditDetailCodeSecondTmp);
    }

    onClearCreditCode() {
        this.f.patchValue({
            creditCode: '',
            creditDetailCodeFirst: '',
            creditDetailCodeSecond: '',
        });
        this.focusInput(this.creditCodeTmp);
    }

    onClearCreditDetailCodeFirst() {
        this.f.patchValue({
            creditDetailCodeFirst: '',
            creditDetailCodeSecond: '',
        });
        this.focusInput(this.creditDetailCodeFirstTmp);
    }

    onClearCreditDetailCodeSecond(focusInput: boolean = true) {
        this.f.patchValue({
            creditDetailCodeSecond: '',
        });
        if (focusInput) {
            this.focusInput(this.creditDetailCodeSecondTmp);
        }
    }

    onClearDebitCode() {
        this.f.patchValue({
            debitCode: '',
            debitDetailCodeFirst: '',
            debitDetailCodeSecond: '',
        });
        this.focusInput(this.debitCodeTmp);
    }

    onClearDebitDetailCodeFirst() {
        this.f.patchValue({
            debitDetailCodeFirst: '',
            debitDetailCodeSecond: '',
        });
        this.focusInput(this.debitDetailCodeFirstTmp);
    }

    onClearDebitDetailCodeSecond() {
        this.f.patchValue({
            debitDetailCodeSecond: '',
        });
        this.focusInput(this.debitDetailCodeSecondTmp);
    }

    private getCreditDetailCodeSecond(callBack) {
        if (
            this.creditDetailCodeSecondPage.isLoadding ||
            this.creditDetailCodeSecondPage.totalItems ===
                this.creditDetailCodeSecondFilter.length
        ) {
            return;
        }
        this.creditDetailCodeSecondPage.isLoadding = true;
        let params = _.cloneDeep(this.creditDetailCodeSecondPage);
        delete params.isLoadding;
        delete params.totalItems;
        this.chartOfAccountService
            .getDetailV2(params.parentCode, params)
            .subscribe((res) => {
                if (this.creditDetailCodeSecondPage.page === 1) {
                    this.creditDetailCodeSecondFilter = [];
                }
                this.creditDetailCodeSecondFilter =
                    this.creditDetailCodeSecondFilter.concat(res.data);
                this.creditDetailCodeSecondPage.page++;
                this.creditDetailCodeSecondPage = {
                    ...this.creditDetailCodeSecondPage,
                    totalItems: res.totalItems,
                    isLoadding: false,
                };
                if (callBack) {
                    callBack();
                }
            });
    }

    private getCreditDetailCodeFirst(callBack) {
        if (
            this.creditDetailCodeFirstPage.isLoadding ||
            this.creditDetailCodeFirstPage.totalItems ===
                this.creditDetailCodeFirstFilter.length
        ) {
            return;
        }
        this.creditDetailCodeFirstPage.isLoadding = true;
        let params = _.cloneDeep(this.creditDetailCodeFirstPage);
        delete params.isLoadding;
        delete params.totalItems;
        this.chartOfAccountService
            .getDetailV2(params.parentCode, params)
            .subscribe((res) => {
                if (this.creditDetailCodeFirstPage.page === 1) {
                    this.creditDetailCodeFirstFilter = [];
                }
                this.creditDetailCodeFirstFilter =
                    this.creditDetailCodeFirstFilter.concat(res.data);
                this.creditDetailCodeFirstPage.page++;
                this.creditDetailCodeFirstPage = {
                    ...this.creditDetailCodeFirstPage,
                    totalItems: res.totalItems,
                    isLoadding: false,
                };
                if (callBack) {
                    callBack();
                }
            });
    }

    private getDebitDetailCodeFirst(callBack) {
        if (
            this.debitDetailCodeFirstPage.isLoadding ||
            this.debitDetailCodeFirstPage.totalItems ===
                this.debitDetailCodeFirstFilter.length
        ) {
            return;
        }
        this.debitDetailCodeFirstPage.isLoadding = true;
        let params = _.cloneDeep(this.debitDetailCodeFirstPage);
        delete params.isLoadding;
        delete params.totalItems;
        this.chartOfAccountService
            .getDetailV2(params.parentCode, params)
            .subscribe((res) => {
                if (this.debitDetailCodeFirstPage.page === 1) {
                    this.debitDetailCodeFirstFilter = [];
                }
                this.debitDetailCodeFirstFilter =
                    this.debitDetailCodeFirstFilter.concat(res.data);
                this.debitDetailCodeFirstPage.page++;
                this.debitDetailCodeFirstPage = {
                    ...this.debitDetailCodeFirstPage,
                    totalItems: res.totalItems,
                    isLoadding: false,
                };
                if (callBack) {
                    callBack();
                }
            });
    }

    private getDebitDetailCodeSecond(callBack) {
        if (
            this.debitDetailCodeSecondPage.isLoadding ||
            this.debitDetailCodeSecondPage.totalItems ===
                this.debitDetailCodeSecondFilter.length
        ) {
            return;
        }
        this.debitDetailCodeSecondPage.isLoadding = true;
        let params = _.cloneDeep(this.debitDetailCodeSecondPage);
        delete params.isLoadding;
        delete params.totalItems;
        this.chartOfAccountService
            .getDetailV2(params.parentCode, params)
            .subscribe((res) => {
                if (this.debitDetailCodeSecondPage.page === 1) {
                    this.debitDetailCodeSecondFilter = [];
                }
                this.debitDetailCodeSecondFilter =
                    this.debitDetailCodeSecondFilter.concat(res.data);
                this.debitDetailCodeSecondPage.page++;
                this.debitDetailCodeSecondPage = {
                    ...this.debitDetailCodeSecondPage,
                    totalItems: res.totalItems,
                    isLoadding: false,
                };
                if (callBack) {
                    callBack();
                }
            });
    }
}
