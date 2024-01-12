import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { NewsModel } from '../../../../models/web-setting/news.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { NewsService } from '../../../../service/web-setting/news.service';
import { LanguageType } from '../../../../utilities/app-enum';
import AppUtil from '../../../../utilities/app-util';
import { FileService } from '../../../../service/file.service';

@Component({
    selector: 'app-news-edit',
    templateUrl: './news-edit.component.html',
    styleUrls: [],
})
export class NewsEditComponent implements OnInit {
    @Input() display = false;

    @Input() set formData(value) {
        if (value?.id) {
            this.isEdit = true;
            this.newsModel = Object.assign(this.newsModel, value);
            this.newsModel.imageUrl = this.newsModel.image
                ? `${environment.serverURLImage}/${this.newsModel.image}`
                : '';
            this.content = this.newsModel.content || '';
        } else {
            this.isEdit = false;
            this.content = '';
            this.newContentImages = [];
            this.newsModel.type = 2;
        }
    }

    @Output() onCancel = new EventEmitter();
    serverImg = environment.serverURLImage;
    isEdit = false;
    newsModel: NewsModel = {};
    languageTypes = [];
    content = '';
    newContentImages = [];
    file: any;

    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly newsService: NewsService,
        private readonly fileService: FileService,
    ) {}

    ngOnInit(): void {
        this.languageTypes = AppUtil.getLanguageTypes();
    }

    onChangeEditor(event) {
        this.content = event.htmlValue;
        event?.delta?.ops?.map(async (item) => {
            if (item?.insert?.image) {
                const image = item?.insert?.image;
                const formData = new FormData();
                formData.append(
                    'file',
                    new Blob([image.split(',')[1]], { type: 'image/png' }),
                );
                const imageUrl = await this.fileService.uploadMedia(
                    new File([image.split(',')[1]], 'image.jpg', {
                        type: 'image/jpg',
                    }),
                    'News',
                );
                this.newContentImages.push({
                    oldText: image,
                    newLink: this.serverImg + imageUrl,
                });
            }
        });
    }

    async onSave() {
        if (this.newContentImages?.length) {
            this.newContentImages?.map((cmtImg) => {
                this.content.replace(cmtImg.oldText, cmtImg.newLink);
            });
        }
        this.newsModel.content = this.content;
        if (this.file) {
            this.newsModel.image = await this.fileService.uploadMedia(
                this.file,
                'News',
            );
        }
        if (this.newsModel.id) {
            this.newsService
                .updateNews(this.newsModel, this.newsModel.id)
                .subscribe(
                    (res) => {
                        if (res) {
                            this.messageService.add({
                                severity: 'success',
                                detail: AppUtil.translate(
                                    this.translateService,
                                    'success.update',
                                ),
                            });
                            this.onCancel.emit({});
                        }
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
        } else {
            this.newsService.createNews(this.newsModel).subscribe(
                (res) => {
                    if (res) {
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.create',
                            ),
                        });
                        this.onCancel.emit({});
                    }
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
    }

    onUploadFile(event) {
        this.file = event.currentFiles[0];
        let reader = new FileReader();
        reader.readAsDataURL(this.file);
        reader.onload = (event) => {
            this.newsModel.image = event.target.result;
            this.newsModel.imageUrl = event.target.result;
        };
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
