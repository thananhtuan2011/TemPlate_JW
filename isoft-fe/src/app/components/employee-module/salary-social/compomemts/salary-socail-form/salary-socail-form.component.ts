import {
    Component,
    EventEmitter,
    HostListener,
    Injector,
    Input,
    OnInit,
    Output,
    Renderer2,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import { SalarySocailService } from 'src/app/service/salary-socail.service';
import AppConstant from 'src/app/utilities/app-constants';
import { CaseService } from 'src/app/service/case.service';
import { AutoComplete } from 'primeng/autocomplete';
import { BaseAccountComponent } from 'src/app/shared/components/BaseAccountComponent';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';

@Component({
    selector: 'app-salary-socail-form',
    templateUrl: './salary-socail-form.component.html',
    styleUrls: ['app-salary-socail-form.component.scss'],
})
export class SalarySocailFormComponent
    extends BaseAccountComponent
    implements OnInit
{
    id = 0;
    appConstant = AppConstant;
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
                this.onSubmit();
                break;
            case 'F6':
                event.preventDefault();
                this.goBack();
                break;
        }
    }

    constructor(
        private readonly salarSocialService: SalarySocailService,
        private readonly caseService: CaseService,
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

    ngOnInit(): void {
        this.getAllByDisplayInsert();
        this.buildForm();
        if (!this.isNew) {
            this.getDetail((res) => {
                this.buildData(res.data);
            }, this.id);
        }
    }

    getDetail(callback, id) {
        this.salarSocialService.getDetail(id).subscribe((response: any) => {
            callback(response);
        });
    }

    get isNew() {
        return this.id === 0;
    }

    get validation() {
        if (
            this.isDebitDetailCodeFirstHasDetails &&
            !this.isDebitDetailCodeSecondHas
        )
            return false;
        if (this.isDebitCodeHasDetails && !this.isDebitDetailCodeFirstHas)
            return false;
        return this.f.valid;
    }

    buildForm() {
        this.form = this.fb.group({
            id: [''],
            code: ['', [Validators.required]],
            name: ['', [Validators.required]],
            valueCompany: [''],
            valueUser: [''],
            debitCode: [''],
            debitDetailCodeFirst: [''],
            debitDetailCodeSecond: [''],
            creditCode: [''],
            creditDetailCodeFirst: [''],
            creditDetailCodeSecond: [''],
            order: [''],
        });
    }

    buildData(data: any) {
        if (!data) return;
        this.f.patchValue({
            id: data.id,
            code: data.code,
            name: data.name,
            valueCompany: data.valueCompany,
            valueUser: data.valueUser,
            debitCode: data?.debit || '',
            debitDetailCodeFirst: data?.debitFirst || '',
            debitDetailCodeSecond: data?.debitSecond || '',
            creditCode: data?.credit || '',
            creditDetailCodeFirst: data?.creditFirst || '',
            creditDetailCodeSecond: data?.creditSecond || '',
            order: data.order,
        });
    }

    onSubmit() {
        if (!this.validation) {
            return;
        }
        let input = this.cleanObject(this.f.value);
        this.salarSocialService.UpadateSalarySocial(input).subscribe((res) => {
            this.goBack();
        });
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
        }
        newData.id = parseInt(newData.id) || 0;
        newData.code = newData.code || '';
        newData.name = newData.name || '';
        newData.valueCompany = parseFloat(newData.valueCompany) || 0;
        newData.valueUser = parseFloat(newData.valueUser) || 0;
        newData.order = parseInt(newData.order) || 0;
        return {
            ...newData,
            accountDebit: newData?.debitCode?.code || '',
            accountCredit: newData?.creditCode?.code || '',
            detailDebit1: newData?.debitDetailCodeFirst?.code || '',
            detailDebit2: newData?.debitDetailCodeSecond?.code || '',
            detailCredit1: newData?.creditDetailCodeFirst?.code || '',
            detailCredit2: newData?.creditDetailCodeSecond?.code || '',
        };
    }

    goBack() {
        this.router.navigate(['/uikit/salarySocial']);
    }
}
