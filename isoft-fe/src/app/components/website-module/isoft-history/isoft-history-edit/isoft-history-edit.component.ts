import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { ClassName, IsoftHistoryModel } from '../isoft-history.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { FileService } from '../../../../service/file.service';
import { IsoftHistoryService } from '../isoft-history.service';
import AppUtil from '../../../../utilities/app-util';

@Component({
    selector: 'app-isoft-history-edit',
    templateUrl: './isoft-history-edit.component.html',
    styleUrls: [],
})
export class IsoftHistoryEditComponent implements OnInit {
    @Input() display = false;

    @Input() set formData(value) {
        if (value?.id) {
            this.isEdit = true;
            this.historyModel = Object.assign(this.historyModel, value);
            this.content = this.historyModel.content || '';
        } else {
            this.isEdit = false;
            this.content = '';
            this.newContentImages = [];
            this.historyModel = {};
        }
    }

    @Output() onCancel = new EventEmitter();
    classNames = [
        {
            value: ClassName.Six,
            label: 'Lớp 6',
        },
        {
            value: ClassName.Seven,
            label: 'Lớp 7',
        },
        {
            value: ClassName.Eight,
            label: 'Lớp 8',
        },
        {
            value: ClassName.Nine,
            label: 'Lớp 9',
        },
    ];
    serverImg = `${environment.serverURLImage}/`;
    isEdit = false;
    historyModel: IsoftHistoryModel = {};
    content = '';
    newContentImages = [];

    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly isoftHistoryService: IsoftHistoryService,
        private readonly fileService: FileService,
    ) {}

    ngOnInit(): void {}

    async onChangeEditor(event) {
        this.content = event.htmlValue;
        event?.delta?.ops?.map(async (item) => {
            if (item?.insert?.image) {
                const image = item?.insert?.image;
                const imageUrl = await this.fileService.uploadMedia(
                    new File([image.split(',')[1]], 'image.jpg', {
                        type: 'image/jpg',
                    }),
                    'Introduces',
                );
                this.newContentImages.push({
                    oldText: image,
                    newLink: this.serverImg + imageUrl,
                });
            }
        });
    }

    onSave() {
        if (this.newContentImages?.length) {
            this.newContentImages?.map((cmtImg) => {
                this.content = this.content.replace(
                    cmtImg.oldText,
                    cmtImg.newLink,
                );
            });
        }
        const request = {
            ...this.historyModel,
            content: this.content,
            name: `Bài ${this.historyModel.order}`,
            order: Number(this.historyModel.order),
        };
        if (this.historyModel.id) {
            this.isoftHistoryService
                .updateHistory(request, this.historyModel.id)
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
            this.isoftHistoryService.createHistory(request).subscribe(
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
}
