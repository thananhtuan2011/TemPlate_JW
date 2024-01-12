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
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { MessageService } from 'primeng/api';
import { AutoComplete } from 'primeng/autocomplete';
import { TypeData } from 'src/app/models/common.model';
import { Position } from 'src/app/models/document.model';
import { CaseService } from 'src/app/service/case.service';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import { DepartmentService } from 'src/app/service/department.service';
import { PositionService } from 'src/app/service/position.service';
import { ToolsFixedAssetsService } from 'src/app/service/tools-fixed-assets.service';
import { PageFilterUser, UserService } from 'src/app/service/user.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppData from 'src/app/utilities/app-data';
import AppUtil from 'src/app/utilities/app-util';
import { ActivatedRoute } from '@angular/router';
import { AssetsFixed242Service } from '../../../../service/assets-fixed-242.service';
import { th } from 'date-fns/locale';

@Component({
    selector: 'app-tools-fixed-assets-form',
    templateUrl: './tools-fixed-assets-form.component.html',
    styles: [
        `
            :host ::ng-deep {
                #phonePrefix .p-dropdown {
                    width: 93px;
                }
                .p-calendar {
                    width: 100%;
                }
            }
        `,
    ],
})
export class ToolsFixedAssetsFormComponent implements OnInit {
    isPageUse = false;
    public appConstant = AppConstant;
    // @Input('types') types: any = {};
    @Input('formData') formData: any = {};
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Input('types') types: any;
    @Output() onCancel = new EventEmitter();
    title: string = '';

    PositionDetailForm: FormGroup = new FormGroup({});

    optionCountries = AppData.COUNTRIES;
    countryCodes: any[] = [];

    isSubmitted = false;
    isInvalidForm = false;
    failPassword: boolean = false;
    pendingRequest: any;
    public getParams: PageFilterUser = {
        page: 1,
        pageSize: 100,
        sortField: 'id',
        isSort: true,
        searchText: '',
    };
    positions: Position[] = [];

    listDepreciation = [
        { id: 1, name: 'Còn khấu hao' },
        { id: 0, name: 'Hết khấu hao' },
    ];
    detail1 = [];
    detail2 = [];
    listDepartment = [];

