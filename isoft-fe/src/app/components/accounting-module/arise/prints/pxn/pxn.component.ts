import { Component, Input, OnInit } from '@angular/core';
import { Company } from 'src/app/models/company.model';
import AppUtil from 'src/app/utilities/app-util';

@Component({
    selector: 'app-pxn',
    templateUrl: './pxn.component.html',
})
export class PXNComponent implements OnInit {
    public appUtil = AppUtil;
    @Input() company: Company;
    @Input() ledgers = [];

    constructor() {}

    ngOnInit(): void {}
}
