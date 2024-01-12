import {
    Component,
    EventEmitter,
    forwardRef,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { CategoryService } from '../../../service/category.service';
import AppConstant from '../../../utilities/app-constants';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CustomerPricesComponent),
    multi: true,
};

@Component({
    selector: 'app-customer-prices',
    templateUrl: './customer-prices.component.html',
    providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR],
})
export class CustomerPricesComponent implements OnInit, ControlValueAccessor {
    private innerValue: any = '';
    prices: any[] = [];
    @Output() onChange = new EventEmitter();
    appConstant = AppConstant;

    private onTouchedCallback: () => void = () => {};
    private onChangeCallback: (_: any) => void = () => {};

    get value(): any {
        return this.innerValue;
    }

    set value(v: any) {
        if (v !== this.innerValue) {
            console.log(v);
            this.innerValue = v;
            this.onChangeCallback(v);
        }
    }

    constructor(private categoryService: CategoryService) {}

    ngOnInit(): void {
        this.getCategories();
    }

    getCategories() {
        this.categoryService.getAll().subscribe((res) => {
            this.prices = res.data
                .filter(
                    (x) => x.type === this.appConstant.CATEGORY_TYPE.PRICE_LIST,
                )
                .map((item) => {
                    return {
                        ...item,
                        display: `${item.code} - ${item.name}`,
                    };
                });
        });
    }

    registerOnChange(fn: any): void {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouchedCallback = fn;
    }

    setDisabledState(isDisabled: boolean): void {}

    writeValue(value: any): void {
        this.value = value;
    }
}
