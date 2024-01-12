import {
    Directive,
    Input,
    OnInit,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core';

import AppUtil from '../../utilities/app-util';
import AppConstants from '../../utilities/app-constants';

export interface MENU_ACTION {
    menu?: string;
    action?: string;
}

@Directive({
    selector: '[appHasAccess]',
})
export class HasAccessDirective implements OnInit {
    @Input('appHasAccess') menuAction: MENU_ACTION = {};
    currentPageRole;

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
    ) {}

    ngOnInit(): void {
        this.currentPageRole = AppUtil.getMenus(this.menuAction.menu);
        if (this.allowPermission()) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        }
    }

    allowPermission() {
        console.log(this.menuAction.action);
        switch (this.menuAction.action) {
            case AppConstants.PERMISSION_FUNC.ADD:
                return this.currentPageRole.add;
            case AppConstants.PERMISSION_FUNC.EDIT:
                return this.currentPageRole.edit;
            case AppConstants.PERMISSION_FUNC.DELETE:
                return this.currentPageRole.delete;
            case AppConstants.PERMISSION_FUNC.VIEW:
                return this.currentPageRole.view;
            default: {
                return false;
            }
        }
    }
}
