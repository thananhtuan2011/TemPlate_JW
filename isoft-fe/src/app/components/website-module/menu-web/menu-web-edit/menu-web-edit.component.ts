import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { IntroduceModel } from '../../../../models/web-setting/introduce.model';
import { Category } from '../../../../models/category.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { IntroduceService } from '../../../../service/web-setting/introduce.service';
import { CategoryService } from '../../../../service/category.service';
import { TypeData } from '../../../../models/common.model';
import { MenuType } from '../../../../utilities/app-enum';
import AppUtil from '../../../../utilities/app-util';
import AppData from 'src/app/utilities/app-data';
import { UserTaskCommentService } from "../../../../service/user-task-comment.service";
import { UserService } from 'src/app/service/user.service';
import { FileService } from 'src/app/service/file.service';

@Component({
    selector: 'app-menu-web-edit',
    templateUrl: './menu-web-edit.component.html',
    styles: [`
        .style_prev_kit {
                display: inline-block;
                border: 0;
                position: relative;
                -webkit-transition: all 200ms ease-in;
                -webkit-transform: scale(1);
                -ms-transition: all 200ms ease-in;
                -ms-transform: scale(1);
                -moz-transition: all 200ms ease-in;
                -moz-transform: scale(1);
                transition: all 200ms ease-in;
                transform: scale(1);
            }

            .style_prev_kit:hover {
                box-shadow: 0 0 40px #000000;
                z-index: 999;
                -webkit-transition: all 200ms ease-in;
                -webkit-transform: scale(2);
                -ms-transition: all 200ms ease-in;
                -ms-transform: scale(2);
                -moz-transition: all 200ms ease-in;
                -moz-transform: scale(2);
                transition: all 200ms ease-in;
                transform: scale(2);
                cursor: pointer;
            }

            img {
                width: 80px;
                height: 40px;
                border-radius: 4px;
                border: 3px solid var(--primary-color);
            }

            img:hover {
                cursor: pointer;
            }

            .item-panel:hover {
                background-color: var(--surface-100);
            }
    `]
})
export class MenuWebEditComponent implements OnInit {
    serverImage = `${environment.serverURLImage}/`;
    @Input() display = false;

    @Input() set formData(value) {
        if (value?.id) {
            this.isEdit = true;
            Object.assign(this.menuModel, value);
            if (this.menuModel.icon) {
                this.menuModel.icon = this.menuModel.icon.trim();
            }
            this.fileLinks = this.menuModel.fileLink || [];
        } else {
            this.isEdit = false;
            this.menuModel = {
                type: MenuType.MenuWeb,
            };
            this.fileLinks = [];
        }
    }

    @Output() onCancel = new EventEmitter();
    serverImg = environment.serverURLImage;
    isEdit = false;
    menuModel: Category = {};
    parentCategories: Category[] = [];
    menuTypes = [];

    icons = AppData.WOLMART_ICON;

    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly categoryService: CategoryService,
        private readonly userTaskCommentService: UserTaskCommentService,
        private readonly fileService: FileService,

    ) { }

    ngOnInit(): void {
        this.menuTypes = [
            {
                value: MenuType.MenuWeb,
                name: 'Menu website sản phẩm',
            },
            {
                value: MenuType.MenuOnePage,
                name: 'Menu website one page',
            },
        ];
        this.getParentCategories();
    }

    getParentCategories() {
        this.categoryService
            .getPaging({
                type: MenuType.MenuWeb,
                page: 1,
                pageSize: 1000,
            })
            .subscribe(
                (res) => {
                    this.parentCategories = res?.data || [];
                },
                (error) => { },
            );
    }

    iconFile: any = {};
    fileLinks: any[] = [];
    selectedImages: any[] = [];
    serverFileImg = environment.serverURLImage + '/';
    serverUserTaskImg = environment.serverURLImage + '/Uploads/usertask/';
    doAttachFile(event: any): void {
        if (
            this.fileLinks.length >= 4 ||
            event.target?.files.length > 4 ||
            event.target?.files.length + this.fileLinks.length > 4
        ) 
        {
            return;
        }
        for (let i = 0; i < event.target?.files.length; i++) {
            const formData = new FormData();
            formData.append('file', event.target?.files[i]);
            this.userTaskCommentService.uploadFile(formData)
                .subscribe((res: any) => {
                    if (this.fileLinks.length < 4) {
                        this.fileLinks.push(res);
                    }
                });
        }
    }

    async doAttachIcon(event: any){
        this.iconFile = await  this.fileService.uploadMedia
            (event.target?.files[0],
            'Images');
    }

    onRemoveImages() {
        this.fileLinks = this.fileLinks.filter((x) => !this.selectedImages.includes(x.fileId));
    }

    onImageClick(id: any) {
        // remove or add class name style_prev_kit (css hover)
        let image = document.getElementById(id);
        let isUsingClass = image.classList.contains('style_prev_kit');
        if (isUsingClass) {
            image.classList.remove('style_prev_kit');
            image.classList.add('opacity-custom');
            this.selectedImages = [...this.selectedImages, id];
        } else {
            image.classList.add('style_prev_kit');
            image.classList.remove('opacity-custom');
            this.selectedImages = this.selectedImages.filter((x) => x !== id);
        }
    }

    onSave() {
        this.menuModel.fileLink = this.fileLinks;
        this.menuModel.icon = this.iconFile;
        const action = this.menuModel?.id
            ? this.categoryService.update(this.menuModel, this.menuModel.id)
            : this.categoryService.create(this.menuModel);
        action.subscribe(
            (res) => {
                const msgKey = this.menuModel?.id
                    ? 'success.update'
                    : 'success.create';
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(this.translateService, msgKey),
                });
                this.onCancel.emit({});
            },
            (err) => {
                this.messageService.add({
                    severity: 'error',
                    detail: AppUtil.translate(this.translateService, 'error.0'),
                });
            },
        );
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
