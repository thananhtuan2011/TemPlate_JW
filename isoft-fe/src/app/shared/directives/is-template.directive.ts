import { Directive, Input } from '@angular/core';

@Directive({
    selector: '[isDirective]',
})
export class IsTemplateDirective {
    @Input('isDirective') name = '';

    constructor() {}
}
