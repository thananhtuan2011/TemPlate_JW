import { Component, HostListener, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { TypeData } from '../../../models/common.model';
import { Category } from '../../../models/category.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { CategoryService } from '../../../service/category.service';
import AppUtil from '../../../utilities/app-util';
import { MenuType } from '../../../utilities/app-enum';
import AppConstant from '../../../utilities/app-constants';

@Component({
    selector: 'app-menu-web',
    templateUrl: './menu-web.component.html',
    styleUrls: [],
    providers: [MessageService, ConfirmationService],
})
export class MenuWebComponent implements OnInit {
    appConstant = AppConstant;
    serverImage = `${environment.serverURLImage}/`;
    display: boolean = false;
    formData = {};
    loading: boolean = false;
    result: TypeData<Category> = {
        data: [],
        currentPage: 0,
        nextStt: 0,
        pageSize: 20,
        totalItems: 0,
    };
    param: any = {
        type: MenuType.MenuWeb,
        page: 1,
        pageSize: 20,
    };
    menuTypes = [
        {
            value: MenuType.MenuWeb,
            label: 'Menu website sản phẩm',
        },
        {
            value: MenuType.MenuOnePage,
            label: 'Menu website one page',
        },
    ];
    isMobile = screen.width <= 1199;
    serverFileImg = environment.serverURLImage + '/';

    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly categoryService: CategoryService,
    ) {}

    ngOnInit(): void {
        this.getMenuWebs();
    }

    getMenuWebs(event?: any) {
        if (event) {
            this.param.page = event.first / event.rows;
            this.param.pageSize = event.rows;
        }
        this.categoryService.getPaging(this.param).subscribe(
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

    onAddMenuWeb() {
        this.display = true;
        this.formData = {};
    }

    getMenuWebDetail(item) {
        this.categoryService.getDetail(item.id).subscribe((res: any) => {
            this.display = true;
            this.formData = res;
        });
    }

    onDeleteMenuWeb(item) {
        let message;
        this.translateService
            .get('question.delete_web_menu_content')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                this.categoryService.deleteCategory(item?.id).subscribe(
                    (res) => {
                        AppUtil.scrollToTop();
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.delete',
                            ),
                        });
                        this.getMenuWebs();
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
        this.getMenuWebs();
    }

    getMenuTypeName(type): string {
        switch (type) {
            case MenuType.MenuWeb:
                return 'Menu website sản phẩm';
            case MenuType.MenuOnePage:
                return 'Menu website one page';
            default:
                return '';
        }
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddMenuWeb();
                break;
        }
    }
}
