import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import {
    SliderModel,
    SliderViewModel,
} from '../../../../models/web-setting/slider.model';
import {
    IntroduceModel,
    IntroduceType,
} from '../../../../models/web-setting/introduce.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { SliderService } from '../../../../service/web-setting/slider.service';
import { IntroduceService } from '../../../../service/web-setting/introduce.service';
import { LanguageType } from '../../../../utilities/app-enum';
import AppUtil from '../../../../utilities/app-util';
import { environment } from '../../../../../environments/environment';
import { FileService } from '../../../../service/file.service';

@Component({
    selector: 'app-introduce-edit',
    templateUrl: './introduce-edit.component.html',
    styleUrls: [],
})
export class IntroduceEditComponent implements OnInit {
    @Input() display = false;

    @Input() set formData(value) {
        if (value?.id) {
            this.isEdit = true;
            this.introduceModel = Object.assign(this.introduceModel, value);
            this.content = this.introduceModel.content || '';
        } else {
            this.isEdit = false;
            this.content = '';
            this.introduceModel.introduceType = IntroduceType.Post;
            this.introduceModel.type = 2;
            this.newContentImages = [];
        }
    }

    @Output() onCancel = new EventEmitter();
    serverImg = `${environment.serverURLImage}/`;
    isEdit = false;
    introduceModel: IntroduceModel = {};
    languageTypes = [];
    introduceTypes = [];
    content = '';
    newContentImages = [];

    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly introduceService: IntroduceService,
        private readonly fileService: FileService,
    ) {}

    ngOnInit(): void {
        this.languageTypes = AppUtil.getLanguageTypes();
        this.introduceTypes = AppUtil.getIntroduceTypes();
    }

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
        this.introduceModel.content = this.content;
        if (this.introduceModel.id) {
            this.introduceService
                .updateIntroduce(this.introduceModel, this.introduceModel.id)
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
            this.introduceService
                .createIntroduce(this.introduceModel)
                .subscribe(
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
