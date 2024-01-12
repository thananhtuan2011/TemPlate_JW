import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import AppUtil from 'src/app/utilities/app-util';
@Component({
    selector: 'app-tscd',
    templateUrl: './tscd.component.html',
    styles: [``],
})
export class TscdComponent implements OnInit {
    @Input('paramToGetLedgers') paramToGetLedgers: any = {};
    @Output() onCancel = new EventEmitter();
    constructor() {}

    ngOnInit(): void {}
}
