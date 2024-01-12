import {
    Component,
    forwardRef,
    OnInit,
    Output,
    EventEmitter,
    Input,
} from '@angular/core';
import {
    ControlValueAccessor,
    FormControl,
    NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { IsInputType } from './is-input.model';

@Component({
    selector: 'is-input',
    templateUrl: './is-input.component.html',
    styleUrls: ['./is-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => IsInputComponent),
            multi: true,
        },
    ],
})
export class IsInputComponent implements OnInit, ControlValueAccessor {
    @Input() type: IsInputType = 'text';
    @Input() placeholder: string = '';
    @Input() error: string = '';
    @Output() blur = new EventEmitter<any>();

    private _onChange: (value: any) => void;
    private _onTouched: () => void;

    disabled = false;

    formControl = new FormControl();

    constructor() {}

    ngOnInit() {
        this.formControl.valueChanges.subscribe((value) => {
            this._onChange && this._onChange(value);
        });
    }

    writeValue(value: any): void {
        this.formControl.setValue(value, { emitEvent: false });
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

    onBlur() {
        this.blur.emit(null);
    }
}
