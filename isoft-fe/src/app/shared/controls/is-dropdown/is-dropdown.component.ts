import {
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Optional,
    Self,
    SimpleChanges,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'is-dropdown',
    templateUrl: './is-dropdown.component.html',
    styles: [``],
})
export class IsDropdownComponent
    implements OnInit, ControlValueAccessor, OnDestroy, OnChanges
{
    @Input() options: any[] = [];
    @Input() label = '';
    @Input() placeholder = '';
    @Input() optionLabel = '';
    @Input() optionValue = '';
    @Input() appendTo = 'body';
    @Input() countIdentity = false;
    @Input() disabled = false;

    formControl = new FormControl();
    destroy$ = new Subject();

    private _onChange: (value: any) => void;
    private _onTouched: () => void;
    // disabled = false;

    value: any;

    constructor(@Self() @Optional() public ngControl: NgControl) {
        this.ngControl && (this.ngControl.valueAccessor = this);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes && changes.options) {
        }
    }

    ngOnInit() {
        this.formControl.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
                this._onChange(data);
            });
    }

    writeValue(value: any): void {
        this.value = value;

        this.formControl.setValue(this.value, { emitEvent: false });
    }

    registerOnChange(fn: any): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this._onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    ngOnDestroy(): void {
        this.destroy$.next(null);
        this.destroy$.complete();
    }
}
