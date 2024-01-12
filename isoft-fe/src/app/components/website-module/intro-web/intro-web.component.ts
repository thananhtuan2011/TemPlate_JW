import {Component, HostListener, OnInit} from '@angular/core';
import {ConfirmationService, MessageService} from 'primeng/api';
import {TranslateService} from '@ngx-translate/core';
import {environment} from '../../../../environments/environment';
import {LanguagePage, Page, TypeData} from '../../../models/common.model';
import {IntroduceModel,} from '../../../models/web-setting/introduce.model';
import {IntroduceService} from '../../../service/web-setting/introduce.service';
import AppUtil from '../../../utilities/app-util';
import AppConstant from '../../../utilities/app-constants';

@Component({
    selector: 'app-intro-web',
    templateUrl: './intro-web.component.html',
    styles: [``],
})
export class IntroWebComponent implements OnInit {
    appConstant = AppConstant;
    serverImage = `${environment.serverURLImage}/`;
    display: boolean = false;
    formData = {};
    loading: boolean = false;
    result: TypeData<IntroduceModel> = {
        data: [],
        currentPage: 0,
        nextStt: 0,
        pageSize: 20,
        totalItems: 0,
    };
    languageTypes = AppUtil.getLanguageTypes();
    param: LanguagePage = {
        page: 0,
        pageSize: 20,
        type: this.languageTypes[2].value
    };
    introduceTypes: any[] = [];
    isMobile = screen.width <= 1199;
    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly introduceService: IntroduceService,
    ) {}

    ngOnInit(): void {
        this.introduceTypes = AppUtil.getIntroduceTypes();
        this.getIntroduces();
    }

    getIntroduces(event?: any) {
        if (event) {
            this.param.page = event.first / event.rows;
            this.param.pageSize = event.rows;
        }
        this.introduceService.getPagingIntroduce(this.param).subscribe(
            (res) => {
                AppUtil.scrollToTop();
                this.result = {
                    ...res,
                    data: res?.data?.map((item) => {
                        return {
                            ...item,
                            typeName: AppUtil.getLanguageTypes().find(x => x.value === item.type).name,
                            introduceTypeName: this.getIntroduceTypeName(
                                item.introduceType,
                            ),
                        };
                    }),
                };
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    detail: 'Lỗi lấy dữ liệu',
                });
            },
        );
    }

    onAddIntroduce() {
        this.display = true;
        this.formData = {};
    }

    getIntroduceDetail(item) {
        this.display = true;
        this.formData = item;
    }

    onDeleteIntroduce(item) {
        let message;
        this.translateService
            .get('question.delete_web_introduce_content')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                this.introduceService.deleteIntroduce(item?.id).subscribe(
                    (res) => {
                        AppUtil.scrollToTop();
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.delete',
                            ),
                        });
                        this.getIntroduces();
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
        this.getIntroduces();
    }

    getIntroduceTypeName(introduceType): string {
        let introType = this.introduceTypes.find((x => x.value === introduceType));
        return introType ? introType.name : '';
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddIntroduce();
                break;
        }
    }
}
