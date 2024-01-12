import { ControlValueAccessor } from '@angular/forms';

export class BaseControlValueAccessor implements ControlValueAccessor {
    private innerValue: any = '';
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
