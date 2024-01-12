import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import AppUtil from 'src/app/utilities/app-util';
@Component({
    selector: 'app-salary-tranfer',
    templateUrl: './salary-tranfer.component.html',
    styles: [
        `
            :host ::ng-deep {
                .p-button,
                .p-button .p-button-icon-left,
                .p-datatable-scrollable-both .p-datatable-tbody > tr > td {
                    font-size: 0.875rem !important;
                }

                .p-inputtext,
                .p-inputgroup > .p-inputwrapper > .p-component > .p-inputtext {
                    width: 100px;
                }
            }
        `,
    ],
})
export class SalaryTranferComponent implements OnInit {
    appUtil = AppUtil;
    @Output() onCancel = new EventEmitter();

    constructor() {}

    ngOnInit(): void {}

    onSave() {
        console.log('on save');
        this.onCancel.emit({});
    }
}
