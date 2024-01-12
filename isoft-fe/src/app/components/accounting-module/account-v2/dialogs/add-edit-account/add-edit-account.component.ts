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
import { ConfirmationService } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { AppComponentBase } from 'src/app/app-component-base';
import { AppMainComponent } from 'src/app/layouts/app.main.component';
import {
    AccountClassificationList,
    AccountClassificationType,
    AccountDurationList,
    AccountDurationType,
    AccountGroupAddEditModel,
    AccountGroupDetailModel,
    AccountGroupList,
    AccountGroupType,
    AccountProtectedList,
    AccountProtectedType,
} from 'src/app/models/account-group.model';
import { AccountGroupService } from 'src/app/service/account-group.service';
import { IsConfirmationType } from 'src/app/shared/is-confirmation/is-comfirmation.model';
import { IsConfirmationService } from 'src/app/shared/is-confirmation/is-comfirmation.service';
import AppUtil from 'src/app/utilities/app-util';
import { AccountType } from '../../account.model';

@Component({
    selector: 'add-edit-account',
    templateUrl: './add-edit-account.component.html',
    styles: [],
})
export class AddEditAccountComponent
    extends AppComponentBase
    implements OnInit
{
    @Input() accountType: AccountType;
    @Output() updateSuccessfull = new EventEmitter();
    @Output('onClose') onClose = new EventEmitter<boolean>();

    title = '';
    display = false;
    formGroup: FormGroup;
    accountTypes = AccountType;
    durationList = AccountDurationList;
    groupList = AccountGroupList;
    classificationList = AccountClassificationList;
    protectedList = AccountProtectedList;
    currentAccount: AccountGroupDetailModel;
    parent: AccountGroupDetailModel;

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
        private _injector: Injector,
        private _host: ElementRef,
    ) {
        super(_injector);
    }

    ngOnInit() {}

    initFormGroup() {
        this.formGroup =
            this.accountType === AccountType.HT
                ? this._fb.group({
                      code: this._fb.control(null, [
                          Validators.required,
                          Validators.minLength(3),
                          Validators.maxLength(6),
                      ]),
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
                      duration: this._fb.control(null, [Validators.required]),
                      accGroup: this._fb.control(null, [Validators.required]),
                      classification: this._fb.control(null, [
                          Validators.required,
                      ]),
                      protected: this._fb.control(null, [Validators.required]),
                  })
                : this._fb.group({
                      code: this._fb.control(null, [
                          Validators.required,
                          Validators.minLength(3),
                          Validators.maxLength(6),
                      ]),
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
                      duration: this._fb.control(null, [Validators.required]),
                      accGroup: this._fb.control(null, [Validators.required]),
                      classification: this._fb.control(null, [
                          Validators.required,
                      ]),
                      protected: this._fb.control(null, [Validators.required]),
                  });

        this.subsribeIsForeignCurrency();
    }

    subsribeIsForeignCurrency() {
        this.formGroup.controls.isForeignCurrency.valueChanges.subscribe(
            (value) => {
                if (this.accountType === AccountType.HT) {
                    if (value) {
                        this.formGroup.controls.openingForeignCredit.enable();
                        this.formGroup.controls.openingForeignDebit.enable();
                    } else {
                        this.formGroup.controls.openingForeignCredit.disable();
                        this.formGroup.controls.openingForeignDebit.disable();
                    }
                } else {
                    if (value) {
                        this.formGroup.controls.openingForeignCreditNb.enable();
                        this.formGroup.controls.openingForeignDebitNb.enable();
                    } else {
                        this.formGroup.controls.openingForeignCreditNb.disable();
                        this.formGroup.controls.openingForeignDebitNb.disable();
                    }
                }
            },
        );
    }

    show(data?: AccountGroupDetailModel, parent?: AccountGroupDetailModel) {
        if (data !== undefined && data !== null && data?.duration == '')
            data.duration = AccountDurationType.n;

        this.parent = parent;
        this.initFormGroup();
        this.display = true;
        this.currentAccount = data;
        if (data && !data?.displayDelete) {
            for (const control in this.formGroup.controls) {
                if (
                    ![
                        'name',
                        'duration',
                        'accGroup',
                        'classification',
                        'protected',
                        'isForeignCurrency',
                    ].includes(control)
                )
                    this.formGroup.controls[control].disable();
            }
        }

        if (this.currentAccount) {
            this.title = parent
                ? 'label.edit_details_number'
                : 'label.edit_account';
            this.formGroup.patchValue({
                ...data,
                protected: data.protected
                    ? data.protected
                    : AccountProtectedType.Debit,
            });
        } else {
            this.title = parent
                ? 'label.add_details_number'
                : 'label.add_account';
            this.formGroup.patchValue({
                duration: AccountDurationType.n,
                accGroup: AccountGroupType.Normal,
                classification: AccountClassificationType.Normal,
                protected: AccountProtectedType.Debit,
            });
        }

        setTimeout(() => {
            this._host.nativeElement.querySelector('#code')?.focus();
        });
    }

    onAddContinue(event: any) {
        this.handleAddAccount(event, true);
    }

    onCancel() {
        this.display = false;
        this.onClose.next(true);
    }

    onAdd(event: any) {
        this.handleAddAccount(event);
    }

    handleAddAccount(event: any, isContinue?: boolean) {
        if (this.valid) {
            this.addAccount(isContinue);
        } else {
            this.formGroup?.markAllAsTouched();
        }
    }

    addAccount(isContinue?: boolean) {
        let formData = this.formGroup.getRawValue();

        formData = {
            ...formData,
            type: formData.code.toString().length - 2,
        };

        let api$: Observable<any>;
        let emitValue = {};
        if (this.currentAccount) {
            const data = new AccountGroupAddEditModel(this.currentAccount);
            const input = {
                ...data,
                ...formData,
            };
            api$ = this._accountGroupService.putAccount(input);
        } else {
            const data = new AccountGroupAddEditModel();
            const input = {
                ...data,
                ...formData,
            };
            emitValue = input;
            api$ = this._accountGroupService.postCreateAccount(input);
        }

        api$.subscribe((response) => {
            if (response.status === 200) {
                if (isContinue) {
                    this.formGroup.reset();
                    this.formGroup.patchValue({
                        isForeignCurrency: false,
                        duration: AccountDurationType.n,
                        accGroup: AccountGroupType.Normal,
                        classification: AccountClassificationType.Normal,
                        protected: AccountProtectedType.Debit,
                    });
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
            }
        });
    }

    onBlurCode() {
        const code =
            this.formGroup.controls.code.valid &&
            this.formGroup.controls.code.value.trim();
        if (!this.currentAccount && code) {
            this._accountGroupService
                .validateExistingAccount(code)
                .subscribe((response) => {
                    if (response.message) {
                        if (!response.code) {
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
                                    rejectLabel: AppUtil.translate(
                                        this.translateService,
                                        'label.no',
                                    ),
                                    message: response.message,
                                    accept: () => {
                                        this.formGroup.controls.name.setValue(
                                            null,
                                        );
                                        this._host.nativeElement
                                            .querySelector('#name')
                                            .focus();
                                    },
                                    reject: () => {
                                        this.formGroup.controls.code.setValue(
                                            null,
                                        );
                                        this._host.nativeElement
                                            .querySelector('#code')
                                            .focus();
                                    },
                                },
                            });
                        } else if (response.code === 'ACCOUNT_EXIST') {
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
                            response.data.name,
                        );
                        this._host.nativeElement.querySelector('#name').focus();
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
                this.onAdd(event);
                break;
            case 'F9':
                event.preventDefault();
                this.onCancel();
                break;
            case 'F10':
                this.codeInputTmp?.nativeElement?.focus();
                event.preventDefault();
                this.onAddContinue(event);
                break;
        }
    }
}
