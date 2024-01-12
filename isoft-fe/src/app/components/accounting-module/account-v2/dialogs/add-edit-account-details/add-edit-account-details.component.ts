import {
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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { combineLatest, filter, Observable } from 'rxjs';
import { AppComponentBase } from 'src/app/app-component-base';
import { AppMainComponent } from 'src/app/layouts/app.main.component';
import {
    AccountClassificationList,
    AccountDurationList,
    AccountDurationType,
    AccountGroupAddEditModel,
    AccountGroupDetailModel,
    AccountGroupList,
    AccountGroupType,
    AccountProtectedList,
} from 'src/app/models/account-group.model';
import { Page } from 'src/app/models/common.model';
import { AccountGroupService } from 'src/app/service/account-group.service';
import { WarehouseService } from 'src/app/service/warehouse.service';
import { IsConfirmationService } from 'src/app/shared/is-confirmation/is-comfirmation.service';
import AppUtil from 'src/app/utilities/app-util';
import { AccountType, AddAccountDetailType } from '../../account.model';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'add-edit-account-details',
    templateUrl: './add-edit-account-details.component.html',
    styles: [],
})
export class AddEditAccountDetailsComponent
    extends AppComponentBase
    implements OnInit {
    @Input() accountType: AccountType;
    @Output() updateSuccessfull = new EventEmitter();
    @Output('onClose') onClose = new EventEmitter<boolean>();

    title = '';
    display = false;
    formGroup: FormGroup;
    wareHouses: any[] = [];
    accountTypes = AccountType;
    accountGroupTypes = AccountGroupType;
    accountDetailTypes = AddAccountDetailType;
    currentParentAccount: AccountGroupDetailModel;
    currentDetail: AccountGroupDetailModel;
    accountDetailType: AddAccountDetailType;

    placeSaveList = [
        {
            id: 1,
            name: 'Cả hai',
        },
        {
            id: 2,
            name: 'HT',
        },
        {
            id: 3,
            name: 'NB',
        },
    ];
    durationList = AccountDurationList;
    groupList = AccountGroupList;
    classificationList = AccountClassificationList;
    protectedList = AccountProtectedList;
    tabIndex = 0;
    noneTabIndexRoutes: string[] = [
        'account-detail-first-v2',
        'account-detail-second-v2',
    ];

    @ViewChild('codeInputTmp') codeInputTmp: ElementRef;

    get valid(): boolean {
        if (this.formGroup && this.formGroup.valid) {
            return true;
        }
        return false;
    }

    constructor(
        public appMain: AppMainComponent,
        private _fb: FormBuilder,
        private _accountGroupService: AccountGroupService,
        private _isConfirmationService: IsConfirmationService,
        private _warehouseService: WarehouseService,
        private _injector: Injector,
        private _host: ElementRef,
        private route: ActivatedRoute,
    ) {
        super(_injector);
    }

    ngOnInit() {
        // Set tabIndex = -1 if route name include in define none route
        if (
            this.noneTabIndexRoutes.includes(
                this.route.snapshot.routeConfig.path,
            )
        ) {
            this.tabIndex = -1;
        }
    }

    getFormGroup(): FormGroup {
        if (this.accountType === AccountType.HT) {
            switch (this.currentParentAccount.accGroup) {
                case AccountGroupType.Inventory:
                    return this._fb.group({
                        warehouseCode: this._fb.control(null),
                        code: this._fb.control(null, [Validators.required]),
                        name: this._fb.control(null, [Validators.required]),
                        stockUnit: this._fb.control(null),
                        openingStockQuantity: this._fb.control(null),
                        stockUnitPrice: this._fb.control(null),
                        openingDebit: this._fb.control(null),
                        isForeignCurrency: this._fb.control(false),
                        openingForeignDebit: this._fb.control({
                            value: null,
                            disabled: true,
                        }),
                        duration: this._fb.control(
                            this.currentParentAccount.duration,
                            [Validators.required],
                        ),
                        accGroup: this._fb.control(
                            this.currentParentAccount.accGroup,
                            [Validators.required],
                        ),
                        classification: this._fb.control(
                            this.currentParentAccount.classification,
                            [Validators.required],
                        ),
                        protected: this._fb.control(
                            this.currentParentAccount.protected ?? 1,
                            [Validators.required],
                        ),
                        isInternal: this._fb.control(
                            this.accountDetailType ===
                                AddAccountDetailType.CT2 &&
                                this.currentParentAccount.isInternal
                                ? this.currentParentAccount.isInternal
                                : 1,
                        ),
                    });
                case AccountGroupType.ImportExport:
                    return this._fb.group({
                        code: this._fb.control(null, [Validators.required]),
                        name: this._fb.control(null, [Validators.required]),
                        stockUnit: this._fb.control(null),
                        openingStockQuantity: this._fb.control(null),
                        stockUnitPrice: this._fb.control(null),
                        openingDebit: this._fb.control(null),
                        isForeignCurrency: this._fb.control(false),
                        openingForeignDebit: this._fb.control({
                            value: null,
                            disabled: true,
                        }),
                        duration: this._fb.control(
                            this.currentParentAccount.duration,
                            [Validators.required],
                        ),
                        accGroup: this._fb.control(
                            this.currentParentAccount.accGroup,
                            [Validators.required],
                        ),
                        classification: this._fb.control(
                            this.currentParentAccount.classification,
                            [Validators.required],
                        ),
                        protected: this._fb.control(
                            this.currentParentAccount.protected ?? 1,
                            [Validators.required],
                        ),
                        isInternal: this._fb.control(
                            this.accountDetailType ===
                                AddAccountDetailType.CT2 &&
                                this.currentParentAccount.isInternal
                                ? this.currentParentAccount.isInternal
                                : 1,
                        ),
                    });
                default:
                    return this._fb.group({
                        code: this._fb.control(null, [Validators.required]),
                        name: this._fb.control(null, [Validators.required]),
                        openingDebit: this._fb.control(null),
                        openingCredit: this._fb.control(null),
                        isForeignCurrency: this._fb.control(false),
                        openingForeignCredit: this._fb.control({
                            value: null,
                            disabled: true,
                        }),
                        openingForeignDebit: this._fb.control({
                            value: null,
                            disabled: true,
                        }),
                        duration: this._fb.control(
                            this.currentParentAccount.duration,
                            [Validators.required],
                        ),
                        accGroup: this._fb.control(
                            this.currentParentAccount.accGroup,
                            [Validators.required],
                        ),
                        classification: this._fb.control(
                            this.currentParentAccount.classification,
                            [Validators.required],
                        ),
                        protected: this._fb.control(
                            this.currentParentAccount.protected ?? 1,
                            [Validators.required],
                        ),
                        isInternal: this._fb.control(
                            this.accountDetailType ===
                                AddAccountDetailType.CT2 &&
                                this.currentParentAccount.isInternal
                                ? this.currentParentAccount.isInternal
                                : 1,
                        ),
                    });
            }
        } else {
            switch (this.currentParentAccount.accGroup) {
                case AccountGroupType.Inventory:
                    return this._fb.group({
                        warehouseCode: this._fb.control(null),
                        code: this._fb.control(null, [Validators.required]),
                        name: this._fb.control(null, [Validators.required]),
                        stockUnit: this._fb.control(null),
                        openingStockQuantityNb: this._fb.control(null),
                        stockUnitPriceNb: this._fb.control(null),
                        openingDebitNb: this._fb.control(null),
                        isForeignCurrency: this._fb.control(false),
                        openingForeignDebitNb: this._fb.control({
                            value: null,
                            disabled: true,
                        }),
                        duration: this._fb.control(
                            this.currentParentAccount.duration,
                            [Validators.required],
                        ),
                        accGroup: this._fb.control(
                            this.currentParentAccount.accGroup,
                            [Validators.required],
                        ),
                        classification: this._fb.control(
                            this.currentParentAccount.classification,
                            [Validators.required],
                        ),
                        protected: this._fb.control(
                            this.currentParentAccount.protected ?? 1,
                            [Validators.required],
                        ),
                        isInternal: this._fb.control(
                            this.accountDetailType ===
                                AddAccountDetailType.CT2 &&
                                this.currentParentAccount.isInternal
                                ? this.currentParentAccount.isInternal
                                : 1,
                        ),
                    });
                case AccountGroupType.ImportExport:
                    return this._fb.group({
                        code: this._fb.control(null, [Validators.required]),
                        name: this._fb.control(null, [Validators.required]),
                        stockUnit: this._fb.control(null),
                        openingStockQuantityNb: this._fb.control(null),
                        stockUnitPriceNb: this._fb.control(null),
                        openingDebitNb: this._fb.control(null),
                        isForeignCurrency: this._fb.control(false),
                        openingForeignDebitNb: this._fb.control({
                            value: null,
                            disabled: true,
                        }),
                        duration: this._fb.control(
                            this.currentParentAccount.duration,
                            [Validators.required],
                        ),
                        accGroup: this._fb.control(
                            this.currentParentAccount.accGroup,
                            [Validators.required],
                        ),
                        classification: this._fb.control(
                            this.currentParentAccount.classification,
                            [Validators.required],
                        ),
                        protected: this._fb.control(
                            this.currentParentAccount.protected ?? 1,
                            [Validators.required],
                        ),
                        isInternal: this._fb.control(
                            this.accountDetailType === AddAccountDetailType.CT2
                                ? this.currentParentAccount.isInternal
                                : 1,
                        ),
                    });
                default:
                    return this._fb.group({
                        code: this._fb.control(null, [Validators.required]),
                        name: this._fb.control(null, [Validators.required]),
                        openingDebitNb: this._fb.control(null),
                        openingCreditNb: this._fb.control(null),
                        isForeignCurrency: this._fb.control(false),
                        openingForeignCreditNb: this._fb.control({
                            value: null,
                            disabled: true,
                        }),
                        openingForeignDebitNb: this._fb.control({
                            value: null,
                            disabled: true,
                        }),
                        duration: this._fb.control(
                            this.currentParentAccount.duration,
                            [Validators.required],
                        ),
                        accGroup: this._fb.control(
                            this.currentParentAccount.accGroup,
                            [Validators.required],
                        ),
                        classification: this._fb.control(
                            this.currentParentAccount.classification,
                            [Validators.required],
                        ),
                        protected: this._fb.control(
                            this.currentParentAccount.protected ?? 1,
                            [Validators.required],
                        ),
                        isInternal: this._fb.control(
                            this.accountDetailType ===
                                AddAccountDetailType.CT2 &&
                                this.currentParentAccount.isInternal
                                ? this.currentParentAccount.isInternal
                                : 1,
                        ),
                    });
            }
        }
    }

    initFormGroup() {
        this.formGroup = this.getFormGroup();
        this.subsribeIsForeignCurrency();
        this.subscribeStockUnitPrice(
            'openingStockQuantity',
            'stockUnitPrice',
            'openingDebit',
        );
        this.subscribeStockUnitPrice(
            'openingStockQuantityNb',
            'stockUnitPriceNb',
            'openingDebitNb',
        );

        if (
            !this.currentDetail &&
            this.accountDetailType === AddAccountDetailType.CT1
        ) {
            this.codeAuto(1);
        } else if (this.accountDetailType === AddAccountDetailType.CT2) {
            this.formGroup.get('isInternal').disable();
            if (!this.currentDetail) {
                this.codeAuto(this.currentParentAccount.isInternal || 1);
            }
        }
        this.patchFormValue();
        this.setDisableState();
    }

    codeAuto(isInternal) {
        var parentRef = this.accountDetailType == this.accountDetailTypes.CT1
            ? this.currentParentAccount?.code
            : this.currentParentAccount?.parentRef + ':' + this.currentParentAccount?.code

        this._accountGroupService
            .codeAuto(parentRef, isInternal)
            .subscribe((res: any) => {
                this.formGroup.get('code').setValue(res.data);
            });
    }

    subsribeIsForeignCurrency() {
        this.formGroup.controls.isForeignCurrency.valueChanges.subscribe(
            (value) => {
                if (this.accountType === AccountType.HT) {
                    if (value) {
                        this.formGroup.controls.openingForeignCredit &&
                            this.formGroup.controls.openingForeignCredit.enable();
                        this.formGroup.controls.openingForeignDebit.enable();
                    } else {
                        this.formGroup.controls.openingForeignCredit &&
                            this.formGroup.controls.openingForeignCredit.disable();
                        this.formGroup.controls.openingForeignDebit.disable();
                    }
                } else {
                    if (value) {
                        this.formGroup.controls.openingForeignCreditNb &&
                            this.formGroup.controls.openingForeignCreditNb.enable();
                        this.formGroup.controls.openingForeignDebitNb.enable();
                    } else {
                        this.formGroup.controls.openingForeignCreditNb &&
                            this.formGroup.controls.openingForeignCreditNb.disable();
                        this.formGroup.controls.openingForeignDebitNb.disable();
                    }
                }
            },
        );
    }

    subscribeStockUnitPrice(
        stockQuanlityName: string,
        stockPrice: string,
        openingDebit: string,
    ) {
        const stockQuantityControl = this.formGroup.get(stockQuanlityName);
        const stockPriceControl = this.formGroup.get(stockPrice);
        const openingDebitControl = this.formGroup.get(openingDebit);
        if (stockQuantityControl && stockPriceControl) {
            combineLatest(
                stockQuantityControl.valueChanges,
                stockPriceControl.valueChanges,
            )
                .pipe(
                    filter(
                        ([stockQuanlity, stockPrice]) =>
                            stockQuanlity && stockPrice,
                    ),
                )
                .subscribe(([stockQuanlity, stockPrice]) => {
                    openingDebitControl.setValue(stockQuanlity * stockPrice);
                });
        }
    }

    setDisableState() {
        if (
            this.accountDetailType === this.accountDetailTypes.CT2 &&
            this.currentParentAccount.accGroup === AccountGroupType.Inventory
        ) {
            this.formGroup.controls.warehouseCode.disable();
        }
    }

    patchFormValue() {

        if (this.currentDetail) {
            this.formGroup.patchValue(this.currentDetail);
        } else {
            if (
                this.accountDetailType === this.accountDetailTypes.CT2 &&
                this.currentParentAccount &&
                this.currentParentAccount.accGroup ===
                AccountGroupType.Inventory
            ) {
                this.formGroup.controls.warehouseCode.setValue(
                    this.currentParentAccount.warehouseCode,
                );
            }
        }
    }

    onBlurStockUnitPrice() {
        const openingDebitControl = this._host.nativeElement.querySelector(
            '#openingDebitControl input',
        );
        if (openingDebitControl) {
            openingDebitControl.focus();
        }
    }

    show(
        type: AddAccountDetailType,
        parentData: AccountGroupDetailModel,
        data?: AccountGroupDetailModel,
    ) {
        if (parentData.duration == '')
            parentData.duration = AccountDurationType.n;

        this.currentDetail = data;
        this.accountDetailType = type;
        this.currentParentAccount = parentData;
        this.getTitle().subscribe((title) => {
            this.title = title;
        });
        this.initFormGroup();
        this.getWareHouseList();
        this.display = true;

        setTimeout(() => {
            this._host.nativeElement?.querySelector('#code')?.focus();
        });
        if (data && !data.displayDelete)
            for (const control in this.formGroup.controls) {
                const arrNotDisable = [
                    'name',
                    'duration',
                    'accGroup',
                    'classification',
                    'protected',
                ];
                if (arrNotDisable.indexOf(control) == -1)
                    this.formGroup.controls[control].disable();
            }
    }

    getWareHouseList() {
        if (
            this.currentParentAccount.accGroup ===
            this.accountGroupTypes.Inventory
        ) {
            this._warehouseService
                .getWarehouse(<Page>{
                    page: 1,
                })
                .subscribe((response) => {
                    this.wareHouses = response.data;
                    if (!this.formGroup.controls.warehouseCode.value) {
                        this.formGroup.controls.warehouseCode.setValue(
                            this.wareHouses[0].code,
                        );
                    }
                });
        }
    }

    getTitle(): Observable<string> {
        if (this.currentParentAccount.accGroup == AccountGroupType.Normal) {
            return AppUtil.translate$(
                this.translateService,
                !this.currentDetail
                    ? 'label.add_details'
                    : 'label.edit_details',
            );
        } else {
            return AppUtil.translateWithParams$(
                this.translateService,
                !this.currentDetail
                    ? 'label.add_details_number'
                    : 'label.edit_details_number',
                {
                    number: this.currentParentAccount.accGroup || '',
                    codeParent: this.currentParentAccount.code || '',
                },
            );
        }
    }

    onAddContinue() {
        this.handleAdd(true);
    }

    onCancel() {
        this.onClose.next(true);
        this.display = false;
    }

    onAdd() {
        this.handleAdd();
    }

    handleAdd(isContinue?: boolean) {
        if (this.valid) {
            let oldInternal = this.formGroup.get('isInternal').value;
            let formData = this.formGroup.getRawValue();
            formData = {
                ...formData,
                type:
                    this.accountDetailType == this.accountDetailTypes.CT1
                        ? 5
                        : 6,
                parentRef: this.currentDetail?.id
                    ? this.currentDetail.parentRef
                    : this.accountDetailType == this.accountDetailTypes.CT1
                        ? this.currentParentAccount.code
                        : this.currentParentAccount.parentRef +
                        ':' +
                        this.currentParentAccount.code,
            };

            let api$: Observable<any>;
            let emitValue = {};
            if (this.currentDetail) {
                // edit

                const data = new AccountGroupAddEditModel(this.currentDetail);
                const input = {
                    ...data,
                    ...formData,
                };
                delete input.expanded;
                api$ = this._accountGroupService.putDetail(input);
            } else {
                // add
                const data = new AccountGroupAddEditModel(
                    this.currentParentAccount,
                );
                const input = {
                    ...data,
                    id: 0,
                    ...formData,
                };
                emitValue = input;
                delete input.expanded;
                api$ = this._accountGroupService.postCreateDetail(input);
            }

            api$.pipe(filter((a) => a.status !== 400)).subscribe((_) => {
                if (isContinue) {
                    this.formGroup.patchValue({
                        ...new AccountGroupAddEditModel(),
                        warehouseCode:
                            this.currentParentAccount.accGroup ===
                                this.accountGroupTypes.Inventory &&
                                this.wareHouses?.length > 0
                                ? this.wareHouses[0].code
                                : '',
                        duration: this.currentParentAccount.duration,
                        accGroup: this.currentParentAccount.accGroup,
                        classification:
                            this.currentParentAccount.classification,
                        protected: this.currentParentAccount.protected,
                        stockUnit: undefined,
                    });
                    this.codeAuto(oldInternal);
                } else {
                    this.display = false;
                    this.updateSuccessfull.emit(emitValue);
                }

                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.update',
                    ),
                });
            });
        } else {
            this.formGroup?.markAllAsTouched();
        }
    }

    onChangeAccountDetail(): void {
        if (!this.currentDetail?.id) {
            const request = {
                id: 0,
                code: this.formGroup.value.code,
                name: '',
                openingDebit: 0,
                openingCredit: 0,
                arisingDebit: 0,
                arisingCredit: 0,
                isForeignCurrency: true,
                openingForeignDebit: 0,
                openingForeignCredit: 0,
                arisingForeignDebit: 0,
                arisingForeignCredit: 0,
                duration: '',
                currency: '',
                exchangeRate: 0,
                accGroup: 0,
                classification: 0,
                protected: 0,
                type: 0,
                hasChild: true,
                hasDetails: true,
                parentRef:
                    this.accountDetailType === AddAccountDetailType.CT1
                        ? this.currentParentAccount?.code
                        : this.accountDetailType === AddAccountDetailType.CT2
                            ? `${this.currentParentAccount?.parentRef}:${this.currentParentAccount?.code}`
                            : '',
            };
            this._accountGroupService
                .validateExistingAccountDetail(request)
                .subscribe((response) => {
                    if (response.message) {
                        if (response.code === 'ACCOUNT_EXIST') {
                            this._isConfirmationService.confirm({
                                confirmation: {
                                    header: AppUtil.translate(
                                        this.translateService,
                                        'label.add_account',
                                    ),
                                    icon: 'pi pi-exclamation-triangle',
                                    acceptLabel: AppUtil.translate(
                                        this.translateService,
                                        'label.yes',
                                    ),
                                    message: response.message,
                                    rejectVisible: false,
                                    accept: () => {
                                        this.formGroup.controls.code.setValue(
                                            null,
                                        );
                                        this._host.nativeElement
                                            .querySelector('#code')
                                            .focus();
                                    },
                                },
                            });
                        }
                    } else {
                        this.formGroup.controls.name.setValue(
                            response?.data?.name,
                        );
                        this._host.nativeElement
                            .querySelector('#name')
                            ?.focus();
                    }
                });
        }
    }

    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        if (!this.display) return;

        switch (event.key) {
            case 'F8':
                this.codeInputTmp?.nativeElement?.focus();
                event.preventDefault();
                await this.onAdd();
                break;
            case 'F9':
                event.preventDefault();
                this.onCancel();
                break;
            case 'F10':
                this.codeInputTmp?.nativeElement?.focus();
                event.preventDefault();
                this.onAddContinue();
                break;
        }
    }
}
