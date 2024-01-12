import { AfterViewInit, Directive, OnDestroy } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Directive({
    selector: '[uppercase]',
})
export class UpperCaseInputDirective implements AfterViewInit, OnDestroy {
    destroy$ = new Subject();

    constructor(private _ngControl: NgControl) {}

    ngAfterViewInit(): void {
        this.subscribeControl();
    }

    subscribeControl() {
        this._ngControl.control.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe((value: string) => {
                if (value) {
                    this._ngControl.control.setValue(value.toUpperCase(), {
                        emitEvent: false,
                    });
                    this._ngControl.viewToModelUpdate(value.toUpperCase());
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next(null);
        this.destroy$.complete();
    }
}
