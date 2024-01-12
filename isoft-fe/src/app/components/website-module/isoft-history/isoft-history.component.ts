import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Page, TypeData } from '../../../models/common.model';
import { IntroduceType } from '../../../models/web-setting/introduce.model';
import { ClassName, IsoftHistoryModel } from './isoft-history.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { IsoftHistoryService } from './isoft-history.service';
import AppUtil from '../../../utilities/app-util';
import { LanguageType } from '../../../utilities/app-enum';

@Component({
    selector: 'app-isoft-history',
    templateUrl: './isoft-history.component.html',
    styleUrls: [],
})
export class IsoftHistoryComponent implements OnInit {
    serverImage = `${environment.serverURLImage}/`;
    display: boolean = false;
    formData = {};
    loading: boolean = false;
    result: TypeData<IsoftHistoryModel> = {
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

    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly isoftHistoryService: IsoftHistoryService,
    ) {}

    ngOnInit(): void {}

    getHistories(event?: any) {
        this.param.page =
            Math.floor(Number(event?.first || 0) / Number(event?.rows || 1)) ||
            1;
        this.param.pageSize = Number(event?.rows || 20);
        this.isoftHistoryService.getPagingHistory(this.param).subscribe(
            (res) => {
                AppUtil.scrollToTop();
                this.result = {
                    ...res,
                    data: res?.data?.map((item) => {
                        return {
                            ...item,
                            classNameStr: this.getClassName(item.className),
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

    onAddHistory() {
        this.display = true;
        this.formData = {};
    }

    getHistoryDetail(item) {
        this.display = true;
        this.formData = {
            ...item,
        };
    }

    onDeleteHistory(item) {
        this.confirmationService.confirm({
            message: 'Bạn có muốn xóa bài lịch sử này',
            header: 'Xóa bài lịch sử?',
            accept: () => {
                this.isoftHistoryService.deleteHistory(item?.id).subscribe(
                    (res) => {
                        AppUtil.scrollToTop();
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.delete',
                            ),
                        });
                        this.getHistories();
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
        this.getHistories();
    }

    getClassName(className): string {
        let classNameStr = '';
        switch (className) {
            case ClassName.Six:
                classNameStr = 'Lớp 6';
                break;
            case ClassName.Seven:
                classNameStr = 'Lớp 7';
                break;
            case ClassName.Eight:
                classNameStr = 'Lớp 8';
                break;
            case ClassName.Nine:
                classNameStr = 'Lớp 9';
                break;
        }
        return classNameStr;
    }
}
