import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { IsConfirmationType } from './is-comfirmation.model';
import { IsConfirmationService } from './is-comfirmation.service';

@Component({
    selector: 'is-confirmation',
    templateUrl: './is-confirmation.component.html',
    styles: [],
})
export class IsConfirmationComponent implements OnInit {
    confirmTypes = IsConfirmationType;

    constructor(public isConfirmationService: IsConfirmationService) {}

    ngOnInit() {}
}
