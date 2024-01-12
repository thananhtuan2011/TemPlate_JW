import {
    Component,
    HostListener,
    Injector,
    OnInit,
    Renderer2,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import AppUtil from 'src/app/utilities/app-util';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import { TaxRatesService } from 'src/app/service/tax-rates.service';
import { BaseAccountComponent } from 'src/app/shared/components/BaseAccountComponent';
import { AutoComplete } from 'primeng/autocomplete';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
@Component({
    selector: 'app-bills-form',
    templateUrl: './bills-form.component.html',
    styleUrls: ['bills-form.component.scss'],
})
export class BillsFormComponent extends BaseAccountComponent implements OnInit {
    id: any;
    types: any = {};

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
        private messageService: MessageService,
        private taxRatesService: TaxRatesService,
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
        this.form = this.fb.group({
            id: [this.id],
            code: ['', [Validators.required]],
            name: ['', [Validators.required]],
            percent: ['', [Validators.required]],
            description: [''],
            type: ['', [Validators.required]],
            order: ['', [Validators.required]],
            debitCode: [''],
            debitDetailCodeFirst: [''],
            debitDetailCodeSecond: [''],
            creditCode: [''],
            creditDetailCodeFirst: [''],
            creditDetailCodeSecond: [''],
        });
    }

    ngOnInit() {
        this.types = AppUtil.getBillsTypes();
        this.getAllByDisplayInsert();
        if (!this.isNew) {
            this.getDetail((data) => {
                this.buildData(data);
            }, this.id);
        }
    }

    get isNew() {
        return this.id === 0;
    }

    getDetail(callback, documentId) {
        this.taxRatesService
            .getDetail(documentId)
            .subscribe((response: any) => {
                callback(response);
            });
    }

    buildData(data: any) {
        if (!data) return;
        this.f.patchValue({
            id: data.id,
            code: data.code,
            name: data.name,
            percent: data.percent,
            description: data.description,
            type: data.type,
            order: data.order,
            debitCode: data?.debit || '',
            debitDetailCodeFirst: data?.debitFirst || '',
            debitDetailCodeSecond: data?.debitSecond || '',
            creditCode: data?.credit || '',
            creditDetailCodeFirst: data?.creditFirst || '',
            creditDetailCodeSecond: data?.creditSecond || '',
        });
    }

    onSubmit() {
        if (this.f.invalid) {
            return;
        }
        const formValue = _.cloneDeep(this.f.value);
        let input = {
            ...formValue,
            debitCode: formValue?.debitCode?.code || '',
            debitCodeName: formValue?.debitCode?.name || '',
            creditCode: formValue?.creditCode?.code || '',
            creditCodeName: formValue?.creditCode?.name || '',
            debitFirstCode: formValue?.debitDetailCodeFirst?.code || '',
            debitSecondCode: formValue?.debitDetailCodeSecond?.code || '',
            creditFirstCode: formValue?.creditDetailCodeFirst?.code || '',
            creditSecondCode: formValue?.creditDetailCodeSecond?.code || '',
        };
        delete input.debitDetailCodeFirst;
        delete input.debitDetailCodeSecond;
        delete input.creditDetailCodeFirst;
        delete input.creditDetailCodeSecond;

        const api = !this.isNew
            ? this.taxRatesService.updateTaxRates(input, this.form.value.id)
            : this.taxRatesService.createTaxRates(input);
        api.subscribe((res: any) => {
            this.messageService.add({
                severity: 'success',
                detail: this.isNew
                    ? 'Thêm mới thành công'
                    : 'Cập nhật thành công',
            });
            this.goBack();
        });
    }

    goBack() {
        this.router.navigate(['/uikit/category/bills']);
    }
}
