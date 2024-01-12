import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { MenuViewModel } from '../../../../models/role.model';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { RoleService } from '../../../../service/role.service';
import AppUtil from '../../../../utilities/app-util';
import { UserRole } from '../../../../models/user-role.model';
import { UserRoleService } from '../../../../service/user-role.service';
import { PermissionAction } from '../../../../utilities/app-enum';

@Component({
    selector: 'app-role-edit',
    templateUrl: './role-edit.component.html',
    styleUrls: [],
})
export class RoleEditComponent implements OnInit {
    @Input() display = false;
    @Input('codeParents') codeParents: MenuViewModel[] = [];

    @Input() set formData(value) {
        if (value?.id) {
            this.isEdit = true;
            Object.assign(this.menuRoleModel, value);
            if (!this.menuRoleModel?.listItem?.length)
                this.menuRoleModel.listItem = [];
        } else {
            this.isEdit = false;
            this.menuRoleModel = {
                id: 0,
                code: '',
                codeParent: '',
                name: '',
                note: '',
                listItem: [],
            };
        }
        this.menuRoleModel?.listItem?.map((item) => {
            item.userRoleName = this.roles?.find(
                (role) => role.id === item.userRoleId,
            )?.title;
        });
    }

    @Output() onCancel = new EventEmitter();
    isEdit = false;
    actions = [
        {
            name: 'Thêm',
            value: PermissionAction.Add,
        },
        {
            name: 'Sửa',
            value: PermissionAction.Edit,
        },
        {
            name: 'Xóa',
            value: PermissionAction.Delete,
        },
        {
            name: 'Xem',
            value: PermissionAction.View,
        },
    ];
    menuRoleModel: MenuViewModel = {};
    roles: UserRole[] = [];
    roleItem: any = {};

    constructor(
        private readonly messageService: MessageService,
        private readonly roleService: RoleService,
        private readonly translateService: TranslateService,
        private readonly userRoleService: UserRoleService,
    ) {}

    ngOnInit(): void {
        this.getUserRoles();
    }

    onSave() {
        this.menuRoleModel?.listItem?.map((item) => {
            delete item.userRoleName;
        });
        if (this.menuRoleModel.id)
            this.roleService
                .updateRole(this.menuRoleModel, this.menuRoleModel.id)
                .subscribe((res) => {
                    this.messageService.add({
                        severity: 'success',
                        detail: AppUtil.translate(
                            this.translateService,
                            'success.update',
                        ),
                    });
                    this.onCancel.emit({});
                });
        else
            this.roleService.createRole(this.menuRoleModel).subscribe((res) => {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.create',
                    ),
                });
                this.onCancel.emit({});
            });
    }

    getUserRoles() {
        this.userRoleService.getAllUserRole().subscribe((res) => {
            this.roles = res.data;
        });
    }

    onBack() {
        this.onCancel.emit({});
    }

    onAddRoleItem() {
        const role = this.roles?.find(
            (role) => role.id === this.roleItem?.userRoleId,
        );
        if (this.menuRoleModel.listItem.find((x) => x.userRoleId === role.id)) {
            this.messageService.add({
                severity: 'info',
                detail: AppUtil.translate(
                    this.translateService,
                    'info.exist_user_role',
                ),
            });
            return;
        }
        let item: any = {
            id: 0,
            menuId: 0,
            userRoleId: role?.id || 0,
            userRoleName: role?.title || '',
            add: this.roleItem?.actions?.find(
                (x) => x.value === PermissionAction.Add,
            )
                ? true
                : false,
            edit: this.roleItem?.actions?.find(
                (x) => x.value === PermissionAction.Edit,
            )
                ? true
                : false,
            delete: this.roleItem?.actions?.find(
                (x) => x.value === PermissionAction.Delete,
            )
                ? true
                : false,
            view: this.roleItem?.actions?.find(
                (x) => x.value === PermissionAction.View,
            )
                ? true
                : false,
        };
        if (!item.add && !item.edit && !item.delete && !item.view) {
            this.setAction(item, true);
        }
        this.menuRoleModel.listItem.push(item);
        this.roleItem = {};
    }

    setAction(item, action) {
        item.add = action;
        item.edit = action;
        item.delete = action;
        item.view = action;
    }

    onDeleteRoleItem(item) {
        const itemIndex = this.menuRoleModel?.listItem?.indexOf(item);
        this.menuRoleModel.listItem?.splice(itemIndex, 1);
    }

    onChangeRole(role, isAll?) {
        console.log(isAll);
        if (isAll) {
            if (!role.add || !role.edit || !role.delete || !role.view) {
                this.setAction(role, true);
            } else {
                this.setAction(role, false);
            }
        }
        role.all = role.view && role.add && role.delete && role.edit;
        console.log(role);
    }

    getRoleAll(role) {
        return role.view && role.add && role.delete && role.edit;
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
