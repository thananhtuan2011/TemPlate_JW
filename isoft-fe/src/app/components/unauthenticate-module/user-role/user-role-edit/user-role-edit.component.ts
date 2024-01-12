import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { MenuViewModel } from '../../../../models/role.model';
import { UserRole } from '../../../../models/user-role.model';
import { MessageService } from 'primeng/api';
import { RoleService } from '../../../../service/role.service';
import { TranslateService } from '@ngx-translate/core';
import { UserRoleService } from '../../../../service/user-role.service';
import AppUtil from '../../../../utilities/app-util';

@Component({
    selector: 'app-user-role-edit',
    templateUrl: './user-role-edit.component.html',
    styleUrls: [],
})
export class UserRoleEditComponent implements OnInit {
    @Input() display = false;

    @Input() set formData(value) {
        if (value?.id) {
            this.isEdit = true;
            Object.assign(this.userRoleModel, value);
        } else {
            this.isEdit = false;
            this.userRoleModel = {};
        }
    }

    @Output() onCancel = new EventEmitter();
    isEdit = false;
    userRoleModel: UserRole = {};

    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly userRoleService: UserRoleService,
    ) {}

    ngOnInit(): void {}

    onSave() {
        if (this.userRoleModel.id)
            this.userRoleService
                .updateUserRole(this.userRoleModel, this.userRoleModel.id)
                .subscribe(
                    (res) => {
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.update',
                            ),
                        });
                        this.onCancel.emit({});
                    },
                    (err) => {
                        this.messageService.add({
                            severity: 'error',
                            detail: AppUtil.translate(
                                this.translateService,
                                'error.0',
                            ),
                        });
                    },
                );
        else
            this.userRoleService.createUserRole(this.userRoleModel).subscribe(
                (res) => {
                    this.messageService.add({
                        severity: 'success',
                        detail: AppUtil.translate(
                            this.translateService,
                            'success.create',
                        ),
                    });
                    this.onCancel.emit({});
                },
                (err) => {
                    this.messageService.add({
                        severity: 'error',
                        detail: AppUtil.translate(
                            this.translateService,
                            'error.0',
                        ),
                    });
                },
            );
    }
    onBack() {
        this.onCancel.emit({});
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F8':
                event.preventDefault();
                await this.onSave();
                break;
            case 'F6':
                event.preventDefault();
                this.onCancel.emit({});
                break;
        }
    }
}
