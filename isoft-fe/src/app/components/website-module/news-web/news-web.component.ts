import { Component, HostListener, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Page, TypeData } from '../../../models/common.model';
import { NewsModel } from '../../../models/web-setting/news.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { NewsService } from '../../../service/web-setting/news.service';
import AppUtil from '../../../utilities/app-util';
import { LanguageType } from '../../../utilities/app-enum';
import AppConstant from '../../../utilities/app-constants';

@Component({
    selector: 'app-news-web',
    templateUrl: './news-web.component.html',
    styles: [``],
})
export class NewsWebComponent implements OnInit {
    appConstant = AppConstant;
    serverImage = `${environment.serverURLImage}/`;
    display: boolean = false;
    formData = {};
    loading: boolean = false;
    result: TypeData<NewsModel> = {
        data: [],
        currentPage: 0,
        nextStt: 0,
        pageSize: 20,
        totalItems: 0,
    };
    isMobile = screen.width <= 1199;
    param: Page = {
        page: 1,
        pageSize: 20,
    };

    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly newsService: NewsService,
    ) {}

    ngOnInit(): void {
        this.getNews();
    }

    getNews(event?: any) {
        if (event) {
            this.param.page = event.first / event.rows;
            this.param.pageSize = event.rows;
        }
        this.newsService.getPagingNews(this.param).subscribe(
            (res) => {
                AppUtil.scrollToTop();
                this.result = res;
                this.result?.data?.map((item) => {
                    item.imageUrl = item.image
                        ? `${environment.serverURLImage}/${item.image}`
                        : '';
                });
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    detail: 'Lỗi lấy dữ liệu',
                });
            },
        );
    }

    onAddNews() {
        this.display = true;
        this.formData = {};
    }

    getNewsDetail(item) {
        this.display = true;
        this.formData = item;
    }

    onDeleteNews(item) {
        let message;
        this.translateService
            .get('question.delete_web_news_content')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                this.newsService.deleteNews(item?.id).subscribe(
                    (res) => {
                        AppUtil.scrollToTop();
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.delete',
                            ),
                        });
                        this.getNews();
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
        this.getNews();
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddNews();
                break;
        }
    }
}