    users: any[] = [];

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private activatedRoute: ActivatedRoute,
        private readonly chartOfAccount: ChartOfAccountService,
        private readonly userService: UserService,
        private readonly departmentService: DepartmentService,
        private readonly chartOfAccountService: ChartOfAccountService,
        private readonly toolFixedAssetsService: ToolsFixedAssetsService,
        private assetsFixed242Service: AssetsFixed242Service,
    ) {
        this.PositionDetailForm = this.fb.group({
            creditCode: [null, Validators.required],
            creditDetailCodeFirst: [null],
            creditDetailCodeSecond: [null],
            buyDate: [null],
            usedDate: [null],
            quantity: [null],
            historicalCost: [null],
            totalMonth: [null],
            departmentId: [null],
            userId: [null],
            use: [1],
            name: [''],
            unitPrice: [0],
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
                'label.tools_fixed_assets_edit',
            );
            this.PositionDetailForm.patchValue({
                id: this.formData.id,
                creditCode: this.formData.creditCode,
                creditDetailCodeFirst: this.formData.creditDetailCodeFirst,
                creditDetailCodeSecond: this.formData.creditDetailCodeSecond,
                buyDate: new Date(this.formData.buyDate),
                usedDate: new Date(this.formData.usedDate),
                historicalCost: this.formData.historicalCost,
                totalMonth: this.formData.totalMonth,
                departmentId: this.formData.departmentId,
                userId: this.formData.userId,
                use: this.formData.use,
                unitPrice: this.formData.unitPrice,
                quantity: this.formData.quantity,
            });
            this.onChangeCreditDebit(
                { value: `${this.PositionDetailForm.value.creditCode}` },
                'debit',
                true,
            );
            this.onChangeCreditDebit(
                {
                    value: `${this.PositionDetailForm.value.creditCode}:${this.PositionDetailForm.value.creditDetailCodeFirst}`,
                },
                'debit1',
                true,
            );
        } else {
            this.title = AppUtil.translate(
                this.translateService,
                'label.tools_fixed_assets_add',
            );
        }
    }

    onReset() {
        this.isInvalidForm = false;
        this.PositionDetailForm.reset();
    }

    ngOnInit() {
        this.isPageUse = this.activatedRoute.snapshot.data.isPageUse;
        this.countryCodes = AppUtil.getCountries();
        this.getAllUserActive();
        this.getAllDepartments();
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.PositionDetailForm.invalid) {
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
            AppUtil.cleanObject(this.PositionDetailForm.value),
        );

        if (this.formData.id) {
            newData.id = this.formData.id;
        }

        newData.buyDate = newData.buyDate
            ? moment(newData.buyDate).format(
                  this.appConstant.FORMAT_DATE.T_DATE,
              )
            : newData.buyDate;
        newData.usedDate = newData.usedDate
            ? moment(newData.usedDate).format(
                  this.appConstant.FORMAT_DATE.T_DATE,
              )
            : newData.usedDate;

        if (this.isEdit) {
            const api = this.activatedRoute.snapshot.data.isPageUse
                ? this.assetsFixed242Service.fixedAssets242Update(
                      newData.id,
                      newData,
                  )
                : this.toolFixedAssetsService.updateToolFixedAssets(newData);
            api.subscribe(
                (res: any) => {
                    if (res?.code === 400) {
                        this.messageService.add({
                            severity: 'error',
                            detail: res?.msg || '',
                        });
                        return;
                    } else {
                        this.onCancel.emit({});
                    }
                },
                (err) => {
                    this.onCancel.emit({});
                },
            );
        } else {
            const api = this.activatedRoute.snapshot.data.isPageUse
                ? this.assetsFixed242Service.fixedAssets242Update(
                      newData.id || 0,
                      newData,
                  )
                : this.toolFixedAssetsService.createToolFixedAssets(newData);
            api.subscribe((res: any) => {
                if (res?.code === 400) {
                    this.messageService.add({
                        severity: 'error',
                        detail: res?.msg || '',
                    });
                    return;
                } else {
                    this.onCancel.emit({});
                }
            });
        }
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
        }
        return newData;
    }

    // getListCreditAccount() {
    //     const query = { classification: [4, 5] }
    //     this.chartOfAccount.getAllClassification(query).subscribe((res: any) => {
    //         this.creditAccounts = res;
    //     })
    // }

    getAllUserActive() {
        this.userService.getAllUserActive().subscribe((res: any) => {
            this.users = res.data;
        });
    }

    getAllDepartments() {
        this.departmentService
            .getAllDepartment()
            .subscribe((res) => (this.listDepartment = res.data));
    }

    // copy
    // ------------------- Chart of account events ------------------
    filteredDebitNames: any[] = [];
    debits1: any[] = [];
    filteredDebit1Names: any[] = [];
    debits2: any[] = [];
    filteredDebit2Names: any[] = [];

    selectedDebit: any = {};
    selectedDebit1: any = {};
    selectedDebit2: any = {};

    @ViewChild('debit') public vcDebit: AutoComplete;
    @ViewChild('debit1') vcDebit1: AutoComplete;
    @ViewChild('debit2') vcDebit2: AutoComplete;

    getChartOfAccountDetails(accountCode, type, isInit = false) {
        if (type === 'debit2') {
            this.selectedDebit2 = this.getCreditDebitObject(
                accountCode,
                'debit2',
            );
        }
        this.chartOfAccountService
            .getDetail(accountCode)
            .subscribe((res: any) => {
                switch (type) {
                    case 'debit':
                        this.debits1 = res.data;
                        this.selectedDebit = this.getCreditDebitObject(
                            accountCode,
                            'debit',
                        );
                        if (!isInit) this.onFocus(this.vcDebit1);
                        break;
                    case 'debit1':
                        this.debits2 = res.data;
                        this.selectedDebit1 = this.getCreditDebitObject(
                            accountCode,
                            'debit1',
                        );
                        if (!isInit) this.onFocus(this.vcDebit2);
                        break;
                }
            });
    }

    onFocus(dataBinding) {
        setTimeout(() => {
            dataBinding.focusInput();
        }, 200);
    }

    getCreditDebitObject(code, type) {
        console.log(type);
        switch (type) {
            case 'debit':
                return this.types.creditAccounts.find((x) => x.code === code);
            case 'debit1':
                return this.debits1.find((x) => x.code === code);
            case 'debit2':
                return this.debits2.find((x) => x.code === code);
        }
    }

    onDebitSelect(event) {
        if (event.includes('|')) {
            this.PositionDetailForm.controls['creditCode'].setValue(
                event.split('|')[0].trim(),
            );
            this.onChangeCreditDebit(
                { value: event.split('|')[0].trim() },
                'debit',
            );
        }
    }

    filterDebitName(event) {
        let filtered: any[] = [];
        let query = event.query;
        for (let i = 0; i < this.types.creditAccounts.length; i++) {
            if (
                this.types.creditAccounts[i].code
                    .toLowerCase()
                    .includes(query.toLowerCase())
            ) {
                filtered.push(
                    `${this.types.creditAccounts[i].code} | ${this.types.creditAccounts[i].name}`,
                );
            }
        }
        this.filteredDebitNames = filtered;
    }

    onDebit1Select(event) {
        if (event.includes('|')) {
            this.PositionDetailForm.controls['creditDetailCodeFirst'].setValue(
                event.split('|')[0].trim(),
            );
            this.onChangeCreditDebit(
                {
                    value: `${this.selectedDebit.code}:${event
                        .split('|')[0]
                        .trim()}`,
                },
                'debit1',
            );
        }
    }

    filterDebit1Name(event) {
        let filtered: any[] = [];
        let query = event.query;
        for (let i = 0; i < this.debits1.length; i++) {
            if (
                this.debits1[i].code.toLowerCase().includes(query.toLowerCase())
            ) {
                filtered.push(
                    `${this.debits1[i].code} | ${this.debits1[i].name}`,
                );
            }
        }
        this.filteredDebit1Names = filtered;
    }

    onDebit2Select(event) {
        if (event.includes('|')) {
            this.PositionDetailForm.controls['creditDetailCodeSecond'].setValue(
                event.split('|')[0].trim(),
            );
            this.onChangeCreditDebit(
                { value: event.split('|')[0].trim() },
                'debit2',
            );
        }
    }

    filterDebit2Name(event) {
        let filtered: any[] = [];
        let query = event.query;
        for (let i = 0; i < this.debits2.length; i++) {
            if (
                this.debits2[i].code.toLowerCase().includes(query.toLowerCase())
            ) {
                filtered.push(
                    `${this.debits2[i].code} | ${this.debits2[i].name}`,
                );
            }
        }
        this.filteredDebit2Names = filtered;
    }

    onChangeCreditDebit(event, type, isInit?) {
        // case exist value
        if (event && event.value) {
            this.getChartOfAccountDetails(event.value, type, isInit);
        }
        // set default (reset form data)
        else {
            switch (type) {
                case 'debit':
                    this.setEmptyData('creditCode');
                    this.setEmptyData('creditDetailCodeFirst');
                    this.setEmptyData('creditDetailCodeSecond');
                    this.selectedDebit = {};
                    this.selectedDebit1 = {};
                    this.selectedDebit2 = {};
                    this.debits1 = [];
                    this.debits2 = [];
                    break;
                case 'debit1':
                    this.setEmptyData('creditDetailCodeFirst');
                    this.setEmptyData('creditDetailCodeSecond');
                    this.selectedDebit1 = {};
                    this.selectedDebit2 = {};
                    this.debits2 = [];
                    break;
                case 'debit2':
                    this.setEmptyData('creditDetailCodeSecond');
                    this.selectedDebit2 = {};
                    break;
            }
        }
    }

    setEmptyData(columnName) {
        this.PositionDetailForm.controls[columnName].setValue('');
    }

    checkValidValidator(fieldName: string) {
        return ((this.PositionDetailForm.controls[fieldName]?.dirty ||
            this.PositionDetailForm.controls[fieldName]?.touched) &&
            this.PositionDetailForm.controls[fieldName]?.invalid) ||
            (this.isInvalidForm &&
                this.PositionDetailForm.controls[fieldName]?.invalid)
            ? 'ng-invalid ng-dirty'
            : '';
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
