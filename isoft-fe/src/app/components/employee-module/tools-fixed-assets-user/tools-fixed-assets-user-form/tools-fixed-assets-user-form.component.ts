import {
    Component,
    HostListener,
    Injector,
    OnInit,
    Renderer2,
    ViewChild,
} from '@angular/core';
import AppConstant from '../../../../utilities/app-constants';
import { FormBuilder, Validators } from '@angular/forms';
import AppData from '../../../../utilities/app-data';
import { PageFilterUser, UserService } from '../../../../service/user.service';
import { Position } from '../../../../models/document.model';
import { MessageService } from 'primeng/api';
import { ChartOfAccountService } from '../../../../service/chart-of-account.service';
import { DepartmentService } from '../../../../service/department.service';
import { BranchService } from '../../../../service/branch.service';
import AppUtil from '../../../../utilities/app-util';
import * as moment from 'moment/moment';
import { AutoComplete } from 'primeng/autocomplete';
import { AssetsFixedUserService } from '../../../../service/assets-fixed-user.service';
import { BaseAccountComponent } from 'src/app/shared/components/BaseAccountComponent';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';

@Component({
    selector: 'app-tools-fixed-assets-user-form',
    templateUrl: './tools-fixed-assets-user-form.component.html',
    styleUrls: ['tools-fixed-assets-user-form.component.scss'],
})
export class ToolsFixedAssetsUserFormComponent
    extends BaseAccountComponent
    implements OnInit
{
    id = 0;
    optionCountries = AppData.COUNTRIES;
    countryCodes: any[] = [];
    failPassword: boolean = false;
    pendingRequest: any;
    getParams: PageFilterUser = {
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
    listDepartment = [];
    listBranch = [];
    users: any[] = [];
    @ViewChild('debitCodeTmp') debitCodeTmp: AutoComplete;
    @ViewChild('debitDetailCodeFirstTmp') debitDetailCodeFirstTmp: AutoComplete;
    @ViewChild('debitDetailCodeSecondTmp')
    debitDetailCodeSecondTmp: AutoComplete;
    @ViewChild('creditCodeTmp') creditCodeTmp: AutoComplete;
    @ViewChild('creditDetailCodeFirstTmp')
    creditDetailCodeFirstTmp: AutoComplete;
    @ViewChild('creditDetailCodeSecondTmp')
    creditDetailCodeSecondTmp: AutoComplete;
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
            case 'F10':
                event.preventDefault();
                this.goBack();
                break;
        }
    }
    constructor(
        private readonly messageService: MessageService,
        private readonly userService: UserService,
        private readonly departmentService: DepartmentService,
        private readonly assetsFixedUserService: AssetsFixedUserService,
        private readonly branchService: BranchService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        fb: FormBuilder,
        chartOfAccountService: ChartOfAccountService,
        renderer: Renderer2,
        injector: Injector,
    ) {
        super(fb, chartOfAccountService, renderer, injector);
        this.id = Number(
            this.activatedRoute?.snapshot?.paramMap?.get('id') || 0,
        );
    }

    ngOnInit() {
        this.countryCodes = AppUtil.getCountries();
        this.buildForm();
        if (!this.isNew) {
            this.getDetail((data) => {
                this.buildDataForm(data);
            }, this.id);
        }
        this.getListCreditAccount();
        this.getAllUserActive();
        this.getAllDepartments();
        this.getBranches();
    }

    get validation() {
        if (
            this.isCreditDetailCodeFirstHasDetails &&
            !this.isCreditDetailCodeSecondHas
        )
            return false;
        if (this.isCreditCodeHasDetails && !this.isCreditDetailCodeFirstHas)
            return false;
        return this.f.valid;
    }

    get isNew() {
        return this.id === 0;
    }

    goBack() {
        this.router.navigate(['/uikit/fixed-assets-user']);
    }

    onSubmit() {
        if (!this.validation) {
            return;
        }
        let input = {
            ..._.cloneDeep(this.f.value),
            creditCode: this.fc['creditCode']?.value?.code || '',
            creditDetailCodeFirst:
                this.fc['creditDetailCodeFirst']?.value?.code || '',
            creditDetailCodeSecond:
                this.fc['creditDetailCodeSecond']?.value?.code || '',
        };
        input.usedDate = input.usedDate
            ? moment(input.usedDate).format(AppConstant.FORMAT_DATE.T_DATE)
            : input.usedDate;
        input.liquidationDate = input.liquidationDate
            ? moment(input.liquidationDate).format(
                  AppConstant.FORMAT_DATE.T_DATE,
              )
            : input.liquidationDate;
        let $api = this.isNew
            ? this.assetsFixedUserService.createFixedAssetUsers(input)
            : this.assetsFixedUserService.updateFixedAssetUsers(this.id, input);
        $api.subscribe((res) => {
            if (res?.code === 400) {
                this.messageService.add({
                    severity: 'error',
                    detail: res?.msg || '',
                });
            } else {
                this.goBack();
            }
        });
    }

    private getDetail(callback, id) {
        this.assetsFixedUserService.getByIdV2(id).subscribe((response: any) => {
            callback(response);
        });
    }

    private getListCreditAccount() {
        this.chartOfAccountService
            .getAllClassification({ classification: [4, 5] })
            .subscribe((res: any) => {
                this.chartOfAccounts = res;
            });
    }

    private buildForm() {
        this.form = this.fb.group({
            id: [this.id],
            creditCode: [null, Validators.required],
            creditDetailCodeFirst: [null],
            creditDetailCodeSecond: [null],
            usedDate: [null],
            historicalCost: [null],
            totalMonth: [null],
            departmentId: [null],
            userId: [null],
            use: [1],
            name: [''],
            usedCode: [''],
            liquidationDate: [null],
            branchId: [null],
            note: [null],
        });
    }

    private buildDataForm(data: any) {
        if (!data) return;
        this.f.patchValue({
            id: data.id,
            creditCode: data.credit,
            creditDetailCodeFirst: data.creditDetailFirst,
            creditDetailCodeSecond: data.creditDetailSecond,
            usedDate: new Date(data.usedDate),
            liquidationDate: new Date(data.liquidationDate),
            historicalCost: data.historicalCost,
            totalMonth: data.totalMonth,
            departmentId: data.departmentId,
            userId: data.userId,
            use: data.use,
            note: data.note,
        });
    }

    private getAllUserActive() {
        this.userService.getAllUserActive().subscribe((res: any) => {
            this.users = res.data;
        });
    }

    private getAllDepartments() {
        this.departmentService
            .getAllDepartment()
            .subscribe((res) => (this.listDepartment = res.data));
    }

    private getBranches() {
        this.branchService.getAllBranch().subscribe((res) => {
            this.listBranch = res?.data || [];
        });
    }
}
