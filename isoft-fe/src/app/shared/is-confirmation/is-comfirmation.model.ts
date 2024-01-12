import { EventEmitter } from '@angular/core';
import { Confirmation } from 'primeng/api';

export enum IsConfirmationType {
    PopUp = 1,
    Dialog,
}

export class IsConfirmation implements Confirmation {
    message?: string;
    key?: string;
    icon?: string = 'pi pi-exclamation-triangle';
    header?: string;
    accept?: Function;
    reject?: Function;
    acceptLabel?: string;
    rejectLabel?: string;
    acceptIcon?: string;
    rejectIcon?: string;
    acceptVisible?: boolean;
    rejectVisible?: boolean;
    blockScroll?: boolean;
    closeOnEscape?: boolean;
    dismissableMask?: boolean;
    defaultFocus?: string;
    acceptButtonStyleClass?: string;
    rejectButtonStyleClass?: string;
    target?: EventTarget;
    acceptEvent?: EventEmitter<any>;
    rejectEvent?: EventEmitter<any>;

    constructor() {}
}

export class IsConfirmationModel {
    type?: IsConfirmationType = IsConfirmationType.Dialog;
    confirmation: IsConfirmation;
}
