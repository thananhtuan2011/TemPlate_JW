import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import {
    IsConfirmationModel,
    IsConfirmationType,
} from './is-comfirmation.model';

@Injectable({
    providedIn: 'root',
})
export class IsConfirmationService {
    type: IsConfirmationType = IsConfirmationType.Dialog;

    constructor(private _confirmationService: ConfirmationService) {}

    confirm(configuration: IsConfirmationModel) {
        this.type = configuration.type
            ? configuration.type
            : IsConfirmationType.Dialog;
        setTimeout(() => {
            this._confirmationService.confirm(configuration.confirmation);
        }, 0);
    }
}
