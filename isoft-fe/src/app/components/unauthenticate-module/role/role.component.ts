import { Component, HostListener, OnInit } from '@angular/core';
import { TypeData } from '../../../models/common.model';
import { MenuRoleModel } from '../../../models/role.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { PageFilterRole, RoleService } from '../../../service/role.service';
import AppUtil from '../../../utilities/app-util';
import { UserRole, UserRoleCRUD } from '../../../models/user-role.model';
import { AppMainComponent } from 'src/app/layouts/app.main.component';
import { ConfigService } from 'src/app/service/system-setting/app.config.service';
import { Subscription } from 'rxjs';
import AppConstant from 'src/app/utilities/app-constants';

@Component({
    selector: 'app-role',
    templateUrl: './role.component.html',
    styles: [
        `
            :host ::ng-deep {
                .p-tag {
                    background: inherit;
                    border-radius: 6px;
                    padding: 6px 12px;
                    font-size: 12px;
                }
            }
        `,
    ],
    providers: [ConfirmationService],
})
export class RoleComponent implements OnInit {
    appConstant = AppConstant;
    appUtil = AppUtil;
    display: boolean = false;
    formData = {};
    result: TypeData<any> = {
        data: [],
        currentPage: 0,
        nextStt: 0,
        pageSize: 20,
        totalItems: 0,
    };
    getParams: PageFilterRole = {
        page: 0,
        pageSize: 20,
        codeParent: '',
        isParent: false,
    };
    getParamsTemp: PageFilterRole = {
        page: 0,
        pageSize: 20,
        codeParent: '',
        isParent: false,
    };
    roles: UserRole[] = [];
    currentPageRole: UserRoleCRUD = {};
    codeParents: MenuRoleModel[] = [];
    subscription: Subscription;
    first = 0;
    isMobile = screen.width <= 1199;

    constructor(
        public appMain: AppMainComponent,
        private readonly messageService: MessageService,
        private readonly roleService: RoleService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly configService: ConfigService,
    ) {}

    ngOnInit(): void {
        this.currentPageRole = this.appUtil.getMenus('PHANQUYEN');
        this.getMenuParents();
        this.subscription = this.configService.configUpdate$.subscribe(
            (config) => this.getMenuParents(config.dark),
        );
    }

    getMenuParents(isDark: boolean = false) {
        this.roleService.getRoles({ isParent: true }).subscribe((res) => {
            this.codeParents = res.data;
            this.codeParents.forEach((parent) => {
                parent.colorRandom = isDark
                    ? AppUtil.generateLightColorHex()
                    : AppUtil.generateDarkColorHex();
            });
        });
    }

    getMenuRole(event?: any) {
        this.getParamsTemp = this.getParams;
        if (event) {
            this.getParams.page = event.first / event.rows;
            this.getParams.pageSize = event.rows;
        } else {
            this.getParams.page = 0;
            this.getParams.pageSize = 10;
        }
        if (AppUtil.getStorage(AppConstant.DATA_TEMP)) {
            this.getParams = AppUtil.getStorage(AppConstant.DATA_TEMP);
            this.first = this.getParams.page * 10;
            AppUtil.removeStorage(AppConstant.DATA_TEMP);
        }
        let params = Object.assign({}, this.getParams);
        if (!params.codeParent) {
            delete params.codeParent;
        }
        this.roleService.getPagingRole(params).subscribe((res) => {
            this.appUtil.scrollToTop();
            this.result = res;
        });
    }

    onAddRole() {
        AppUtil.setStorage(
            AppConstant.DATA_TEMP,
            JSON.stringify(this.getParams),
        );
        this.display = true;
        this.formData = {};
    }

    onEditRole(item) {
        AppUtil.setStorage(
            AppConstant.DATA_TEMP,
            JSON.stringify(this.getParams),
        );
        this.roleService.getDetail(item.id).subscribe((res) => {
            this.formData = res;
            this.display = true;
        });
    }

    onDeleteRole(id) {
        this.confirmationService.confirm({
            message: this.appUtil.translate(
                this.translateService,
                'question.delete_role_content',
            ),
            header: this.appUtil.translate(
                this.translateService,
                'question.delete_role_header',
            ),
            accept: () => {
                this.roleService.deleteRole(id).subscribe((res) => {
                    this.appUtil.scrollToTop();
                    this.getMenuRole();
                    this.messageService.add({
                        severity: 'success',
                        detail: this.appUtil.translate(
                            this.translateService,
                            'success.delete',
                        ),
                    });
                });
            },
        });
    }

    onCancelForm(event) {
        this.getMenuParents();
        this.display = false;
        this.formData = {};
    }

    getParentColor(codeParent) {
        let parent = this.codeParents.find((x) => x.code === codeParent);
        return parent ? parent.colorRandom : 'var(--primary-color)';
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddRole();
                break;
        }
    }
}
