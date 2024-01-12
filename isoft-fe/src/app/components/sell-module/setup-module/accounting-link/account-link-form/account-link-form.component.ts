import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { Dropdown } from 'primeng/dropdown';
import { AccountLinkService } from 'src/app/service/account-link.service';
import { BranchService } from 'src/app/service/branch.service';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';

@Component({
    selector: 'app-account-link-form',
    templateUrl: './account-link-form.component.html',
})
export class AccountLinkFormComponent implements OnInit {
    public appConstant = AppConstant;
    @Input('formData') formData: any = {};
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Input('creditAccounts') creditAccounts;
    @Output() onCancel = new EventEmitter();
    title: string = '';

    accountLinkForm: FormGroup = new FormGroup({});

    isSubmitted = false;
    isInvalidForm = false;
    failPassword: boolean = false;

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private accountLinkService: AccountLinkService,
        private chartOfAccount: ChartOfAccountService,
    ) {
        this.accountLinkForm = this.fb.group({
            name: [''],
            account: [''],
            detail1: [''],
            detail2: [''],
            code: [''],
            accountName: [''],
            detailName1: [''],
            detailName2: [''],
            id: [null],
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (
            this.isEdit &&
            this.formData &&
            Object.keys(this.formData).length > 0
        ) {
            this.title = AppUtil.translate(
                this.translateService,
                'label.edit_accounting_link',
            );
            const data = this.formData;
            this.accountLinkForm.setValue({
                name: this.formData.name,
                account: this.formData.account,
                detail1: this.formData.detail1,
                detail2: this.formData.detail2,
                code: this.formData.code,
                accountName: this.formData.accountName,
                detailName1: this.formData.detailName1,
                detailName2: this.formData.detailName2,
                id: this.formData.id,
            });
            if (data.account) {
                this.chooseCreditCode(
                    {
                        value: data.account,
                    },
                    true,
                );
            }
            if (data.detail1) {
                this.chooseDetail1({ value: data.detail1 }, true);
            }
        }
    }

    onReset() {
        this.isInvalidForm = false;
        this.accountLinkForm.reset();
    }

    ngOnInit() {}

    checkValidValidator(fieldName: string) {
        return ((this.accountLinkForm.controls[fieldName].dirty ||
            this.accountLinkForm.controls[fieldName].touched) &&
            this.accountLinkForm.controls[fieldName].invalid) ||
            (this.isInvalidForm &&
                this.accountLinkForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.accountLinkForm.controls[fieldNames[i]].dirty ||
                    this.accountLinkForm.controls[fieldNames[i]].touched) &&
                    this.accountLinkForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.accountLinkForm.controls[fieldNames[i]].invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.accountLinkForm.invalid) {
            this.messageService.add({
                severity: 'error',
                detail: AppUtil.translate(
                    this.translateService,
                    'info.please_check_again',
                ),
            });
            this.isInvalidForm = true;
            this.isSubmitted = false;
            return;
        }

        let newData = this.cleanObject(
            AppUtil.cleanObject(this.accountLinkForm.value),
        );

        if (newData.account) {
            let item = this.creditAccounts.find(
                (item) => item.code == newData.account,
            );
            newData.accountName = item.name;
        }
        if (newData.detail1) {
            let item = this.listDetail1.find(
                (item) => item.code == newData.detail1,
            );
            newData.detailName1 = item.name;
        }
        if (newData.detail2) {
            let item = this.listDetail2.find(
                (item) => item.code == newData.detail2,
            );
            newData.detailName2 = item.name;
        }
        // newData.detail1 ? newData.detail1Name = this.listDetail1.find(item => item.code == newData.debit1).name : '';
        // newData.detail2 ? newData.detail2Name = this.listDetail2.find(item => item.code == newData.debit2).name : '';
        this.accountLinkService.updateAccount(newData).subscribe((res: any) => {
            if (res?.code === 400) {
                this.messageService.add({
                    severity: 'error',
                    detail: res?.msg || '',
                });
                return;
            } else {
                this.onCancel.emit({});
                this.messageService.add({
                    severity: 'success',
                    detail: 'Cập nhật thành công',
                });
            }
        });
    }

    onBack() {
        this.onCancel.emit({});
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
        }
        return newData;
    }

    //copy

    data: any = [];
    creditCode: any;
    detail1: any;
    detail2: any;
    listDetail1: any[] = [];
    listDetail2: any[] = [];
    @ViewChild('creditDetailCodeFirst') creditDetailCodeFirst: Dropdown;
    @ViewChild('creditDetailCodeSecond') creditDetailCodeSecond: Dropdown;

    chooseCreditCode(event, isEdit) {
        if (!event.value) {
            return;
        }
        const id = this.accountLinkForm.get('account').value;
        this.chartOfAccount.getDetail(id).subscribe((res) => {
            this.listDetail1 = res.data;
            if (!isEdit) {
                if (this.listDetail1.length > 0) {
                    setTimeout(() => {
                        this.creditDetailCodeFirst.focus();
                        this.creditDetailCodeFirst.show();
                    }, 100);
                }
            }
        });
    }
    clearCreditCode(event) {
        this.listDetail1 = [];
    }

    chooseDetail1(event, isEdit?) {
        if (!event.value) {
            return;
        }
        const item = this.listDetail1.find((item) => item.code == event.value);
        this.data.detail1 = item;
        const id =
            this.accountLinkForm.get('account').value +
            ':' +
            this.accountLinkForm.get('detail1').value;
        this.chartOfAccount.getDetail(id).subscribe((res) => {
            this.listDetail2 = res.data;
            if (!isEdit) {
                if (this.listDetail2.length > 0) {
                    setTimeout(() => {
                        this.creditDetailCodeSecond.focus();
                        this.creditDetailCodeSecond.show();
                    }, 100);
                }
            }
        });
    }

    clearDetail1(event) {
        this.listDetail2 = [];
    }

    chooseDetail2(event) {
        if (!event.value) {
            return;
        }
        const item = this.detail2.find((item) => item.code == event.value);
        this.data['detail2'] = item;
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F8':
                event.preventDefault();
                await this.onSubmit();
                break;
            case 'F6':
                event.preventDefault();
                this.onCancel.emit({});
                break;
        }
    }
}
