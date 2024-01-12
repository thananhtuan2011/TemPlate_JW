import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { Goods } from '../../../../models/goods.model';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { GoodsService } from '../../../../service/goods.service';
import AppUtil from '../../../../utilities/app-util';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-product-edit',
    templateUrl: './product-edit.component.html',
    styleUrls: [],
})
export class ProductEditComponent implements OnInit {
    @Input() display = false;
    @Input() types = {};

    @Input() set formData(value) {
        if (value?.id) {
            this.isEdit = true;
            Object.assign(this.goodModel, value);
            this.goodModel.detail1 = value.detailFirstObj.code
            this.goodModel.detail2 = value.detailSecondObj.code
        } else {
            this.isEdit = false;
        }
    }

    @Output() onCancel = new EventEmitter();
    serverImg = environment.serverURLImage + '/';
    isEdit = false;
    goodModel: Goods = {};
    contentVietnam = '';
    newContentImagesVn = [];
    contentKorea = '';
    newContentImagesKo = [];
    contentEnglish = '';
    newContentImagesEn = [];

    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly goodsService: GoodsService,
    ) {}

    ngOnInit(): void {}

    onSave() {
        let requestModel: Goods = {};
        Object.assign(requestModel, this.goodModel);
        if (this.newContentImagesVn?.length) {
            this.newContentImagesVn?.map((cmtImg) => {
                this.contentVietnam.replace(cmtImg.oldText, cmtImg.newLink);
            });
        }
        if (this.newContentImagesKo?.length) {
            this.newContentImagesKo?.map((cmtImg) => {
                this.contentKorea.replace(cmtImg.oldText, cmtImg.newLink);
            });
        }
        if (this.newContentImagesEn?.length) {
            this.newContentImagesEn?.map((cmtImg) => {
                this.contentEnglish.replace(cmtImg.oldText, cmtImg.newLink);
            });
        }
        requestModel.contentVietNam = this.contentVietnam;
        requestModel.contentKorea = this.contentKorea;
        requestModel.contentEnglish = this.contentEnglish;
        this.goodsService.updateForWebsite(requestModel, this.goodModel.id).subscribe(
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
                    detail: AppUtil.translate(this.translateService, 'error.0'),
                });
            },
        );
    }

    onChangeEditorVietnam(event) {
        this.contentVietnam = event.htmlValue;
        event?.delta?.ops?.map((item) => {
            if (item?.insert?.image) {
                const image = item?.insert?.image;
                const formData = new FormData();
                formData.append(
                    'file',
                    new Blob([image.split(',')[1]], { type: 'image/png' }),
                );
                this.goodsService.uploadFiles(formData).subscribe(
                    (res) => {
                        if (res) {
                            this.newContentImagesVn.push({
                                oldText: image,
                                newLink: this.serverImg + res.fileName,
                            });
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
        });
    }

    onChangeEditorKorea(event) {
        this.contentKorea = event.htmlValue;
        event?.delta?.ops?.map((item) => {
            if (item?.insert?.image) {
                const image = item?.insert?.image;
                const formData = new FormData();
                formData.append(
                    'file',
                    new Blob([image.split(',')[1]], { type: 'image/png' }),
                );
                this.goodsService.uploadFiles(formData).subscribe(
                    (res) => {
                        if (res) {
                            this.newContentImagesKo.push({
                                oldText: image,
                                newLink: this.serverImg + res.fileName,
                            });
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
        });
    }

    onChangeEditorEnglish(event) {
        this.contentEnglish = event.htmlValue;
        event?.delta?.ops?.map((item) => {
            if (item?.insert?.image) {
                const image = item?.insert?.image;
                const formData = new FormData();
                formData.append(
                    'file',
                    new Blob([image.split(',')[1]], { type: 'image/png' }),
                );
                this.goodsService.uploadFiles(formData).subscribe(
                    (res) => {
                        if (res) {
                            this.newContentImagesEn.push({
                                oldText: image,
                                newLink: this.serverImg + res.fileName,
                            });
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
        });
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
