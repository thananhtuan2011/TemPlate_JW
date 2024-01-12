import { Component, HostListener, OnInit } from '@angular/core';
import { Page, TypeData } from '../../../models/common.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { RoleService } from '../../../service/role.service';
import { TranslateService } from '@ngx-translate/core';
import { UserRoleService } from '../../../service/user-role.service';
import AppUtil from '../../../utilities/app-util';
import AppConstant from '../../../utilities/app-constants';

@Component({
    selector: 'app-user-role',
    templateUrl: './user-role.component.html',
    styleUrls: [],
    providers: [ConfirmationService, MessageService],
})
export class UserRoleComponent implements OnInit {
    appConstant = AppConstant;
    display: boolean = false;
    formData = {};
    loading: boolean = false;
    result: TypeData<any> = {
        data: [],
        currentPage: 0,
        nextStt: 0,
        pageSize: 20,
        totalItems: 0,
    };
    param: Page = {
        page: 0,
        pageSize: 20,
    };
    isMobile = screen.width <= 1199;
    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly userRoleService: UserRoleService,
    ) {}

    ngOnInit(): void {
        this.getUserRoles();
    }

    getUserRoles(event?: any) {
        if (event) {
            this.param.page = event.first / event.rows + 1;
            this.param.pageSize = event.rows;
        }
        this.userRoleService.getPagingUserRole(this.param).subscribe(
            (res) => {
                AppUtil.scrollToTop();
                this.result = res;
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    detail: 'Lỗi lấy dữ liệu',
                });
            },
        );
    }

    onAddUserRole() {
        this.display = true;
        this.formData = {};
    }

    onEditUserRole(item) {
        this.display = true;
        this.formData = item;
    }

    onDeleteUserRole(id) {
        this.confirmationService.confirm({
            message: AppUtil.translate(
                this.translateService,
                'question.delete_user_role_content',
            ),
            header: AppUtil.translate(
                this.translateService,
                'question.delete_user_role_header',
            ),
            accept: () => {
                this.userRoleService.deleteUserRole(id).subscribe(
                    (res) => {
                        AppUtil.scrollToTop();
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.delete',
                            ),
                        });
                        this.getUserRoles();
                    },
                    (error) => {
                        this.messageService.add({
                            severity: 'error',
                            detail: AppUtil.translate(
                                this.translateService,
                                'error.0',
                            ),
                        });
                    },
                );
            },
        });
    }

    onCancelForm(event) {
        this.display = false;
        this.formData = {};
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddUserRole();
                break;
        }
    }
}
