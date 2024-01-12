import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    Renderer2,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import { DocumentService } from 'src/app/service/document.service';
import { User } from 'src/app/models/user.model';
import { UserService } from '../../../../../service/user.service';
import { debounceTime, Subject } from 'rxjs';
import * as _ from 'lodash';
import { AutoComplete } from 'primeng/autocomplete';
import { ConfigAriseEnum } from 'src/app/models/config-arise.model';
import { InputMask } from 'primeng/inputmask';
import { InputNumber } from 'primeng/inputnumber';
import { da } from 'date-fns/locale';
import { ActivatedRoute, Route, Router } from '@angular/router';

@Component({
    selector: 'app-type-of-document-form',
    templateUrl: './type-of-document-form.component.html',
    styleUrls: ['./type-of-document-form.component.scss'],
})
export class TypeOfDocumentFormComponent implements OnInit {
    title: string = '';
    documentForm: FormGroup;
    chartOfAccounts: any[];
    id: any;
    emptyMessageAutoComplete: string = 'không tìm thấy dữ liệu';
    @ViewChild('debitCodeTmp') public debitCodeTmp: AutoComplete;
    @ViewChild('debitDetailCodeFirstTmp') debitDetailCodeFirstTmp: AutoComplete;
    @ViewChild('debitDetailCodeSecondTmp')
    debitDetailCodeSecondTmp: AutoComplete;
    @ViewChild('creditCodeTmp') creditCodeTmp: AutoComplete;
    @ViewChild('creditDetailCodeFirstTmp')
    creditDetailCodeFirstTmp: AutoComplete;
    @ViewChild('creditDetailCodeSecondTmp')
    creditDetailCodeSecondTmp: AutoComplete;
    @ViewChild('userManagerAutoCompleteTmp')
    userManagerAutoCompleteTmp: AutoComplete;
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F8':
                event.preventDefault();
                await this.onSubmit();
                break;
            case 'F6':
                event.preventDefault();
                this.goBack();
                break;
        }
    }

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

    userManagerFilter = [];
    userManagerList = [];

    constructor(
        private fb: FormBuilder,
        private chartOfAccountService: ChartOfAccountService,
        private translateService: TranslateService,
        private messageService: MessageService,
        private documentService: DocumentService,
        private readonly renderer: Renderer2,
        private readonly userService: UserService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
    ) {
        this.id = Number(this.activatedRoute.snapshot.paramMap.get('id') || 0);
        this.documentForm = this.fb.group({
            id: [0],
            stt: [''],
            code: ['', [Validators.required]],
            name: ['', [Validators.required]],
            debitCode: [''],
            debitDetailCodeFirst: [''],
            debitDetailCodeSecond: [''],
            creditCode: [''],
            creditDetailCodeFirst: [''],
            creditDetailCodeSecond: [''],
            userManager: [''],
            title: [''],
        });
    }

    getAllByDisplayInsert() {
        this.chartOfAccountService
            .getAllByDisplayInsert()
            .subscribe((res: any) => {
                this.chartOfAccounts = res;
            });
    }

    ngOnInit() {
        this.getAllByDisplayInsert();
        this.getUsers();
        if (!this.isNew) {
            this.getDetail((data) => {
                this.buildData(data);
            }, this.id);
        }
    }

    getDetail(callback, documentId) {
        this.documentService
            .getDocumentDetailV2(documentId)
            .subscribe((response: any) => {
                callback(response);
            });
    }

    buildData(data: any) {
        this.f.patchValue({
            id: data?.id || 0,
            stt: data?.stt,
            code: data?.code,
            name: data?.name,
            debitCode: data?.debit || '',
            debitDetailCodeFirst: data?.debitDetailFirst || '',
            debitDetailCodeSecond: data?.debitDetailSecond || '',
            creditCode: data?.credit || '',
            creditDetailCodeFirst: data?.creditDetailFirst || '',
            creditDetailCodeSecond: data?.creditDetailSecond || '',
            userManager: data?.userManager || '',
            title: data?.title || '',
        });
    }

    onSubmit() {
        if (!this.validateForm) {
            return;
        }
        const formValue = _.cloneDeep(this.f.value);
        let input = {
            ...formValue,
            debitCode: formValue?.debitCode?.code || '',
            nameDebitCode: formValue?.debitCode?.name || '',
            creditCode: formValue?.creditCode?.code || '',
            nameCreditCode: formValue?.creditCode?.name || '',
            debitCodeFirst: formValue?.debitDetailCodeFirst?.code || '',
            debitCodeFirstName: formValue?.debitDetailCodeFirst?.name || '',
            debitCodeSecond: formValue?.debitDetailCodeSecond?.code || '',
            debitCodeSecondName: formValue?.debitDetailCodeSecond?.name || '',
            creditCodeFirst: formValue?.creditDetailCodeFirst?.code || '',
            creditCodeFirstName: formValue?.creditDetailCodeFirst?.name || '',
            creditCodeSecond: formValue?.creditDetailCodeSecond?.code || '',
            creditCodeSecondName: formValue?.creditDetailCodeSecond?.name || '',
            userId: formValue?.userManager?.id?.toString() || '',
            userCode: formValue?.userManager?.code || '',
            userFullName: formValue?.userManager?.fullName || '',
        };
        delete input.debitDetailCodeFirst;
        delete input.debitDetailCodeSecond;
        delete input.creditDetailCodeFirst;
        delete input.creditDetailCodeSecond;
        delete input.userManager;
        const api = !this.isNew
            ? this.documentService.updateDocument(this.f.value.id, input)
            : this.documentService.createDocument(input);
        api.subscribe((res: any) => {
            if (res && res.status != 605) {
                this.messageService.add({
                    severity: 'success',
                    detail: !this.isNew
                        ? 'Cập nhật thành công'
                        : 'Thêm mới thành công',
                });
            }
            this.goBack();
        });
    }

    getChartOfAccountName(code) {
        let chartOfAccount = this.chartOfAccounts.find((x) => x.code === code);
        return chartOfAccount ? chartOfAccount.name : '';
    }

    getUsers() {
        this.userService
            .getPagingUser({
                page: 0,
                pageSize: 20,
            })
            .subscribe(
                (res) => {
                    this.userManagerList = res.data || [];
                },
                (err) => {
                    this.userManagerList = [];
                },
            );
    }

    goBack() {
        this.router.navigate(['/uikit/category/type-of-document']);
    }

    get isNew() {
        return this.id === 0;
    }

    get f() {
        return this.documentForm;
    }

    get fc() {
        return this.documentForm.controls;
    }

    get validateForm(): boolean {
        // nếu các giá trị cơ bản của form không có
        if (this.f.invalid) return false;
        // nếu tài khoản nợ/có không có dữ liệu
        // if ([this.isDebitCodeHas, this.isCreditCodeHas].includes(false)) return false;
        if (!this.isUserManagerHas && this.fc['userManager'].value !== '')
            return false;
        return true;
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
            ].el.nativeElement.querySelector('.p-autocomplete-panel');
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

    onClearUserManager() {
        this.f.patchValue({
            userManager: '',
        });
        this.focusInput(this.userManagerAutoCompleteTmp);
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

    filterUserManager(event) {
        if (!event) {
            this.userManagerFilter = [];
            return;
        }
        event.query = event.query || '';
        if (this.fc['userManager'].value instanceof String) {
            event.query = this.fc['userManager'].value || '';
        } else if (this.fc['userManager'].value instanceof Object) {
            this.creditCodeFilter = [
                (event.query = this.fc['userManager'].value),
            ];
            return;
        }

        const list = _.filter(_.cloneDeep(this.userManagerList), (item) => {
            return (item.fullName || '')
                .toLowerCase()
                .startsWith(event.query.toLowerCase());
        });
        this.userManagerFilter = list;
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
