import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[autofocus]',
})
export class AutofocusDirective {
    // tslint:disable-next-line:variable-name
    private _autofocus: boolean;
    constructor(private el: ElementRef) {}

    // tslint:disable-next-line:use-lifecycle-interface
    ngOnInit() {
        if (this._autofocus || typeof this._autofocus === 'undefined') {
            window.setTimeout(() => {
                this.el.nativeElement.focus();
            });
        }
    }

    @Input() set autofocus(condition: boolean) {
        this._autofocus = condition !== false;
    }
}
