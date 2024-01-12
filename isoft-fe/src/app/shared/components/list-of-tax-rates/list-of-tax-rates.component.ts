import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BaseControlValueAccessor } from '../BaseControlValueAccessor';
import { CategoryService } from '../../../service/category.service';
import AppConstants from '../../../utilities/app-constants';
import { TaxRatesService } from '../../../service/tax-rates.service';
import { Dropdown } from 'primeng/dropdown';

@Component({
    selector: 'app-list-of-tax-rates',
    templateUrl: './list-of-tax-rates.component.html',
})
export class ListOfTaxRatesComponent
    extends BaseControlValueAccessor
    implements OnInit
{
    @Input() taxRates: any[] = [];
    @Output() onChange = new EventEmitter();
    @Output() onClearEmitter = new EventEmitter();
    @Input() disabled = false;
    @Input() isShowFull = false;
    @ViewChild('pDropdown') pDropdown: Dropdown;

    constructor(private readonly taxRatesService: TaxRatesService) {
        super();
    }

    ngOnInit(): void {
        // this.taxRatesService.getAllTaxRatesV2().subscribe((res) => {
        //     if (res.data) {
        //         this.taxRates = res.data.filter(item => item.code.includes('V'))
        //     }
        // });
    }

    onValueChange($event: any) {
        let taxCode = $event.value || '';
        let taxRate = this.taxRates.find((x) => x.code == taxCode);
        this.onChange.emit(taxRate);
    }
    

    clearValue = () => {
        this.value = null;
        this.pDropdown.updateSelectedOption(null)
    }

    onClear = (event: any) => {
        this.clearValue();
        this.onClearEmitter.emit(event)
    }
}
